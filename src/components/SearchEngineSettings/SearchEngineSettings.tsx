import { useEffect, useState } from 'react';
import { SearchEngine, Website } from '../../common/search';
import '../Settings/Settings.css';
import './SearchEngineSettings.css';
import { TbEdit } from 'react-icons/tb';
import { Preferences } from '../../common/preference';
import TextInput from '../input/TextInput/TextInput';
import Button from '../input/Button/Button';
import { Link } from 'react-router-dom';

export default function SearchEngineSettings() {
  const [searchEngines, setSearchEngines] = useState<SearchEngine[]>([]);
  const [selectedSearchEngineId, setSelectedSearchEngineId] = useState<string | null>(null);

  useEffect(() => {
    Preferences.get().then((preferences) => setSearchEngines(preferences.searchEngines));
  }, []);

  const items = searchEngines.map((eachEngine) => (
    <div
      className={`search-engine-settings-item ${selectedSearchEngineId === eachEngine.id ? 'search-engine-settings-item-selected' : ''}`}
      onClick={() => setSelectedSearchEngineId(eachEngine.id)}
      key={eachEngine.id}
    >
      <div className='search-engine-settings-item-content'>
        <img src={Website.getFavIconUrl(eachEngine.url)} height={16} width={16} />
        <div>
          {eachEngine.name}
        </div>
        <div className='search-engine-settings-item-command'>
          {eachEngine.command}
        </div>
      </div>
      <TbEdit size={18} className='search-engine-settings-item-edit' />
    </div>
  ));

  return (
    <div className='settings'>
      <div className='settings-title'>
        ― 検索エンジン設定 ―
      </div>
      <div
        className='settings-content scrollbar-none'
        style={{ height: 'var(--search-engine-settings-content-height)' }}
      >
        {items}
      </div>
      <div className='search-engine-settings-edit'>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--margin)',
          margin: 'var(--margin)',
        }}>
          <div style={{
            display: 'flex',
            gap: 'calc(var(--margin) / 2)',
          }}>
            <div className='search-engine-settings-edit-item'>
              <div className='search-engine-settings-edit-item-name'>
                表示名
              </div>
              <TextInput
                inputProps={{
                  placeholder: 'Google検索',
                  autoFocus: true,
                }}
              />
            </div>
            <div className='search-engine-settings-edit-item'>
              <div className='search-engine-settings-edit-item-name'>
                コマンドフレーズ
              </div>
              <TextInput
                inputProps={{
                  placeholder: 'google',
                }}
              />
            </div>
          </div>
          <div className='search-engine-settings-edit-item'>
            <div className='search-engine-settings-edit-item-name'>
              検索 URL
            </div>
            <TextInput
              inputProps={{
                placeholder: 'https://google.com/search?q={keyword}',
              }}
            />
          </div>
          <Button
            text='新規作成する'
            style={{
              backgroundColor: 'var(--light-gray-color)',
              marginTop: 2,
              textAlign: 'center',
            }}
          />
        </div>
      </div>
      <Link to='/settings' style={{ textDecoration: 'none' }}>
        <Button
          text='設定に戻る'
          style={{
            backgroundColor: 'var(--light-gray-color)',
            color: 'var(--white-color)',
          }}
        />
      </Link>
    </div>
  );
}
