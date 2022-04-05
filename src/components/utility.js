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

export const sortArray = (a, b) => {
  if (a === b) return 0;
  return a < b ? -1 : 1;
};

export const calculateAveragePosition = (elements, useWorldPosition = true) => {
  const averagePosition = new THREE.Vector3(0, 0, 0);
  elements.forEach((element) => {
    const elementPosition = useWorldPosition ? new THREE.Vector3() : element.instance.position.clone();
    if (useWorldPosition) element.instance.getWorldPosition(elementPosition);
    averagePosition.add(elementPosition);
  });
  return averagePosition.divideScalar(elements.length);
};

export const titleCase = (text) => {
  const result = text.replace(/([A-Z])/g, ' $1');
  return text.charAt(0).toUpperCase() + result.slice(1);
};
