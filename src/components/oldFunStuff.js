const nodeClones = [];
const directed = false;

const eigenvectorApproximation = (nodeIds) => {
  let iterationCount = 0;
  let eigenvectorValues = {};
  let lastNormalizedValues;
  while (iterationCount <= 40) {
    const newEigenvectorValues = {};
    nodeIds.forEach((nodeId) => {
      const node = nodeClones[nodeId];
      if (eigenvectorValues[nodeId] === undefined) {
        newEigenvectorValues[nodeId] = node.targetForEdges.length;
        if (!directed) newEigenvectorValues[nodeId] += node.sourceForEdges.length;
      } else {
        const connectedNodes = new Set();
        node.targetForEdges.forEach((edge) => connectedNodes.add(nodeClones[edge.sourceNode]));
        if (!directed) node.sourceForEdges.forEach((edge) => connectedNodes.add(nodeClones[edge.targetNode]));
        newEigenvectorValues[nodeId] = 0;
        connectedNodes.forEach((connectedNode) => {
          newEigenvectorValues[nodeId] += eigenvectorValues[connectedNode.id];
        });
      }
    });
    eigenvectorValues = newEigenvectorValues;
    const normalized = {};
    const maxVal = Math.max(...Object.values(eigenvectorValues));
    let difference = 0;
    Object.keys(eigenvectorValues).forEach((nodeId) => {
      const normalizedValue = maxVal ? eigenvectorValues[nodeId] / maxVal : 0;
      normalized[nodeId] = normalizedValue;
      if (lastNormalizedValues) difference += Math.abs(normalizedValue - lastNormalizedValues[nodeId]);
      else difference = false;
    });
    if ((difference !== false && difference < 0.01) || iterationCount === 40) {
      eigenvectorValues = normalized;
      nodeIds.forEach((nodeId) => nodeClones[nodeId].data.eigenvector = normalized[nodeId]);
      break;
    }
    lastNormalizedValues = normalized;
    iterationCount++;
  }
};
