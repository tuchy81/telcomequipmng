export interface Survey {
  survey_id: number;
  survey_no: string;
  survey_name: string;
  start_date: string;
  end_date: string;
  description: string;
  status: 'OPEN' | 'CLOSED';
  closed_at: string | null;
  closed_by: string | null;
  created_at: string;
  inspection_count?: number;
}

export interface SurveyCreateRequest {
  survey_no: string;
  survey_name: string;
  start_date: string;
  end_date: string;
  description: string;
}

export interface Asset {
  asset_id: number;
  asset_no: string;
  asset_name: string;
  category: string;
  location_building: string;
  location_floor: string;
  location_room: string;
  rack_position: string;
  ip_address: string;
  serial_no: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface AssetCreateRequest {
  asset_no: string;
  asset_name: string;
  category: string;
  location_building: string;
  location_floor: string;
  location_room: string;
  rack_position: string;
  ip_address: string;
  serial_no: string;
  status: string;
}

export interface InspectionFile {
  file_id: number;
  inspection_id: number;
  file_path: string;
  file_name: string;
  file_size: number;
  exif_lat: number | null;
  exif_lng: number | null;
  exif_taken_at: string | null;
  created_at: string;
}

export interface Inspection {
  inspection_id: number;
  survey_id: number;
  asset_id: number;
  inspect_dt: string;
  inspector_name: string;
  result: '정상' | '이상' | '보류';
  field_memo: string;
  admin_memo: string;
  created_at: string;
  updated_at: string;
  asset?: Asset;
  survey?: Survey;
  files?: InspectionFile[];
}

export interface InspectionCreateRequest {
  asset_id: number;
  inspector_name: string;
  result: '정상' | '이상' | '보류';
  field_memo: string;
}

export interface InspectionUpdateRequest {
  result?: '정상' | '이상' | '보류';
  field_memo?: string;
  admin_memo?: string;
}

export interface MapMarker {
  inspection_id: number;
  asset_no: string;
  asset_name: string;
  inspect_dt: string;
  inspector_name: string;
  result: string;
  exif_lat: number;
  exif_lng: number;
  thumbnail_url: string;
}

export interface DashboardStats {
  active_surveys: number;
  total_assets: number;
  today_inspections: number;
  abnormal_assets: number;
}

export interface PasswordChangeRequest {
  current_password: string;
  new_password: string;
}
