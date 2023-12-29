import './Search.css';
import { useEffect, useState } from 'react';
import { SearchItem, SearchItemType } from '../../common/search';
import SearchResultItem from './SearchResultItem/SearchResultItem';
import { BiSearch } from 'react-icons/bi';

export default function Search() {
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const itemSources: SearchItem[] = [
    {
      type: SearchItemType.SearchEngine,
      engine: {
        name: 'Google',
        url: 'https://www.google.com/search?q={keyword}',
      },
    },
    {
      type: SearchItemType.SearchHistory,
      history: {
        title: 'JavaScript map関数 - Google 検索',
        url: 'https://www.google.com/search?q=JavaScript+map%E9%96%A2%E6%95%B0',
        domain: 'google.com',
      },
    },
  ];

  const items = itemSources.map((eachItem, index) => (
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
      <input type='text' className='search-bar' placeholder='検索キーワード' />
      <div className='search-results scrollbar-none'>
        {items}
      </div>
    </div>
  );

  function onKeyDown(event: KeyboardEvent) {
    switch (event.code) {
      case 'ArrowUp':
        setSelectedItemIndex((state) => state <= 0 ? 0 : state - 1);
        break;

      case 'ArrowDown':
        setSelectedItemIndex((state) => state + 1 >= itemSources.length ? itemSources.length - 1 : state + 1);
        break;
    }
  }
}
