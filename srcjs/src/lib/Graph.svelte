<script>
  import { onMount } from 'svelte';
  import Viva from 'vivagraphjs';
  import forceLayoutViva from './forceLayoutViva';

  export let graph;

  let container;

  onMount(() => {
    const layout = forceLayoutViva(graph);

    const renderer = Viva.Graph.View.renderer(graph, {
      layout: layout,
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