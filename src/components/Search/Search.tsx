import './Search.css';
import { useEffect, useState } from 'react';
import SearchResultItem from './SearchResultItem/SearchResultItem';
import { BiSearch } from 'react-icons/bi';
import { SearchItem } from '../../common/search';

export default function Search() {
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [searchItems, setSearchItems] = useState<SearchItem[]>([]);

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
        onChange={async (e) => {
          const text = e.currentTarget.value;
          setSearchText(text);

          const newItems = await SearchItem.search({
            text,
            historyStartTime: 0, // fix
          });

          setSearchItems(newItems);
        }}
        placeholder='検索キーワード'
      />
      <div className='search-results scrollbar-none'>
        {items}
      </div>
    </div>
  );

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
