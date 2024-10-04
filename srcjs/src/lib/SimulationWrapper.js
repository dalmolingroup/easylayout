export class SimulationWrapper {
  constructor(graphData) {
    if (new.target === SimulationWrapper) {
      throw new TypeError("Cannot construct SimulationWrapper instances directly");
    }
    this.graphData = graphData;
    this.started = false;
  }

  start(containerElement, nodePositions) {
    throw new Error("Method 'start(containerElement, nodePositions)' must be implemented.");
  }

  pause() {
    throw new Error("Method 'pause()' must be implemented.");
  }

  resume() {
    throw new Error("Method 'resume()' must be implemented.");
  }

  getNodePositions() {
    throw new Error("Method 'getNodePositions()' must be implemented.");
  }

  // setNodePosition() {
  //   throw new Error("Method 'setNodePosition()' must be implemented.");
  // }

  forEachNode() {
    throw new Error("Method 'forEachNode()' must be implemented.");
  }

  forEachLink() {
    throw new Error("Method 'forEachLink()' must be implemented.");
  }

  updateLayoutSetting(newData) {
    throw new Error("Method 'updateLayoutSetting()' must be implemented.");
  }

  destroy() {
    throw new Error("Method 'destroy()' must be implemented.");
  }
}
