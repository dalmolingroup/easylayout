<script>
  import { onMount, onDestroy } from "svelte";
  import { Canvas, Rect, ActiveSelection, controlsUtils } from "fabric";
  import { nodePositions } from "../store.js";

  let canvas;
  let fabricCanvas;
  const offset = 200;

  // fabricjs.github.io/docs/configuring-controls
  // Removing all six scaling handles, keeping rotating handle
  ActiveSelection.createControls = () => {
    const controls = controlsUtils.createObjectDefaultControls();
    delete controls.mr;
    delete controls.mb;
    delete controls.mb;
    delete controls.ml;
    delete controls.mt;
    delete controls.tr;
    delete controls.br;
    delete controls.bl;
    delete controls.tl;
    return { controls: controls }
  };

  // Since the scaling handles are hidden,
  // this part is not stricly necessary
  ActiveSelection.ownDefaults = {
    ...ActiveSelection.ownDefaults,
    lockScalingX: true,
    lockScalingY: true,
  }

  onMount(() => {
    console.log(ActiveSelection.ownDefaults);
    if ($nodePositions.size > 0) {
      fabricCanvas = new Canvas(canvas, {
        fireRightClick: true,
        stopContextMenu: true,
      });

      fabricCanvas.on('selection:created',function(opt){
        console.log(opt);
        
        // opt.e.target.set({
        //   lockScalingX: true,
        //   lockScalingY: true,
        // });
      });

      fabricCanvas.on('object:rotating', function(opt) {
        console.log(opt.e);
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
          hasControls: false,
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

<div style="width: 600px; height: 400px;">
  <canvas bind:this={canvas} width="600" height="400"></canvas>
</div>

<style>
  div {
    border: 1px solid #ccc;
  }
</style>
