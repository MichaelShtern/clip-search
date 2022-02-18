import { useCallback, useEffect } from 'react';

export interface IItemNotFoundPaneProps {
  itemText: string;
  onAddItemCallback: () => void;
}

export const ItemNotFoundPane: React.FC<IItemNotFoundPaneProps> = ({
  itemText,
  onAddItemCallback,
}: IItemNotFoundPaneProps) => {
  const keyDownCallback = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        onAddItemCallback();
      }
    },
    [onAddItemCallback]
  );

  useEffect(() => {
    document.addEventListener('keydown', keyDownCallback, false);

    return () => {
      document.removeEventListener('keydown', keyDownCallback, false);
    };
  }, [keyDownCallback]);

  let itemTrimmed = itemText;
  if (itemTrimmed.length > 20) {
    itemTrimmed = `${itemTrimmed.substring(0, 17)}...`;
  }

  return (
    <div
      style={{
        paddingTop: '1rem',
        paddingLeft: '2rem',
        fontWeight: 'bolder',
        color: '#332C27',
      }}
    >
      Could not find <span style={{ color: '#00B0F0' }}>{itemTrimmed}</span>,
      click{' '}
      <span
        onClick={() => onAddItemCallback()}
        style={{ color: '#006AC3', cursor: 'pointer' }}
      >
        here
      </span>{' '}
      or hit <span style={{ fontStyle: 'italic' }}>Enter</span> to add it
    </div>
  );
};
