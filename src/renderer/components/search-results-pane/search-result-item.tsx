import { useCallback, useMemo } from 'react';
import { DeleteIcon, EditIcon } from '@fluentui/react-icons-mdl2';
import { breakSearchQueryToNormalHighlighPairs } from '../../utils/text-utils';
import { SearchResultType } from '../../services/search-service';
import './search-result-item.css';

export interface SearchResultItemProps {
  value: string;
  tags: string[];
  type: SearchResultType;
  highlightedText: string;
  isSelected: boolean;
  height: number;
  index: number;
  sectionName?: string;
  onItemSelected: (index: number) => void;
  onItemDelete: (index: number) => void;
  onItemEdit: (index: number) => void;
  onItemAdd: (index: number, value: string) => void;
}

export const SearchResultItem: React.FC<SearchResultItemProps> = ({
  value,
  tags,
  type,
  isSelected,
  height,
  highlightedText: higlihtedText,
  index,
  sectionName,
  onItemSelected,
  onItemDelete,
  onItemEdit,
  onItemAdd,
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

  const addButtonKeyDown = useCallback(
    (event) => {
      if (event.key === 'Enter') {
        onItemAdd(index, value);
        event.stopPropagation();
      }
    },
    [onItemAdd, index, value]
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

  const editButtonKeyDown = useCallback(
    (event) => {
      if (event.key === 'Enter') {
        onItemEdit(index);
        event.stopPropagation();
      }
    },
    [onItemEdit, index]
  );

  const onEditButtonClick = useCallback(
    (event) => {
      onItemEdit(index);
      event.stopPropagation();
    },
    [index, onItemEdit]
  );

  const onAddButtonClick = useCallback(
    (event) => {
      onItemAdd(index, value);

      event.stopPropagation();
    },
    [onItemAdd, index, value]
  );

  const onDeleteButtonClick = useCallback(
    (event) => {
      onItemDelete(index);

      event.stopPropagation();
    },
    [onItemDelete, index]
  );

  let className = 'SearchResultItem';
  if (isSelected) {
    className += ' SearchResultItem-Selected';
  }
  if (sectionName) {
    className += ' SearchResultItem-NewSection';
  }

  return (
    <div
      onClick={() => onItemSelected(index)}
      className={className}
      style={{
        height: `${height}rem`,
        paddingLeft: '0.5rem',
        paddingTop: '0.1rem',
        paddingBottom: '0.1rem',
        boxSizing: 'border-box',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
      }}
    >
      <div
        className="SearchResultButtonContainer"
        style={{
          position: 'relative',
        }}
      >
        {sectionName && (
          <div
            className="SearchResultSectionName"
            style={{
              position: 'absolute',
              paddingTop: '0.2rem',
              paddingBottom: '0.2rem',
              paddingLeft: '0.5rem',
              paddingRight: '0.5rem',
              zIndex: 2,
              fontSize: '70%',
            }}
          >
            {sectionName}
          </div>
        )}

        <div
          className="SearchResultItemButtonWrapper"
          style={{
            position: 'absolute',
            right: '0rem',
            zIndex: 1,
            height: '1.5rem',
            width: '3.5rem',
            margin: '0rem',
          }}
        />
        {type === SearchResultType.Stored && (
          <div
            tabIndex={0}
            className="SearchResultItemButton"
            style={{
              position: 'absolute',
              right: '2rem',
              zIndex: 2,
              height: '1.3rem',
            }}
            onKeyDown={editButtonKeyDown}
            onClick={onEditButtonClick}
          >
            <EditIcon
              style={{
                fontSize: '1rem',
                position: 'relative',
                top: '-0.15rem',
              }}
            />
          </div>
        )}

        {type === SearchResultType.Stored && (
          <div
            tabIndex={0}
            className="SearchResultItemButton"
            style={{
              position: 'absolute',
              right: '0.5rem',
              zIndex: 2,
              height: '1.3rem',
            }}
            onKeyDown={deleteButtonKeyDown}
            onClick={onDeleteButtonClick}
          >
            <DeleteIcon
              style={{
                fontSize: '1rem',
                position: 'relative',
                top: '-0.15rem',
              }}
            />
          </div>
        )}

        {type === SearchResultType.ClipboardTracked && (
          <div
            tabIndex={0}
            className="SearchResultItemButton"
            style={{
              position: 'absolute',
              right: '0.5rem',
              zIndex: 2,
              height: '1.3rem',
            }}
            onKeyDown={addButtonKeyDown}
            onClick={onAddButtonClick}
          >
            <div
              style={{
                fontSize: '1.3rem',
                position: 'relative',
                top: '-0.25rem',
              }}
            >
              {'\uFF0B'}
            </div>
          </div>
        )}
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
