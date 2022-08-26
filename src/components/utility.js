import * as THREE from 'three';

/**
 * checks if a value is between two values
 * @param value - the value to check
 * @param min - the lower limit
 * @param max - the upper limit
 * @returns {boolean}
 */
export const between = (value, min, max) => value > min && value < max;

/**
 * converts Hexadecimal color values to RGB (#ff0000 => [255, 0, 0])
 * @param hex - the hexadecimal color value
 * @returns {[number,number,number]} - the RGB color array
 */
// source: https://stackoverflow.com/questions/21646738/convert-hex-to-rgba
export const hexToRGB = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
};

/**
 * converts RGB color values to HEX ([255, 0, 0] => #ff0000)
 * @param rgbArray - array with RGB values
 * @returns {`#${string}${string}${string}`} - the hexadezimal color string
 */
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

/**
 * calculate color for element based on a position on a gradient between two colors
 * @param lowerColorBoundIndicator - first gradient color
 * @param upperColorBoundIndicator - second gradient color
 * @param position - the position on the gradient
 * @returns {*} - the hexadecimal color string
 */
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

/**
 * sort array function used for the array.sort() function build into JS
 * @param a - the first value
 * @param b - the second value
 * @param reverse - if the order should be reversed
 * @returns {number|number} - -1, 0 or 1 for the array.sort() function
 */
export const sortArray = (a, b, reverse = false) => {
  if (a === b) return 0;
  const compareFunction = reverse ? b < a : a < b;
  return compareFunction ? -1 : 1;
};

/**
 * calculate the average position between all given elements
 * @param elements - the elements to calculate the average position between
 * @param elementGroup - the group all network elements are part of to get the world positions of the elements
 * @returns {Vector3}
 */
export const calculateAveragePosition = (elements, elementGroup) => {
  const averagePosition = new THREE.Vector3();
  elements.forEach((element) => {
    const worldPos = element.position.clone();
    elementGroup.localToWorld(worldPos);
    averagePosition.add(worldPos);
  });
  return averagePosition.divideScalar(elements.length);
};

/**
 * convert text to title case: theyAreTakingTheHobbitsToIsengard -> They Are Taking The Hobbits To Isengard
 * @param text - the text to convert
 * @returns {string} - the converted text
 */
export const titleCase = (text) => {
  if (!text) return '';
  const result = text.replace(/([A-Z])/g, ' $1');
  return text.charAt(0).toUpperCase() + result.slice(1);
};

/**
 * move an element in an array to a different position
 * @param array - the array with the element that should be moved
 * @param currentIndex - the current position of the element
 * @param newIndex - the position the element should be moved to
 * @returns {*[]} - the array with the updated element positions
 */
export const arrayMove = (array, currentIndex, newIndex) => {
  const newArray = [...array];
  newArray.splice(newIndex, 0, newArray.splice(currentIndex, 1)[0]);
  return newArray;
};
