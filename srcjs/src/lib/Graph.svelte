<script>
  import { onMount, onDestroy } from "svelte";
  import { isSimulationRunning } from "../store.js";
  import Viva from "vivagraphjs";

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

    graph.forEachNode((node) => {
      // Ideally we don't need this check because the nodes
      // should always have precomputed positions
      if (node.x) layout.setNodePosition(node.id, node.x, node.y);
    });

    renderer = Viva.Graph.View.renderer(graph, {
      layout: layout,
      container: container,
      graphics: Viva.Graph.View.webglGraphics(),
      renderLinks: true,
      prerender: true,
    });

    renderer.run();
  });

  onDestroy(() => {
    graph.forEachNode((node) => {
      let nodePosition = layout.getNodePosition(node.id);
      node.x = nodePosition.x;
      node.y = nodePosition.y;
    });
  });
</script>

<div bind:this={container} style="width: 600px; height: 400px;"></div>

<style>
  div {
    border: 1px solid #ccc;
  }
</style>
