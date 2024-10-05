import { Cosmograph } from "@cosmograph/cosmograph";
import { SimulationWrapper } from "./SimulationWrapper.js";

export class SimulationWrapperCosmo extends SimulationWrapper {
  #nodeLinks;

  constructor(graphData) {
    super(graphData);
    this.config = {
      nodeColor: (d) => d.color,
      nodeSize: (d) => Math.pow(d.size, 1/2),
      nodeSizeScale: 2,
      linkWidth: 2,
      fitViewOnInit: true,
      linkArrows: false,
      linkColor: [144, 144, 144, 1],
      backgroundColor: [248, 250, 252, 1],
      showTopLabels: false,
      showDynamicLabels: false,
      showHoveredNodeLabel: false,
      renderHoveredNodeRing: false,
      // disableSimulation: true,
      spaceSize: 128,
      // fitViewDelay: 0,
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
    const nodePositionsEmpty = Object.keys(nodePositions).length <= 0;

    this.nodes = this.graphData.nodes.map((node) => {
      const nodeId = String(node[nodeFirstColumnName]);

      const transformedNode = {
        id: nodeId,
        size: node.size || 5,
        color: node.color || [0, 0, 0, 1],
        component: node.component || null,
        links: this.#nodeLinks.get(nodeId),
      };

      if (nodePositionsEmpty) {
        transformedNode.x = node.initialX;
        transformedNode.y = node.initialY;
      } else {
        const nodePos = nodePositions[nodeId];
        transformedNode.x = nodePos.x;
        transformedNode.y = -nodePos.y;
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
      this.graph.start();
      this.firstLoad = false;
    } else {
      this.graph.restart();
    }
  }

  getNodePositions() {
    const nodePositions = this.graph.getNodePositions();
    const transformedPositions = {};

    Object.entries(nodePositions).forEach(([nodeId, pos]) => {
      const transformedPosition = this.graph.spaceToScreenPosition([pos.x, pos.y]);
      transformedPositions[nodeId] = {
        x: transformedPosition[0],
        y: transformedPosition[1],
      };
    });

    const numberOfNodes = this.nodes.length;
    const centerX = Object.values(transformedPositions).reduce((acc, curr) => acc + curr.x, 0) / numberOfNodes;
    const centerY = Object.values(transformedPositions).reduce((acc, curr) => acc + curr.y, 0) / numberOfNodes;

    Object.entries(transformedPositions).forEach(([nodeId, pos]) => {
      transformedPositions[nodeId] = {
        x: pos.x - centerX,
        y: pos.y - centerY,
      };
    });

    return transformedPositions;
  }

  forEachNode(fn) {
    this.nodes.forEach(fn);
  }

  forEachLink(fn) {
    this.links.forEach(fn);
  }

  updateLayoutSetting(settingId) {
    return (e) => {
      this.graph.setConfig({ [settingId]: + e.target.value });
    }
  }

  destroy() {
    this.graph.remove();
  }
}
