import { useState, useEffect } from 'react';
import { getSurveys, getInspections, updateInspection } from '../../api/client';
import type { Survey, Inspection } from '../../types';
import Loading from '../../components/Loading';
import { getFileUrl } from '../../api/client';

export default function AdminInspectionList() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [selectedSurveyId, setSelectedSurveyId] = useState<number | ''>('');
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [memoEdit, setMemoEdit] = useState<{ id: number; memo: string } | null>(null);

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    try {
      const data = await getSurveys();
      setSurveys(data);
    } catch {
      setError('실사 목록을 불러오지 못했습니다.');
    }
  };

  const loadInspections = async (surveyId: number) => {
    try {
      setLoading(true);
      setError('');
      const data = await getInspections(surveyId);
      setInspections(data);
    } catch {
      setError('점검 내역을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSurveyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val) {
      const id = Number(val);
      setSelectedSurveyId(id);
      loadInspections(id);
    } else {
      setSelectedSurveyId('');
      setInspections([]);
    }
  };

  const handleMemoSave = async () => {
    if (!memoEdit) return;
    try {
      await updateInspection(memoEdit.id, { admin_memo: memoEdit.memo });
      setMemoEdit(null);
      if (selectedSurveyId) await loadInspections(selectedSurveyId as number);
    } catch {
      setError('관리자 메모 저장에 실패했습니다.');
    }
  };

  const getResultBadge = (result: string) => {
    if (result === '정상') return 'badge badge-normal';
    if (result === '이상') return 'badge badge-abnormal';
    return 'badge badge-pending';
  };

  return (
    <div>
      <div className="page-header">
        <h2>점검 내역</h2>
        <div className="page-toolbar">
          <select className="form-control" value={selectedSurveyId} onChange={handleSurveyChange} style={{ minWidth: 240 }}>
            <option value="">실사를 선택하세요</option>
            {surveys.map((s) => (
              <option key={s.survey_id} value={s.survey_id}>
                {s.survey_no} - {s.survey_name} ({s.status === 'OPEN' ? '진행중' : '완료'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <Loading />
      ) : selectedSurveyId === '' ? (
        <div className="empty-state">
          <p>실사를 선택하면 점검 내역이 표시됩니다.</p>
        </div>
      ) : inspections.length === 0 ? (
        <div className="empty-state">
          <p>해당 실사의 점검 내역이 없습니다.</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>자산번호</th>
                  <th>장비명</th>
                  <th>작업자</th>
                  <th>점검일시</th>
                  <th>결과</th>
                  <th>메모</th>
                  <th>사진</th>
                  <th>관리자 메모</th>
                </tr>
              </thead>
              <tbody>
                {inspections.map((ins) => (
                  <tr key={ins.inspection_id}>
                    <td style={{ fontWeight: 600 }}>{ins.asset?.asset_no}</td>
                    <td>{ins.asset?.asset_name}</td>
                    <td>{ins.inspector_name}</td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.8125rem' }}>
                      {new Date(ins.inspect_dt).toLocaleString('ko-KR')}
                    </td>
                    <td>
                      <span className={getResultBadge(ins.result)}>{ins.result}</span>
                    </td>
                    <td style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ins.field_memo}
                    </td>
                    <td>
                      {ins.files && ins.files.length > 0 ? (
                        <div style={{ display: 'flex', gap: 4 }}>
                          {ins.files.slice(0, 2).map((f) => (
                            <img
                              key={f.file_id}
                              src={getFileUrl(f.file_path)}
                              alt={f.file_name}
                              style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
                            />
                          ))}
                          {ins.files.length > 2 && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-400)', alignSelf: 'center' }}>
                              +{ins.files.length - 2}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--color-gray-400)', fontSize: '0.8125rem' }}>-</span>
                      )}
                    </td>
                    <td>
                      {memoEdit?.id === ins.inspection_id ? (
                        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                          <input
                            className="form-control"
                            style={{ minWidth: 140, fontSize: '0.8125rem', padding: '4px 8px' }}
                            value={memoEdit.memo}
                            onChange={(e) => setMemoEdit({ ...memoEdit, memo: e.target.value })}
                          />
                          <button className="btn btn-sm btn-primary" onClick={handleMemoSave}>저장</button>
                          <button className="btn btn-sm btn-secondary" onClick={() => setMemoEdit(null)}>취소</button>
                        </div>
                      ) : (
                        <div
                          style={{ cursor: 'pointer', minWidth: 80, fontSize: '0.8125rem', color: ins.admin_memo ? 'var(--color-gray-700)' : 'var(--color-gray-400)' }}
                          onClick={() => setMemoEdit({ id: ins.inspection_id, memo: ins.admin_memo || '' })}
                          title="클릭하여 관리자 메모 편집"
                        >
                          {ins.admin_memo || '메모 추가'}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
