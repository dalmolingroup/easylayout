<script>
  import Counter from './lib/Counter.svelte';
  import Graph from './lib/Graph.svelte';
  import Viva from 'vivagraphjs';
  import forceLayoutViva from './lib/forceLayoutViva';
  import forceLayoutD3 from './lib/forceLayoutD3';

  const graphGenerator = Viva.Graph.generator();
  const graph = graphGenerator.grid(5, 5);

  let selectedLayout = "viva";

  function toggleLayout() {
    selectedLayout = selectedLayout === "viva" ? "d3" : "viva";
  }
</script>

<main>
  <h1>Vite + Svelte</h1>
  <div class="card">
    <Counter />
  </div>
  <div class="card">
    <button on:click={toggleLayout}>
      Toggle Layout
    </button>
  </div>
  <div class="card">
    {#if selectedLayout === "viva"}
      <Graph {graph} layoutSpecification={forceLayoutViva} />
    {:else}
      <Graph {graph} layoutSpecification={forceLayoutD3} />
    {/if}
  </div>
</main>

<style>
</style>