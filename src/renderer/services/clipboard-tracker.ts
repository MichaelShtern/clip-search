export interface IClipboardTrackedItem {
  value: string;
  usedOn: Date[];
}

export default class ClipboardTracker {
  clipboardUsageMap: Map<string, Date[]>;

  private onClipboardTextChangeCallback: (() => void) | undefined;

  constructor() {
    this.clipboardUsageMap = new Map<string, Date[]>();
  }

  addNewClipboardTextCopied = (value: string): void => {
    if (!this.clipboardUsageMap.has(value)) {
      this.clipboardUsageMap.set(value, []);
    }

    this.clipboardUsageMap.get(value)?.push(new Date());

    if (this.onClipboardTextChangeCallback) {
      this.onClipboardTextChangeCallback();
    }
  };

  listenOnClipboardTextChanged = (callback: () => void): void => {
    this.onClipboardTextChangeCallback = callback;
  };

  getClipboardTrackedItems = (): IClipboardTrackedItem[] => {
    return [...this.clipboardUsageMap].map((entry) => {
      return { value: entry[0], usedOn: entry[1] };
    });
  };

  startTrackingFromElectronMain = (): void => {
    (window as any).api.onClipboardCopy(
      (_event: unknown, ...args: unknown[]) => {
        const value = args.toString();
        this.addNewClipboardTextCopied(value);
      }
    );
  };
}

export const ClipboardTrackerGlobal = new ClipboardTracker();
