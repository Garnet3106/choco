import './Search.css';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import SearchResultItem from './SearchResultItem/SearchResultItem';
import { BiSearch } from 'react-icons/bi';
import { MdSettings } from 'react-icons/md';
import { SearchEngine, SearchItem, SearchItemType, SearchResult, SearchResultType, Website } from '../../common/search';
import { searchTimeout } from '../../../default.json';
import { Link } from 'react-router-dom';
import { Preferences } from '../../common/preference';
import { Favorites } from '../../common/search';
import { UnexhaustiveError } from '../../common/error';

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
  let searchResultMessage: string | null = null;

  if (!searchResult.items.length && !searchTextQueue.current.length) {
    if (searchText.trim() === '') {
      searchResultMessage = 'Webサイトをお気に入りに登録するとここに表示されます。';
    } else {
      searchResultMessage = '該当するWebサイトが見つかりませんでした。';
    }
  }

  useEffect(() => {
    chrome.windows.getCurrent().then((window) => {
      if (window.height) {
        setSearchResultHeight(window.height * 0.4);
      }
    });
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [selectedItemIndex, searchText, searchResult]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    updateSearchResult(searchText);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
          top: 11,
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
        placeholder={searchResult.type === SearchResultType.SearchEngine ? `“${searchResult.searchEngine.name}” で検索中` : '検索キーワードを入力'}
        autoFocus
      />
      <div className='search-results scrollbar-none' style={{ height: searchResultHeight }} ref={searchResultsRef}>
        {items}
        {
          searchResultMessage && (
            <div className='search-result-message'>
              {searchResultMessage}
            </div>
          )
        }
      </div>
    </div>
  );

  function enqueueSearchText(newSearchText: string) {
    setSearchText(newSearchText);
    searchTextQueue.current.push(newSearchText);
    setTimeout(dequeueSearchText, searchTimeout);
  }

  async function dequeueSearchText() {
    if (searchTextQueue.current.length >= 2) {
      searchTextQueue.current.shift();
      return;
    }

    const currentSearchText = searchTextQueue.current.pop()?.trim() ?? '';
    updateSearchResult(currentSearchText);
  }

  async function updateSearchResult(currentSearchText: string) {
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
        const searchItem: SearchItem = {
          type: SearchItemType.SearchEngineKeyword,
          website: {
            title: `“${currentSearchText}” で検索`,
            url: SearchEngine.replaceKeyword(searchResult.searchEngine.url, currentSearchText),
            domain: Website.getDomain(searchResult.searchEngine.url),
          },
        };

        setSearchResult({
          type: SearchResultType.SearchEngine,
          searchEngine: searchResult.searchEngine,
          items: currentSearchText ? [searchItem] : [],
        });
      } break;

      default:
        throw new UnexhaustiveError();
    }

    setSelectedItemIndex(0);
  }

  async function onChangeSearchText(event: ChangeEvent<HTMLInputElement>) {
    enqueueSearchText(event.currentTarget.value);
  }

  function onKeyDown(event: KeyboardEvent) {
    switch (event.code) {
      case 'KeyF':
        if (event.ctrlKey) {
          event.preventDefault();
          const target = searchResult.items[selectedItemIndex];

          if (!target) {
            break;
          }

          if (target.type === SearchItemType.Favorite) {
            Favorites.remove(target.website.url).then(() => enqueueSearchText(searchText));
          } else {
            const website = SearchItem.getWebsite(target);

            if (!website) {
              break;
            }

            Favorites.add(website).then(() => enqueueSearchText(searchText));
          }
        }
        break;

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

      default:
        break;
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
          searchEngine: searchItem.engine,
          items: [],
        });
        break;

      case SearchItemType.Favorite:
        createTab(searchItem.website.url);
        break;

      case SearchItemType.SearchEngineKeyword:
        createTab(searchItem.website.url);
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

      default:
        throw new UnexhaustiveError();
    }

    if (closePopup && searchItem.type !== SearchItemType.SearchEngine) {
      window.close();
    }
  }
}
