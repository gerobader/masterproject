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
        nodeId: node.id,
        percentage: ((index + 1) / nodeIds.length) * 100
      }
    });
    const nextStep = (allConnectedNodes, path, distance) => {
      allConnectedNodes.forEach((connectedNode) => {
        if (
          (nodePathMaps[nodeId][connectedNode.id] && nodePathMaps[nodeId][connectedNode.id].distance < distance)
          || connectedNode.id === nodeId
        ) {
          // return if connected node is starting node or if path length is already longer than another found path
          return;
        }
        const currentPath = [...path, connectedNode];
        let allPaths = [];
        // remove all paths to this node that are longer than the current path
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
        // add all nodes, that are connected to the current node to the next iteration array
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
  postMessage({type: 'finished', nodePathMaps});
  // eslint-disable-next-line no-restricted-globals
  self.close();
};
