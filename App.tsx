import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.tsx';
import HomePage from './pages/HomePage.tsx';
import AdminPage from './pages/AdminPage.tsx';
import FengShuiPage from './pages/FengShuiPage.tsx';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/feng-shui" element={<FengShuiPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;