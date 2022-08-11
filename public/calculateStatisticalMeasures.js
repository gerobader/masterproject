onmessage = (e) => {
  const {nodeClones, directed} = e.data;
  const nodeIds = Object.keys(nodeClones);

  const calculateCloseness = (node) => {
    if (!node.pathMap) return 0;
    const reachableNodeIds = Object.keys(node.pathMap);
    if (reachableNodeIds.length !== nodeIds.length - 1) return 0;
    const distanceSum = reachableNodeIds.reduce((prevVal, targetNodeId) => prevVal + node.pathMap[targetNodeId].distance, 0);
    return reachableNodeIds.length / distanceSum;
  };

  const calculateBetweenness = (currentNode) => {
    let allShortestPathsCount = 0;
    let shortestPathPassThroughCount = 0;
    nodeIds.forEach((nodeId) => {
      const node = nodeClones[nodeId];
      if (node.id === currentNode.id || !node.pathMap) return;
      Object.keys(node.pathMap).forEach((targetNodeId) => {
        if (parseInt(targetNodeId, 10) === currentNode.id) return;
        const pathsToTargetNode = node.pathMap[targetNodeId];
        pathsToTargetNode.paths.forEach((path) => {
          allShortestPathsCount++;
          if (path.find((pathNode) => pathNode.id === currentNode.id)) shortestPathPassThroughCount++;
        });
      });
    });
    if (allShortestPathsCount === 0) return 0;
    return shortestPathPassThroughCount / allShortestPathsCount;
  };

  const calculateLocalClusteringCoefficient = (node) => {
    const degree = node.targetForEdges.length + node.sourceForEdges.length;
    let maxPossibleLinks = degree * (degree - 1);
    if (!directed) maxPossibleLinks /= 2;
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
    return existingLinks / maxPossibleLinks;
  };

  nodeIds.forEach((nodeId) => {
    const node = nodeClones[nodeId];
    node.data = {
      closeness: calculateCloseness(node),
      betweenness: calculateBetweenness(node),
      lcc: calculateLocalClusteringCoefficient(node)
    };
    postMessage({
      type: 'progress',
      nodeId: parseInt(nodeId, 10)
    });
  });
  postMessage({type: 'finished', updatedClones: nodeClones});
  // eslint-disable-next-line no-restricted-globals
  self.close();
};
