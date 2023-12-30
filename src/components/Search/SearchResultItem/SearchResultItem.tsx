import './SearchResultItem.css';
import { ReactNode } from 'react';
import { SearchItem, SearchItemType } from '../../../common/search';
import { BiSearch } from 'react-icons/bi';
import { FaCircle } from 'react-icons/fa';
import { MdHistory } from 'react-icons/md';
import { HiOutlineDuplicate } from 'react-icons/hi';

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
      elements.text = props.item.tab.title;
      elements.caption = props.item.tab.domain;
      break;

    case SearchItemType.SearchHistory:
      elements.topIcon = <FaCircle {...topIconProps} />;
      elements.typeIcon = <MdHistory {...typeIconProps} />;
      elements.text = props.item.history.title;
      elements.caption = props.item.history.domain;
      elements.tag = 'n日前';
      break;
  }

  return (
    <div className={`search-result-item ${props.selected ? 'search-result-item-selected' : ''}`}>
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
}
