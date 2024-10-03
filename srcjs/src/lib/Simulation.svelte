<script>
  import { onMount, onDestroy } from "svelte";
  import { isSimulationRunning } from "../store.js";

  export let simulation;

  let container;

  $: if (simulation && !$isSimulationRunning) {
    simulation.pause();
  } else if (simulation && $isSimulationRunning) {
    simulation.resume();
  }

  onMount(() => {
    simulation.start(container);
  });

  onDestroy(() => {
    // graph.forEachLink((link) => {
    //   let linkPositions = layout.getLinkPosition(link.id);
    //   link.coords = [
    //     linkPositions.from.x,
    //     linkPositions.from.y,
    //     linkPositions.to.x,
    //     linkPositions.to.y
    //   ];
    // });
    simulation.destroy();
  });
</script>

<div bind:this={container} style="width: 100%; height: 100%;"></div>

<style>
</style>
