import { ReactNode } from 'react';
import SettingGroup from './SettingGroup/SettingGroup';
import SettingItem from './SettingItem/SettingItem';
import './Settings.css';

type SettingGroupSource = {
  [name: string]: {
    [name: string]: ReactNode,
  },
};

export default function Settings() {
  const settingGroups: SettingGroupSource = {
    '検索結果の除外': {
      '除外設定を有効にする': '...',
      '検索履歴の反映期間': '...',
      'ドメインを除外する': '...',
    },
  };

  const settingGroupNodes = Object.entries(settingGroups).map(([groupName, items]) => {
    const itemNodes = Object.entries(items).map(([itemName, itemValue]) => (
      <SettingItem name={itemName} value={itemValue} />
    ));

    return <SettingGroup name={groupName} items={itemNodes} />;
  });

  return (
    <div className='settings'>
      <div className='settings-title'>
        ― choco 設定 ―
      </div>
      {settingGroupNodes}
    </div>
  );
}
