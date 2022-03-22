export const between = (value, min, max) => value > min && value < max;

// source: https://stackoverflow.com/questions/21646738/convert-hex-to-rgba
export const hexToRGB = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
};

// source: https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
export const RGBtoHex = (rgbArray) => {
  const componentToHex = (c) => {
    const hex = c.toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  };
  return `#${componentToHex(rgbArray[0])}${componentToHex(rgbArray[1])}${componentToHex(rgbArray[2])}`;
};

/**
 * Calculates color between two colors based on fraction
 */
export const calculateColor = (color1, color2, fraction) => {
  const rgbColor1 = hexToRGB(color1);
  const rgbColor2 = hexToRGB(color2);
  const newColor = [
    Math.round((rgbColor2[0] - rgbColor1[0]) * fraction + rgbColor1[0]),
    Math.round((rgbColor2[1] - rgbColor1[1]) * fraction + rgbColor1[1]),
    Math.round((rgbColor2[2] - rgbColor1[2]) * fraction + rgbColor1[2])
  ];
  return RGBtoHex(newColor);
};

export const calculateColorForElement = (lowerColorBoundIndicator, upperColorBoundIndicator, position) => {
  let color;
  if (lowerColorBoundIndicator.positionPercent === position) {
    color = lowerColorBoundIndicator.color;
  } else {
    const fraction = ((position - lowerColorBoundIndicator.positionPercent) / (
      upperColorBoundIndicator.positionPercent - lowerColorBoundIndicator.positionPercent));
    color = calculateColor(lowerColorBoundIndicator.color, upperColorBoundIndicator.color, fraction);
  }
  return color;
};

export const sortElements = (elements, sortValue) => {
  elements.sort((a, b) => {
    if (a.data[sortValue] === b.data[sortValue]) return 0;
    return a.data[sortValue] < b.data[sortValue] ? -1 : 1;
  });
  const min = elements[0].data[sortValue];
  const max = elements[elements.length - 1].data[sortValue] - min;
  return elements.map((element) => ({object: element, percentage: Math.ceil(((element.data[sortValue] - min) / max) * 100)}));
};

export const calculatePathBetweenNodes = (startNode, targetNode, allNodes) => {
  if (targetNode.pathMap) {
    const pathInfo = targetNode.pathMap[startNode.id];
    const paths = pathInfo.paths.map((path) => new Set(Array.from(path).reverse()));
    return {target: targetNode, paths, distance: pathInfo.paths[0].size - 1};
  }
  const result = {target: targetNode, paths: []};
  const maxPathLength = 12; // allNodes.length < 100 ? 10 : allNodes.length / 10;
  const calculate = (currentNode, usedNodes, distance) => {
    if (distance > maxPathLength || result.distance < distance) return;
    usedNodes.add(currentNode);
    const connectedNodes = [];
    currentNode.targetForEdges.forEach((incomingEdge) => {
      connectedNodes.push(incomingEdge.sourceNode);
    });
    currentNode.sourceForEdges.forEach((outgoingEdge) => {
      connectedNodes.push(outgoingEdge.targetNode);
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

export const sortArray = (a, b) => {
  if (a === b) return 0;
  return a < b ? -1 : 1;
};
