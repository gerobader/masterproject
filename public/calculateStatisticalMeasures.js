onmessage = (e) => {
  const nodeClones = e.data;
  const nodeIds = Object.keys(nodeClones);

  const calculateCloseness = (node) => {
    const sum = Object.keys(node.pathMap).reduce((prevVal, currVal) => prevVal + node.pathMap[currVal].distance, 0);
    return Math.round((sum / (nodeIds.length - 1)) * 1000) / 1000;
  };

  const calculateBetweenness = (currentNode) => {
    let allShortestPathsCount = 0;
    let shortestPathPassThroughCount = 0;
    nodeIds.forEach((nodeId) => {
      const node = nodeClones[nodeId];
      if (node.id === currentNode.id) return;
      Object.keys(node.pathMap).forEach((targetNodeId) => {
        if (parseInt(targetNodeId, 10) === currentNode.id) return;
        const pathsToTargetNode = node.pathMap[targetNodeId];
        pathsToTargetNode.paths.forEach((path) => {
          allShortestPathsCount++;
          if (path.find((pathNode) => pathNode.id === currentNode.id)) shortestPathPassThroughCount++;
        });
      });
    });
    return Math.round(((shortestPathPassThroughCount / allShortestPathsCount) * 100) * 1000) / 1000;
  };

  const calculateLocalClusteringCoefficient = (node, isDirectedGraph) => {
    const degree = node.targetForEdges.length + node.sourceForEdges.length;
    let maxPossibleLinks = degree * (degree - 1);
    if (!isDirectedGraph) maxPossibleLinks /= 2;
    if (maxPossibleLinks === 0) return 0;
    let existingLinks = 0;
    const connectedNodes = new Set();
    node.targetForEdges.forEach((edge) => connectedNodes.add(nodeClones[edge.sourceNode]));
    node.sourceForEdges.forEach((edge) => connectedNodes.add(nodeClones[edge.targetNode]));
    connectedNodes.forEach((connectedNode) => {
      const connectedNodesV2 = new Set();
      connectedNode.sourceForEdges.forEach((edge) => connectedNodesV2.add(nodeClones[edge.targetNode]));
      connectedNodesV2.forEach((connectedNodeV2) => {
        if (connectedNodes.has(connectedNodeV2)) existingLinks++;
      });
    });
    return Math.round((existingLinks / maxPossibleLinks) * 1000) / 1000;
  };

  nodeIds.forEach((nodeId) => {
    const node = nodeClones[nodeId];
    const closeness = calculateCloseness(node);
    const betweenness = calculateBetweenness(node);
    const lcc = calculateLocalClusteringCoefficient(node, false);
    postMessage({
      type: 'progress',
      nodeId: parseInt(nodeId, 10),
      statisticalMeasures: {closeness, betweenness, lcc}
    });
  });
  postMessage({type: 'finished'});

  // eslint-disable-next-line no-restricted-globals
  self.close();
};
