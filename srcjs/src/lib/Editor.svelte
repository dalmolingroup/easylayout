<script>
  import { onMount, onDestroy } from "svelte";
  import { Canvas, Rect } from "fabric";
  import { nodePositions } from "../store.js";

  let canvas;
  let fabricCanvas;
  const offset = 200;

  onMount(() => {
    if ($nodePositions.size > 0) {
      fabricCanvas = new Canvas(canvas, {
        fireRightClick: true,
        stopContextMenu: true,
      });

      // BEGIN: fabricjs.com/fabric-intro-part-5
      fabricCanvas.on('mouse:wheel', function(opt) {
        let delta = opt.e.deltaY;
        let zoom = fabricCanvas.getZoom();
        zoom *= 0.999 ** delta;
        if (zoom > 20) zoom = 20;
        if (zoom < 0.01) zoom = 0.01;
        fabricCanvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
        opt.e.preventDefault();
        opt.e.stopPropagation();
      });

      fabricCanvas.on('mouse:down', function(opt) {
        if (opt.e.button === 2) {
          fabricCanvas.isDragging = true;
          fabricCanvas.selection = false;
          fabricCanvas.lastPosX = opt.e.clientX;
          fabricCanvas.lastPosY = opt.e.clientY;
        }
      });

      fabricCanvas.on('mouse:move', function(opt) {
        if (fabricCanvas.isDragging) {
          var vpt = fabricCanvas.viewportTransform;
          vpt[4] += opt.e.clientX - fabricCanvas.lastPosX;
          vpt[5] += opt.e.clientY - fabricCanvas.lastPosY;
          fabricCanvas.requestRenderAll();
          fabricCanvas.lastPosX = opt.e.clientX;
          fabricCanvas.lastPosY = opt.e.clientY;
        }
      });

      fabricCanvas.on('mouse:up', function(opt) {
        // on mouse up we want to recalculate new interaction
        // for all objects, so we call setViewportTransform
        fabricCanvas.setViewportTransform(fabricCanvas.viewportTransform);
        fabricCanvas.isDragging = false;
        fabricCanvas.selection = true;
      });
      // END: fabricjs.com/fabric-intro-part-5

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

      fabricCanvas.requestRenderAll();
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
