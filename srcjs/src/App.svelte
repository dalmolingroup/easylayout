<script>
  import "./app.css";
  import Graph from "./lib/Graph.svelte";
  import Editor from "./lib/Editor.svelte";
  import Viva from "vivagraphjs";
  import forceLayoutViva from "./lib/forceLayoutViva";
  import forceLayoutD3 from "./lib/forceLayoutD3";
  import { isSimulationRunning, isEditorMode } from "./store.js";
  import { onMount } from "svelte";
  import {
    nodeLoadTransform,
    linkLoadTransform,
  } from "./lib/customTransformFromRToViva";

  // Speed dial imports
  import { fly } from "svelte/transition";

  let graph;

  let selectedLayoutName = "viva";
  let availableLayouts = { viva: forceLayoutViva, d3: forceLayoutD3 };

  function switchLayout() {
    selectedLayoutName = selectedLayoutName === "viva" ? "d3" : "viva";
  }

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
  id="collapsed-sidebar"
  class="fixed top-0 left-0 z-40 w-14 h-screen"
  aria-label="Sidebar"
>
  <div class="h-full px-2 py-2 overflow-y-auto bg-gray-50 dark:bg-gray-800">
    <ul class="space-y-2 font-medium">
      <li>
        <span
          class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white group"
        >
          <svg
            class="flex-shrink-0 w-5 h-5 text-gray-500 dark:text-gray-400"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M10.83 5a3.001 3.001 0 0 0-5.66 0H4a1 1 0 1 0 0 2h1.17a3.001 3.001 0 0 0 5.66 0H20a1 1 0 1 0 0-2h-9.17ZM4 11h9.17a3.001 3.001 0 0 1 5.66 0H20a1 1 0 1 1 0 2h-1.17a3.001 3.001 0 0 1-5.66 0H4a1 1 0 1 1 0-2Zm1.17 6H4a1 1 0 1 0 0 2h1.17a3.001 3.001 0 0 0 5.66 0H20a1 1 0 1 0 0-2h-9.17a3.001 3.001 0 0 0-5.66 0Z"
            />
          </svg>
        </span>
      </li>
    </ul>
    <ul class="pt-4 mt-4 space-y-2 font-medium border-t border-gray-200 dark:border-gray-700">
      <li>
        <a
          href="#"
          class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
        >
          <svg
            class="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M10.83 5a3.001 3.001 0 0 0-5.66 0H4a1 1 0 1 0 0 2h1.17a3.001 3.001 0 0 0 5.66 0H20a1 1 0 1 0 0-2h-9.17ZM4 11h9.17a3.001 3.001 0 0 1 5.66 0H20a1 1 0 1 1 0 2h-1.17a3.001 3.001 0 0 1-5.66 0H4a1 1 0 1 1 0-2Zm1.17 6H4a1 1 0 1 0 0 2h1.17a3.001 3.001 0 0 0 5.66 0H20a1 1 0 1 0 0-2h-9.17a3.001 3.001 0 0 0-5.66 0Z"
            />
          </svg>
        </a>
      </li>
      <li>
        <a
          href="#"
          class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
        >
          <svg
            class="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 18"
          >
            <path
              d="M14 2a3.963 3.963 0 0 0-1.4.267 6.439 6.439 0 0 1-1.331 6.638A4 4 0 1 0 14 2Zm1 9h-1.264A6.957 6.957 0 0 1 15 15v2a2.97 2.97 0 0 1-.184 1H19a1 1 0 0 0 1-1v-1a5.006 5.006 0 0 0-5-5ZM6.5 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8 10H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Z"
            />
          </svg>
        </a>
      </li>
      <li>
        <a
          href="#"
          class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
        >
          <svg
            class="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 18 20"
          >
            <path
              d="M17 5.923A1 1 0 0 0 16 5h-3V4a4 4 0 1 0-8 0v1H2a1 1 0 0 0-1 .923L.086 17.846A2 2 0 0 0 2.08 20h13.84a2 2 0 0 0 1.994-2.153L17 5.923ZM7 9a1 1 0 0 1-2 0V7h2v2Zm0-5a2 2 0 1 1 4 0v1H7V4Zm6 5a1 1 0 1 1-2 0V7h2v2Z"
            />
          </svg>
        </a>
      </li>
    </ul>
  </div>
</aside>

<main class="container flex flex-col h-screen">
  <div class="fixed bg-cyan-400">
    {#if !$isEditorMode}
      <button on:click={switchLayout}>
        Switch layout (now: {selectedLayoutName})
      </button>

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
        <Graph
          {graph}
          layoutSpecification={availableLayouts[selectedLayoutName]}
        />
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
