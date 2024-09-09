<script>
  import Counter from './lib/Counter.svelte';
  import Graph from './lib/Graph.svelte';
  import Viva from 'vivagraphjs';
  import forceLayoutViva from './lib/forceLayoutViva';
  import forceLayoutD3 from './lib/forceLayoutD3';

  const graphGenerator = Viva.Graph.generator();
  const graph = graphGenerator.grid(5, 5);
</script>

<main>
  <h1>Vite + Svelte</h1>
  <div class="card">
    <Counter />
  </div>
  <div class="card">
    <Graph {graph} layoutSpecification={forceLayoutViva} />
  </div>
  <div class="card">
    <Graph {graph} layoutSpecification={forceLayoutD3} />
  </div>
</main>

<style>
</style>