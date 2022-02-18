export interface INormalHighlightPair {
  index: number;
  normal: string;
  bold: string;
}

export const breakSearchQueryToNormalHighlighPairs = (
  text: string,
  higlihtedText: string
): INormalHighlightPair[] => {
  const textLower = text.toLowerCase();
  const queryLower = higlihtedText.toLowerCase();

  let currIndex = 0;

  const pairs: INormalHighlightPair[] = [];

  if (queryLower.length === 0) {
    pairs.push({
      index: currIndex,
      normal: text,
      bold: '',
    });

    return pairs;
  }

  while (true) {
    const index = textLower.indexOf(queryLower, currIndex);

    if (index === -1) {
      if (currIndex < textLower.length) {
        // Item not found, push the remaining text
        pairs.push({
          index: currIndex,
          normal: text.substring(currIndex),
          bold: '',
        });
      }
      break;
    }

    if (index === currIndex) {
      // Item found at current index
      pairs.push({
        index: currIndex,
        normal: '',
        bold: text.substring(currIndex, currIndex + queryLower.length),
      });
    } else {
      pairs.push({
        index: currIndex,
        normal: text.substring(currIndex, index),
        bold: text.substring(index, index + queryLower.length),
      });
    }

    currIndex = index + queryLower.length;
  }

  return pairs;
};
