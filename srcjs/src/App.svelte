<script>
  import Counter from './lib/Counter.svelte';
  import Graph from './lib/Graph.svelte';
  import GraphD3 from './lib/GraphD3.svelte';
  import Viva from 'vivagraphjs';

  const graphGenerator = Viva.Graph.generator();
  const graph = graphGenerator.grid(5, 5);
</script>

<main>
  <h1>Vite + Svelte</h1>
  <div class="card">
    <Counter />
  </div>
  <div class="card">
    <Graph {graph} />
  </div>
  <div class="card">
    <GraphD3 {graph} />
  </div>
</main>

<style>
</style>