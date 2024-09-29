<script>
  import { onMount, onDestroy } from "svelte";
  import {
    Canvas,
    Rect,
    Line,
    ActiveSelection,
    controlsUtils,
    Point,
    Group,
  } from "fabric";

  export let graph;
  export let layout;

  let canvasHTMLElement;
  let fabricCanvas;
  const offset = 200;
  const linesByLinkId = new Map();
  const groupsByComponentId = new Map();
  const rectsByNodeId = new Map();

  function rotateComponent(group, componentId, angle) {
    group.angle = angle;

    const newGroup = new Group([], {
      originX: "center",
      originY: "center",
      objectCaching: false,
    });

    group.forEachObject((i) => {
      group.remove(i);
      newGroup.add(i);
    });

    fabricCanvas.remove(group);

    groupsByComponentId.set(componentId, newGroup);
    fabricCanvas.add(newGroup);

    updateLines(newGroup);
    newGroup.setCoords();

    return newGroup.height;
  };

  function getHeightIfRotated(group, angle) {
    const radians = angle * Math.PI / 180;

    // Rotate each point around the center of the list of points
    const rotatedListOfPoints =  group._objects.map((obj) => {
      let x = obj.left - group.left;
      let y = obj.top - group.top;

      let xNew = x * Math.cos(radians) - y * Math.sin(radians) + group.left;
      let yNew = x * Math.sin(radians) + y * Math.cos(radians) + group.top;

      return new Point(xNew, yNew);
    });

    // Find the height of the rotated list of points
    let listOfYValues = rotatedListOfPoints.map((point) => point.y);
    let height = Math.max(...listOfYValues) - Math.min(...listOfYValues);

    return height;
  }

  function minimizeGroupHeightThroughRotation(group, componentId) {
    if (group._objects.length === 1) return group.angle;

    let left = -90;
    let right = 90;
    let precision = 1;

    while (right - left > precision) {
      let mid1 = left + (right - left) / 3;
      let mid2 = right - (right - left) / 3;
      
      let height1 = getHeightIfRotated(group, mid1);
      let height2 = getHeightIfRotated(group, mid2);

      if (height1 < height2) {
        right = mid2;
      } else {
        left = mid1;
      }
    }

    let optimalAngle = (left + right) / 2;
    rotateComponent(group, componentId, optimalAngle);
    return optimalAngle;
  };

  export function rotateComponents(event) {
    if (fabricCanvas) {
      groupsByComponentId.forEach(minimizeGroupHeightThroughRotation);
      fabricCanvas.renderAll();
    }
  }

  // <disable-scaling src=fabricjs.github.io/docs/configuring-controls>
  // Removing all six scaling handles, keeping rotating handle
  const controls = { mtr: controlsUtils.createObjectDefaultControls().mtr };

  ActiveSelection.createControls = () => { return { controls } };
  Group.createControls = () => { return { controls } };

  // Since the scaling handles are hidden,
  // this part is not stricly necessary
  ActiveSelection.ownDefaults = {
    ...ActiveSelection.ownDefaults,
    lockScalingX: true,
    lockScalingY: true,
  };

  function updateLines(rootObject) {
    const rootObjectIsGroup = "_objects" in rootObject;

    let childObjects = rootObjectIsGroup ? rootObject._objects : [rootObject]; 

    childObjects.forEach((childObject) => {
      // TODO: Handle nested groups recursively
      if ("_objects" in childObject) return;

      const finalPointRelativeToParent = new Point(childObject.left, childObject.top);
      const finalPointRelativeToGrandparent = finalPointRelativeToParent.transform(
        rootObject.calcTransformMatrix(),
      );

      let finalPoint = rootObjectIsGroup
        ? finalPointRelativeToGrandparent
        : finalPointRelativeToParent;

      childObject.linksDeparting.forEach((linkId) => {
        const line = linesByLinkId.get(linkId);
        line.set({ x1: finalPoint.x, y1: finalPoint.y });
      });
      childObject.linksArriving.forEach((linkId) => {
        const line = linesByLinkId.get(linkId);
        line.set({ x2: finalPoint.x, y2: finalPoint.y });
      });
    });
  }

  onMount(() => {
    fabricCanvas = new Canvas(canvasHTMLElement, {
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
      "object:moving": (event) => { return updateLines(event.target) },
      "object:rotating": (event) => { return updateLines(event.target) },
    });

    graph.forEachLink((link) => {
      const coords = link.coords.map((coord) => coord + offset);
      const line = new Line(coords, {
        fill: null,
        stroke: "#909090",
        strokeWidth: 1,
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

      if (node.links) {
        node.links.forEach((link) => {
          if (link.fromId === node.id) {
            linksDeparting.push(link.id);
          } else {
            linksArriving.push(link.id);
          }
        });
      };

      const rect = new Rect({
        left: node.x + offset,
        top: node.y + offset,
        fill: node.data.color || "#000000",
        width: node.data.size || 10,
        height: node.data.size || 10,
        angle: 90,
        hasControls: false,
        originX: "center",
        originY: "center",
        objectCaching: false,
        linksDeparting: linksDeparting,
        linksArriving: linksArriving,
        nodeId: node.id,
        id: "_node" + node.id,
      });

      rectsByNodeId.set(node.id, rect);

      if(!node.data.component) {
        fabricCanvas.add(rect);
        return;
      }

      if(!groupsByComponentId.has(node.data.component)) {
        const group = new Group([rect], {
          originX: "center",
          originY: "center",
          objectCaching: false,
        });

        groupsByComponentId.set(node.data.component, group);
        fabricCanvas.add(group);
        return;
      }

      groupsByComponentId.get(node.data.component).add(rect);
      return;
    });

    fabricCanvas.requestRenderAll();
  });

  onDestroy(() => {
    graph.forEachNode((node) => {
      const rect = rectsByNodeId.get(node.id);
      if ("component" in node.data)
        layout.setNodePosition(node.id, (rect.left + rect.group.left) - offset, (rect.top + rect.group.top) - offset);
      else
        layout.setNodePosition(node.id, rect.left - offset, rect.top - offset);
    });
    fabricCanvas.dispose();
  });
</script>

<canvas bind:this={canvasHTMLElement} width="600" height="400"></canvas>

<style>
</style>
