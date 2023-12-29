import { useState } from 'react';
import { SearchItem, SearchItemType } from '../../common/search';
import './Search.css';
import SearchResultItem from './SearchResultItem/SearchResultItem';

export default function Search() {
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);

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
    <div className='search'>
      <input type='text' className='search-bar' placeholder='検索キーワード' />
      <div className='search-results scrollbar-none'>
        {items}
      </div>
    </div>
  );
}
