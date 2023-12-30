import './Search.css';
import { useEffect, useState } from 'react';
import { SearchItemType, Tab } from '../../common/search';
import SearchResultItem from './SearchResultItem/SearchResultItem';
import { BiSearch } from 'react-icons/bi';

export default function Search() {
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [searchItems, setSearchItems] = useState([]);

  useEffect(() => {
    chrome.storage.local.get().then(importStorage);
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
        onChange={(e) => setSearchText(e.currentTarget.value)}
        placeholder='検索キーワード'
      />
      <div className='search-results scrollbar-none'>
        {items}
      </div>
    </div>
  );

  function importStorage(data: { [key: string]: any }) {
    if (data.openTabs) {
      const newItems = data.openTabs.map((eachTab: Tab) => ({
        type: SearchItemType.OpenTab,
        tab: eachTab,
      }));

      setSearchItems(newItems);
    }
  }

  function onChangeStorage(_data: { [key: string]: chrome.storage.StorageChange }) {
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
