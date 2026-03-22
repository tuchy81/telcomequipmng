import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSurveys } from '../../api/client';
import type { Survey } from '../../types';
import Loading from '../../components/Loading';

export default function SurveySelect() {
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [workerName, setWorkerName] = useState(() => sessionStorage.getItem('worker_name') || '');

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    try {
      setLoading(true);
      const data = await getSurveys();
      setSurveys(data.filter((s) => s.status === 'OPEN'));
    } catch {
      setError('실사 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (survey: Survey) => {
    if (!workerName.trim()) {
      setError('작업자 이름을 먼저 입력하세요.');
      return;
    }
    sessionStorage.setItem('worker_name', workerName.trim());
    navigate(`/worker/survey/${survey.survey_id}/inspections`);
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="page-header">
        <h2>실사 선택</h2>
      </div>

      <div className="worker-name-section">
        <div className="form-group">
          <label style={{ textAlign: 'center' }}>작업자 이름</label>
          <input
            className="form-control"
            placeholder="이름을 입력하세요"
            value={workerName}
            onChange={(e) => setWorkerName(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {surveys.length === 0 ? (
        <div className="empty-state">
          <p>진행중인 실사가 없습니다.</p>
        </div>
      ) : (
        <div className="survey-list">
          {surveys.map((s) => (
            <div key={s.survey_id} className="survey-card" onClick={() => handleSelect(s)}>
              <div className="survey-card-info">
                <h3>{s.survey_name}</h3>
                <p>
                  {s.survey_no} | {s.start_date} ~ {s.end_date}
                </p>
                {s.description && (
                  <p style={{ marginTop: 4, color: 'var(--color-gray-600)' }}>{s.description}</p>
                )}
              </div>
              <div className="survey-card-arrow">&rsaquo;</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
