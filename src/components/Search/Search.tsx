import './Search.css';

export default function Search() {
  return (
    <div className='search'>
      <input type='text' className='search-bar' placeholder='Enter keyword' />
      <div className='search-results scrollbar-none'>
        <div className='search-result-item'>
          “Google検索” で検索する
        </div>
        <div className='search-result-item'>
          <span>JavaScript map関数 - <b>Google</b> 検索</span>
          <span className='search-result-item-caption'>
            google.com
          </span>
        </div>
        <div className='search-result-item'>
          <span>JavaScript map関数 - <b>Google</b> 検索</span>
          <span className='search-result-item-caption'>
            google.com
          </span>
        </div>
        <div className='search-result-item'>
          <span>JavaScript map関数 - <b>Google</b> 検索</span>
          <span className='search-result-item-caption'>
            google.com
          </span>
        </div>
        <div className='search-result-item'>
          <span>JavaScript map関数 - <b>Google</b> 検索</span>
          <span className='search-result-item-caption'>
            google.com
          </span>
        </div>
        <div className='search-result-item'>
          <span>JavaScript map関数 - <b>Google</b> 検索</span>
          <span className='search-result-item-caption'>
            google.com
          </span>
        </div>
        <div className='search-result-item'>
          <span>JavaScript map関数 - <b>Google</b> 検索</span>
          <span className='search-result-item-caption'>
            google.com
          </span>
        </div>
        <div className='search-result-item'>
          <span>JavaScript map関数 - <b>Google</b> 検索</span>
          <span className='search-result-item-caption'>
            google.com
          </span>
        </div>
      </div>
    </div>
  );
}
