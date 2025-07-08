import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ShortenerPage from './pages/ShortenerPage';
import RedirectPage from './pages/RedirectPage';
import StatsPage from './pages/StatsPage';
import Container from '@mui/material/Container';

function App() {
  return (
    <BrowserRouter>
      <Container maxWidth="md" style={{ marginTop: '2rem' }}>
        <Routes>
          <Route path="/" element={<ShortenerPage />} />
          <Route path="/:shortcode" element={<RedirectPage />} />
          <Route path="/stats" element={<StatsPage />} />
        </Routes>
      </Container>
    </BrowserRouter>
  );
}

export default App;
