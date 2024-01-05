import './SearchResultItem.css';
import { MouseEvent, ReactNode, useEffect, useRef } from 'react';
import { SearchItem, SearchItemType, Website } from '../../../common/search';
import { BiSearch, BiSolidWrench } from 'react-icons/bi';
import { MdFavorite, MdHistory } from 'react-icons/md';
import { HiOutlineDuplicate } from 'react-icons/hi';
import { UnexhaustiveError } from '../../../common/error';

export type SearchResultItemProps = {
  index: number,
  item: SearchItem,
  selected?: boolean,
  onSelect?: (element: HTMLDivElement) => void,
  onOpen?: (index: number, closePopup: boolean) => void,
};

type Elements = {
  topIcon?: ReactNode,
  typeIcon?: ReactNode,
  text?: string,
  caption?: string,
  tag?: string,
};

export default function SearchResultItem(props: SearchResultItemProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (props.onSelect && props.selected && ref.current) {
      props.onSelect(ref.current);
    }
  }, [props.selected]);  // eslint-disable-line react-hooks/exhaustive-deps

  const topFavIconProps = {
    height: 18,
    width: 18,
    style: {
      marginTop: 2,
      marginRight: 8,
      minWidth: 18,
    },
  };

  const topIconProps = {
    color: 'var(--white-color)',
    size: 18,
    style: {
      marginTop: 2,
      marginRight: 8,
      minWidth: 18,
    },
  };

  const typeIconProps = {
    color: 'var(--light-gray-color)',
    size: 20,
    style: {
      marginLeft: 8,
      minWidth: 20,
    },
  };

  const elements: Elements = {};

  switch (props.item.type) {
    case SearchItemType.SearchEngine:
      elements.topIcon = <BiSearch {...topIconProps} />;
      elements.text = `“${props.item.engine.name}” で検索する`;
      break;

    case SearchItemType.Favorite:
      elements.topIcon = getFavIconImage(props.item.website.url);
      elements.typeIcon = <MdFavorite {...typeIconProps} />;
      elements.text = props.item.website.title;
      elements.caption = props.item.website.domain;
      break;

    case SearchItemType.SearchEngineKeyword:
      elements.topIcon = <BiSearch {...topIconProps} />;
      elements.text = props.item.website.title;
      break;

    case SearchItemType.ChromePage:
      elements.topIcon = <BiSolidWrench {...topIconProps} />;
      elements.text = props.item.page.title;
      elements.caption = 'ブラウザー機能';
      break;

    case SearchItemType.OpenTab:
      elements.topIcon = getFavIconImage(props.item.tab.website.url);
      elements.typeIcon = <HiOutlineDuplicate {...typeIconProps} />;
      elements.text = props.item.tab.website.title;
      elements.caption = props.item.tab.website.domain;
      break;

    case SearchItemType.SearchHistory:
      elements.topIcon = getFavIconImage(props.item.history.website.url);
      elements.typeIcon = <MdHistory {...typeIconProps} />;
      elements.text = props.item.history.website.title;
      elements.caption = props.item.history.website.domain;
      elements.tag = getSearchHistoryDateString(props.item.history.lastVisited);
      break;

    default:
      throw new UnexhaustiveError();
  }

  return (
    <div
      className={`search-result-item ${props.selected ? 'search-result-item-selected' : ''}`}
      onClick={onClick}
      ref={ref}
    >
      {elements.topIcon}
      <div className='search-result-item-content'>
        <div className='search-result-item-content-left'>
          <span className='search-result-item-text'>
            {elements.text}
          </span>
          <span className='search-result-item-caption'>
            {elements.caption}
          </span>
        </div>
        <div className='search-result-item-content-right'>
          {
            elements.tag && (
              <div className='search-result-item-tag'>
                {elements.tag}
              </div>
            )
          }
          {elements.typeIcon}
        </div>
      </div>
    </div>
  );

  function onClick(event: MouseEvent<HTMLDivElement>) {
    if (props.onOpen) {
      props.onOpen(props.index, !event.ctrlKey);
    }
  }

  function getFavIconImage(url: string): ReactNode {
    const favIconUrl = Website.getFavIconUrl(url);
    return <img src={favIconUrl} {...topFavIconProps} />;
  }

  function getSearchHistoryDateString(lastVisited: number): string {
    const nowDate = toDateTimestamp(Date.now());
    const lastVisitedDate = toDateTimestamp(lastVisited);
    const diff = nowDate - lastVisitedDate;

    if (diff === 0) {
      return '今日';
    }

    if (diff === 1) {
      return '昨日';
    }

    if (diff < 30) {
      return `${diff}日前`;
    }

    if (diff < 365) {
      return `${Math.floor(diff / 30)}ヶ月前`;
    }

    return `1年以上前`;
  }

  function toDateTimestamp(ms: number): number {
    return Math.floor(ms / 1000 / 3600 / 24);
  }
}
