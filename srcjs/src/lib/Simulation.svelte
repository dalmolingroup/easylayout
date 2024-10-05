<script>
  import { onMount, onDestroy } from "svelte";
  import { isSimulationRunning } from "../store.js";

  export let simulation;
  export let nodePositions;

  let container;

  $: if (simulation.started) {
    if (!$isSimulationRunning) simulation.pause();
    else simulation.resume();
  }

  onMount(() => {
    simulation.start(container, nodePositions);
  });

  onDestroy(() => {
    nodePositions = simulation.getNodePositions();
    simulation.destroy();
  });
</script>

<div bind:this={container} style="width: 100%; height: 100%;"></div>

<style>
</style>
