import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Shell } from './components/layout/Shell';

// Pages
import { Home } from './pages/Home';
import { Assistant } from './pages/Assistant';
import { Standards } from './pages/Standards';
import { StandardDetail } from './pages/StandardDetail';
import { StandardCompare } from './pages/StandardCompare';
import { Compliance } from './pages/Compliance';
import { ComplianceDetail } from './pages/ComplianceDetail';
import { Laboratories } from './pages/Laboratories';
import { Services } from './pages/Services';
import { Consumer } from './pages/Consumer';
import { Knowledge } from './pages/Knowledge';
import { Alerts } from './pages/Alerts';
import { Dashboard } from './pages/Dashboard';
import { Settings } from './pages/Settings';

export function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Shell />}>
            <Route index element={<Home />} />
            <Route path="assistant" element={<Assistant />} />
            <Route path="standards" element={<Standards />} />
            <Route path="standards/:id" element={<StandardDetail />} />
            <Route path="standards/compare" element={<StandardCompare />} />
            <Route path="compliance" element={<Compliance />} />
            <Route path="compliance/:id" element={<ComplianceDetail />} />
            <Route path="laboratories" element={<Laboratories />} />
            <Route path="services" element={<Services />} />
            <Route path="consumer" element={<Consumer />} />
            <Route path="knowledge" element={<Knowledge />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
