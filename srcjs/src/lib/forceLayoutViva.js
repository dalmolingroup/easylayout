import Viva from 'vivagraphjs';

export default function forceLayoutViva(graph, settings) {
    const layout = Viva.Graph.Layout.forceDirected(graph, settings);
    return layout;
}