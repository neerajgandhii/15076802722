import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ShortenerPage from '../pages/ShortenerPage';
import StatsPage from '../pages/StatsPage';
import RedirectPage from '../pages/RedirectPage';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<ShortenerPage />} />
      <Route path="/stats" element={<StatsPage />} />
      <Route path="/:shortcode" element={<RedirectPage />} />
    </Routes>
  );
}
