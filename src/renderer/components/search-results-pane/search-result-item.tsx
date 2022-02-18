import { useMemo } from 'react';
import { breakSearchQueryToNormalHighlighPairs } from '../../utils/text-utils';
import './search-result-item.css';

export interface SearchResultItemProps {
  value: string;
  tags: string[];
  highlightedText: string;
  isSelected: boolean;
  height: number;
  index: number;
  onItemSelected: (index: number) => void;
}

export const SearchResultItem: React.FC<SearchResultItemProps> = ({
  value,
  tags,
  isSelected,
  height,
  highlightedText: higlihtedText,
  index,
  onItemSelected,
}: SearchResultItemProps) => {
  const className = isSelected
    ? 'SearchResultItem SearchResultItem-Selected'
    : 'SearchResultItem';

  const highlightedValuesPairs = useMemo(
    () => breakSearchQueryToNormalHighlighPairs(value, higlihtedText),
    [value, higlihtedText]
  );

  const highlightedTagsPairs = useMemo(
    () =>
      tags.map((tag, indx) => {
        const tagPair = {
          ind: indx,
          pairs: breakSearchQueryToNormalHighlighPairs(tag, higlihtedText),
        };

        return tagPair;
      }),
    [tags, higlihtedText]
  );

  return (
    <div
      onClick={() => onItemSelected(index)}
      className={className}
      style={{
        height: `${height}rem`,
        paddingLeft: '0.5rem',
        paddingRight: '0.5rem',
        paddingTop: '0.1rem',
        paddingBottom: '0.1rem',
        boxSizing: 'border-box',
        cursor: 'pointer',
      }}
    >
      {highlightedValuesPairs.map((pair) => (
        <span key={pair.index}>
          {pair.normal}
          <span className="SearchResultItem-Highlighted">{pair.bold}</span>
        </span>
      ))}
      <span> </span>
      {highlightedTagsPairs.map((tag) => (
        <span key={tag.ind} className="SearchResultItem-Tag">
          {tag.pairs.map((pair) => (
            <span key={pair.index}>
              {pair.normal}
              <span className="SearchResultItem-Highlighted">{pair.bold}</span>
            </span>
          ))}{' '}
        </span>
      ))}
    </div>
  );
};
