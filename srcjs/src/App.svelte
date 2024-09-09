<script>
  import Counter from './lib/Counter.svelte';
  import Graph from './lib/Graph.svelte';
  import Viva from 'vivagraphjs';
  import forceLayoutViva from './lib/forceLayoutViva';
  import forceLayoutD3 from './lib/forceLayoutD3';
  import { nodePositions } from './store.js';

  const graphGenerator = Viva.Graph.generator();
  const graph = graphGenerator.grid(5, 5);

  let selectedLayout = "viva";
  let isSimulationRunning = true;
  let positions = [];

  nodePositions.subscribe(value => {
    positions = value;
  });

function switchLayout() {
  selectedLayout = selectedLayout === "viva" ? "d3" : "viva";
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
      Switch layout (now: {selectedLayout})
    </button>
    <button on:click={toggleSimulation}>
      {isSimulationRunning ? "Pause" : "Continue"} simulation
    </button>
  </div>
  <div class="card">
    {#if selectedLayout === "viva"}
      <Graph {graph} layoutSpecification={forceLayoutViva} {positions} />
    {:else}
      <Graph {graph} layoutSpecification={forceLayoutD3} {positions}/>
    {/if}
  </div>
</main>

<style>
</style>