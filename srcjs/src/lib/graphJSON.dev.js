const graphJSON = {
    nodes: [
        { "id": "1", "size": 20, "color": "#ff0000" },
        { "id": "2", "size": 40, "color": "#00ff00" },
        { "id": "3", "size": 5 },
        { "id": "4", "color": "#0000ff" },
    ],
    links: [
        { "from": "1", "to": "2" },
        { "from": "1", "to": "3" },
        { "from": "1", "to": "4" },
        { "from": "2", "to": "3" },
        { "from": "2", "to": "4" },
        { "from": "3", "to": "4" },
    ]
}

export default graphJSON;