import forceLayoutViva from "./forceLayoutViva";
import forceLayoutD3 from "./forceLayoutD3";

const layoutSettings = [
    {
        "value": "viva",
        "name": "VivaGraphJS",
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
                "effectorFn": (layout, id) => {
                    return (e) => {
                        layout.simulator[id](e.target.value);
                    }
                }
            },
            {
                "id": "springCoeff",
                "name": "Spring coefficient",
                "type": "range",
                "min": 0.0001,
                "max": 0.0025,
                "step": 0.00001,
                "value": 0.0002,
                "effectorFn": (layout, id) => {
                    return (e) => {
                        layout.simulator[id](e.target.value);
                    }
                }
            },
            {
                "id": "dragCoeff",
                "name": "Drag coefficient",
                "type": "range",
                "min": 0.01,
                "max": 1,
                "step": 0.01,
                "value": 0.01,
                "effectorFn": (layout, id) => {
                    return (e) => {
                        layout.simulator[id](e.target.value);
                    }
                }
            },
            {
                "id": "gravity",
                "name": "Gravity",
                "type": "range",
                "min": -2,
                "max": -0.1,
                "step": 0.1,
                "value": -0.4,
                "effectorFn": (layout, id) => {
                    return (e) => {
                        layout.simulator[id](e.target.value);
                    }
                }
            },
            {
                "id": "timeStep",
                "name": "Time step",
                "type": "range",
                "min": 1,
                "max": 100,
                "step": 1,
                "value": 10,
                "effectorFn": (layout, id) => {
                    return (e) => {
                        layout.simulator[id](e.target.value);
                    }
                }
            },
        ],
    },
    {
        "value": "d3",
        "name": "d3-force",
        "spec": forceLayoutD3,
        "settings": [
            {
                "id": "temperatureDecay",
                "name": "Temperature decay",
                "type": "range",
                "min": 0,
                "max": 1,
                "step": 0.001,
                "value": 0.0228,
                "effectorFn": (layout) => {
                    return (e) => {
                        console.log(layout);
                        // layout.simulation[id](e.target.value);
                    }
                }
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
                "id": "gravity",
                "name": "Node repulsion",
                "type": "range",
                "min": 0,
                "max": 200,
                "step": 0.1,
                "value": 30,
            },
            {
                "id": "linkDistance",
                "name": "Link distance",
                "type": "range",
                "min": 0,
                "max": 100,
                "step": 1,
                "value": 30,
            },
            {
                "id": "springIterations",
                "name": "Link rigidity",
                "type": "range",
                "min": 0,
                "max": 200,
                "step": 0.1,
                "value": 30,
            },
        ],
    },
]

export default layoutSettings;