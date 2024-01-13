import './Search.css';
import { ReactNode, useEffect, useRef, useState } from 'react';
import SearchResultItem from './SearchResultItem/SearchResultItem';
import { BiSearch } from 'react-icons/bi';
import { MdSettings } from 'react-icons/md';
import { CategorizedSearchItems, Favorites, Search as ItemSearch, SearchEngine, SearchItem, SearchItemType, SearchResult, SearchResultType, Website } from '../../common/search';
import { Link } from 'react-router-dom';
import { Preferences } from '../../common/preference';
import { UnexhaustiveError } from '../../common/error';
import toast from 'react-hot-toast';
import { Tab } from '../../common/tab';
import SearchBar, { SearchBarRef } from './SearchBar/SearchBar';
import { searchTimeout } from '../../../default.json';

const defaultSearchResult: SearchResult = {
  type: SearchResultType.Normal,
  items: [],
  categorizeItems: false,
};

export default function Search() {
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);

  const searchBarRef = useRef<SearchBarRef | null>(null);
  const [searchText, setSearchText] = useState('');

  const [searchResult, setSearchResult] = useState<SearchResult>(defaultSearchResult);
  const [searchResultHeight, setSearchResultHeight] = useState(200);
  const searchResultsRef = useRef<HTMLDivElement>(null);
  let searchResultMessage: string | null = null;

  if (!searchResult.items.length) {
    if (searchText.trim() === '') {
      if (searchResult.type === SearchResultType.SearchEngine) {
        searchResultMessage = '検索キーワードを入力すると検索できます。';
      } else {
        searchResultMessage = 'Webサイトをお気に入りに登録するとここに表示されます。';
      }
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

  let items: ReactNode[] = [];

  if (searchResult.type === SearchResultType.Normal && searchResult.categorizeItems) {
    const categorized = CategorizedSearchItems.categorize(searchResult.items);
    let indexSum = 0;

    items = Object.entries(categorized).map(([eachType, eachItems]) => {
      const eachItemNodes = getSearchResultItems(eachItems, (index) => index + indexSum);
      const firstCategory = indexSum === 0;
      indexSum += eachItems.length;

      if (!eachItemNodes.length) {
        return [];
      }

      const categoryName = (
        <div
          className='search-result-category-name'
          style={{ marginTop: firstCategory ? 0 : 5 }}
          key={Math.random()}
        >
          {SearchItemType.translation[Number(eachType) as SearchItemType]}
        </div>
      );

      return [categoryName, ...eachItemNodes];
    });
  } else {
    items = getSearchResultItems(searchResult.items);
  }

  return (
    <div className='search' style={{ position: 'relative' }}>
      {getSearchBarIcon()}
      <Link to='/settings'>
        <MdSettings
          color='var(--light-gray-color)'
          size={18}
          style={{
            cursor: 'pointer',
            right: 'var(--margin-half)',
            position: 'absolute',
            top: 12,
          }}
        />
      </Link>
      <SearchBar
        placeholder={searchResult.type === SearchResultType.SearchEngine ? `“${searchResult.searchEngine.name}” で検索する（Escで戻る）` : '検索キーワードを入力'}
        debounceTimeout={searchResult.type === SearchResultType.SearchEngine ? 0 : searchTimeout}
        onChange={updateSearchResult}
        ref={searchBarRef}
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

  function updateSearchText(newSearchText: string) {
    searchBarRef.current?.updateSearchText(newSearchText);
    setSearchText(newSearchText);
  }

  async function updateSearchResult(newSearchText: string) {
    updateSearchText(newSearchText);

    switch (searchResult.type) {
      case SearchResultType.Normal: {
        const preferences = await Preferences.get();

        const newItems = await ItemSearch.search({
          text: newSearchText,
          hideNotificationCountInTitle: preferences.displayAndBehavior.hideNotificationCountInTitle,
        });

        setSearchResult({
          type: SearchResultType.Normal,
          items: newItems,
          categorizeItems: preferences.displayAndBehavior.showCategoryName,
        });
      } break;

      case SearchResultType.SearchEngine: {
        const searchItem: SearchItem = {
          type: SearchItemType.SearchEngineKeyword,
          website: {
            title: `“${newSearchText}” で検索`,
            url: SearchEngine.replaceKeyword(searchResult.searchEngine.url, newSearchText),
          },
        };

        setSearchResult({
          type: SearchResultType.SearchEngine,
          searchEngine: searchResult.searchEngine,
          items: newSearchText ? [searchItem] : [],
        });
      } break;

      default:
        throw new UnexhaustiveError();
    }

    setSelectedItemIndex(0);
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
            Favorites.remove(target.website.url).then(() => updateSearchResult(searchText));
            toast('お気に入りから削除しました。');
          } else {
            const website = SearchItem.getWebsite(target);

            if (!website) {
              toast('この項目はお気に入りに追加できません。');
              break;
            }

            Favorites.add(website).then(() => updateSearchResult(searchText));
            toast('お気に入りに追加しました。');
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

      case 'Escape':
        if (searchResult.type === SearchResultType.SearchEngine) {
          updateSearchText('');
          setSearchResult(defaultSearchResult);
          event.preventDefault();
        }
        break;

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

  function getSearchBarIcon(): ReactNode {
    if (searchResult.type === SearchResultType.SearchEngine) {
      return (
        <img
          src={Website.getFavIconUrl(searchResult.searchEngine.url)}
          height={18}
          width={18}
          style={{
            left: 'calc(var(--margin-half) + 1px)',
            position: 'absolute',
            top: 11,
          }}
        />
      );
    } else {
      return (
        <BiSearch
          color='var(--light-gray-color)'
          size={18}
          style={{
            left: 'calc(var(--margin-half) + 1px)',
            position: 'absolute',
            top: 11,
          }}
        />
      );
    }
  }

  function getSearchResultItems(
    items: SearchItem[],
    indexer: (index: number) => number = (index) => index,
  ): ReactNode[] {
    return items.map((eachItem, index) => {
      const calculatedIndex = indexer(index);

      return (
        <SearchResultItem
          index={calculatedIndex}
          item={eachItem}
          selected={calculatedIndex === selectedItemIndex}
          onSelect={onSelectSearchResultItem}
          onOpen={(index, closePopup) => {
            setSelectedItemIndex(index);
            openSearchItem(eachItem, closePopup);
          }}
          key={Math.random()}
        />
      );
    });
  }

  async function openSearchItem(searchItem: SearchItem, closePopup: boolean): Promise<void> {
    const openInNewTab = (await Preferences.get()).displayAndBehavior.openInNewTab;
    const createTab = async (url: string) => Tab.openUrl(url, openInNewTab, closePopup);

    switch (searchItem.type) {
      case SearchItemType.SearchEngine:
        updateSearchText('');
        setSearchResult({
          type: SearchResultType.SearchEngine,
          searchEngine: searchItem.engine,
          items: [],
        });
        break;

      case SearchItemType.SearchEngineKeyword:
        createTab(searchItem.website.url);
        break;

      case SearchItemType.Favorite:
        createTab(searchItem.website.url);
        break;

      case SearchItemType.ChromePage:
        createTab(searchItem.page.url);
        break;

      case SearchItemType.OpenTab:
        chrome.tabs.update(searchItem.tab.id, { active: true });
        break;

      case SearchItemType.Bookmark:
        createTab(searchItem.website.url);
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
