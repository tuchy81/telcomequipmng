import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInspections, deleteInspection, getSurveys } from '../../api/client';
import type { Inspection, Survey } from '../../types';
import Loading from '../../components/Loading';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function WorkerInspectionList() {
  const { surveyId } = useParams<{ surveyId: string }>();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Inspection | null>(null);

  const workerName = sessionStorage.getItem('worker_name') || '';
  const isClosed = survey?.status === 'CLOSED';

  useEffect(() => {
    if (!workerName) {
      navigate('/worker');
      return;
    }
    loadData();
  }, [surveyId]);

  const loadData = async () => {
    if (!surveyId) return;
    try {
      setLoading(true);
      const [surveysData, inspData] = await Promise.all([
        getSurveys(),
        getInspections(Number(surveyId), workerName),
      ]);
      const found = surveysData.find((s) => s.survey_id === Number(surveyId));
      setSurvey(found || null);
      setInspections(inspData);
    } catch {
      setError('데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setError('');
      await deleteInspection(deleteTarget.inspection_id);
      setDeleteTarget(null);
      await loadData();
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('완료된 실사의 점검 내역은 삭제할 수 없습니다.');
      } else {
        setError('삭제에 실패했습니다.');
      }
      setDeleteTarget(null);
    }
  };

  const getResultBadge = (result: string) => {
    if (result === '정상') return 'badge badge-normal';
    if (result === '이상') return 'badge badge-abnormal';
    return 'badge badge-pending';
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="page-header">
        <h2>
          {survey ? `${survey.survey_name}` : '점검 내역'}
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-gray-500)', marginLeft: 8, fontWeight: 400 }}>
            {workerName}
          </span>
        </h2>
        <div className="page-toolbar">
          <button className="btn btn-secondary" onClick={() => navigate('/worker')}>
            실사 목록
          </button>
          {!isClosed && (
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/worker/survey/${surveyId}/inspections/new`)}
            >
              + 점검 등록
            </button>
          )}
        </div>
      </div>

      {isClosed && <div className="banner-closed">완료된 실사입니다</div>}

      {error && <div className="error-message">{error}</div>}

      {inspections.length === 0 ? (
        <div className="empty-state">
          <p>등록된 점검 내역이 없습니다.</p>
        </div>
      ) : (
        inspections.map((ins) => (
          <div key={ins.inspection_id} className="inspection-item">
            <div
              className="inspection-item-info"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/worker/inspections/${ins.inspection_id}`)}
            >
              <h4>
                {ins.asset?.asset_no} - {ins.asset?.asset_name}
              </h4>
              <p>
                {new Date(ins.inspect_dt).toLocaleString('ko-KR')} |{' '}
                <span className={getResultBadge(ins.result)}>{ins.result}</span>
              </p>
              {ins.field_memo && (
                <p style={{ marginTop: 2, color: 'var(--color-gray-600)' }}>{ins.field_memo}</p>
              )}
            </div>
            <div className="inspection-item-actions">
              <button
                className="btn btn-sm btn-secondary"
                disabled={isClosed}
                onClick={() => navigate(`/worker/survey/${surveyId}/inspections/${ins.inspection_id}/edit`)}
              >
                수정
              </button>
              <button
                className="btn btn-sm btn-danger"
                disabled={isClosed}
                onClick={() => setDeleteTarget(ins)}
              >
                삭제
              </button>
            </div>
          </div>
        ))
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="점검 삭제"
        message={`"${deleteTarget?.asset?.asset_no} - ${deleteTarget?.asset?.asset_name}" 점검 내역을 삭제하시겠습니까?`}
        confirmLabel="삭제"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
