onmessage = (e) => {
  const nodePathMaps = {};
  const nodes = e.data;
  const nodeIds = Object.keys(nodes).map((nodeId) => parseInt(nodeId, 10));
  const getConnectedNodes = (node) => {
    const connectedNodes = new Set();
    node.targetForEdges.forEach((incomingEdge) => connectedNodes.add(nodes[incomingEdge.sourceNode]));
    node.sourceForEdges.forEach((outgoingEdge) => connectedNodes.add(nodes[outgoingEdge.targetNode]));
    return [...connectedNodes];
  };
  const nextStep = (allConnectedNodes, path, distance, startNodeId) => {
    allConnectedNodes.forEach((connectedNode) => {
      if (
        (nodePathMaps[startNodeId][connectedNode.id] && nodePathMaps[startNodeId][connectedNode.id].distance < distance)
        || connectedNode.id === startNodeId
        || distance >= 20
      ) {
        // return if connected node is starting node or if path length is already
        // longer than another found path or the path is too long
        return;
      }
      const currentPath = [...path, connectedNode];
      let allPaths = [];
      // remove all paths to this node that are longer than the current path
      if (nodePathMaps[startNodeId][connectedNode.id]) {
        allPaths = nodePathMaps[startNodeId][connectedNode.id].paths.filter(
          (existingPath) => existingPath.length <= currentPath.length
        );
      }
      nodePathMaps[startNodeId][connectedNode.id] = {
        target: connectedNode,
        paths: [...allPaths, currentPath],
        distance
      };
      const nextConnectedNodes = getConnectedNodes(connectedNode);
      nextStep(nextConnectedNodes, currentPath, distance + 1, startNodeId);
    });
  };

  nodeIds.forEach((nodeId, index) => {
    const node = nodes[nodeId];
    nodePathMaps[nodeId] = {};
    postMessage({
      type: 'progress',
      progress: {
        nodeId: node.id,
        progressCount: index + 1
      }
    });
    const connectedNodes = getConnectedNodes(node);
    connectedNodes.forEach((connectedNode) => {
      nodePathMaps[nodeId][connectedNode.id] = {
        target: connectedNode,
        paths: [node, connectedNode],
        distance: 1
      };
    });
    try {
      nextStep(connectedNodes, [node], 1, nodeId);
    } catch (err) {
      postMessage({type: 'error', message: 'There was an error calculating the shortest Paths!'});
    }
  });
  postMessage({type: 'finished', nodePathMaps});
  // eslint-disable-next-line no-restricted-globals
  self.close();
};
