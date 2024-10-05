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
  import GrowingPacker from "./packer.growing.js";

  export let simulation;
  export let nodePositions;

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

    return newGroup;
  }

  function getLCCBBox(canvas) {
    return canvas.getObjects().reduce(
      (acc, obj) => {
        if (obj.isLCC) {
          acc.minLeft = Math.min(acc.minLeft, obj.left);
          acc.minTop = Math.min(acc.minTop, obj.top);
          acc.maxLeft = Math.max(acc.maxLeft, obj.left);
          acc.maxTop = Math.max(acc.maxTop, obj.top);
        }
        return acc;
      },
      {
        minLeft: Infinity,
        minTop: Infinity,
        maxLeft: -Infinity,
        maxTop: -Infinity,
      }
    );
  }

  export function packComponents(event) {
    if (!fabricCanvas) return;

    const PADDING = 10;
    let blocks = [];

    groupsByComponentId.forEach((group, componentId) => {
      let g = group;

      // No need to rotate if component only has one node
      if (group._objects.length > 1) {
        const optimalAngle = minimizeFunction(computeHeightAfterRotation, group);
        g = rotateComponent(group, componentId, optimalAngle);
      }

      blocks.push({ w: g.width + PADDING, h: g.height + PADDING, componentId });
    });

    const lccBoundingBox = getLCCBBox(fabricCanvas);

    // Sort blocks by width first and then height, both descending
    blocks.sort((a, b) => {
      if (a.w === b.w) return b.h - a.h;
      return b.w - a.w;
    });

    // Instantiate GrowingPacker and fit the blocks
    const packer = new GrowingPacker(
      lccBoundingBox.maxLeft + PADDING + (blocks[0].w / 2),
      lccBoundingBox.minTop,
      lccBoundingBox.maxLeft - lccBoundingBox.minLeft,
      lccBoundingBox.maxTop - lccBoundingBox.minTop,
    );
    packer.fit(blocks);

    blocks.forEach((block) => {
      if (block.fit) {
        const group = groupsByComponentId.get(block.componentId);
        group.left = block.fit.x;
        group.top = block.fit.y;
        group.setCoords();
        updateLines(group);
      }
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

  export function discardActiveSelection() {
    fabricCanvas.discardActiveObject();
  }

  export function persistNodePositions() {
    simulation.forEachNode((node) => {
      const rect = rectsByNodeId.get(node.id);

      if (rect.isLCC) {
        nodePositions[node.id] = { x: rect.left, y: rect.top };
        return;
      }

      // TODO: This should be made recursive like updateLines
      const pointRelativeToParent = new Point(rect.left, rect.top);
      const pointRelativeToGrandparent = pointRelativeToParent.transform(
        rect.group.calcTransformMatrix()
      );

      nodePositions[node.id] = {
        x: pointRelativeToGrandparent.x,
        y: pointRelativeToGrandparent.y,
      };
    });
  }

  function updateLines(rootObject, cumulativeMatrix = [1, 0, 0, 1, 0, 0]) {
    const rootObjectIsGroup = "_objects" in rootObject;

    if (rootObjectIsGroup) {
      rootObject._objects.forEach((child) => {
        updateLines(child, rootObject.calcTransformMatrix());
      });
      return;
    }

    const pointRelativeToParent = new Point(rootObject.left, rootObject.top);
    const pointRelativeToGrandparent = pointRelativeToParent.transform(
      rootObjectIsGroup ? rootObject.calcTransformMatrix() : cumulativeMatrix,
    );

    rootObject.linksDeparting.forEach((linkId) => {
      const line = linesByLinkId.get(linkId);
      line.set({ x1: pointRelativeToGrandparent.x, y1: pointRelativeToGrandparent.y });
    });
    rootObject.linksArriving.forEach((linkId) => {
      const line = linesByLinkId.get(linkId);
      line.set({ x2: pointRelativeToGrandparent.x, y2: pointRelativeToGrandparent.y });
    });
  }

  onMount(() => {
    fabricCanvas = new Canvas(canvasHTMLElement, {
      fireRightClick: true,
      stopContextMenu: true,
    });

    setUpZoomAndPan(fabricCanvas);

    // fabricjs.com/using-transformations
    // fabricjs.github.io/docs/understanding-fabricjs/transformations
    // davelage.com/posts/fabric-selection-group-positioning
    // medium.com/@luizzappa/the-transformation-matrix-in-fabric-js-fb7f733d0624
    // OBRIGADO @luizzappa VC MERECE UM BEIJO
    fabricCanvas.on({
      "object:moving": (event) => updateLines(event.target),
      "object:rotating": (event) => updateLines(event.target),
    });

    simulation.forEachLink((link) => {
      const start = nodePositions[link.fromId || link.source];
      const end = nodePositions[link.toId || link.target];
      const coords = [start.x, start.y, end.x, end.y];

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

    simulation.forEachNode((node) => {
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

      const nodePos = nodePositions[node.id];

      const component =
        "data" in node
        ? node.data.component || null
        : node.component || null;

      const rect = new Rect({
        left: nodePos.x,
        top: nodePos.y,
        fill: node.color || node.data.color || "#000000",
        width: node.size || node.data.size || 10,
        height: node.size || node.data.size || 10,
        angle: 90,
        hasControls: false,
        originX: "center",
        originY: "center",
        objectCaching: false,
        linksDeparting: linksDeparting,
        linksArriving: linksArriving,
        isLCC: component === null,
      });

      rectsByNodeId.set(node.id, rect);

      if (component === null) {
        fabricCanvas.add(rect);
        return;
      }

      if (!groupsByComponentId.has(component)) {
        const group = new Group([rect], {
          originX: "center",
          originY: "center",
          objectCaching: false,
        });

        groupsByComponentId.set(component, group);
        fabricCanvas.add(group);
        return;
      }

      groupsByComponentId.get(component).add(rect);
      return;
    });

    fabricCanvas.requestRenderAll();

    const lccBoundingBox = getLCCBBox(fabricCanvas);

    const lccCenterX = (lccBoundingBox.minLeft + lccBoundingBox.maxLeft) / 2
    const lccCenterY = (lccBoundingBox.minTop + lccBoundingBox.maxTop) / 2

    // github.com/anvaka/VivaGraphJS/blob/6373e7e83f1a878a8bfb9a7f15ed84825f62030b/demos/other/precompute-advanced.html#L66
    const graphSize = Math.min(lccBoundingBox.maxLeft - lccBoundingBox.minLeft, lccBoundingBox.maxTop - lccBoundingBox.minTop);
    const screenSize = Math.min(canvasHTMLElement.clientWidth, canvasHTMLElement.clientHeight);
    const desiredScale = screenSize / graphSize;

    const canvasCenter = new Point(
      -canvasHTMLElement.clientWidth / 2 + lccCenterX,
      -canvasHTMLElement.clientHeight / 2 + lccCenterY
    )
    
    // stackoverflow.com/questions/54395045/fabricjs-programmatically-pan-canvas-on-mobile-browser
    fabricCanvas.zoomToPoint(canvasCenter, fabricCanvas.getZoom() / (desiredScale * 0.1));
    fabricCanvas.absolutePan(canvasCenter);
  });

  onDestroy(() => {
    persistNodePositions();
    fabricCanvas.dispose();
  });
</script>

<canvas bind:this={canvasHTMLElement} width="600" height="400"></canvas>

<style>
</style>
