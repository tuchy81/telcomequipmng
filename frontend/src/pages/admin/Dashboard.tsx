import { useState, useEffect } from 'react';
import { getDashboard } from '../../api/client';
import type { DashboardStats } from '../../types';
import Loading from '../../components/Loading';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await getDashboard();
      setStats(data);
    } catch (err) {
      setError('대시보드 데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="page-header">
        <h2>대시보드</h2>
      </div>

      {error && <div className="error-message">{error}</div>}

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.active_surveys}</div>
            <div className="stat-label">진행중 실사 수</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.total_assets}</div>
            <div className="stat-label">전체 장비 수</div>
          </div>
          <div className="stat-card success">
            <div className="stat-value">{stats.today_inspections}</div>
            <div className="stat-label">금일 점검 수</div>
          </div>
          <div className="stat-card danger">
            <div className="stat-value">{stats.abnormal_assets}</div>
            <div className="stat-label">이상 장비 수</div>
          </div>
        </div>
      )}
    </div>
  );
}
