import './SearchResultItem.css';
import { ReactNode } from 'react';
import { SearchItem, SearchItemType } from '../../../common/search';
import { BiSearch } from 'react-icons/bi';
import { FaCircle } from 'react-icons/fa';

export type SearchResultItemProps = {
  item: SearchItem,
  selected?: boolean,
};

type Elements = {
  topIcon?: ReactNode,
  typeIcon?: ReactNode,
  text?: string,
  caption?: string,
  tag?: string,
};

export default function SearchResultItem(props: SearchResultItemProps) {
  const reactIconProps = {
    color: 'var(--white-color)',
    size: 18,
    style: {
      minWidth: 18,
      marginRight: 5,
    },
  };

  const elements: Elements = {};

  switch (props.item.type) {
    case SearchItemType.SearchEngine:
      elements.topIcon = <BiSearch {...reactIconProps} />;
      elements.text = `“${props.item.engine.name}” で検索する`;
      break;

    case SearchItemType.SearchHistory:
      elements.topIcon = <FaCircle {...reactIconProps} />;
      elements.text = props.item.history.title;
      elements.caption = props.item.history.domain;
      break;
  }

  return (
    <div className={`search-result-item ${props.selected ? 'search-result-item-selected' : ''}`}>
      {elements.topIcon}
      <div className='search-result-item-content'>
        <span>{elements.text}</span>
        <span className='search-result-item-caption'>
          {elements.caption}
        </span>
      </div>
    </div>
  );
}
