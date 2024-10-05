<script>
  import "./app.css";
  import Simulation from "./lib/Simulation.svelte";
  import Editor from "./lib/Editor.svelte";
  import layoutSettings from "./lib/layoutSettings.js";
  import { isSimulationRunning, isEditorMode } from "./store.js";
  import { onMount } from "svelte";

  // Speed dial imports
  import { fly } from "svelte/transition";
  import { SpeedDial, SpeedDialButton } from 'flowbite-svelte';
  import { AdjustmentsHorizontalSolid, DrawSquareSolid, DotsHorizontalOutline, PauseSolid, PlaySolid, UploadSolid, ReplySolid, ObjectsColumnSolid, } from 'flowbite-svelte-icons';

  // Select imports
  import { Label, Select } from "flowbite-svelte";
  import { SimulationWrapperCosmo } from "./lib/SimulationWrapperCosmo";
  import { SimulationWrapperViva, SimulationWrapperD3 } from "./lib/SimulationWrapperViva";

  const States = {
    SIMULATING: "simulating",
    EDITING: "editing",
  }

  let currentState = States.SIMULATING;

  let editorComponent;

  let graphData;
  let simulation;

  let selectedLayoutName = "viva";

  let nodePositions = {};

  let settings = {};

  const availableSimulations = {
    "viva": SimulationWrapperViva,
    "d3": SimulationWrapperD3,
    "cosmo": SimulationWrapperCosmo,
  }

  $: selectedLayout = layoutSettings.find((l) => l.value === selectedLayoutName);
  $: if (simulation) {
    selectedLayout.settings.forEach((setting) => {
      settings[setting.id] = setting.value;
    });
  };

  $: if (graphData) {
    simulation = new availableSimulations[selectedLayoutName](graphData);
  };


  function toggleSimulation() {
    $isSimulationRunning = !$isSimulationRunning;
    if ($isSimulationRunning) currentState = States.SIMULATING;
  }

  async function handleShinyData(graphJSON) {
    console.log("Received Shiny data:", graphJSON);

    if (import.meta.env.DEV) {
      graphJSON = (await import("./lib/graphJSON.dev.js")).default;
    }

    graphData = graphJSON;
  }

  function toggleEditorMode() {
    if ($isEditorMode) {
      // Discarding active selection is just an easy way to avoid transforming
      // the relative selection coordinates to canvas coordinates
      editorComponent.discardActiveSelection();
      $isSimulationRunning = false;
      $isEditorMode = false;
      currentState = States.SIMULATING;
    } else {
      $isEditorMode = true;
      currentState = States.EDITING;
    }
  }

  let sidebarExpanded = true;

  function toggleSidebar() {
    sidebarExpanded = !sidebarExpanded;
  }

  function transmitCoordinatesBackToShiny() {
    const coordinates = [];

    if ($isEditorMode) editorComponent.persistNodePositions();

    const nodePositions = simulation.getNodePositions();

    Object.entries(nodePositions).forEach(([nodeId, pos]) => {
      coordinates.push(pos);
    });

    Shiny.setInputValue("coordinates", coordinates);
  }

  onMount(() => {
    jQuery(document).on("shiny:connected", function () {
      console.log("Shiny connected");
      Shiny.addCustomMessageHandler(
        "dataTransferredFromServer",
        handleShinyData,
      );
      Shiny.setInputValue("svelteAppMounted", true);
    });
  });
</script>

