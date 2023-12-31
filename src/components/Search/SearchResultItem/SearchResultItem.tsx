import './SearchResultItem.css';
import { MouseEvent, ReactNode, useEffect, useRef } from 'react';
import { SearchItem, SearchItemType } from '../../../common/search';
import { BiSearch } from 'react-icons/bi';
import { FaCircle } from 'react-icons/fa';
import { MdHistory } from 'react-icons/md';
import { HiOutlineDuplicate } from 'react-icons/hi';

export type SearchResultItemProps = {
  item: SearchItem,
  selected?: boolean,
  onSelect?: (element: HTMLDivElement) => void,
  onOpen?: (closePopup: boolean) => void,
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

  const topIconProps = {
    color: 'var(--white-color)',
    size: 18,
    style: {
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

    case SearchItemType.OpenTab:
      elements.topIcon = <FaCircle {...topIconProps} />;
      elements.typeIcon = <HiOutlineDuplicate {...typeIconProps} />;
      elements.text = props.item.tab.website.title;
      elements.caption = props.item.tab.website.domain;
      break;

    case SearchItemType.SearchHistory:
      elements.topIcon = <FaCircle {...topIconProps} />;
      elements.typeIcon = <MdHistory {...typeIconProps} />;
      elements.text = props.item.history.website.title;
      elements.caption = props.item.history.website.domain;
      elements.tag = getSearchHistoryDateString(props.item.history.lastVisited);
      break;
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
      props.onOpen(!event.ctrlKey);
    }
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
