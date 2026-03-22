import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import HomePage from './pages/HomePage';
import AdminLayout from './components/AdminLayout';
import Layout from './components/Layout';

import Dashboard from './pages/admin/Dashboard';
import SurveyManagement from './pages/admin/SurveyManagement';
import AssetManagement from './pages/admin/AssetManagement';
import AdminInspectionList from './pages/admin/InspectionList';
import MapView from './pages/admin/MapView';
import Settings from './pages/admin/Settings';

import SurveySelect from './pages/worker/SurveySelect';
import WorkerInspectionList from './pages/worker/InspectionList';
import InspectionForm from './pages/worker/InspectionForm';
import InspectionDetail from './pages/worker/InspectionDetail';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home */}
        <Route path="/" element={<HomePage />} />

        {/* Admin - requires password */}
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/surveys" element={<SurveyManagement />} />
          <Route path="/admin/assets" element={<AssetManagement />} />
          <Route path="/admin/inspections" element={<AdminInspectionList />} />
          <Route path="/admin/map" element={<MapView />} />
          <Route path="/admin/settings" element={<Settings />} />
        </Route>

        {/* Worker */}
        <Route element={<Layout type="worker" />}>
          <Route path="/worker" element={<SurveySelect />} />
          <Route path="/worker/survey/:surveyId/inspections" element={<WorkerInspectionList />} />
          <Route path="/worker/survey/:surveyId/inspections/new" element={<InspectionForm />} />
          <Route path="/worker/survey/:surveyId/inspections/:inspectionId/edit" element={<InspectionForm />} />
          <Route path="/worker/inspections/:inspectionId" element={<InspectionDetail />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
