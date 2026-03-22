import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <div className="home-container">
        <h1 className="home-title">네트워크 장비 실사점검 시스템</h1>
        <p className="home-subtitle">역할을 선택하여 시작하세요</p>
        <div className="home-buttons">
          <button className="home-role-btn" onClick={() => navigate('/admin')}>
            <div className="home-role-icon">&#128736;</div>
            <div className="home-role-label">관리자</div>
            <div className="home-role-desc">실사 관리, 자산 관리, 지도</div>
          </button>
          <button className="home-role-btn" onClick={() => navigate('/worker')}>
            <div className="home-role-icon">&#128221;</div>
            <div className="home-role-label">작업자</div>
            <div className="home-role-desc">점검 등록, 수정, 조회</div>
          </button>
        </div>
      </div>
    </div>
  );
}
