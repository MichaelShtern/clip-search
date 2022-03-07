import {
  ClipboardTrackerGlobal,
  IClipboardTrackedItem,
} from './clipboard-tracker';
import { IClipboardItem, StoreServiceGlobal } from './storage-service';

const minClipboardQueries = 3;
const minDefaultClipboardItems = 5;
const minDefaultStoredItems = 10;

export enum SearchResultType {
  Stored,
  ClipboardTracked,
}
export interface ISearchResult {
  results: ISearchResultItem[];
}

export interface ISearchResultItem {
  id: string;
  value: string;
  tags: string[];
  type: SearchResultType;
  searchGroupName: string;
}

const storedItemToResultItem = (
  item: IClipboardItem,
  searchGroupName: string
): ISearchResultItem => {
  return {
    id: item.id,
    value: item.value,
    tags: item.tags,
    type: SearchResultType.Stored,
    searchGroupName,
  };
};

const clipboardItemToResultItem = (
  item: IClipboardTrackedItem,
  searchGroupName: string
): ISearchResultItem => {
  return {
    id: item.value,
    value: item.value,
    tags: [],
    type: SearchResultType.ClipboardTracked,
    searchGroupName,
  };
};

const storedItemToRecentlyUsedResultItem = (
  item: IClipboardItem
): ISearchResultItem => {
  return storedItemToResultItem(item, 'Recently used');
};

const storedItemToSearchResultItem = (
  item: IClipboardItem
): ISearchResultItem => {
  return storedItemToResultItem(item, 'Stored results');
};

const clipboardItemToFrequnetlyUsedResultItem = (
  item: IClipboardTrackedItem
): ISearchResultItem => {
  return clipboardItemToResultItem(item, 'Frequently used in clipboard');
};

const clipboardItemToSearchResultItem = (
  item: IClipboardTrackedItem
): ISearchResultItem => {
  return clipboardItemToResultItem(item, 'Clipboard results');
};

const clipboardSortFunction = (
  a: IClipboardTrackedItem,
  b: IClipboardTrackedItem
): number => {
  return b.usedOn.length - a.usedOn.length;
};

export const search = async (query: string): Promise<ISearchResult> => {
  const { items: storedItems } = await StoreServiceGlobal.getClipboard();
  const clipboardItems = ClipboardTrackerGlobal.getClipboardTrackedItems();

  // Handle 0 query top suggestion
  if (!query) {
    const topStoredItems = storedItems
      .slice(0, minDefaultStoredItems)
      .map(storedItemToRecentlyUsedResultItem);
    const orderedClipboardItems = clipboardItems
      .filter((i) => i.usedOn.length >= minClipboardQueries)
      .sort(clipboardSortFunction);
    const topClipboardItems = orderedClipboardItems
      .slice(0, minDefaultClipboardItems)
      .map(clipboardItemToFrequnetlyUsedResultItem);

    return Promise.resolve({
      results: topStoredItems.concat(topClipboardItems),
    });
  }

  const queryLower = query.toLowerCase();

  const storedResults = storedItems.filter(
    (item) =>
      item.value.toLowerCase().includes(queryLower) ||
      item.tags.some((tag) => tag.toLowerCase().includes(queryLower))
  );

  const clipbaordResults = clipboardItems.filter((item) =>
    item.value.toLowerCase().includes(queryLower)
  );

  return Promise.resolve({
    results: storedResults
      .map(storedItemToSearchResultItem)
      .concat(clipbaordResults.map(clipboardItemToSearchResultItem)),
  });
};
