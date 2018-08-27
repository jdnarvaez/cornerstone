import getMinMax from './getMinMax.js';

function hasModalityLUT (viewport) {
  return viewport.modalityLUT && viewport.modalityLUT.lut && viewport.modalityLUT.lut.length > 0;
}

function hasVoiLUT (viewport) {
  return viewport.voiLUT && viewport.voiLUT.lut && viewport.voiLUT.lut.length > 0;
}

function hasPresentationLUT (viewport) {
  return viewport.presentationLUT && viewport.presentationLUT.lut && viewport.presentationLUT.lut.length > 0;
}

/**
 * Calculate the min & max pixel values for an image and setup windows
 *
 * @param {Image} image A Cornerstone Image Object
 * @param {Viewport} image A Cornerstone Viewport Object
 */
export default function (image, viewport) {
  if (!image) {
    return;
  }

  if (!viewport.voi) {
    viewport.voi = {};
  }

  if (image.minPixelValue === undefined || image.maxPixelValue === undefined) {
    const minMax = getMinMax(image.getPixelData());

    image.minPixelValue = minMax.min;
    image.maxPixelValue = minMax.max;
  }

  //Setup min max of the VOI since these output values can change what WebGL shader is required
  if (hasPresentationLUT(viewport)) {
    const minMax = getMinMax(viewport.presentationLUT.lut);
    viewport.voi.minMax = minMax;
    viewport.presentationLUT.minMax = minMax;
  } else if (hasVoiLUT(viewport)) {
    const minMax = getMinMax(viewport.voiLUT.lut);
    viewport.voi.minMax = minMax;
    viewport.voiLUT.minMax = minMax;
  } else if (hasModalityLUT(viewport)) {
    const minMax = getMinMax(viewport.modalityLUT.lut);
    viewport.modalityLUT.minMax = minMax;
    viewport.voi.minMax = minMax;
  }

  if (viewport.voi === undefined || viewport.voi.windowWidth === undefined || viewport.voi.windowCenter === undefined) {
    var min = image.minPixelValue;
    var max = image.maxPixelValue;

    if (viewport.presentationLUT) {
      min = viewport.presentationLUT.minMax.min;
      max = viewport.presentationLUT.minMax.max;
    } else if (viewport.voiLUT) {
      min = viewport.voiLUT.minMax.min;
      max = viewport.voiLUT.minMax.max;
    } else if (viewport.modalityLUT) {
      min = viewport.modalityLUT.minMax.min;
      max = viewport.modalityLUT.minMax.max;
    }

    viewport.voi.windowCenter = (min + max + 1) / 2 * image.slope + image.intercept;
    viewport.voi.windowWidth = Math.abs((min + 1 - max) * image.slope);
  }
}
