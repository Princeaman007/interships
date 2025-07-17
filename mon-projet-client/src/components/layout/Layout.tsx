import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
// import DashboardLayout from '../layouts/DashboardLayout';
// import DashboardHome from '../pages/DashboardHome';
// import SettingsPage from '/pages/SettingsPage';
import DashboardLayout from './DashboardLayout';
import DashboardHome from './DashboardHome'; 
import SettingsPage from './SettingsPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<div className="p-4">404 - Page not found</div>} />
      </Routes>
    </Router>
  );
}