{#if sidebarExpanded && !$isEditorMode}
<aside
  id="expanded-sidebar"
  class="fixed top-0 left-0 z-40 w-48 h-screen overflow-hidden"
  aria-label="Sidebar"
  in:fly={{ x: -200, duration: 300 }}
  out:fly={{ x: -200, duration: 300 }}
>
  <div class="h-full px-3 py-4 overflow-hidden bg-gray-50 dark:bg-gray-800">
    <ul class="space-y-2 font-medium text-lg">
      <li>
        <p class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white group">
          <svg class="w-6 h-6 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 21">
            <path d="M10.83 5a3.001 3.001 0 0 0-5.66 0H4a1 1 0 1 0 0 2h1.17a3.001 3.001 0 0 0 5.66 0H20a1 1 0 1 0 0-2h-9.17ZM4 11h9.17a3.001 3.001 0 0 1 5.66 0H20a1 1 0 1 1 0 2h-1.17a3.001 3.001 0 0 1-5.66 0H4a1 1 0 1 1 0-2Zm1.17 6H4a1 1 0 1 0 0 2h1.17a3.001 3.001 0 0 0 5.66 0H20a1 1 0 1 0 0-2h-9.17a3.001 3.001 0 0 0-5.66 0Z"/>
          </svg>
          <span class="ms-3">Settings</span>
        </p>
      </li>
    </ul>
    <ul
      class="pt-4 mt-4 space-y-2 font-medium border-t border-gray-200 dark:border-gray-700"
    >
      <li class="mb-4">
        <Label>
          Layout algorithm
          <Select
            class="mt-2"
            items={layoutSettings}
            bind:value={selectedLayoutName}
            placeholder=""
          />
        </Label>
      </li>
    </ul>
    {#key selectedLayoutName}
      <ul
        out:fly={{ delay: 0, duration: 200 }}
        in:fly={{ delay: 250, duration: 200 }}
      >
        {#each selectedLayout.settings as setting}
          {#if setting.shown}
            <li>
              <label for="steps-range" class="block text-sm font-medium text-gray-900 dark:text-gray-300">{setting.name}</label>
              <input
                type="range"
                id={setting.id}
                min={setting.min}
                max={setting.max}
                value={setting.value}
                step={setting.step}
                on:input={simulation.updateLayoutSetting(setting.id)}
                class="w-full h-1 mb-4 range-sm bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
            </li>
          {/if}
        {/each}
      </ul>
    {/key}
  </div>
</aside>
{/if}

<main class="container flex flex-col h-screen">

  <div class="flex flex-grow bg-slate-50">
    {#if simulation && !$isEditorMode}
      {#key selectedLayoutName}
        <Simulation {simulation} bind:nodePositions />
      {/key}
    {:else if $isEditorMode}
      <Editor {simulation} bind:nodePositions bind:this={editorComponent}/>
    {:else}
      <p>Loading graph....</p>
    {/if}
  </div>

  <SpeedDial color="dark" defaultClass="fixed end-6 top-6" pill={false}>
    <DotsHorizontalOutline slot="icon" class="w-8 h-8" />
    {#if currentState === States.SIMULATING}
    <SpeedDialButton name={$isSimulationRunning ? "Pause" : "Resume"} on:click={toggleSimulation}>
      {#if $isSimulationRunning}
        <PauseSolid slot="icon" class="w-8 h-8" />
      {:else}
        <PlaySolid slot="icon" class="w-8 h-8" />
      {/if}
    </SpeedDialButton>
    <SpeedDialButton name="Layout settings" on:click={toggleSidebar}>
      <AdjustmentsHorizontalSolid class="w-6 h-6" />
    </SpeedDialButton>
    {/if}
    {#if $isEditorMode}
    <SpeedDialButton name="Simulation" on:click={toggleEditorMode}>
      <ReplySolid class="w-6 h-6" />
    </SpeedDialButton>
    <SpeedDialButton name="Pack components" on:click={editorComponent.packComponents}>
      <ObjectsColumnSolid class="w-6 h-6" />
    </SpeedDialButton>
    {:else}
    <SpeedDialButton name="Edit" on:click={toggleEditorMode}>
      <DrawSquareSolid class="w-6 h-6" />
    </SpeedDialButton>
    {/if}
    <SpeedDialButton name="Finish" on:click={transmitCoordinatesBackToShiny}>
      <UploadSolid class="w-6 h-6" />
    </SpeedDialButton>
  </SpeedDial>
</main>

<style>
</style>
