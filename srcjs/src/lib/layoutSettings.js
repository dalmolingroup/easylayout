import forceLayoutViva from "./forceLayoutViva";
import forceLayoutD3 from "./forceLayoutD3";

const effectorFn = (layout, id) => {
    return (e) => {
        layout.simulator[id](e.target.value);
    }
};

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
                "effectorFn": effectorFn,
            },
            {
                "id": "springCoeff",
                "name": "Spring coefficient",
                "type": "range",
                "min": 0.0001,
                "max": 0.0025,
                "step": 0.00001,
                "value": 0.0002,
                "effectorFn": effectorFn,
            },
            {
                "id": "dragCoeff",
                "name": "Drag coefficient",
                "type": "range",
                "min": 0.01,
                "max": 1,
                "step": 0.01,
                "value": 0.01,
                "effectorFn": effectorFn,
            },
            {
                "id": "gravity",
                "name": "Gravity",
                "type": "range",
                "min": -2,
                "max": -0.1,
                "step": 0.1,
                "value": -0.4,
                "effectorFn": effectorFn,
            },
            {
                "id": "timeStep",
                "name": "Time step",
                "type": "range",
                "min": 1,
                "max": 100,
                "step": 1,
                "value": 10,
                "effectorFn": effectorFn,
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
                "effectorFn": effectorFn,
            },
            {
                "id": "velocityDecay",
                "name": "Velocity decay",
                "type": "range",
                "min": 0,
                "max": 1,
                "step": 0.01,
                "value": 0.4,
                "effectorFn": effectorFn,
            },
            {
                "id": "strength",
                "name": "Node repulsion",
                "type": "range",
                "min": 0,
                "max": 200,
                "step": 0.1,
                "value": 30,
                "effectorFn": (layout, id) => {
                    return (e) => {
                        layout.simulator.force("charge")[id](-e.target.value);
                    }
                },
            },
            {
                "id": "distance",
                "name": "Link distance",
                "type": "range",
                "min": 0,
                "max": 100,
                "step": 1,
                "value": 30,
                "effectorFn": (layout, id) => {
                    return (e) => {
                        layout.simulator.force("link")[id](e.target.value);
                    }
                },
            },
            {
                "id": "iterations",
                "name": "Link rigidity",
                "type": "range",
                "min": 0,
                "max": 200,
                "step": 0.1,
                "value": 30,
                "effectorFn": (layout, id) => {
                    return (e) => {
                        layout.simulator.force("link")[id](e.target.value);
                    }
                },
            },
        ],
    },
]

export default layoutSettings;