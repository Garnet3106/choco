import { useEffect, useState } from 'react';
import { SearchEngine, Website } from '../../common/search';
import '../Settings/Settings.css';
import './SearchEngineSettings.css';
import { TbEdit } from 'react-icons/tb';
import { Preferences } from '../../common/preference';

export default function SearchEngineSettings() {
  const [searchEngines, setSearchEngines] = useState<SearchEngine[]>([]);

  useEffect(() => {
    Preferences.get().then((preferences) => setSearchEngines(preferences.searchEngines));
  }, []);

  const items = searchEngines.map((eachEngine) => (
    <div className='search-engine-settings-item' key={Math.random()}>
      <div className='search-engine-settings-item-content'>
        <img src={Website.getFavIconUrl(eachEngine.url)} height={16} width={16} />
        <div>
          {eachEngine.name}
        </div>
        <div className='search-engine-settings-item-command'>
          {eachEngine.command}
        </div>
      </div>
      <TbEdit size={18} color='var(--light-gray-color)' style={{ marginLeft: 'calc(var(--margin) / 2)' }} />
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
    </div>
  );
}
