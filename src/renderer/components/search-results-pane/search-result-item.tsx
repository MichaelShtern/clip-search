import { useCallback, useMemo } from 'react';
import { DeleteIcon, EditIcon } from '@fluentui/react-icons-mdl2';
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
  onItemDelete: (index: number) => void;
}

export const SearchResultItem: React.FC<SearchResultItemProps> = ({
  value,
  tags,
  isSelected,
  height,
  highlightedText: higlihtedText,
  index,
  onItemSelected,
  onItemDelete,
}: SearchResultItemProps) => {
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

  const deleteButtonKeyDown = useCallback(
    (event) => {
      if (event.key === 'Enter') {
        onItemDelete(index);
        event.stopPropagation();
      }
    },
    [onItemDelete, index]
  );

  const editButtonKeyDown = useCallback((event) => {
    if (event.key === 'Enter') {
      event.stopPropagation();
    }
  }, []);

  const onEditButtonClick = useCallback((event) => {
    event.stopPropagation();
  }, []);

  const onDeleteButtonClick = useCallback(
    (event) => {
      onItemDelete(index);

      event.stopPropagation();
    },
    [onItemDelete, index]
  );

  const className = isSelected
    ? 'SearchResultItem SearchResultItem-Selected'
    : 'SearchResultItem';

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
      <div
        className="SearchResultButtonContainer"
        style={{
          position: 'relative',
        }}
      >
        <div
          tabIndex={0}
          className="SearchResultItemButton"
          style={{
            position: 'absolute',
            right: '1.5rem',
            zIndex: 1,
            height: '1.3rem',
          }}
          onKeyDown={editButtonKeyDown}
          onClick={onEditButtonClick}
        >
          <EditIcon
            style={{ fontSize: '1rem', position: 'relative', top: '-0.15rem' }}
          />
        </div>

        <div
          tabIndex={0}
          className="SearchResultItemButton"
          style={{
            position: 'absolute',
            right: '0rem',
            zIndex: 1,
            height: '1.3rem',
          }}
          onKeyDown={deleteButtonKeyDown}
          onClick={onDeleteButtonClick}
        >
          <DeleteIcon
            style={{ fontSize: '1rem', position: 'relative', top: '-0.15rem' }}
          />
        </div>
      </div>

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
