import Viva from "vivagraphjs";
import layoutSettings from "./layoutSettings.js";
import { SimulationWrapper } from "./SimulationWrapper.js";
import {
  nodeLoadTransform,
  linkLoadTransform,
} from "./customTransformFromRToViva";


export class SimulationWrapperBase extends SimulationWrapper {
  constructor(graphData) {
    super(graphData);
    this.graph = Viva.Graph.serializer().loadFromJSON(
      graphData,
      nodeLoadTransform(graphData),
      linkLoadTransform(graphData),
    );
    this.graphics = Viva.Graph.View.webglGraphics();

    this.graphics.node(function (node) {
      return Viva.Graph.View.webglSquare(
        node.data.size || 10,
        node.data.color || "#000000"
      );
    });
  }

  start(containerElement, nodePositions) {
    if (Object.keys(nodePositions).length > 0) {
      this.graph.forEachNode((node) => {
        const prevNodePosition = nodePositions[node.id];
        this.layout.setNodePosition(node.id, prevNodePosition.x, prevNodePosition.y);
      });
    } else {
      this.graph.forEachNode((node) => {
        if (node.data.initialX)
          this.layout.setNodePosition(node.id, node.data.initialX, node.data.initialY);
      });
    }

    this.renderer = Viva.Graph.View.renderer(this.graph, {
      layout: this.layout,
      container: containerElement,
      graphics: this.graphics,
      renderLinks: true,
      prerender: true,
    });

    this.renderer.run();
    this.started = true;
    this.renderer.pause();

    // const graphRect = this.layout.getGraphRect();
    // const layoutCenterX = (graphRect.x1 + graphRect.x2) / 2;
    // const layoutCenterY = (graphRect.y1 + graphRect.y2) / 2;
    // this.renderer.moveTo(layoutCenterX, layoutCenterY);
  }

  pause() {
    if (this.renderer) this.renderer.pause();
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
    return nodePositions;
  }

  forEachNode(fn) {
    this.graph.forEachNode(fn);
  }

  forEachLink(fn) {
    this.graph.forEachLink(fn);
  }

  updateLayoutSetting(settingId) {
    throw new Error("Method 'updateLayoutSetting(settingId)' must be implemented.");
  }

  destroy() {
    // console.log('"destroying"');
  }
}

export class SimulationWrapperViva extends SimulationWrapperBase {
  #selectedLayout;

  constructor(graphData,) {
    super(graphData);

    this.#selectedLayout = layoutSettings.find((l) => l.value === "viva");
    let settings = {};
    this.#selectedLayout.settings.forEach((setting) => {
      settings[setting.id] = setting.value;
    });
    this.layout = this.#selectedLayout.spec(this.graph, settings);
  }

  updateLayoutSetting(settingId) {
    return (e) => {
      this.layout.simulator[settingId](e.target.value);
    }
  }
}

export class SimulationWrapperD3 extends SimulationWrapperBase {
  #selectedLayout;

  constructor(graphData,) {
    super(graphData);

    this.#selectedLayout = layoutSettings.find((l) => l.value === "d3");
    let settings = {};
    this.#selectedLayout.settings.forEach((setting) => {
      settings[setting.id] = setting.value;
    });
    this.layout = this.#selectedLayout.spec(this.graph, settings);
  }

  updateLayoutSetting(settingId) {
    const acessor = {
      alphaDecay: this.layout.simulator.alphaDecay,
      velocityDecay: this.layout.simulator.velocityDecay,
  
      // Many-body force
      chargeStrength: this.layout.simulator.force("charge").strength,
      theta: this.layout.simulator.force("charge").theta,
      distanceMin: this.layout.simulator.force("charge").distanceMin,
      distanceMax: this.layout.simulator.force("charge").distanceMax,
  
      // Link force
      linkDistance: this.layout.simulator.force("link").distance,
      linkStrength: this.layout.simulator.force("link").strength,
      linkIterations: this.layout.simulator.force("link").iterations,
  
      // Centering force
      centerX: this.layout.simulator.force("center").x,
      centerY: this.layout.simulator.force("center").y,
      centerStrength: this.layout.simulator.force("center").strength,
  
      // Collision force
      collisionRadius: this.layout.simulator.force("collide").radius,
      collisionStrength: this.layout.simulator.force("collide").strength, 
      collisionIterations: this.layout.simulator.force("collide").iterations, 
  
      // Positioning forces
      x: this.layout.simulator.force("x").x,
      y: this.layout.simulator.force("y").y,
      xStrength: this.layout.simulator.force("x").strength,
      yStrength: this.layout.simulator.force("y").strength,
  
      // Radial force
      // radialRadius: this.layout.simulator.force("radial").radius,
      // radialStrength: this.layout.simulator.force("radial").strength,
    };

    return (e) => {
      acessor[settingId](e.target.value);
      this.layout.simulator.alpha(1).restart();
    }
  }
}
