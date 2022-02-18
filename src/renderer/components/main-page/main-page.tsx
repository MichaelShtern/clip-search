import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ISearchResult, search } from '../../services/search-service';
import { StoreServiceGlobal } from '../../services/storage-service';
import { AddItemPane } from '../add-item-pane/add-item-pane';
import { ItemNotFoundPane } from '../item-not-found-pane/item-not-found-pane';
import { ISearchBoxHandle, SearchBox } from '../search-box/search-box';
import { SearchResultPane } from '../search-results-pane/search-result-pane';

export const baseFontSizeInPixel = 16;
export const baseFontSize = `${baseFontSizeInPixel}px`;
export const pageWidthInRem = 32;
export const pageHeightInRem = 17.25;

export const MainPage: React.FC = () => {
  document.documentElement.style.fontSize = baseFontSize;

  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<ISearchResult>({
    results: [],
  });
  const [showAddItemPane, setShowAddItemPane] = useState(false);

  useEffect(() => {
    async function searchInit() {
      const results = await search('');
      setSearchResults(results);
    }
    searchInit();
  }, [setSearchResults]);

  const onSearchCallback = useCallback(
    async (query: string) => {
      const results = await search(query);
      setSearchResults(results);
      setSearchText(query);
    },
    [setSearchText, setSearchResults]
  );

  const searchBoxRef = useRef<ISearchBoxHandle | null>(null);

  const onAddItem = useCallback(async (value: string, tags: string[]) => {
    setShowAddItemPane(false);
    await StoreServiceGlobal.addItem(value, tags);
    searchBoxRef.current?.setText(value);
    const results = await search(value);
    setSearchResults(results);
    searchBoxRef.current?.focus();
  }, []);

  const onAddItemCancel = useCallback(() => {
    setShowAddItemPane(false);
    searchBoxRef.current?.focus();
  }, []);

  const onAddItemCallback = useCallback(() => {
    setShowAddItemPane(true);
  }, []);

  useEffect(() => {
    searchBoxRef.current?.focus();
  }, [searchBoxRef]);

  const showItemNotFoundPane = searchResults.results.length === 0;

  return (
    <div
      style={{
        width: `${pageWidthInRem}rem`,
        // maxHeight: pageHeightInRem + "rem",
        // minHeight: pageHeightInRem / 4 + "rem",
        height: `${pageHeightInRem}rem`,
        background: '#f3f3f3',
        overflow: 'hidden',
      }}
    >
      <SearchBox
        onTextChange={onSearchCallback}
        disabled={showAddItemPane}
        ref={searchBoxRef}
      />
      <SearchResultPane
        searchText={searchText}
        searchResults={searchResults.results}
      />
      {showItemNotFoundPane && !showAddItemPane && (
        <ItemNotFoundPane
          itemText={searchText}
          onAddItemCallback={onAddItemCallback}
        />
      )}
      {showAddItemPane && (
        <AddItemPane
          initialValue={searchText}
          onCancel={onAddItemCancel}
          onAdd={onAddItem}
        />
      )}
    </div>
  );
};
