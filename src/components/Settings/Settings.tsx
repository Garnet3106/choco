import { ReactNode, useState } from 'react';
import SettingGroup from './SettingGroup/SettingGroup';
import SettingItem from './SettingItem/SettingItem';
import './Settings.css';
import ToggleButton from '../input/ToggleButton/ToggleButton';
import { Preferences } from '../../common/preference';

type SettingGroupSource = {
  [name: string]: {
    [name: string]: ReactNode,
  },
};

export default function Settings() {
  const [preferences, setPreferences] = useState(Preferences.getDefault());

  const settingGroups: SettingGroupSource = {
    '検索結果の除外': {
      '除外設定を有効にする': (
        <ToggleButton
          enabled={preferences.searchExclusion.enable}
          onClick={() => updatePreferences((state) => { state.searchExclusion.enable = !state.searchExclusion.enable; })}
        />
      ),
      '検索履歴の反映期間': '...',
      'ドメインを除外する': '...',
    },
  };

  const settingGroupNodes = Object.entries(settingGroups).map(([groupName, items]) => {
    const itemNodes = Object.entries(items).map(([itemName, itemValue]) => (
      <SettingItem name={itemName} value={itemValue} key={Math.random()} />
    ));

    return <SettingGroup name={groupName} items={itemNodes} key={Math.random()} />;
  });

  return (
    <div className='settings'>
      <div className='settings-title'>
        ― choco 設定 ―
      </div>
      {settingGroupNodes}
    </div>
  );

  async function updatePreferences(callback: (state: Preferences) => void): Promise<void> {
    setPreferences((state) => {
      const newState = structuredClone(state);
      callback(newState);
      return newState;
    });
  }
}
