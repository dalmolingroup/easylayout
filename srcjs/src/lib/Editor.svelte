<script>
  import { onMount, onDestroy } from "svelte";
  import { Canvas, Rect } from "fabric";
  import { nodePositions } from "../store.js";

  let canvas;
  let fabricCanvas;
  const offset = 200;

  onMount(() => {
    if ($nodePositions.size > 0) {
      fabricCanvas = new Canvas(canvas);

      for (let [nodeId, position] of $nodePositions) {
        let rect = new Rect({
          left: position.x + offset,
          top: position.y + offset,
          fill: "#0080ff",
          width: 10,
          height: 10,
          angle: 90,
        });
        fabricCanvas.add(rect);
      }

      fabricCanvas.renderAll();
    }
  });

  onDestroy(() => {
    const canvasObjects = fabricCanvas.getObjects();
    canvasObjects.map((obj, index) => {
      let nodePosition = { x: obj.left, y: obj.top };
      $nodePositions.set(`${index + 1}`, {
        x: nodePosition.x - offset,
        y: nodePosition.y - offset,
      });
      console.log($nodePositions);
    });
    fabricCanvas.dispose();
  });
</script>

<canvas
  bind:this={canvas}
  width="800"
  height="600"
  style="border:1px solid #000;"
></canvas>

<style>
  canvas {
    display: block;
    margin: 0 auto;
  }
</style>
