import Viva from 'vivagraphjs';

const settings = {
    springLength : 10,
    springCoeff : 0.0005,
    dragCoeff : 0.02,
    gravity : -1.2
}

export default function forceLayoutViva(graph) {
    const layout = Viva.Graph.Layout.forceDirected(graph, settings);
    return layout;
}