import { ReactNode } from 'react';
import './SettingItem.css';

export type SettingItemProps = {
  name: string,
  value: ReactNode,
};

export default function SettingItem(props: SettingItemProps) {
  return (
    <div className='setting-item'>
      <div className='setting-item-name'>
        {props.name}
      </div>
      {props.value}
    </div>
  );
}
