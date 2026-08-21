import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { DashboardLayout } from './layouts/DashboardLayout';
import { DashboardPage } from './pages/DashboardPage';
import { ScreenPage } from './pages/ScreenPage';
import { ResultsPage } from './pages/ResultsPage';
import { CandidateDetailPage } from './pages/CandidateDetailPage';
import { ComparePage } from './pages/ComparePage';
import { ShortlistedPage } from './pages/ShortlistedPage';
import { JobsPage } from './pages/JobsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { PlaceholderPage } from './pages/PlaceholderPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Dashboard Shell Layout */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/screen" element={<ScreenPage />} />
          <Route path="/candidates" element={<ResultsPage />} />
          <Route path="/candidate/:id" element={<CandidateDetailPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/shortlisted" element={<ShortlistedPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/settings" element={<PlaceholderPage />} />
          <Route path="/api-keys" element={<PlaceholderPage />} />
          <Route path="/help" element={<PlaceholderPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
