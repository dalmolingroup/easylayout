<script>
  import { onMount, onDestroy } from 'svelte';
  import { nodePositions, isSimulationRunning } from '../store.js';
  import Viva from 'vivagraphjs';

  export let graph;
  export let layoutSpecification;
  export let positions;

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

    if (positions.length !== 0) {
      graph.forEachNode(node => {
        let nodePosition = positions[node.id]
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
    let positions = [];
    graph.forEachNode(node => {
      let nodePosition = layout.getNodePosition(node.id);
      positions.push({ x: nodePosition.x, y: nodePosition.y });
    });
    nodePositions.set(positions);
  });
</script>

<div bind:this={container} style="width: 600px; height: 400px;"></div>

<style>
  div {
    border: 1px solid #ccc;
  }
</style>