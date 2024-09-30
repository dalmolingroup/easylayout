import { Point } from "fabric";

export function computeHeightAfterRotation(angle, group) {
  const radians = (angle * Math.PI) / 180;

  // Rotate each point around the center of the list of points
  const rotatedListOfPoints = group._objects.map((obj) => {
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

// Binary search optimization
export function minimizeFunction(fn, ...args) {
  let left = -90;
  let right = 90;
  let precision = 1;

  while (right - left > precision) {
    let mid1 = left + (right - left) / 3;
    let mid2 = right - (right - left) / 3;

    let height1 = fn(mid1, ...args);
    let height2 = fn(mid2, ...args);

    if (height1 < height2) {
      right = mid2;
    } else {
      left = mid1;
    }
  }

  let optimalValue = (left + right) / 2;
  return optimalValue;
}

// fabricjs.com/fabric-intro-part-5
export function setUpZoomAndPan(fabricCanvas) {
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
}
