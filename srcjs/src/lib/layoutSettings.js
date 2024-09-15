import forceLayoutViva from "./forceLayoutViva";
import forceLayoutD3 from "./forceLayoutD3";

const layoutSettings = [
    {
        "value": "viva",
        "name": "VivaGraphJS",
        "spec": forceLayoutViva,
        "settings": [
            {
                "name": "Spring length",
                "type": "range",
                "min": 0,
                "max": 10,
                "step": 0.1,
                "value": 1,
            },
            {
                "name": "Spring coefficient",
                "type": "range",
                "min": 0,
                "max": 10,
                "step": 0.1,
                "value": 1,
            },
            {
                "name": "Drag coefficient",
                "type": "range",
                "min": 0,
                "max": 10,
                "step": 0.1,
                "value": 1,
            },
            {
                "name": "Gravity",
                "type": "range",
                "min": 0,
                "max": 10,
                "step": 0.1,
                "value": 1,
            },
        ],
    },
    {
        "value": "d3",
        "name": "d3-force",
        "spec": forceLayoutD3,
        "settings": [
            {
                "name": "Temperature decay",
                "type": "range",
                "min": 0,
                "max": 1,
                "step": 0.001,
                "value": 0.0228,
            },
            {
                "name": "Velocity decay",
                "type": "range",
                "min": 0,
                "max": 1,
                "step": 0.01,
                "value": 0.4,
            },
            {
                "name": "Node repulsion",
                "type": "range",
                "min": 0,
                "max": 200,
                "step": 0.1,
                "value": 30,
            },
            {
                "name": "Link distance",
                "type": "range",
                "min": 0,
                "max": 100,
                "step": 1,
                "value": 30,
            },
            {
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