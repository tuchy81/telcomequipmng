import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getMapMarkers, getSurveys, getFileUrl } from '../../api/client';
import type { MapMarker, Survey } from '../../types';
import Loading from '../../components/Loading';

// Fix leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const createIcon = (color: string) =>
  new L.DivIcon({
    className: '',
    html: `<div style="
      width: 24px; height: 24px; border-radius: 50%;
      background: ${color}; border: 3px solid #fff;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });

const icons: Record<string, L.DivIcon> = {
  '정상': createIcon('#16a34a'),
  '이상': createIcon('#dc2626'),
  '보류': createIcon('#ea580c'),
};

export default function MapView() {
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [surveyFilter, setSurveyFilter] = useState<number | ''>('');
  const [resultFilter, setResultFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSurveys();
  }, []);

  useEffect(() => {
    loadMarkers();
  }, [surveyFilter, resultFilter]);

  const loadSurveys = async () => {
    try {
      const data = await getSurveys();
      setSurveys(data);
    } catch {
      // silent
    }
  };

  const loadMarkers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getMapMarkers(
        surveyFilter ? (surveyFilter as number) : undefined,
        resultFilter || undefined
      );
      setMarkers(data);
    } catch {
      setError('지도 데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const defaultCenter: [number, number] = [37.5665, 126.978]; // Seoul
  const center: [number, number] =
    markers.length > 0 ? [markers[0].exif_lat, markers[0].exif_lng] : defaultCenter;

  return (
    <div>
      <div className="page-header">
        <h2>점검 위치 지도</h2>
      </div>

      <div className="map-filters">
        <select
          className="form-control"
          value={surveyFilter}
          onChange={(e) => setSurveyFilter(e.target.value ? Number(e.target.value) : '')}
          style={{ minWidth: 220 }}
        >
          <option value="">전체 실사</option>
          {surveys.map((s) => (
            <option key={s.survey_id} value={s.survey_id}>
              {s.survey_no} - {s.survey_name}
            </option>
          ))}
        </select>
        <select
          className="form-control"
          value={resultFilter}
          onChange={(e) => setResultFilter(e.target.value)}
          style={{ minWidth: 120 }}
        >
          <option value="">전체 결과</option>
          <option value="정상">정상</option>
          <option value="이상">이상</option>
          <option value="보류">보류</option>
        </select>
        <span style={{ fontSize: '0.875rem', color: 'var(--color-gray-500)' }}>
          {markers.length}건 표시중
        </span>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading && markers.length === 0 ? (
        <Loading />
      ) : (
        <div className="map-container">
          <MapContainer
            center={center}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {markers.map((m) => (
              <Marker
                key={m.inspection_id}
                position={[m.exif_lat, m.exif_lng]}
                icon={icons[m.result] || icons['보류']}
              >
                <Popup>
                  <div style={{ minWidth: 180, fontSize: '0.8125rem' }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{m.asset_no}</div>
                    <div>{m.asset_name}</div>
                    <div style={{ color: '#666', margin: '4px 0' }}>
                      {m.inspector_name} | {new Date(m.inspect_dt).toLocaleDateString('ko-KR')}
                    </div>
                    <div style={{ marginBottom: 6 }}>
                      <span
                        className={`badge ${
                          m.result === '정상' ? 'badge-normal' : m.result === '이상' ? 'badge-abnormal' : 'badge-pending'
                        }`}
                      >
                        {m.result}
                      </span>
                    </div>
                    {m.thumbnail_url && (
                      <img
                        src={getFileUrl(m.thumbnail_url)}
                        alt="점검 사진"
                        style={{ width: '100%', maxWidth: 180, borderRadius: 4 }}
                      />
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}
    </div>
  );
}
