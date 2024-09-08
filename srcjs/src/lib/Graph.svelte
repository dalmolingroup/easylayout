<script>
  import { onMount } from 'svelte';
  import Viva from 'vivagraphjs';

  let container;

  onMount(() => {
    const graphGenerator = Viva.Graph.generator();
    const graph = graphGenerator.grid(20, 20);

    const renderer = Viva.Graph.View.renderer(graph, {
      container: container,
      graphics: Viva.Graph.View.webglGraphics()
    });

    renderer.run();
  });
</script>

<div bind:this={container} style="width: 600px; height: 400px;"></div>

<style>
  div {
    border: 1px solid #ccc;
  }
</style>