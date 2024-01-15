import './App.css';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Search from '../Search/Search';
import Settings from '../Settings/Settings';
import { Toaster } from 'react-hot-toast';
import SearchEngineSettings from '../SearchEngineSettings/SearchEngineSettings';
import Manual from '../Manual/Manual';

export default function App() {
  return (
    <main className='app'>
      <Toaster
        position='bottom-center'
        toastOptions={{
          style: {
            backgroundColor: 'var(--dark-gray-color)',
            borderRadius: 3,
            color: 'var(--white-color)',
            padding: '4px 0',
          },
        }}
      />
      <BrowserRouter>
        <Routes>
          <Route path='/' Component={Search} />
          <Route path='/settings' Component={Settings} />
          <Route path='/settings/search_engines' Component={SearchEngineSettings} />
          <Route path='/manual/:index' Component={Manual} />
          <Route path='/index.html' element={<Navigate to='/' />} />
        </Routes>
      </BrowserRouter>
    </main>
  );
}
