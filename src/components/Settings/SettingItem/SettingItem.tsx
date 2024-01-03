import { ReactNode } from 'react';
import './SettingItem.css';

export type SettingItemProps = {
  name: string,
  value: ReactNode,
  disabled?: boolean,
};

export default function SettingItem(props: SettingItemProps) {
  return (
    <div className='setting-item'>
      <div className={`setting-item-name ${props.disabled ? 'setting-item-name-disabled' : ''}`}>
        {props.name}
      </div>
      {props.value}
    </div>
  );
}
