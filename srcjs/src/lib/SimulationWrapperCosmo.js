import { Cosmograph } from "@cosmograph/cosmograph";
import { SimulationWrapper } from "./SimulationWrapper.js";

export class SimulationWrapperCosmo extends SimulationWrapper {
  #nodeLinks;

  constructor(graphData) {
    super(graphData);
    this.config = {
      nodeColor: (d) => d.color,
      nodeSize: (d) => d.size,
      nodeSizeScale: 0.5,
      linkWidth: 2,
      fitViewOnInit: true,
      linkArrows: false,
      linkColor: [144, 144, 144, 1],
      backgroundColor: [248, 250, 252, 1],
      showTopLabels: false,
      showDynamicLabels: false,
      showHoveredNodeLabel: false,
      renderHoveredNodeRing: false,
      disableSimulation: true,
    };

    this.firstLoad = true;

    const firstLink = this.graphData.links[0];
    const linkFirstColumnName = Object.keys(firstLink)[0];
    const linkSecondColumnName = Object.keys(firstLink)[1];

    this.#nodeLinks = new Map();

    this.links = this.graphData.links.map((link) => {
      const source = String(link[linkFirstColumnName]);
      const target = String(link[linkSecondColumnName]);

      if (this.#nodeLinks.get(source) == undefined)
        this.#nodeLinks.set(source, []);

      if (this.#nodeLinks.get(target) == undefined)
        this.#nodeLinks.set(target, []);

      const currentId = `${source}_${target}`;

      this.#nodeLinks.get(source).push({
        id: currentId,
        fromId: source,
        toId: target,
      });

      this.#nodeLinks.get(target).push({
        id: currentId,
        fromId: source,
        toId: target,
      });

      return {
        id: currentId,
        source: source,
        target: target,
      };
    });
  }

  start(containerElement, nodePositions) {
    const firstNode = this.graphData.nodes[0];
    const nodeFirstColumnName = Object.keys(firstNode)[0];

    this.nodes = this.graphData.nodes.map((node) => {
      const nodeId = String(node[nodeFirstColumnName]);

      const transformedNode = {
        id: nodeId,
        size: node.size || 5,
        color: node.color || [0, 0, 0, 1],
        component: node.component || null,
        links: this.#nodeLinks.get(nodeId),
      };

      if (Object.keys(nodePositions).length > 0) {
        const nodePos = nodePositions[nodeId];
        transformedNode.x = nodePos.x;
        transformedNode.y = -nodePos.y;
      } else {
        transformedNode.x = node.initialX;
        transformedNode.y = node.initialY;
      }

      return transformedNode;
    });

    this.graph = new Cosmograph(containerElement, this.config);
    this.graph.setData(this.nodes, this.links);
    this.started = true;
    this.graph.pause();
  }

  pause() {
    this.graph.pause();
  }

  resume() {
    if (this.firstLoad) {
      this.graph.setConfig({ disableSimulation: false });
      this.graph.start();
      this.firstLoad = false;
    } else {
      this.graph.restart();
    }
  }

  getNodePositions() {
    return this.graph.getNodePositions();
  }

  forEachNode(fn) {
    this.nodes.forEach(fn);
  }

  forEachLink(fn) {
    this.links.forEach(fn);
  }

  updateLayoutSetting(settingId) {
    return (e) => {
        this.graph.setConfig({ [settingId]: e.target.value });
    }
  }

  destroy() {
    this.graph.remove();
  }
}
