const graphJSON = {
    nodes: [
        { "id": "1", },
        { "id": "2", },
        { "id": "3", },
        { "id": "4", },
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