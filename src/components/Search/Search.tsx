import './Search.css';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import SearchResultItem from './SearchResultItem/SearchResultItem';
import { BiSearch } from 'react-icons/bi';
import { MdSettings } from 'react-icons/md';
import { SearchItem, SearchItemType, SearchResult, SearchResultType } from '../../common/search';
import { searchTimeout } from '../../../default.json';
import { Link } from 'react-router-dom';
import { Preferences } from '../../common/preference';

export default function Search() {
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const [searchText, setSearchText] = useState('');

  const [searchResult, setSearchResult] = useState<SearchResult>({
    type: SearchResultType.Normal,
    items: [],
  });

  const [searchResultHeight, setSearchResultHeight] = useState(200);
  const searchTextQueue = useRef<string[]>([]);
  const searchResultsRef = useRef<HTMLDivElement>(null);

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
  }, [selectedItemIndex, searchResult]); // eslint-disable-line react-hooks/exhaustive-deps

  const items = searchResult.items.map((eachItem, index) => (
    <SearchResultItem
      index={index}
      item={eachItem}
      selected={index === selectedItemIndex}
      onSelect={onSelectSearchResultItem}
      onOpen={(index, closePopup) => {
        setSelectedItemIndex(index);
        openSearchItem(eachItem, closePopup);
      }}
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
      <Link to='/settings'>
        <MdSettings
          color='var(--light-gray-color)'
          size={18}
          style={{
            cursor: 'pointer',
            right: 'calc(var(--margin) / 2)',
            position: 'absolute',
            top: 12,
          }}
        />
      </Link>
      <input
        type='text'
        className='search-bar'
        value={searchText}
        onChange={onChangeSearchText}
        placeholder='検索キーワード'
        autoFocus
      />
      <div className='search-results scrollbar-none' style={{ height: searchResultHeight }} ref={searchResultsRef}>
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

    switch (searchResult.type) {
      case SearchResultType.Normal: {
        const newItems = await SearchItem.search({
          text: currentSearchText,
          historyStartTime: 0, // fix
        });

        setSearchResult({
          type: SearchResultType.Normal,
          items: newItems,
        });
      } break;

      case SearchResultType.SearchEngine: {
        setSearchResult({
          type: SearchResultType.SearchEngine,
          items: [],
        });
      } break;
    }
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
        setSelectedItemIndex((state) => state + 1 >= searchResult.items.length ? searchResult.items.length - 1 : state + 1);
        event.preventDefault();
        break;

      case 'Enter': {
        if (event.isComposing) {
          break;
        }

        const target = searchResult.items[selectedItemIndex];

        if (target) {
          openSearchItem(target, !event.ctrlKey);
        }

        event.preventDefault();
      } break;
    }
  }

  function onSelectSearchResultItem(element: HTMLDivElement) {
    if (searchResultsRef.current && element.parentElement) {
      const currentScrollTop = searchResultsRef.current.scrollTop;
      const currentScrollBottom = currentScrollTop + searchResultsRef.current.offsetHeight;
      const selectedTop = element.offsetTop - (element.parentElement.offsetTop ?? 0);
      const selectedHeight = element.offsetHeight;
      const selectedBottom = selectedTop + selectedHeight;

      if (selectedBottom > currentScrollBottom) {
        searchResultsRef.current.scrollBy(0, selectedHeight);
        return;
      }

      if (selectedTop < currentScrollTop) {
        searchResultsRef.current.scrollBy(0, -selectedHeight);
        return;
      }
    }
  }

  async function openSearchItem(searchItem: SearchItem, closePopup: boolean): Promise<void> {
    const openInNewTab = (await Preferences.get()).displayAndBehavior.openInNewTab;

    const createTab = async (url: string) => {
      if (openInNewTab) {
        chrome.tabs.create({
          url,
          active: closePopup,
        });
      } else {
        const activeTabs = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });

        if (activeTabs[0] && activeTabs[0].id) {
          chrome.tabs.update(activeTabs[0].id, { url });
        }
      }
    };

    switch (searchItem.type) {
      case SearchItemType.SearchEngine:
        setSearchText('');
        setSearchResult({
          type: SearchResultType.SearchEngine,
          items: [],
        });
        break;

      case SearchItemType.ChromePage:
        createTab(searchItem.page.url);
        break;

      case SearchItemType.OpenTab:
        chrome.tabs.update(searchItem.tab.id, { active: true });
        break;

      case SearchItemType.SearchHistory:
        createTab(searchItem.history.website.url);
        break;
    }

    if (closePopup && searchItem.type !== SearchItemType.SearchEngine) {
      window.close();
    }
  }
}
