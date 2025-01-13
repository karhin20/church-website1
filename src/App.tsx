import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Chat from './pages/Chat';
import HymnHome from './pages/hymnHome';
import BiblePage from './pages/Bible';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/hymns" element={<HymnHome />} />
      <Route path="/bible" element={<BiblePage />} />
    </Routes>
  );
}

export default App;