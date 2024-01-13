import { useEffect, useState } from 'react';
import { SearchEngine, Website } from '../../common/search';
import '../Settings/Settings.css';
import './SearchEngineSettings.css';
import { TbEdit } from 'react-icons/tb';
import { Preferences } from '../../common/preference';
import TextInput from '../input/TextInput/TextInput';
import Button from '../input/Button/Button';
import { Link } from 'react-router-dom';
import * as uuid from 'uuid';
import toast from 'react-hot-toast';

type DraftSearchEngine = SearchEngine & {
  createdNew: boolean,
};

export default function SearchEngineSettings() {
  const [searchEngines, setSearchEngines] = useState<SearchEngine[]>([]);
  const [draftSearchEngine, setDraftSearchEngine] = useState(getDefaultDraftSearchEngine());

  useEffect(() => {
    Preferences.get().then((preferences) => setSearchEngines(preferences.searchEngines));
  }, []);

  const items = searchEngines
    .sort(sortSearchEngines)
    .map((eachEngine) => (
      <div
        className={`search-engine-settings-item ${draftSearchEngine.id === eachEngine.id ? 'search-engine-settings-item-selected' : ''}`}
        onClick={() => setExistingSearchEngineToDraft(eachEngine.id)}
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
            gap: 'var(--margin-half)',
          }}>
            <div className='search-engine-settings-edit-item'>
              <div className='search-engine-settings-edit-item-name'>
                表示名
              </div>
              <TextInput
                inputProps={{
                  value: draftSearchEngine.name,
                  onChange: (e) => {
                    const value = e.currentTarget.value;
                    updateDraftSearchEngine((state) => state.name = value);
                  },
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
                  value: draftSearchEngine.command,
                  onChange: (e) => {
                    const value = e.currentTarget.value.toLowerCase();
                    updateDraftSearchEngine((state) => state.command = value);
                  },
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
                value: draftSearchEngine.url,
                onChange: (e) => {
                  const value = e.currentTarget.value;
                  updateDraftSearchEngine((state) => state.url = value);
                },
                placeholder: 'https://google.com/search?q={keyword}',
              }}
            />
          </div>
          <div className='settings-buttons' style={{ marginTop: 0 }}>
            {
              !draftSearchEngine.createdNew && (
                <Button
                  text='削除する'
                  style={{
                    backgroundColor: 'transparent',
                    borderColor: 'var(--light-gray-color)',
                    borderStyle: 'solid',
                    borderWidth: 1,
                    marginBottom: -1,
                    marginTop: -1,
                    textAlign: 'center',
                    marginRight: 'var(--margin)',
                  }}
                  onClick={deleteSearchEngine}
                />
              )
            }
            <Button
              text={draftSearchEngine.createdNew ? '新規作成する' : '更新する'}
              style={{
                backgroundColor: 'var(--light-gray-color)',
                textAlign: 'center',
              }}
              onClick={createOrUpdateSearchEngine}
            />
          </div>
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

  function getDefaultDraftSearchEngine(): DraftSearchEngine {
    return {
      createdNew: true,
      id: uuid.v4(),
      name: '',
      command: '',
      url: '',
    };
  }

  function sortSearchEngines(a: SearchEngine, b: SearchEngine): number {
    if (a.name > b.name) {
      return 1;
    }

    if (a.name < b.name) {
      return -1;
    }

    return 0;
  }

  function validateUserInput(): boolean {
    if (!draftSearchEngine.name.length) {
      toast('表示名を入力してください。');
      return false;
    }

    if (draftSearchEngine.name.length > 30) {
      toast('表示名は30文字以内で入力してください。');
      return false;
    }

    if (!draftSearchEngine.command.length) {
      toast('コマンドフレーズを入力してください。');
      return false;
    }

    if (draftSearchEngine.command.length > 30) {
      toast('コマンドフレーズは30文字以内で入力してください。');
      return false;
    }

    if (!draftSearchEngine.command.match(/^[a-z0-9]+$/)) {
      toast('コマンドフレーズは半角英数字で入力してください。');
      return false;
    }

    if (!draftSearchEngine.url) {
      toast('検索 URL を入力してください。');
      return false;
    }

    if (!draftSearchEngine.url.includes('{keyword}')) {
      toast('検索 URL には少なくとも1つの {keyword} を追加してください。');
      return false;
    }

    return true;
  }

  function updateDraftSearchEngine(callback: (state: DraftSearchEngine) => void) {
    setDraftSearchEngine((state) => {
      const newState = {...state};
      callback(newState);
      return newState;
    });
  }

  function setExistingSearchEngineToDraft(id: string) {
    const target = searchEngines.find((v) => v.id === id);

    if (!target) {
      return;
    }

    setDraftSearchEngine({
      createdNew: false,
      ...target,
    });
  }

  async function saveChanges(updatedSearchEngines: SearchEngine[]): Promise<void> {
    setSearchEngines(updatedSearchEngines);
    const preferences = await Preferences.get();
    Preferences.update({...preferences, searchEngines: updatedSearchEngines });
    setDraftSearchEngine(getDefaultDraftSearchEngine());
  }

  async function createOrUpdateSearchEngine() {
    if (!validateUserInput()) {
      return;
    }

    await saveChanges(getUpdatedSearchEngine());
    toast('検索エンジンを保存しました。');
  }

  function getUpdatedSearchEngine(): SearchEngine[] {
    if (draftSearchEngine.createdNew) {
      const updated = [...searchEngines];

      updated.push({
        id: uuid.v4(),
        name: draftSearchEngine.name,
        command: draftSearchEngine.command,
        url: draftSearchEngine.url,
      });

      return updated;
    } else {
      return searchEngines.map((eachEngine) => {
        if (eachEngine.id === draftSearchEngine.id) {
          return {
            id: eachEngine.id,
            name: draftSearchEngine.name,
            command: draftSearchEngine.command,
            url: draftSearchEngine.url,
          };
        } else {
          return eachEngine;
        }
      });
    }
  }

  function deleteSearchEngine() {
    if (draftSearchEngine.createdNew) {
      return;
    }

    const updatedSearchEngines = searchEngines.filter((v) => v.id !== draftSearchEngine.id);
    saveChanges(updatedSearchEngines);
    toast('検索エンジンを削除しました。');
  }
}
