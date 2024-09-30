<script>
  import { onMount, onDestroy } from "svelte";
  import { isSimulationRunning } from "../store.js";
  import Viva from "vivagraphjs";

  export let graph;
  export let layout;
  export let usePrecomputedPositions;

  let container;
  let renderer;

  $: if (renderer && !$isSimulationRunning) {
    renderer.pause();
  } else if (renderer && $isSimulationRunning) {
    renderer.resume();
  }

  onMount(() => {
    if (usePrecomputedPositions) {
      graph.forEachNode((node) => {
        // Ideally we don't need this check because the nodes
        // should always have precomputed positions
        if (node.data.x) layout.setNodePosition(node.id, node.data.x, node.data.y);
      });
      usePrecomputedPositions = false;
    }

    let graphics = Viva.Graph.View.webglGraphics();

    graphics.node(function(node) {
      return Viva.Graph.View.webglSquare(
        node.data.size || 10,
        node.data.color || "#000000"
      );
    });

    renderer = Viva.Graph.View.renderer(graph, {
      layout: layout,
      container: container,
      graphics: graphics,
      renderLinks: true,
      prerender: true,
    });

    renderer.run();
  });

  onDestroy(() => {
    graph.forEachLink((link) => {
      let linkPositions = layout.getLinkPosition(link.id);
      link.coords = [
        linkPositions.from.x,
        linkPositions.from.y,
        linkPositions.to.x,
        linkPositions.to.y
      ];
    });
  });
</script>

<div bind:this={container} style="width: 100%; height: 100%;"></div>

<style>
</style>
