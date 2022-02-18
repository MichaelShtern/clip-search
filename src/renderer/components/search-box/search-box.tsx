import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import './search-box.css';

export interface ISearchBoxProps {
  onTextChange: (text: string) => void;
  disabled: boolean;
}

export interface ISearchBoxHandle {
  focus: () => void;
  setText: (text: string) => void;
}

const SearhBoxRefFunction: React.ForwardRefRenderFunction<
  ISearchBoxHandle,
  ISearchBoxProps
> = ({ onTextChange, disabled }, forwardedRef) => {
  const [inputText, setInputText] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useImperativeHandle(
    forwardedRef,
    () => ({
      focus() {
        inputRef.current?.focus();
      },
      setText(text: string) {
        setInputText(text);
        onTextChange(text);
      },
    }),
    [inputRef, setInputText, onTextChange]
  );

  const onInputCallback = useCallback(
    ({ target }: { target: EventTarget | null }) => {
      const { value } = target as HTMLInputElement;
      onTextChange(value);
      setInputText(value);
    },
    [onTextChange, setInputText]
  );

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ height: '2.25rem' }}>
        <div style={{ padding: '0.3rem' }} className="SearchBoxInput">
          {/* <div
                        style={{
                            position: "relative",
                        }}
                    >
                        <div
                            className="SearchBoxAddIcon"
                            style={{
                                position: "absolute",
                                right: "1rem",
                                zIndex: "1",
                                fontSize: "larger",
                            }}
                        >
                            Add
                        </div>
                    </div> */}
          <input
            value={inputText}
            ref={inputRef}
            disabled={disabled}
            type="text"
            placeholder="Search for stored items or tags"
            onInput={onInputCallback}
            style={{
              height: '1.8rem',
              position: 'relative',
              paddingTop: '0.3rem',
              paddingBottom: '0.1rem',
              paddingLeft: '0.3rem',
              resize: 'none',
              fontFamily: 'Segoe UI',
              fontSize: '0.9rem',
              width: '100%',
              boxSizing: 'border-box',
              color: '#676767',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export const SearchBox = forwardRef(SearhBoxRefFunction);
