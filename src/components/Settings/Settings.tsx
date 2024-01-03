import { ReactNode, useEffect, useState } from 'react';
import SettingGroup from './SettingGroup/SettingGroup';
import SettingItem from './SettingItem/SettingItem';
import './Settings.css';
import ToggleButton from '../input/ToggleButton/ToggleButton';
import { Preferences } from '../../common/preference';
import Dropdown from '../input/Dropdown/Dropdown';
import Button from '../input/Button/Button';
import { Link } from 'react-router-dom';

type SettingGroupSource = {
  [name: string]: {
    [name: string]: ReactNode,
  },
};

export default function Settings() {
  const [preferences, setPreferences] = useState(Preferences.getDefault());

  useEffect(() => {
    Preferences.get().then(setPreferences);
  }, []);

  const settingGroups: SettingGroupSource = {
    '検索結果の除外': {
      '除外設定を有効にする': (
        <ToggleButton
          enabled={preferences.searchExclusion.enable}
          onClick={() => updatePreferences((state) => { state.searchExclusion.enable = !state.searchExclusion.enable; })}
        />
      ),
      '検索履歴の反映期間': preferences.searchExclusion.enable && (
        <Dropdown
          selected={String(preferences.searchExclusion.targetPeriodOfSearchHistory)}
          items={[7, 30, 60, 120].map((v) => ({ id: v.toString(), text: `${v}日前` }))}
          onChange={(id) => updatePreferences((state) => { state.searchExclusion.targetPeriodOfSearchHistory = Number(id); })}
        />
      ),
      'ドメインで除外する': preferences.searchExclusion.enable && '...',
      'キーワードで除外する': preferences.searchExclusion.enable && '...',
      'ブクマフォルダで除外する': preferences.searchExclusion.enable && '...',
    },
    '表示と動作': {
      '検索結果をグループ化する': (
        <ToggleButton
          enabled={preferences.displayAndBehavior.groupSearchResult}
          onClick={() => updatePreferences((state) => { state.displayAndBehavior.groupSearchResult = !state.displayAndBehavior.groupSearchResult; })}
        />
      ),
      '新しいタブで開く': (
        <ToggleButton
          enabled={preferences.displayAndBehavior.openInNewTab}
          onClick={() => updatePreferences((state) => { state.displayAndBehavior.openInNewTab = !state.displayAndBehavior.openInNewTab; })}
        />
      ),
    },
  };

  const settingGroupNodes = Object.entries(settingGroups).map(([groupName, items]) => {
    const itemNodes = Object.entries(items).map(([itemName, itemValue]) => (
      <SettingItem name={itemName} value={itemValue} disabled={!itemValue} key={Math.random()} />
    ));

    return <SettingGroup name={groupName} items={itemNodes} key={Math.random()} />;
  });

  return (
    <div className='settings'>
      <div className='settings-title'>
        ― choco 設定 ―
      </div>
      <div className='settings-content scrollbar-none'>
        {settingGroupNodes}
      </div>
      <div className='settings-buttons'>
        <Link to='/' style={{ textDecoration: 'none' }}>
          <Button
            text='検索に戻る'
            style={{
              backgroundColor: 'var(--light-gray-color)',
              color: 'var(--dark-gray-color)',
              fontWeight: 'bold',
              marginRight: 'var(--margin)',
            }}
          />
        </Link>
      </div>
    </div>
  );

  async function updatePreferences(callback: (state: Preferences) => void): Promise<void> {
    const newState = structuredClone(preferences);
    callback(newState);
    setPreferences(newState);
    chrome.storage.local.set({ preferences: newState });
  }
}
