<script>
  import { onMount, onDestroy } from 'svelte';
  import { nodePositions, isSimulationRunning } from '../store.js';
  import Viva from 'vivagraphjs';

  export let graph;
  export let layoutSpecification;

  let container;
  let layout;
  let renderer;

  $: if (renderer && !$isSimulationRunning) {
    renderer.pause();
  } else if (renderer && $isSimulationRunning) {
    renderer.resume();
  }
  
  onMount(() => {
    layout = layoutSpecification(graph);
    globalThis.layout = layout;

    if ($nodePositions.size > 0) {
      console.log($nodePositions);
      graph.forEachNode(node => {
        let nodePosition = $nodePositions.get(node.id)
        layout.setNodePosition(node.id, nodePosition.x, nodePosition.y);
      });
    }

    renderer = Viva.Graph.View.renderer(graph, {
      layout: layout,
      container: container,
      graphics: Viva.Graph.View.webglGraphics(),
      renderLinks : true,
      prerender  : true
    });

    renderer.run();
  });

  onDestroy(() => {
    graph.forEachNode(node => {
      let nodePosition = layout.getNodePosition(node.id);
      $nodePositions.set(node.id, { x: nodePosition.x, y: nodePosition.y });
    });
  });
</script>

<div bind:this={container} style="width: 600px; height: 400px;"></div>

<style>
  div {
    border: 1px solid #ccc;
  }
</style>