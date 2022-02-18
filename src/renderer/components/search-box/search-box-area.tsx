import { ISearchBoxProps, SearchBox } from './search-box';

const SearchBoxArea: React.FC<ISearchBoxProps> = ({
  onTextChange,
  disabled,
}: ISearchBoxProps) => {
  return (
    <div style={{ gridTemplateColumns: '100% 0%', display: 'grid' }}>
      <SearchBox onTextChange={onTextChange} disabled={disabled} />
      {/* <AddItemButton /> */}
    </div>
  );
};

export default SearchBoxArea;
