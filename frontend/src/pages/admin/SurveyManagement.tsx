import { useState, useEffect } from 'react';
import {
  getSurveys,
  createSurvey,
  closeSurvey,
  reopenSurvey,
  deleteSurvey,
} from '../../api/client';
import type { Survey, SurveyCreateRequest } from '../../types';
import Loading from '../../components/Loading';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function SurveyManagement() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'close' | 'reopen' | 'delete';
    survey: Survey;
  } | null>(null);

  const [form, setForm] = useState<SurveyCreateRequest>({
    survey_no: '',
    survey_name: '',
    start_date: '',
    end_date: '',
    description: '',
  });

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    try {
      setLoading(true);
      const data = await getSurveys();
      setSurveys(data);
    } catch {
      setError('실사 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.survey_no.trim() || !form.survey_name.trim()) {
      setError('실사번호와 실사명은 필수 항목입니다.');
      return;
    }
    try {
      setError('');
      await createSurvey(form);
      setShowCreate(false);
      setForm({ survey_no: '', survey_name: '', start_date: '', end_date: '', description: '' });
      await loadSurveys();
    } catch (err: any) {
      setError(err.response?.data?.message || '실사 등록에 실패했습니다.');
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    try {
      setError('');
      if (confirmAction.type === 'close') {
        await closeSurvey(confirmAction.survey.survey_id, '관리자');
      } else if (confirmAction.type === 'reopen') {
        await reopenSurvey(confirmAction.survey.survey_id);
      } else if (confirmAction.type === 'delete') {
        await deleteSurvey(confirmAction.survey.survey_id);
      }
      setConfirmAction(null);
      await loadSurveys();
    } catch (err: any) {
      setError(err.response?.data?.message || '작업에 실패했습니다.');
      setConfirmAction(null);
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="page-header">
        <h2>실사 관리</h2>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          + 실사 등록
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>실사번호</th>
                <th>실사명</th>
                <th>기간</th>
                <th>상태</th>
                <th>설명</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {surveys.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-gray-400)' }}>
                    등록된 실사가 없습니다.
                  </td>
                </tr>
              ) : (
                surveys.map((s) => (
                  <tr key={s.survey_id}>
                    <td style={{ fontWeight: 600 }}>{s.survey_no}</td>
                    <td>{s.survey_name}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {s.start_date} ~ {s.end_date}
                    </td>
                    <td>
                      <span className={`badge ${s.status === 'OPEN' ? 'badge-open' : 'badge-closed'}`}>
                        {s.status === 'OPEN' ? '진행중' : '완료'}
                      </span>
                    </td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.description}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {s.status === 'OPEN' ? (
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => setConfirmAction({ type: 'close', survey: s })}
                          >
                            완료처리
                          </button>
                        ) : (
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => setConfirmAction({ type: 'reopen', survey: s })}
                          >
                            재오픈
                          </button>
                        )}
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => setConfirmAction({ type: 'delete', survey: s })}
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Survey Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>실사 등록</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>실사번호 *</label>
                <input
                  className="form-control"
                  value={form.survey_no}
                  onChange={(e) => setForm({ ...form, survey_no: e.target.value })}
                  placeholder="예: SV-2026-001"
                  required
                />
              </div>
              <div className="form-group">
                <label>실사명 *</label>
                <input
                  className="form-control"
                  value={form.survey_name}
                  onChange={(e) => setForm({ ...form, survey_name: e.target.value })}
                  placeholder="예: 2026년 1분기 정기 실사"
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label>시작일</label>
                  <input
                    type="date"
                    className="form-control"
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>종료일</label>
                  <input
                    type="date"
                    className="form-control"
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>대상 범위 메모</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="실사 대상 범위를 입력하세요"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>
                  취소
                </button>
                <button type="submit" className="btn btn-primary">
                  등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={!!confirmAction}
        title={
          confirmAction?.type === 'close'
            ? '실사 완료 처리'
            : confirmAction?.type === 'reopen'
            ? '실사 재오픈'
            : '실사 삭제'
        }
        message={
          confirmAction?.type === 'close'
            ? `"${confirmAction.survey.survey_name}" 실사를 완료 처리하시겠습니까? 완료 처리 후 모든 점검 내역은 수정/삭제가 불가합니다.`
            : confirmAction?.type === 'reopen'
            ? `"${confirmAction?.survey.survey_name}" 실사를 재오픈하시겠습니까?`
            : `"${confirmAction?.survey.survey_name}" 실사를 삭제하시겠습니까? 점검 내역이 있는 경우 삭제할 수 없습니다.`
        }
        confirmLabel={confirmAction?.type === 'delete' ? '삭제' : '확인'}
        danger={confirmAction?.type === 'delete'}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}
