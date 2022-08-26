import {Matrix, EigenvalueDecomposition} from 'ml-matrix';

onmessage = (e) => {
  const {nodeClones, adjacencyMatrix, directed} = e.data;
  const nodeIds = Object.keys(nodeClones);

  /**
   * calculates the closeness value of a node
   * @param node - the node to calculate the value for
   * @returns {number} - the closeness value
   */
  const calculateCloseness = (node) => {
    if (!node.pathMap) return 0;
    const reachableNodeIds = Object.keys(node.pathMap);
    if (reachableNodeIds.length !== nodeIds.length - 1) return 0;
    const distanceSum = reachableNodeIds.reduce((prevVal, targetNodeId) => prevVal + node.pathMap[targetNodeId].distance, 0);
    return reachableNodeIds.length / distanceSum;
  };

  /**
   * calculates the betweenness value of a node
   * @param currentNode - the node to calculate the value for
   * @returns {number} - the betweenness value
   */
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

  /**
   * calculates the eigenvectors for all nodes
   */
  const calculateEigenvectors = () => {
    try {
      const {realEigenvalues, eigenvectorMatrix} = new EigenvalueDecomposition(new Matrix(adjacencyMatrix));
      const maxEigenvalue = Math.max(...realEigenvalues);
      const correspondingVector = eigenvectorMatrix.data.map((vector) => vector[realEigenvalues.indexOf(maxEigenvalue)]);
      const maxVectorValue = Math.max(...correspondingVector);
      correspondingVector.forEach((value, index) => {
        correspondingVector[index] = value / maxVectorValue;
      });
      nodeIds.forEach((nodeId) => nodeClones[nodeId].data.eigenvector = correspondingVector[nodeId]);
    } catch (err) {
      postMessage({type: 'error', message: 'Error calculating Eigenvectors', error: err});
    }
  };

  /**
   * calculates the local clustering coefficient of a node
   * @param node - the node to calculate the value for
   * @returns {number} - the local clustering coefficient value
   */
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
  if (!directed) calculateEigenvectors();
  postMessage({type: 'finished', updatedClones: nodeClones});
  // eslint-disable-next-line no-restricted-globals
  self.close();
};
