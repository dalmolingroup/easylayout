export const nodeLoadTransform = (node) => {
    return {
        id: node["name"],
        data: node
    };
};

export const linkLoadTransform = (link) => {
    return {
        fromId: link["from"],
        toId: link["to"],
        data: link
    };
};