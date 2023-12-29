import './Search.css';

export default function Search() {
  return (
    <div className='search'>
      <input type='text' className='search-bar' />
      <div className='search-results'>
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
      </div>
    </div>
  );
}
