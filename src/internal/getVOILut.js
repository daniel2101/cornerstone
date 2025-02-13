/* eslint no-bitwise: 0 */

/**
 * Volume of Interest Lookup Table Function
 *
 * @typedef {Function} VOILUTFunction
 *
 * @param {Number} modalityLutValue
 * @returns {Number} transformed value
 * @memberof Objects
 */

/**
 * @module: VOILUT
 */

/**
 *
 * @param {Number} windowWidth Window Width
 * @param {Number} windowCenter Window Center
 * @returns {VOILUTFunction} VOI LUT mapping function
 * @memberof VOILUT
 */
function generateLinearVOILUT (windowWidth, windowCenter) {
  return function (modalityLutValue) {
    return ((modalityLutValue - windowCenter) / windowWidth + 0.5) * 255.0;
  };
}

/**
 * Generate a non-linear volume of interest lookup table
 *
 * @param {Number} windowWidth Window Width
 * @param {Number} windowCenter Window Center
 * @param {LUT} [voiLUT] Volume of Interest Lookup Table Object
 *
 * @returns {VOILUTFunction} VOI LUT mapping function
 * @memberof VOILUT
 */
function generateNonLinearVOILUT (windowWidth, windowCenter, voiLUT) {
  // We don't trust the voiLUT.numBitsPerEntry, mainly thanks to Agfa!
  const bitsPerEntry = Math.max(...voiLUT.lut).toString(2).length;
  const shift = bitsPerEntry - 8;
  const minValue = voiLUT.lut[0] >> shift;
  const maxValue = voiLUT.lut[voiLUT.lut.length - 1] >> shift;
  const maxValueMapped = voiLUT.firstValueMapped + voiLUT.lut.length - 1;

  return function (modalityLutValue) {
    if (modalityLutValue < voiLUT.firstValueMapped) {
      return minValue;
    } else if (modalityLutValue >= maxValueMapped) {
      return maxValue;
    }
    const linearVOILUT = generateLinearVOILUT(windowWidth >> shift, windowCenter >> shift);

    return linearVOILUT(voiLUT.lut[modalityLutValue - voiLUT.firstValueMapped] >> shift);

  };
}

/**
 * Retrieve a VOI LUT mapping function given the current windowing settings
 * and the VOI LUT for the image
 *
 * @param {Number} windowWidth Window Width
 * @param {Number} windowCenter Window Center
 * @param {LUT} [voiLUT] Volume of Interest Lookup Table Object
 *
 * @return {VOILUTFunction} VOI LUT mapping function
 * @memberof VOILUT
 */
export default function (windowWidth, windowCenter, voiLUT) {
  if (voiLUT) {
    return generateNonLinearVOILUT(windowWidth, windowCenter, voiLUT);
  }

  return generateLinearVOILUT(windowWidth, windowCenter);
}
