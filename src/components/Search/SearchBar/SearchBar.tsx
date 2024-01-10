import { Ref, forwardRef, useImperativeHandle, useRef, useState } from 'react';
import './SearchBar.css';

export type Debouncer = {
  timeoutId: number,
  searchText: string,
};

export type SearchBarRef = {
  updateSearchText: (searchText: string) => void,
};

export type SearchBarProps = {
  defaultSearchText?: string,
  placeholder?: string,
  debounceTimeout?: number,
  onChange?: (searchText: string) => void,
};

// eslint-disable-next-line react-refresh/only-export-components
function SearchBar(props: SearchBarProps, ref: Ref<SearchBarRef>) {
  const debouncer = useRef<Debouncer | null>(null);
  const [searchText, setSearchText] = useState(props.defaultSearchText ?? '');

  useImperativeHandle(ref, () => ({
    updateSearchText: setSearchText,
  }));

  return (
    <input
      type='text'
      className='search-bar'
      value={searchText}
      onChange={(e) => onChange(e.currentTarget.value)}
      placeholder={props.placeholder}
      autoFocus
    />
  );

  function onChange(newSearchText: string) {
    setSearchText(newSearchText);

    if (debouncer.current !== null) {
      clearTimeout(debouncer.current.timeoutId);
    }

    debouncer.current = {
      timeoutId: setTimeout(consumeSearchText, props.debounceTimeout ?? 0),
      searchText: newSearchText,
    };
  }

  async function consumeSearchText() {
    if (debouncer.current === null) {
      return;
    }

    if (props.onChange) {
      props.onChange(debouncer.current.searchText);
    }

    debouncer.current = null;
  }
}

const component = forwardRef(SearchBar);
export default component;
