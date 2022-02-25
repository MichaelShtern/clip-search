import { useCallback, useEffect, useRef } from 'react';
import './add-item-pane.css';

export interface IAddItemPaneProps {
  initialValue: string;
  onCancel: () => void;
  onAdd: (value: string, tags: string[]) => void;
}

export const AddItemPane: React.FC<IAddItemPaneProps> = ({
  onAdd,
  onCancel,
  initialValue,
}: IAddItemPaneProps) => {
  const inputValueRef = useRef<HTMLInputElement | null>(null);
  const inputTagRef = useRef<HTMLInputElement | null>(null);

  const onAddCallback = useCallback(() => {
    const value = inputValueRef.current?.value;
    if (!value) {
      onCancel();
    }
    const tagsString = inputTagRef.current?.value || '';
    const tags = tagsString.split(' ').filter((tag) => !!tag);
    onAdd(value as string, tags);
  }, [inputValueRef, onAdd, onCancel]);

  const keyDownCallback = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      } else if (event.key === 'Enter') {
        onAddCallback();
      }
    },
    [onCancel, onAddCallback]
  );

  const cancelButtonKeyDownCallback = useCallback(
    (event) => {
      if (event.key === 'Enter') {
        onCancel();
      }

      event.stopPropagation();
    },
    [onCancel]
  );

  useEffect(() => {
    document.addEventListener('keydown', keyDownCallback, false);

    return () => {
      document.removeEventListener('keydown', keyDownCallback, false);
    };
  }, [keyDownCallback]);

  useEffect(() => {
    if (initialValue) {
      inputTagRef.current?.focus();
    } else {
      inputValueRef.current?.focus();
    }
  }, [initialValue, inputValueRef, inputTagRef]);

  const onAddButtonLostFocusCallback = useCallback(() => {
    inputValueRef.current?.focus();
  }, [inputValueRef]);

  const addButtonKeyDownCallback = useCallback(
    (event) => {
      if (event.key === 'Enter') {
        event.stopPropagation();
        onAddCallback();
      }
    },
    [onAddCallback]
  );

  return (
    <div
      style={{
        padding: '0.3rem',
        margin: '0.3rem',
        backgroundColor: 'white',
        borderRadius: '0.3rem',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '12% 88%',
          gridTemplateRows: '50% 50%',
        }}
      >
        <div className="AddItemPaneInputLabel">Value:</div>
        <input
          ref={inputValueRef}
          className="AddItemPaneInput"
          type="text"
          placeholder="Write your new item value"
          defaultValue={initialValue}
        />
        <div className="AddItemPaneInputLabel">Tags:</div>
        <input
          ref={inputTagRef}
          className="AddItemPaneInput"
          type="text"
          placeholder="Write tags here, for example: Tag1 Tag2"
        />
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          padding: '0.5rem',
          gap: '0.5rem',
        }}
      >
        <div
          className="AddItemPaneInputButtonWrapper"
          onClick={() => onCancel()}
          onKeyDown={cancelButtonKeyDownCallback}
        >
          <div
            tabIndex={0}
            className="AddItemPaneInputButton AddItemPaneInputButtonDefault"
          >
            Cancel
          </div>
        </div>

        <div
          className="AddItemPaneInputButtonWrapper"
          onClick={onAddCallback}
          onKeyDown={addButtonKeyDownCallback}
        >
          <div
            tabIndex={0}
            className="AddItemPaneInputButton AddItemPaneInputButtonPrimary"
            onBlur={onAddButtonLostFocusCallback}
          >
            Add
          </div>
        </div>

        {/* Adding extra tabble element to capture focus and manually propogate to input */}
        <div tabIndex={0} />
      </div>
    </div>
  );
};
