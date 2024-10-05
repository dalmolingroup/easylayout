import forceLayoutViva from "./forceLayoutViva";
import forceLayoutD3 from "./forceLayoutD3";

const layoutSettings = [
  {
    "value": "viva",
    "name": "@anvaka/VivaGraphJS",
    "spec": forceLayoutViva,
    "settings": [
      {
        "id": "springLength",
        "name": "Spring length",
        "type": "range",
        "min": 1,
        "max": 100,
        "step": 1,
        "value": 100,
      },
      {
        "id": "springCoeff",
        "name": "Spring coefficient",
        "type": "range",
        "min": 0.0001,
        "max": 0.0025,
        "step": 0.00001,
        "value": 0.0002,
      },
      {
        "id": "dragCoeff",
        "name": "Drag coefficient",
        "type": "range",
        "min": 0.01,
        "max": 1,
        "step": 0.01,
        "value": 0.01,
      },
      {
        "id": "gravity", // TODO: not updating during runtime
        "name": "Gravity",
        "type": "range",
        "min": -2,
        "max": -0.1,
        "step": 0.1,
        "value": -0.4,
      },
      {
        "id": "timeStep",
        "name": "Time step",
        "type": "range",
        "min": 1,
        "max": 100,
        "step": 1,
        "value": 10,
      },
    ],
  },
  {
    "value": "d3",
    "name": "@d3/d3-force",
    "spec": forceLayoutD3,
    "settings": [
      {
        "id": "alphaDecay",
        "name": "Temperature decay",
        "type": "range",
        "min": 0,
        "max": 1,
        "step": 0.001,
        "value": 0.0228,
      },
      {
        "id": "velocityDecay",
        "name": "Velocity decay",
        "type": "range",
        "min": 0,
        "max": 1,
        "step": 0.01,
        "value": 0.4,
      },
      {
        "id": "strength",
        "name": "Node repulsion",
        "type": "range",
        "min": -200,
        "max": 50,
        "step": 0.1,
        "value": -30,
      },
      {
        "id": "distance",
        "name": "Link distance",
        "type": "range",
        "min": 0,
        "max": 100,
        "step": 1,
        "value": 30,
      },
      {
        "id": "iterations",
        "name": "Link rigidity",
        "type": "range",
        "min": 1,
        "max": 10,
        "step": 1,
        "value": 1,
      },
    ],
  },
  {
    "value": "cosmo",
    "name": "@cosmograph-org/cosmo",
    "spec": null,
    "settings": [
      {
        "id": "repulsion",
        "name": "Repulsion force coefficient",
        "type": "range",
        "min": 0.0,
        "max": 2.0,
        "step": 0.01,
        "value": 0.1
      },
      {
        "id": "repulsionTheta",
        "name": "Detalization of Many-Body force calculations (Barnes–Hut approximation criterion)",
        "type": "range",
        "min": 0.3,
        "max": 2.0,
        "step": 0.1,
        "value": 1.7
      },
      {
        "id": "repulsionQuadtreeLevels",
        "name": "Barnes–Hut approximation depth",
        "type": "range",
        "min": 5,
        "max": 12,
        "step": 1,
        "value": 12
      },
      {
        "id": "linkSpring",
        "name": "Link spring force coefficient",
        "type": "range",
        "min": 0.0,
        "max": 2.0,
        "step": 0.01,
        "value": 1.0
      },
      {
        "id": "linkDistance",
        "name": "Minimum link distance",
        "type": "range",
        "min": 1,
        "max": 20,
        "step": 1,
        "value": 2
      },
      {
        "id": "linkDistRandomVariationRange",
        "name": "Link distance randomness multiplier range",
        "type": "range",
        "value": [1.0, 1.2]
      },
      {
        "id": "gravity",
        "name": "Gravity force coefficient",
        "type": "range",
        "min": 0.0,
        "max": 1.0,
        "step": 0.01,
        "value": 0.0
      },
      {
        "id": "center",
        "name": "Centering force coefficient",
        "type": "range",
        "min": 0.0,
        "max": 1.0,
        "step": 0.01,
        "value": 0.0
      },
      {
        "id": "friction",
        "name": "Friction coefficient",
        "type": "range",
        "min": 0.8,
        "max": 1.0,
        "step": 0.01,
        "value": 0.85
      },
      {
        "id": "decay",
        "name": "Force simulation decay coefficient",
        "type": "range",
        "min": 100,
        "max": 10000,
        "step": 100,
        "value": 1000
      },
      // {
      //     "id": "repulsionFromMouse",
      //     "name": "Repulsion from the mouse pointer force coefficient",
      //     "type": "range",
      //     "min": 0.0,
      //     "max": 5.0,
      //     "step": 0.1,
      //     "value": 2.0
      // },
    ]
  },
]

export default layoutSettings;