<script>
  import Counter from "./lib/Counter.svelte";
  import Graph from "./lib/Graph.svelte";
  import Viva from "vivagraphjs";
  import forceLayoutViva from "./lib/forceLayoutViva";
  import forceLayoutD3 from "./lib/forceLayoutD3";
  import { nodePositions, isSimulationRunning } from "./store.js";
  import { get } from "svelte/store";
  import { onMount } from 'svelte';

  const graphGenerator = Viva.Graph.generator();
  const graph = graphGenerator.grid(5, 5);

  let selectedLayoutName = "viva";
  let availableLayouts = { viva: forceLayoutViva, d3: forceLayoutD3 };

  function switchLayout() {
    selectedLayoutName = selectedLayoutName === "viva" ? "d3" : "viva";
  }

  function toggleSimulation() {
    $isSimulationRunning = !$isSimulationRunning;
  }

  onMount(() => {
    console.log("Shiny:");
    console.log(Shiny);
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
    {#key selectedLayoutName}
      <Graph
        graph={graph}
        layoutSpecification={availableLayouts[selectedLayoutName]}
        positions={get(nodePositions)}
      />
    {/key}
  </div>
</main>

<style>
</style>
