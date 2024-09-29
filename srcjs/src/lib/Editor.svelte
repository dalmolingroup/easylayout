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
  import {
    computeHeightAfterRotation,
    minimizeFunction,
    setUpZoomAndPan,
  } from "./utils";

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
  }

  export function rotateComponents(event) {
    if (!fabricCanvas) return;

    groupsByComponentId.forEach((group, componentId) => {
      if (group._objects.length === 1) return;

      const optimalAngle = minimizeFunction(computeHeightAfterRotation, group);
      rotateComponent(group, componentId, optimalAngle);
    });
    fabricCanvas.renderAll();
  }

  // <disable-scaling src=fabricjs.github.io/docs/configuring-controls>
  // Removing all six scaling handles, keeping rotating handle
  const controls = {
    controls: { mtr: controlsUtils.createObjectDefaultControls().mtr },
  };

  ActiveSelection.createControls = () => controls;
  Group.createControls = () => controls;

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

    childObjects.forEach((child) => {
      // TODO: Handle nested groups recursively
      if ("_objects" in child) return;

      const pointRelativeToParent = new Point(child.left, child.top);
      const pointRelativeToGrandparent = pointRelativeToParent.transform(
        rootObject.calcTransformMatrix(),
      );

      let finalPoint = rootObjectIsGroup
        ? pointRelativeToGrandparent
        : pointRelativeToParent;

      child.linksDeparting.forEach((linkId) => {
        const line = linesByLinkId.get(linkId);
        line.set({ x1: finalPoint.x, y1: finalPoint.y });
      });
      child.linksArriving.forEach((linkId) => {
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

    setUpZoomAndPan(fabricCanvas);

    // TODO: Refactor and rename variables for clarity
    // fabricjs.com/using-transformations
    // fabricjs.github.io/docs/understanding-fabricjs/transformations
    // davelage.com/posts/fabric-selection-group-positioning
    // medium.com/@luizzappa/the-transformation-matrix-in-fabric-js-fb7f733d0624
    // OBRIGADO @luizzappa VC MERECE UM BEIJO
    fabricCanvas.on({
      "object:moving": (event) => updateLines(event.target),
      "object:rotating": (event) => updateLines(event.target),
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
      }

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

      if (!node.data.component) {
        fabricCanvas.add(rect);
        return;
      }

      if (!groupsByComponentId.has(node.data.component)) {
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
        layout.setNodePosition(
          node.id,
          rect.left + rect.group.left - offset,
          rect.top + rect.group.top - offset,
        );
      else
        layout.setNodePosition(node.id, rect.left - offset, rect.top - offset);
    });
    fabricCanvas.dispose();
  });
</script>

<canvas bind:this={canvasHTMLElement} width="600" height="400"></canvas>

<style>
</style>
