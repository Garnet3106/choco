import './Search.css';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import SearchResultItem from './SearchResultItem/SearchResultItem';
import { BiSearch } from 'react-icons/bi';
import { SearchItem } from '../../common/search';
import { searchTimeout } from '../../../env.json';

export default function Search() {
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [searchItems, setSearchItems] = useState<SearchItem[]>([]);
  const [searchResultHeight, setSearchResultHeight] = useState(200);
  const searchTextQueue = useRef<string[]>([]);

  useEffect(() => {
    chrome.windows.getCurrent().then((window) => {
      if (window.height) {
        setSearchResultHeight(window.height * 0.4);
      }
    });
  }, []);

  useEffect(() => {
    chrome.storage.local.onChanged.addListener(onChangeStorage);
    return () => chrome.storage.local.onChanged.removeListener(onChangeStorage);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [searchItems.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const items = searchItems.map((eachItem, index) => (
    <SearchResultItem
      item={eachItem}
      selected={index === selectedItemIndex}
      key={Math.random()}
    />
  ));

  return (
    <div className='search' style={{ position: 'relative' }}>
      <BiSearch
        color='var(--light-gray-color)'
        size={18}
        style={{
          left: 'calc(var(--margin) / 2)',
          position: 'absolute',
          top: 12,
        }}
      />
      <input
        type='text'
        className='search-bar'
        value={searchText}
        onChange={onChangeSearchText}
        placeholder='検索キーワード'
      />
      <div className='search-results scrollbar-none' style={{ height: searchResultHeight }}>
        {items}
      </div>
    </div>
  );

  async function dequeSearchText() {
    if (searchTextQueue.current.length >= 2) {
      searchTextQueue.current.shift();
      return;
    }

    const currentSearchText = searchTextQueue.current.pop() ?? '';

    const newItems = await SearchItem.search({
      text: currentSearchText,
      historyStartTime: 0, // fix
    });

    setSearchItems(newItems);
  }

  function onChangeStorage(_data: { [key: string]: chrome.storage.StorageChange }) {
  }

  async function onChangeSearchText(event: ChangeEvent<HTMLInputElement>) {
    const text = event.currentTarget.value;
    setSearchText(text);
    searchTextQueue.current.push(text);
    setTimeout(dequeSearchText, searchTimeout);
  }

  function onKeyDown(event: KeyboardEvent) {
    switch (event.code) {
      case 'ArrowUp':
        setSelectedItemIndex((state) => state <= 0 ? 0 : state - 1);
        event.preventDefault();
        break;

      case 'ArrowDown':
        setSelectedItemIndex((state) => state + 1 >= searchItems.length ? searchItems.length - 1 : state + 1);
        event.preventDefault();
        break;
    }
  }
}
