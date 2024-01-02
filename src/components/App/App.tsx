import './App.css';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Search from '../Search/Search';
import Settings from '../Settings/Settings';

export default function App() {
  return (
    <main className='app'>
      <BrowserRouter>
        <Routes>
          <Route path='/' Component={Search} />
          <Route path='/settings' Component={Settings} />
          <Route path='/index.html' element={<Navigate to='/' />} />
        </Routes>
      </BrowserRouter>
    </main>
  );
}
