onmessage = (e) => {
  const nodePathMaps = {};
  const nodes = e.data;
  const maxPathLength = 12;
  const calculatePathBetweenNodes = (startNode, targetNode) => {
    if (nodePathMaps[targetNode.id]) {
      const pathInfo = nodePathMaps[targetNode.id][startNode.id];
      const paths = pathInfo.paths.map((path) => new Set(Array.from(path).reverse()));
      return {target: targetNode, paths, distance: pathInfo.paths[0].size - 1};
    }
    const result = {target: targetNode, paths: []};
    const calculate = (currentNode, usedNodes, distance) => {
      if (distance > maxPathLength || result.distance < distance) return;
      usedNodes.add(currentNode);
      const connectedNodes = [];
      currentNode.targetForEdges.forEach((incomingEdge) => {
        connectedNodes.push(nodes[incomingEdge.sourceNode]);
      });
      currentNode.sourceForEdges.forEach((outgoingEdge) => {
        connectedNodes.push(nodes[outgoingEdge.targetNode]);
      });
      const found = connectedNodes.filter((connectedNode) => connectedNode.id === targetNode.id);
      if (found.length) {
        usedNodes.add(targetNode);
        const shortestPaths = result.paths.filter((path) => path.size <= usedNodes.size) || [];
        result.distance = distance;
        result.paths = [...shortestPaths, usedNodes];
      } else {
        connectedNodes.forEach((connectedNode) => {
          if (!usedNodes.has(connectedNode)) {
            calculate(connectedNode, new Set(usedNodes), distance + 1);
          }
        });
      }
    };
    calculate(startNode, new Set(), 1);
    return result;
  };
  const nodeKeys = Object.keys(nodes);
  nodeKeys.forEach((startNodeId, index) => {
    nodePathMaps[startNodeId] = {};
    postMessage({
      type: 'progress',
      progress: {
        info: nodes[startNodeId].name,
        percentage: ((index + 1) / nodeKeys.length) * 100
      }
    });
    nodeKeys.forEach((targetNodeId) => {
      if (startNodeId !== targetNodeId) {
        nodePathMaps[startNodeId][targetNodeId] = calculatePathBetweenNodes(nodes[startNodeId], nodes[targetNodeId]);
      }
    });
  });
  postMessage({type: 'success', nodePathMaps});
  // eslint-disable-next-line no-restricted-globals
  self.close();
};
