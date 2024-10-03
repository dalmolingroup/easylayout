import Viva from "vivagraphjs";
import layoutSettings from "./layoutSettings.js";
import { SimulationWrapper } from "./SimulationWrapper.js";
import {
  nodeLoadTransform,
  linkLoadTransform,
} from "./customTransformFromRToViva";

export class SimulationWrapperViva extends SimulationWrapper {
  static containerType = "div";

  constructor(graphData) {
    super(graphData);
    this.graph = Viva.Graph.serializer().loadFromJSON(
        graphData,
        nodeLoadTransform(graphData),
        linkLoadTransform(graphData),
      );

    const selectedLayout = layoutSettings.find((l) => l.value === "viva");
    let settings = {};
    selectedLayout.settings.forEach((setting) => {
      settings[setting.id] = setting.value;
    });
    this.layout = selectedLayout.spec(this.graph, settings);

    this.graphics = Viva.Graph.View.webglGraphics();

    this.graphics.node(function(node) {
      return Viva.Graph.View.webglSquare(
        node.data.size || 10,
        node.data.color || "#000000"
      );
    });

    this.graph.forEachNode((node) => {
      if (node.data.x && node.data.y) {
        this.layout.setNodePosition(node.id, node.data.x, node.data.y);
      }
    });
  }

  start(containerElement) {
    this.renderer = Viva.Graph.View.renderer(this.graph, {
      layout: this.layout,
      container: containerElement,
      graphics: this.graphics,
      renderLinks: true,
      prerender: true,
    });
    
    this.renderer.run();
    this.renderer.pause();
  }

  pause() {
    if(this.renderer) this.renderer.pause();
  }

  resume() {
    this.renderer.resume();
  }

  getNodePositions() {
    let nodePositions = {};
    this.graph.forEachNode((node) => {
      let currPos = this.layout.getNodePosition(node.id);
      nodePositions[node.id] = {
        x: currPos.x,
        y: currPos.y,
      };
    });
  }

  // setNodePosition(nodeId, x, y) {
  //   this.layout.setNodePosition(nodeId, x, y);
  // }

  forEachNode(fn) {
    this.graph.forEachNode(fn);
  }

  forEachLink(fn) {
    this.graph.forEachLink(fn);
  }

  updateLayoutSetting(settingId) {
    return (e) => {
        this.layout.simulator[settingId](e.target.value);
    }
  }

  destroy() {
    console.log('"destroying"');
  }
}
