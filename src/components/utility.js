import * as THREE from 'three';

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
    const fraction = ((position - lowerColorBoundIndicator.positionPercent)
      / (upperColorBoundIndicator.positionPercent - lowerColorBoundIndicator.positionPercent));
    color = calculateColor(lowerColorBoundIndicator.color, upperColorBoundIndicator.color, fraction);
  }
  return color;
};

export const sortArray = (a, b, reverse = false) => {
  if (a === b) return 0;
  const compareFunction = reverse ? b < a : a < b;
  return compareFunction ? -1 : 1;
};

export const calculateAveragePosition = (elements) => {
  const averagePosition = new THREE.Vector3(0, 0, 0);
  elements.forEach((element) => {
    averagePosition.add(element.position);
  });
  return averagePosition.divideScalar(elements.length);
};

export const titleCase = (text) => {
  if (!text) return '';
  const result = text.replace(/([A-Z])/g, ' $1');
  return text.charAt(0).toUpperCase() + result.slice(1);
};

export const arrayMove = (array, currentIndex, newIndex) => {
  const newArray = [...array];
  newArray.splice(newIndex, 0, newArray.splice(currentIndex, 1)[0]);
  return newArray;
};

export const createNodes = (nodes, networkBoundarySize) => nodes.map((node) => ({
  position: new THREE.Vector3(
    node.position ? node.position.x : Math.random() * networkBoundarySize - networkBoundarySize / 2,
    node.position ? node.position.y : Math.random() * networkBoundarySize - networkBoundarySize / 2,
    node.position ? node.position.z : Math.random() * networkBoundarySize - networkBoundarySize / 2
  ),
  size: node.size || 1,
  color: node.color || '#008799',
  id: node.id,
  name: node.name || node.text || node.label,
  data: node.data || node.attributes || {},
  colorLocked: Boolean(node.colorLocked),
  shape: node.shape || 'Sphere',
  pathMap: node.pathMap,
  visible: node.visible !== false
}));

export const createEdges = (edgesInfo) => {
  const edges = [];
  edgesInfo.forEach((edgeInfo) => {
    const edge = {
      id: edgeInfo.id,
      source: edgeInfo.source,
      target: edgeInfo.target,
      size: edgeInfo.size || 1,
      color: edgeInfo.color || '#ffffff',
      visible: edgeInfo.visible !== false,
      data: {}
    };
    if (edgeInfo.data) edge.data = edgeInfo.data;
    if (edgeInfo.attributes) edge.data = {...edge.data, ...edgeInfo.attributes};
    if (edgeInfo.value) edge.data.value = edgeInfo.value;
    edges.push(edge);
  });
  return edges;
};
