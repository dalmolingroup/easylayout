<script>
  import { onMount } from 'svelte';
  import { Canvas, Rect } from 'fabric'

  let canvas;

  onMount(() => {
    const fabricCanvas = new Canvas(canvas);

    const rect = new Rect({
      left: 100,
      top: 100,
      fill: 'red',
      width: 50,
      height: 50,
      angle: 45,
    });

    fabricCanvas.add(rect);
    fabricCanvas.renderAll();
  });
</script>

<canvas bind:this={canvas} width="800" height="600" style="border:1px solid #000;"></canvas>

<style>
  canvas {
    display: block;
    margin: 0 auto;
  }
</style>