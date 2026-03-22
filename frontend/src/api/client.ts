import axios from 'axios';
import type {
  Survey,
  SurveyCreateRequest,
  Asset,
  AssetCreateRequest,
  Inspection,
  InspectionCreateRequest,
  InspectionUpdateRequest,
  MapMarker,
  DashboardStats,
  PasswordChangeRequest,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ========== Dashboard ==========
export const getDashboard = () =>
  api.get<DashboardStats>('/api/dashboard').then((r) => r.data);

// ========== Survey ==========
export const getSurveys = () =>
  api.get<Survey[]>('/api/surveys').then((r) => r.data);

export const createSurvey = (data: SurveyCreateRequest) =>
  api.post<Survey>('/api/surveys', data).then((r) => r.data);

export const updateSurvey = (id: number, data: SurveyCreateRequest) =>
  api.put<Survey>(`/api/surveys/${id}`, data).then((r) => r.data);

export const closeSurvey = (id: number, closedBy?: string) =>
  api.post<Survey>(`/api/surveys/${id}/close`, { closed_by: closedBy }).then((r) => r.data);

export const reopenSurvey = (id: number) =>
  api.post<Survey>(`/api/surveys/${id}/reopen`).then((r) => r.data);

export const deleteSurvey = (id: number) =>
  api.delete(`/api/surveys/${id}`);

// ========== Asset ==========
export const getAssets = (search?: string) =>
  api.get<Asset[]>('/api/assets', { params: search ? { search } : {} }).then((r) => r.data);

export const createAsset = (data: AssetCreateRequest) =>
  api.post<Asset>('/api/assets', data).then((r) => r.data);

export const updateAsset = (id: number, data: AssetCreateRequest) =>
  api.put<Asset>(`/api/assets/${id}`, data).then((r) => r.data);

export const deleteAsset = (id: number) =>
  api.delete(`/api/assets/${id}`);

export const downloadAssetsExcel = () =>
  api.get('/api/assets/download', { responseType: 'blob' }).then((r) => {
    const url = window.URL.createObjectURL(new Blob([r.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'assets.xlsx';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  });

// ========== Inspection ==========
export const getInspections = (surveyId: number, inspectorName?: string) =>
  api
    .get<Inspection[]>(`/api/surveys/${surveyId}/inspections`, {
      params: inspectorName ? { inspector_name: inspectorName } : {},
    })
    .then((r) => r.data);

export const getInspection = (id: number) =>
  api.get<Inspection>(`/api/inspections/${id}`).then((r) => r.data);

export const getLatestInspection = (assetId: number) =>
  api.get<Inspection>(`/api/assets/${assetId}/inspections/latest`).then((r) => r.data);

export const createInspection = (surveyId: number, data: InspectionCreateRequest) =>
  api.post<Inspection>(`/api/surveys/${surveyId}/inspections`, data).then((r) => r.data);

export const updateInspection = (id: number, data: InspectionUpdateRequest) =>
  api.put<Inspection>(`/api/inspections/${id}`, data).then((r) => r.data);

export const deleteInspection = (id: number) =>
  api.delete(`/api/inspections/${id}`);

export const uploadInspectionFiles = (inspectionId: number, files: File[]) => {
  const formData = new FormData();
  files.forEach((f) => formData.append('files', f));
  return api
    .post<any>(`/api/inspections/${inspectionId}/files`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
};

export const deleteInspectionFile = (inspectionId: number, fileId: number) =>
  api.delete(`/api/inspections/${inspectionId}/files/${fileId}`);

// ========== Map ==========
export const getMapMarkers = (surveyId?: number, result?: string) =>
  api
    .get<MapMarker[]>('/api/inspections/map', {
      params: {
        ...(surveyId ? { survey_id: surveyId } : {}),
        ...(result ? { result } : {}),
      },
    })
    .then((r) => r.data);

// ========== Admin Password ==========
export const verifyAdminPassword = (password: string) =>
  api.post('/api/admin/verify', { password }).then((r) => r.data);

export const changeAdminPassword = (data: PasswordChangeRequest) =>
  api.put('/api/admin/password', data).then((r) => r.data);

// ========== File URL helper ==========
export const getFileUrl = (filePath: string) =>
  `${API_BASE}/api/files/${filePath}`;
