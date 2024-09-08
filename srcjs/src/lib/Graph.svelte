<script>
  import { onMount } from 'svelte';
  import Viva from 'vivagraphjs';

  let container;

  onMount(() => {
    const graph = Viva.Graph.graph();

    graph.addNode('A');
    graph.addNode('B');
    graph.addLink('A', 'B');

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