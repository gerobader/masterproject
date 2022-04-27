onmessage = (e) => {
  const nodePathMaps = {};
  const nodes = e.data;
  const nodeIds = Object.keys(nodes).map((nodeId) => parseInt(nodeId, 10));
  nodeIds.forEach((nodeId, index) => {
    const node = nodes[nodeId];
    nodePathMaps[nodeId] = {};
    postMessage({
      type: 'progress',
      progress: {
        info: node.name,
        percentage: ((index + 1) / nodeIds.length) * 100
      }
    });
    const nextStep = (allConnectedNodes, path, distance) => {
      allConnectedNodes.forEach((connectedNode) => {
        if (
          (nodePathMaps[nodeId][connectedNode.id] && nodePathMaps[nodeId][connectedNode.id].distance < distance)
          || connectedNode.id === nodeId
        ) {
          return;
        }
        const currentPath = [...path, connectedNode];
        let allPaths = [];
        if (nodePathMaps[nodeId][connectedNode.id]) {
          allPaths = nodePathMaps[nodeId][connectedNode.id].paths.filter(
            (existingPath) => existingPath.length <= currentPath.length
          );
        }
        nodePathMaps[nodeId][connectedNode.id] = {
          target: connectedNode,
          paths: [...allPaths, currentPath],
          distance
        };
        const nextConnectedNodes = [];
        connectedNode.targetForEdges.forEach((incomingEdge) => {
          if (!nextConnectedNodes.includes(nodes[incomingEdge.sourceNode])) {
            nextConnectedNodes.push(nodes[incomingEdge.sourceNode]);
          }
        });
        connectedNode.sourceForEdges.forEach((outgoingEdge) => {
          if (!nextConnectedNodes.includes(nodes[outgoingEdge.targetNode])) {
            nextConnectedNodes.push(nodes[outgoingEdge.targetNode]);
          }
        });
        nextStep(nextConnectedNodes, currentPath, distance + 1);
      });
    };
    const connectedNodes = [];
    node.targetForEdges.forEach((incomingEdge) => {
      connectedNodes.push(nodes[incomingEdge.sourceNode]);
    });
    node.sourceForEdges.forEach((outgoingEdge) => {
      if (!connectedNodes.includes(nodes[outgoingEdge.targetNode])) {
        connectedNodes.push(nodes[outgoingEdge.targetNode]);
      }
    });
    nextStep(connectedNodes, [node], 1);
  });
  postMessage({type: 'success', nodePathMaps});
  // eslint-disable-next-line no-restricted-globals
  self.close();
};
