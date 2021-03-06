import localforage from 'localforage';
import { v4 as uuidv4 } from 'uuid';

export interface IClipboardItem {
  id: string;
  value: string;
  tags: string[];
}
export interface IClipboard {
  items: IClipboardItem[];
}

export class StoreService {
  clipboardStorageKey = 'quicklip_V1';

  clipboardCache: IClipboard | null;

  constructor() {
    this.clipboardCache = null;
  }

  initCache = async () => {
    if (!this.clipboardCache) {
      this.clipboardCache = await localforage.getItem<IClipboard>(
        this.clipboardStorageKey
      );
    }

    // doeesn't exist in storage yet
    if (!this.clipboardCache) {
      this.clipboardCache = { items: [] };
    }
  };

  getClipboard = async (): Promise<IClipboard> => {
    await this.initCache();
    return this.clipboardCache as IClipboard;
  };

  addItem = async (value: string, tags: string[]): Promise<IClipboardItem> => {
    await this.initCache();
    const newItem: IClipboardItem = {
      value,
      tags,
      id: uuidv4(),
    };
    this.clipboardCache?.items.push(newItem);
    await localforage.setItem<IClipboard>(
      this.clipboardStorageKey,
      this.clipboardCache as IClipboard
    );

    return newItem;
  };

  deleteItem = async (id: string): Promise<void> => {
    await this.initCache();

    if (this.clipboardCache) {
      this.clipboardCache.items = this.clipboardCache?.items.filter(
        (item) => item.id !== id
      );

      await localforage.setItem<IClipboard>(
        this.clipboardStorageKey,
        this.clipboardCache as IClipboard
      );
    }
  };

  updateItem = async (
    id: string,
    value: string,
    tags: string[]
  ): Promise<void> => {
    await this.initCache();

    if (this.clipboardCache && value) {
      const items = this.clipboardCache?.items.filter((item) => item.id === id);
      if (items && items.length > 0) {
        const item = items[0];
        item.value = value;
        item.tags = tags;

        await localforage.setItem<IClipboard>(
          this.clipboardStorageKey,
          this.clipboardCache as IClipboard
        );
      }
    }
  };
}

export const StoreServiceGlobal = new StoreService();
