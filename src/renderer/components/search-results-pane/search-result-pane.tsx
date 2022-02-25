import { useCallback, useEffect, useRef, useState } from 'react';
import { ISearchResultItem } from '../../services/search-service';
import { convertPxToRem, convertRemToPx } from '../../utils/unit-converter';
import { SearchResultItem } from './search-result-item';
import './search-result-pane.css';

const searchResultItemHeight = 1.5;
const searchResultItemVisibleCount = 10;
const searchPaneMaxHeight =
  searchResultItemHeight * searchResultItemVisibleCount;

export interface ISearchResultPaneProps {
  searchText: string;
  searchResults: ISearchResultItem[];
  onDeleteItem: (id: string) => void;
}

const SearchResultPaneWithResults: React.FC<ISearchResultPaneProps> = ({
  searchText,
  searchResults,
  onDeleteItem,
}: ISearchResultPaneProps) => {
  const paneRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Reset selected index and scrolling position when we get new results
  useEffect(() => {
    setSelectedIndex(0);
    if (paneRef.current) {
      paneRef.current.scrollTop = 0;
    }
  }, [searchResults, setSelectedIndex]);

  const onItemDeleteCbk = useCallback(
    (index: number) => {
      const item = searchResults[index];

      if (item) {
        onDeleteItem(item.id);
      }
    },
    [searchResults, onDeleteItem]
  );

  const keyDownCallback = useCallback(
    async (event: KeyboardEvent) => {
      let step = 0;
      if (event.key === 'ArrowDown') {
        step = 1;
      } else if (event.key === 'ArrowUp') {
        step = -1;
      } else if (event.key === 'Enter') {
        const selectedItem = searchResults[selectedIndex];
        await navigator.clipboard.writeText(selectedItem.value);

        const userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.indexOf(' electron/') !== -1) {
          (window as any).api.send('toMain', 'hide');
        }

        return;
      } else {
        return;
      }

      // prevent default scrolling
      event.preventDefault();

      let newIndex = selectedIndex + step;
      if (newIndex < 0) {
        newIndex = searchResults.length - 1;
      } else if (newIndex >= searchResults.length) {
        newIndex = 0;
      }

      setSelectedIndex(newIndex);

      // Change the pane scroll position to make the selectd item visible
      if (paneRef.current) {
        const currentScrollPosition = convertPxToRem(
          paneRef.current?.scrollTop
        );

        const firstIndexInViewFloat =
          currentScrollPosition / searchResultItemHeight;
        const firstIndexInView = Math.ceil(firstIndexInViewFloat);

        let lastIndexInView =
          firstIndexInView + searchResultItemVisibleCount - 1;
        if (Math.abs(firstIndexInViewFloat - firstIndexInView) > 0.001) {
          lastIndexInView -= 1;
        }

        if (newIndex < firstIndexInView) {
          // Scroll to a position when the selected index is the top in view
          let scrollPosition =
            newIndex * convertRemToPx(searchResultItemHeight);
          if (scrollPosition < 0) {
            scrollPosition = 0;
          }

          paneRef.current.scrollTop = scrollPosition;
        }
        if (newIndex > lastIndexInView) {
          // Scroll to a position when the selected index is the last in view
          const scrollPosition =
            (newIndex - searchResultItemVisibleCount + 1) *
            convertRemToPx(searchResultItemHeight);

          paneRef.current.scrollTop = scrollPosition;
        }
      }
    },
    [searchResults, selectedIndex, setSelectedIndex]
  );

  useEffect(() => {
    document.addEventListener('keydown', keyDownCallback, false);

    return () => {
      document.removeEventListener('keydown', keyDownCallback, false);
    };
  }, [keyDownCallback]);

  return (
    <div
      tabIndex={0}
      className="SearchResultPane"
      ref={paneRef}
      style={{
        maxHeight: `${searchPaneMaxHeight}rem`,
        overflow: 'auto',
      }}
    >
      {searchResults.map((item, index) => (
        <SearchResultItem
          key={item.id}
          value={item.value}
          tags={item.tags}
          highlightedText={searchText}
          isSelected={index === selectedIndex}
          height={searchResultItemHeight}
          index={index}
          onItemDelete={onItemDeleteCbk}
          onItemSelected={(indx) => setSelectedIndex(indx)}
        />
      ))}
    </div>
  );
};

export const SearchResultPane: React.FC<ISearchResultPaneProps> = ({
  searchText,
  searchResults,
  onDeleteItem,
}: ISearchResultPaneProps) => {
  if (searchResults.length === 0) {
    return null;
  }

  return (
    <SearchResultPaneWithResults
      searchText={searchText}
      searchResults={searchResults}
      onDeleteItem={onDeleteItem}
    />
  );
};
