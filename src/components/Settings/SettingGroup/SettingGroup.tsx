import './SettingGroup.css';
import { FC, ReactElement } from 'react';
import { SettingItemProps } from '../SettingItem/SettingItem';

type SettingGroupItemElement = ReactElement<FC<SettingItemProps>>;

export type SettingGroupProps = {
  name: string,
  items: SettingGroupItemElement[],
};

export default function SettingGroup(props: SettingGroupProps) {
  return (
    <div className='setting-group'>
      <div className='setting-group-name'>
        {props.name}
      </div>
      {props.items}
    </div>
  );
}
