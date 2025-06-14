import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ReadmeGeneratorPage from './pages/ReadmeGeneratorPage';
import ChatPage from './pages/ChatPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/readme-generator" element={<ReadmeGeneratorPage />} />
      <Route path="/chat" element={<ChatPage />} />
    </Routes>
  );
}

export default App;