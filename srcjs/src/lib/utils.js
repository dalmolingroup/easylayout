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
