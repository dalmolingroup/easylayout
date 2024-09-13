export const nodeLoadTransform = (graph_json) => {
    // No matter what the first column of the graph is,
    // it's content will serve as the node ID
    const firstNode = graph_json.nodes[0];
    const firstColumnName = Object.keys(firstNode)[0];

    return (node) => {
        return {
            id: node[firstColumnName],
            data: node
        };
    };
};

export const linkLoadTransform = (graph_json) => {
    // No matter what the first two columns of the graph are,
    // their content will serve as "from" and "to" node IDs respectively
    const firstLink = graph_json.links[0];
    const firstColumnName = Object.keys(firstLink)[0];
    const secondColumnName = Object.keys(firstLink)[1];

    return (link) => {
        return {
            fromId: link[firstColumnName],
            toId: link[secondColumnName],
            data: link
        };
    };
};