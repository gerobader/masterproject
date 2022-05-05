onmessage = (e) => {
  const nodePathMaps = {};
  const {nodeClones: nodes, nodeOrder} = e.data;
  const maxPathLength = 12;
  const calculatePathBetweenNodes = (startNode, targetNode) => {
    console.log(startNode.name, '->', targetNode.name);
    if (nodePathMaps[targetNode.id]) {
      const pathInfo = nodePathMaps[targetNode.id][startNode.id];
      if (pathInfo.paths.length) {
        const paths = pathInfo.paths.map((path) => new Set(Array.from(path).reverse()));
        return {target: targetNode, paths, distance: pathInfo.paths[0].size - 1};
      }
      return {target: targetNode, paths: [], distance: 0};
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
        if (!connectedNodes.includes(nodes[outgoingEdge.targetNode])) {
          connectedNodes.push(nodes[outgoingEdge.targetNode]);
        }
      });
      const found = connectedNodes.find((connectedNode) => connectedNode.id === targetNode.id);
      if (found) {
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
  nodeOrder.forEach((startNodeId, index) => {
    nodePathMaps[startNodeId] = {};
    postMessage({
      type: 'progress',
      progress: {
        info: nodes[startNodeId].name,
        percentage: ((index + 1) / nodeOrder.length) * 100
      }
    });
    nodeOrder.forEach((targetNodeId) => {
      if (startNodeId !== targetNodeId) {
        nodePathMaps[startNodeId][targetNodeId] = calculatePathBetweenNodes(nodes[startNodeId], nodes[targetNodeId]);
      }
    });
  });
  postMessage({type: 'success', nodePathMaps});
  // eslint-disable-next-line no-restricted-globals
  self.close();
};