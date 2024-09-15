<script>
  import { onMount, onDestroy } from "svelte";
  import {
    Canvas,
    Rect,
    Line,
    ActiveSelection,
    controlsUtils,
    Point,
  } from "fabric";

  export let graph;

  let canvas;
  let fabricCanvas;
  const offset = 200;
  const linesByLinkId = new Map();

  // <disable-scaling src=fabricjs.github.io/docs/configuring-controls>
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
    return { controls: controls };
  };

  // Since the scaling handles are hidden,
  // this part is not stricly necessary
  ActiveSelection.ownDefaults = {
    ...ActiveSelection.ownDefaults,
    lockScalingX: true,
    lockScalingY: true,
  };

  function updateLines(opt) {
    const isGroup = "_objects" in opt.target;
    if (isGroup) {
      const objectsInsideGroup = opt.target._objects;

      objectsInsideGroup.forEach((obj) => {
        const finalPointRelative = new Point(obj.left, obj.top);
        const finalPointAbsolute = finalPointRelative.transform(
          opt.target.calcTransformMatrix(),
        );

        obj.linksDeparting.forEach((linkId) => {
          const nodeLine = linesByLinkId.get(linkId);

          nodeLine.set({
            x1: finalPointAbsolute.x,
            y1: finalPointAbsolute.y,
          });
        });
        obj.linksArriving.forEach((linkId) => {
          const nodeLine = linesByLinkId.get(linkId);

          nodeLine.set({
            x2: finalPointAbsolute.x,
            y2: finalPointAbsolute.y,
          });
        });
      });
    } else {
      opt.target.linksDeparting.forEach((linkId) => {
        const nodeLine = linesByLinkId.get(linkId);
        nodeLine.set({ x1: opt.target.left, y1: opt.target.top });
      });
      opt.target.linksArriving.forEach((linkId) => {
        const nodeLine = linesByLinkId.get(linkId);
        nodeLine.set({ x2: opt.target.left, y2: opt.target.top });
      });
    }
  }

  onMount(() => {
    fabricCanvas = new Canvas(canvas, {
      fireRightClick: true,
      stopContextMenu: true,
    });

    // <zoom-and-pan src=fabricjs.com/fabric-intro-part-5>
    fabricCanvas.on("mouse:wheel", function (opt) {
      let delta = opt.e.deltaY;
      let zoom = fabricCanvas.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 20) zoom = 20;
      if (zoom < 0.01) zoom = 0.01;
      fabricCanvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    fabricCanvas.on("mouse:down", function (opt) {
      if (opt.e.button === 2) {
        fabricCanvas.isDragging = true;
        fabricCanvas.selection = false;
        fabricCanvas.lastPosX = opt.e.clientX;
        fabricCanvas.lastPosY = opt.e.clientY;
      }
    });

    fabricCanvas.on("mouse:move", function (opt) {
      if (fabricCanvas.isDragging) {
        let vpt = fabricCanvas.viewportTransform;
        vpt[4] += opt.e.clientX - fabricCanvas.lastPosX;
        vpt[5] += opt.e.clientY - fabricCanvas.lastPosY;
        fabricCanvas.requestRenderAll();
        fabricCanvas.lastPosX = opt.e.clientX;
        fabricCanvas.lastPosY = opt.e.clientY;
      }
    });

    fabricCanvas.on("mouse:up", function (opt) {
      // on mouse up we want to recalculate new interaction
      // for all objects, so we call setViewportTransform
      fabricCanvas.setViewportTransform(fabricCanvas.viewportTransform);
      fabricCanvas.isDragging = false;
      fabricCanvas.selection = true;
    });
    // </zoom-and-pan>

    // TODO: Refactor and rename variables for clarity
    // fabricjs.com/using-transformations
    // fabricjs.github.io/docs/understanding-fabricjs/transformations
    // davelage.com/posts/fabric-selection-group-positioning
    // medium.com/@luizzappa/the-transformation-matrix-in-fabric-js-fb7f733d0624
    // OBRIGADO @luizzappa VC MERECE UM BEIJO
    fabricCanvas.on({
      "object:moving": updateLines,
      "object:rotating": updateLines,
    });

    graph.forEachLink((link) => {
      const coords = link.coords.map((coord) => coord + offset);
      const line = new Line(coords, {
        fill: null,
        stroke: "#808080",
        strokeWidth: 2,
        selectable: false,
        evented: false,
        objectCaching: false,
      });
      linesByLinkId.set(link.id, line);
      fabricCanvas.add(line);
    });

    graph.forEachNode((node) => {
      const linksDeparting = [];
      const linksArriving = [];

      node.links.forEach((link) => {
        if (link.fromId === node.id) {
          linksDeparting.push(link.id);
        } else {
          linksArriving.push(link.id);
        }
      });

      const rect = new Rect({
        left: node.x + offset,
        top: node.y + offset,
        fill: "#0080ff",
        width: 10,
        height: 10,
        angle: 90,
        hasControls: false,
        originX: "center",
        originY: "center",
        objectCaching: false,
        linksDeparting: linksDeparting,
        linksArriving: linksArriving,
      });

      fabricCanvas.add(rect);
    });

    fabricCanvas.requestRenderAll();
  });

  onDestroy(() => {
    const canvasObjects = fabricCanvas.getObjects();
    let currentNodeIndex = 0;
    graph.forEachNode((node) => {
      node.x = canvasObjects[currentNodeIndex].left - offset;
      node.y = canvasObjects[currentNodeIndex].top - offset;
      currentNodeIndex++;
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
