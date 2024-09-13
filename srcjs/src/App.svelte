<script>
  import Counter from "./lib/Counter.svelte";
  import Graph from "./lib/Graph.svelte";
  import Viva from "vivagraphjs";
  import forceLayoutViva from "./lib/forceLayoutViva";
  import forceLayoutD3 from "./lib/forceLayoutD3";
  import { isSimulationRunning } from "./store.js";
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
  <h1>Vite + Svelte</h1>
  <div class="card">
    <Counter />
  </div>
  <div class="card">
    <button on:click={switchLayout}>
      Switch layout (now: {selectedLayoutName})
    </button>
    <button on:click={toggleSimulation}>
      {$isSimulationRunning ? "Pause" : "Continue"} simulation
    </button>
  </div>
  <div class="card">
    {#if graph}
      {#key selectedLayoutName}
        <Graph
          {graph}
          layoutSpecification={availableLayouts[selectedLayoutName]}
        />
      {/key}
    {:else}
      <p>Loading graph...</p>
    {/if}
  </div>
</main>

<style>
</style>
