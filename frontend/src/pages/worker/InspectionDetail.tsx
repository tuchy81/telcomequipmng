import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInspection, getLatestInspection, getFileUrl } from '../../api/client';
import type { Inspection } from '../../types';
import Loading from '../../components/Loading';

export default function InspectionDetail() {
  const { inspectionId } = useParams<{ inspectionId: string }>();
  const navigate = useNavigate();
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [prevInspection, setPrevInspection] = useState<Inspection | null>(null);
  const [prevOpen, setPrevOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadInspection();
  }, [inspectionId]);

  const loadInspection = async () => {
    if (!inspectionId) return;
    try {
      setLoading(true);
      const data = await getInspection(Number(inspectionId));
      setInspection(data);

      // Load previous inspection for comparison
      if (data.asset_id) {
        try {
          const prev = await getLatestInspection(data.asset_id);
          // Only show if it's a different inspection
          if (prev.inspection_id !== data.inspection_id) {
            setPrevInspection(prev);
          }
        } catch {
          // No previous inspection
        }
      }
    } catch {
      setError('점검 정보를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getResultBadge = (result: string) => {
    if (result === '정상') return 'badge badge-normal';
    if (result === '이상') return 'badge badge-abnormal';
    return 'badge badge-pending';
  };

  if (loading) return <Loading />;
  if (!inspection) {
    return (
      <div className="empty-state">
        <p>{error || '점검 정보를 찾을 수 없습니다.'}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h2>점검 상세</h2>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          목록으로
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="card">
        <div className="detail-section">
          <h3>점검 정보</h3>
          <dl className="detail-grid">
            <dt>자산번호</dt>
            <dd>{inspection.asset?.asset_no}</dd>
            <dt>장비명</dt>
            <dd>{inspection.asset?.asset_name}</dd>
            <dt>분류</dt>
            <dd>{inspection.asset?.category || '-'}</dd>
            <dt>위치</dt>
            <dd>
              {[
                inspection.asset?.location_building,
                inspection.asset?.location_floor,
                inspection.asset?.location_room,
              ]
                .filter(Boolean)
                .join(' ') || '-'}
              {inspection.asset?.rack_position ? ` (${inspection.asset.rack_position})` : ''}
            </dd>
            <dt>작업자</dt>
            <dd>{inspection.inspector_name}</dd>
            <dt>점검일시</dt>
            <dd>{new Date(inspection.inspect_dt).toLocaleString('ko-KR')}</dd>
            <dt>결과</dt>
            <dd>
              <span className={getResultBadge(inspection.result)}>{inspection.result}</span>
            </dd>
            <dt>메모</dt>
            <dd>{inspection.field_memo || '-'}</dd>
            {inspection.admin_memo && (
              <>
                <dt>관리자 메모</dt>
                <dd>{inspection.admin_memo}</dd>
              </>
            )}
          </dl>
        </div>

        {/* Photos */}
        {inspection.files && inspection.files.length > 0 && (
          <div className="detail-section">
            <h3>첨부 사진 ({inspection.files.length}장)</h3>
            <div className="detail-photos">
              {inspection.files.map((f) => (
                <img
                  key={f.file_id}
                  src={getFileUrl(f.file_path)}
                  alt={f.file_name}
                  onClick={() => window.open(getFileUrl(f.file_path), '_blank')}
                />
              ))}
            </div>
          </div>
        )}

        {/* Previous Inspection */}
        {prevInspection && (
          <div className="prev-inspection-panel" style={{ marginTop: 16 }}>
            <div className="prev-inspection-header" onClick={() => setPrevOpen(!prevOpen)}>
              <span>이전 실사 내역 비교</span>
              <span>{prevOpen ? '\u25B2' : '\u25BC'}</span>
            </div>
            {prevOpen && (
              <div className="prev-inspection-body">
                <div className="info-row">
                  <span className="info-label">점검일시</span>
                  <span>{new Date(prevInspection.inspect_dt).toLocaleString('ko-KR')}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">작업자</span>
                  <span>{prevInspection.inspector_name}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">결과</span>
                  <span className={getResultBadge(prevInspection.result)}>
                    {prevInspection.result}
                  </span>
                </div>
                {prevInspection.field_memo && (
                  <div className="info-row">
                    <span className="info-label">메모</span>
                    <span>{prevInspection.field_memo}</span>
                  </div>
                )}
                {prevInspection.files && prevInspection.files.length > 0 && (
                  <div className="prev-photos">
                    {prevInspection.files.map((f) => (
                      <img key={f.file_id} src={getFileUrl(f.file_path)} alt={f.file_name} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
