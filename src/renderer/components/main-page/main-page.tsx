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

interface IAddItemState {
  showPane: boolean;
  isEditMode: boolean;
  id: string;
  value: string;
  tags: string[];
}

const addItemPaneHidden: IAddItemState = {
  showPane: false,
  id: '',
  value: '',
  isEditMode: false,
  tags: [],
};

export const MainPage: React.FC = () => {
  // Set base fond size on html
  document.documentElement.style.fontSize = baseFontSize;

  // Avoid showing scrollbars, the size is pre-determined and should be fixed
  document.body.style.overflow = 'hidden';

  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<ISearchResult>({
    results: [],
  });

  const [addItemPaneState, setAddItemPaneState] = useState(addItemPaneHidden);

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

  const onDeleteItemCbk = useCallback(
    async (id: string) => {
      await StoreServiceGlobal.deleteItem(id);

      const results = await search(searchText);
      setSearchResults(results);
      searchBoxRef.current?.focus();
    },
    [searchText, setSearchResults, searchBoxRef]
  );

  const onEditItemCbk = useCallback(
    (id: string, value: string, tags: string[]) => {
      setAddItemPaneState({
        showPane: true,
        isEditMode: true,
        id,
        tags,
        value,
      });
    },
    [setAddItemPaneState]
  );

  const onAddItemComplete = useCallback(
    async (value: string, tags: string[]) => {
      setAddItemPaneState(addItemPaneHidden);
      await StoreServiceGlobal.addItem(value, tags);
      searchBoxRef.current?.setText(value);
      const results = await search(value);
      setSearchResults(results);
      searchBoxRef.current?.focus();
    },
    [setAddItemPaneState, searchBoxRef, setSearchResults]
  );

  const onEditItemComplete = useCallback(
    async (value: string, tags: string[], id: string) => {
      setAddItemPaneState(addItemPaneHidden);
      await StoreServiceGlobal.updateItem(id, value, tags);

      const results = await search(searchText);
      setSearchResults(results);
      searchBoxRef.current?.focus();
    },
    [setAddItemPaneState, setSearchResults, searchText]
  );

  const onAddItemCancel = useCallback(() => {
    setAddItemPaneState(addItemPaneHidden);
    searchBoxRef.current?.focus();
  }, [setAddItemPaneState, searchBoxRef]);

  const onAddItemCallback = useCallback(() => {
    setAddItemPaneState({
      showPane: true,
      isEditMode: false,
      id: '',
      tags: [],
      value: searchText,
    });
  }, [setAddItemPaneState, searchText]);

  useEffect(() => {
    searchBoxRef.current?.focus();
  }, [searchBoxRef]);

  const showItemNotFoundPane = searchResults.results.length === 0;

  return (
    <div
      style={{
        width: `${pageWidthInRem}rem`,
        height: `${pageHeightInRem}rem`,
        background: '#f3f3f3',
        overflow: 'hidden',
      }}
    >
      <SearchBox
        onTextChange={onSearchCallback}
        disabled={addItemPaneState.showPane}
        ref={searchBoxRef}
      />
      {!addItemPaneState.showPane && (
        <SearchResultPane
          searchText={searchText}
          searchResults={searchResults.results}
          onDeleteItem={onDeleteItemCbk}
          onEditItem={onEditItemCbk}
        />
      )}
      {showItemNotFoundPane && !addItemPaneState.showPane && (
        <ItemNotFoundPane
          itemText={searchText}
          onAddItemCallback={onAddItemCallback}
        />
      )}
      {addItemPaneState.showPane && (
        <AddItemPane
          initialValue={addItemPaneState.value}
          initialTagValue={addItemPaneState.tags}
          id={addItemPaneState.id}
          editMode={addItemPaneState.isEditMode}
          onCancel={onAddItemCancel}
          onAdd={onAddItemComplete}
          onEdit={onEditItemComplete}
        />
      )}
    </div>
  );
};
