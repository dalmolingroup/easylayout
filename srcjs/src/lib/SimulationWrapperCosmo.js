import { Cosmograph } from "@cosmograph/cosmograph";
import { SimulationWrapper } from "./SimulationWrapper.js";

export class SimulationWrapperCosmo extends SimulationWrapper {
  static containerType = "canvas";

  constructor(graphData) {
    super(graphData);
    this.config = {
      nodeColor: (d) => d.color,
      nodeSize: (d) => d.size,
      linkWidth: 2,
    };

    const firstNode = graphData.nodes[0];
    const nodeFirstColumnName = Object.keys(firstNode)[0];

    this.nodes = this.graphData.nodes.map((node) => {
      return {
        id: node[nodeFirstColumnName],
        x: node.x || null,
        y: node.y || null,
        size: (node.size / 2) || 5,
        color: node.color || [0, 0, 0, 1],
        component: node.component || null,
      };
    });

    const firstLink = graphData.links[0];
    const linkFirstColumnName = Object.keys(firstLink)[0];
    const linkSecondColumnName = Object.keys(firstLink)[1];

    this.links = this.graphData.links.map((link) => {
      return {
        source: link[linkFirstColumnName],
        target: link[linkSecondColumnName],
      };
    });
  }

  start(containerElement) {
    this.graph = new Cosmograph(containerElement, this.config);
    this.graph.setData(this.nodes, this.links);
    this.graph.fitView();
    this.graph.pause();
  }

  pause() {
    if(this.graph.isSimulationRunning) this.graph.pause();
  }

  resume() {
    this.graph.restart();
  }

  getNodePositions() {
    this.graph.getNodePositions();
  }

  // setNodePosition() {
  //   throw new Error("Method 'setNodePosition()' must be implemented.");
  // }

  forEachNode(fn) {
    this.nodes.forEach(fn);
  }

  forEachLink(fn) {
    this.links.forEach(fn);
  }

  updateLayoutSetting(newData) {
    // this.graphData = newData;
    // this.graph.setData(this.graphData.nodes, this.graphData.links);
  }

  destroy() {
    this.graph.remove();
  }
}
