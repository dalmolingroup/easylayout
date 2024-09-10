<script>
  import Counter from './lib/Counter.svelte';
  import Graph from './lib/Graph.svelte';
  import Viva from 'vivagraphjs';
  import forceLayoutViva from './lib/forceLayoutViva';
  import forceLayoutD3 from './lib/forceLayoutD3';
  import { nodePositions } from './store.js';

  const graphGenerator = Viva.Graph.generator();
  const graph = graphGenerator.grid(5, 5);

  let selectedLayoutName = "viva";
  let availableLayouts = {"viva": forceLayoutViva, "d3": forceLayoutD3};
  let isSimulationRunning = true;
  let positions = [];

  nodePositions.subscribe(value => {
    positions = value;
  });

  function switchLayout() {
    selectedLayoutName = selectedLayoutName === "viva" ? "d3" : "viva";
  }

  function toggleSimulation() {
    isSimulationRunning = isSimulationRunning ? false : true;
  }
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
      {isSimulationRunning ? "Pause" : "Continue"} simulation
    </button>
  </div>
  <div class="card">
    {#key selectedLayoutName}
      <Graph {graph} layoutSpecification={availableLayouts[selectedLayoutName]} {positions} />
    {/key}
  </div>
</main>

<style>
</style>