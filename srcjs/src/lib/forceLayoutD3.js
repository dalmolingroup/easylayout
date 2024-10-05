import {
  forceSimulation,
  forceManyBody,
  forceLink,
  forceCenter,
  forceCollide,
  forceX,
  forceY,
} from 'd3-force';

// const settings = {
//     springLength : 20,
//     springCoeff : 1,
//     springIterations: 10,
//     gravity: -30
// }

export default function d3Layout(graph, settings) {
    let nodes = [];
    let links = [];
    let nodeIndexLookup = new Map();
    let linkIndexLookup = new Map();
  
    graph.forEachNode(node => {
      const d3Node = {id: node.id};
      const index = nodes.length;
  
      nodes.push(d3Node);
      nodeIndexLookup.set(node.id, index);
    });
  
    graph.forEachLink(link => {
      const source = nodeIndexLookup.get(link.fromId);
      const target = nodeIndexLookup.get(link.toId);
      const index = links.length;
  
      const d3Link = {source: source, target: target, index: index};
  
      links.push(d3Link);
  
      linkIndexLookup.set(link.id, d3Link);
    })

    const fCharge = forceManyBody()
      .strength(settings.chargeStrength)
      .theta(settings.theta)
      .distanceMin(settings.distanceMin)
      .distanceMax(settings.distanceMax);

    const fLink = forceLink(links)
      .distance(settings.linkDistance)
      // .strength(settings.linkStrength) // TODO: slider could multiply accessor result
      .iterations(settings.linkIterations);

    const fCenter = forceCenter()
      .x(settings.centerX)
      .y(settings.centerY)
      .strength(settings.centerStrength);

    const fCollide = forceCollide()
      .radius(settings.collisionRadius)
      .strength(settings.collisionStrength);

    const fX = forceX()
      .x(settings.x)
      .strength(settings.xStrength);

    const fY = forceY()
      .y(settings.y)
      .strength(settings.yStrength);

    // const fRadial = forceRadial()
    //   .radius(settings.radialRadius)
    //   .strength(settings.radialStrength);
  
    const simulation = forceSimulation(nodes)
      .alphaDecay(settings.alphaDecay)
      .velocityDecay(settings.velocityDecay)
      .force("charge", fCharge)
      .force("link", fLink)
      .force("center", fCenter)
      .force("collide", fCollide)
      .force("x", fX)
      .force("y", fY);
  
    simulation.stop();
  
    return {
      simulator: simulation,

      step: function() {
        simulation.tick();
      },
  
      getNodePosition: getNodePosition,
  
      getLinkPosition: function(linkId) {
        var link = linkIndexLookup.get(linkId);
        return {
          from: link.source,
          to: link.target
        };
      },
  
      getGraphRect: function() {
        var minX = Number.POSITIVE_INFINITY;
        var minY = Number.POSITIVE_INFINITY;
        var maxX = Number.NEGATIVE_INFINITY;
        var maxY = Number.NEGATIVE_INFINITY;
  
        nodes.forEach(function(node) {
          if (node.x < minX) minX = node.x;
          if (node.x > maxX) maxX = node.x;
  
          if (node.y < minY) minY = node.y;
          if (node.y > maxY) maxY = node.y;
        })
  
        return {
          x1: minX,
          x2: maxX,
          y1: minY,
          y2: maxY
        }
      },
  
      isNodePinned: function() {
        // TODO: implement
        return false;
      },
  
      pinNode: function() {
        // TODO: implement me
        // https://github.com/vasturiano/react-force-graph/issues/95#issuecomment-545571055
      },
  
      dispose: function() {
      },
  
      setNodePosition: function(nodeId, x, y) {
        var pos = getNodePosition(nodeId);
        pos.x = x;
        pos.y = y;
      }
    }
  
    function getNodePosition(nodeId) {
      var idx = nodeIndexLookup.get(nodeId);
      return nodes[idx];
    }
}