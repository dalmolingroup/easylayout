const graphJSON = {
    nodes: [
        { "id": "1", "size": 20, "color": "#ff0000", "initialX": 123, "initialY": 123 },
        { "id": "2", "size": 40, "color": "#00ff00" },
        { "id": "3", "size": 5 },
        { "id": "4", "color": "#0000ff" },
        { "id": "5", "color": "#ff00ff", "component": "abc" },
        { "id": "6", "color": "#ff00ff", "component": "abc" },
        { "id": "7", "color": "#ff00ff", "component": "def" },
        { "id": "8", "color": "#ff00ff", "component": "def" },
        { "id": "9", "color": "#ff00ff", "component": "ghi" },
    ],
    links: [
        { "from": "1", "to": "2" },
        { "from": "1", "to": "3" },
        { "from": "1", "to": "4" },
        { "from": "2", "to": "3" },
        { "from": "2", "to": "4" },
        { "from": "3", "to": "4" },
        { "from": "5", "to": "6" },
        { "from": "7", "to": "8" },
    ]
}

export default graphJSON;