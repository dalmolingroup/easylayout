<script>
  import Graph from "./lib/Graph.svelte";
  import Editor from "./lib/Editor.svelte";
  import Viva from "vivagraphjs";
  import forceLayoutViva from "./lib/forceLayoutViva";
  import forceLayoutD3 from "./lib/forceLayoutD3";
  import { isSimulationRunning, isEditorMode } from "./store.js";
  import { onMount } from "svelte";
  import { nodeLoadTransform, linkLoadTransform } from "./lib/customTransformFromRToViva";

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
      graphJSON = (await import('./lib/graphJSON.dev.js')).default;
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

<main>
  <div class="card">
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
  <div class="card">
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
      <p>Loading graph...</p>
    {/if}
  </div>
</main>

<style>
</style>
