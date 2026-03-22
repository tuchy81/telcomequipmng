import { Outlet, Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  type: 'admin' | 'worker';
}

export default function Layout({ type }: LayoutProps) {
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="app-layout">
      <header className="app-header">
        <h1>
          <Link to="/">장비 실사점검</Link>
        </h1>
        <nav className="header-nav">
          {type === 'admin' ? (
            <>
              <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>
                대시보드
              </Link>
              <Link to="/admin/surveys" className={isActive('/admin/surveys') ? 'active' : ''}>
                실사관리
              </Link>
              <Link to="/admin/assets" className={isActive('/admin/assets') ? 'active' : ''}>
                자산관리
              </Link>
              <Link to="/admin/inspections" className={isActive('/admin/inspections') ? 'active' : ''}>
                점검내역
              </Link>
              <Link to="/admin/map" className={isActive('/admin/map') ? 'active' : ''}>
                지도
              </Link>
              <Link to="/admin/settings" className={isActive('/admin/settings') ? 'active' : ''}>
                설정
              </Link>
            </>
          ) : (
            <>
              <Link to="/worker" className={location.pathname === '/worker' ? 'active' : ''}>
                실사선택
              </Link>
            </>
          )}
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
