import { ReactNode, useEffect, useState } from 'react';
import SettingGroup from './SettingGroup/SettingGroup';
import SettingItem from './SettingItem/SettingItem';
import './Settings.css';
import ToggleButton from '../input/ToggleButton/ToggleButton';
import { Preferences } from '../../common/preference';
import Button from '../input/Button/Button';
import { Link } from 'react-router-dom';
import { links, versionCode } from '../../../default.json';
import { Tab } from '../../common/tab';

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
    '機能': {
      '検索エンジン': (
        <Link
          to='/settings/search_engines'
          className='settings-hyperlink'
        >
          編集する
        </Link>
      ),
    },
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
      <div className='settings-title' style={{ marginBottom: 0 }}>
        ― choco 設定 ―
      </div>
      <div className='settings-content scrollbar-none'>
        {settingGroupNodes}
      </div>
      <div className='settings-buttons'>
        <Link to='/' style={{ textDecoration: 'none' }}>
          <Button
            text='検索に戻る'
            className='settings-buttons-item'
          />
        </Link>
      </div>
      <div className='settings-caption'>
        <span className='settings-caption-row'>
          <span>
            {`choco v${versionCode} by `}
            <span className='settings-caption-hyperlink' onClick={() => openHyperlink(links.developer)}>
              Garnet3106
            </span>
          </span>
        </span>
        <span className='settings-caption-row'>
          <span className='settings-caption-hyperlink' onClick={() => openHyperlink(links.contactUs)}>
            ご意見/ご要望はこちら
          </span>
          <span className='settings-caption-hyperlink' onClick={() => openHyperlink(links.githubIssues)}>
            GitHub Issues
          </span>
        </span>
      </div>
    </div>
  );

  function openHyperlink(url: string) {
    Tab.openUrl(url, true, true);
    window.close();
  }

  async function updatePreferences(callback: (state: Preferences) => void): Promise<void> {
    const newState = structuredClone(preferences);
    callback(newState);
    setPreferences(newState);
    Preferences.update(newState);
  }
}
