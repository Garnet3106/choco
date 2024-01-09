import { ReactNode, useEffect, useState } from 'react';
import SettingGroup from './SettingGroup/SettingGroup';
import SettingItem from './SettingItem/SettingItem';
import './Settings.css';
import ToggleButton from '../input/ToggleButton/ToggleButton';
import { Preferences } from '../../common/preference';
import Button from '../input/Button/Button';
import { Link } from 'react-router-dom';
import { contactUrl } from '../../../default.json';

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
      'ドメインで除外する': preferences.searchExclusion.enable && '準備中',
      'キーワードで除外する': preferences.searchExclusion.enable && '準備中',
      'ブクマフォルダで除外する': preferences.searchExclusion.enable && '準備中',
    },
    '表示と動作': {
      'カテゴリー名を表示する': (
        <ToggleButton
          enabled={preferences.displayAndBehavior.showCategoryName}
          onClick={() => updatePreferences((state) => { state.displayAndBehavior.showCategoryName = !state.displayAndBehavior.showCategoryName; })}
        />
      ),
      'タイトルの通知件数を隠す': (
        <ToggleButton
          enabled={preferences.displayAndBehavior.hideNotificationCountInTitle}
          onClick={() => updatePreferences((state) => { state.displayAndBehavior.hideNotificationCountInTitle = !state.displayAndBehavior.hideNotificationCountInTitle; })}
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
              color: 'var(--white-color)',
              marginRight: 'var(--margin)',
            }}
          />
        </Link>
      </div>
      <div className='settings-caption'>
        Garnet3106 © All rights reserved.
        <br />
        <span className='settings-caption-hyperlink' onClick={() => openFeedbackLink()}>
          ご意見・ご要望はこちら
        </span>
      </div>
    </div>
  );

  function openFeedbackLink() {
    chrome.tabs.create({
      url: contactUrl,
      active: true,
    });

    window.close();
  }

  async function updatePreferences(callback: (state: Preferences) => void): Promise<void> {
    const newState = structuredClone(preferences);
    callback(newState);
    setPreferences(newState);
    Preferences.update(newState);
  }
}
