<script>
  import "./app.css";
  import Graph from "./lib/Graph.svelte";
  import Editor from "./lib/Editor.svelte";
  import Viva from "vivagraphjs";
  import layoutSettings from "./lib/layoutSettings.js";
  import { isSimulationRunning, isEditorMode } from "./store.js";
  import { onMount } from "svelte";
  import {
    nodeLoadTransform,
    linkLoadTransform,
  } from "./lib/customTransformFromRToViva";

  // Speed dial imports
  import { fly } from "svelte/transition";

  // Select imports
  import { Label, Select, Range } from "flowbite-svelte";

  let graph;

  let minmaxValue = 0;

  let selectedLayoutName = "viva";

  $: selectedLayout = layoutSettings.find(
    (l) => l.value === selectedLayoutName,
  );

  function toggleSimulation() {
    $isSimulationRunning = !$isSimulationRunning;
  }

  async function handleShinyData(graphJSON) {
    console.log("Received Shiny data:");
    console.log(graphJSON);

    if (import.meta.env.DEV) {
      graphJSON = (await import("./lib/graphJSON.dev.js")).default;
    }

    graph = Viva.Graph.serializer().loadFromJSON(
      graphJSON,
      nodeLoadTransform(graphJSON),
      linkLoadTransform(graphJSON),
    );
  }

  function toggleEditorMode() {
    $isEditorMode = !$isEditorMode;
  }

  let sidebarExpanded = false;

  function toggleSidebar() {
    sidebarExpanded = !sidebarExpanded;
    console.log(sidebarExpanded);
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

<aside
  id="expanded-sidebar"
  class="fixed top-0 left-0 z-40 w-48 h-screen overflow-hidden"
  aria-label="Sidebar"
>
  <div class="h-full px-3 py-4 overflow-hidden bg-gray-50 dark:bg-gray-800">
    <ul class="space-y-2 font-medium text-lg">
      <li>
        <p
          class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white group"
        >
          <svg
            class="w-6 h-6 text-gray-500 dark:text-gray-400"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 22 21"
          >
            <path
              d="M10.83 5a3.001 3.001 0 0 0-5.66 0H4a1 1 0 1 0 0 2h1.17a3.001 3.001 0 0 0 5.66 0H20a1 1 0 1 0 0-2h-9.17ZM4 11h9.17a3.001 3.001 0 0 1 5.66 0H20a1 1 0 1 1 0 2h-1.17a3.001 3.001 0 0 1-5.66 0H4a1 1 0 1 1 0-2Zm1.17 6H4a1 1 0 1 0 0 2h1.17a3.001 3.001 0 0 0 5.66 0H20a1 1 0 1 0 0-2h-9.17a3.001 3.001 0 0 0-5.66 0Z"
            />
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
        <li>
          <Label>Spring length</Label>
          <Range
            id="range-minmax"
            min="0"
            max="10"
            bind:value={minmaxValue}
            size="sm"
          />
        </li>
        {#each selectedLayout.settings as setting}
          <li>
            <Label>{setting.name}</Label>
            <Range
              min={setting.min}
              max={setting.max}
              value={setting.value}
              step={setting.step}
              size="sm"
            />
          </li>
        {/each}
      </ul>
    {/key}
  </div>
</aside>

<main class="container flex flex-col h-screen">
  <div class="fixed top-0 right-0 bg-cyan-400">
    {#if !$isEditorMode}
      <button on:click={toggleSimulation}>
        {$isSimulationRunning ? "Pause" : "Continue"} simulation
      </button>
    {/if}

    <button on:click={toggleEditorMode}>
      {$isEditorMode ? "Leave editor" : "Enter editor"}
    </button>
  </div>

  <div class="flex flex-grow bg-yellow-100">
    {#if graph && !$isEditorMode}
      {#key selectedLayoutName}
        <Graph {graph} layoutSpecification={selectedLayout.spec} />
      {/key}
    {:else if $isEditorMode}
      <Editor {graph} />
    {:else}
      <p>Loading graph....</p>
    {/if}
  </div>
</main>

<style>
</style>
