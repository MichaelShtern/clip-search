import { StoreServiceGlobal } from './storage-service';

export interface ISearchResult {
  results: ISearchResultItem[];
}

export interface ISearchResultItem {
  id: string;
  value: string;
  tags: string[];
}

// const defaultItems: ISearchResultItem[] = Array.from(Array(20).keys()).map(
//     (item) => {
//         const id = item.toString();
//         return {
//             id: id,
//             value: "michast" + id + "@microsoft.com",
//             tags: ["email", "account"],
//         };
//     }
// );

export const search = async (query: string): Promise<ISearchResult> => {
  const { items } = await StoreServiceGlobal.getClipboard();

  if (!query) {
    return Promise.resolve({ results: items.slice(0, 25) });
  }

  const queryLower = query.toLowerCase();

  const results = items.filter(
    (item) =>
      item.value.toLowerCase().includes(queryLower) ||
      item.tags.some((tag) => tag.toLowerCase().includes(queryLower))
  );

  return Promise.resolve({ results });
};
