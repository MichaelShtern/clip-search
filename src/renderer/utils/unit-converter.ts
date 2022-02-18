export const baseFontSizeInPixel = 16;

export const convertPxToRem = (px: number, base?: number) => {
  return px / (base ?? baseFontSizeInPixel);
};

export const convertRemToPx = (rem: number, base?: number) => {
  return rem * (base ?? baseFontSizeInPixel);
};
