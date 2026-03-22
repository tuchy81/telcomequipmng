import { useState } from 'react';
import { verifyAdminPassword } from '../api/client';

interface AdminPasswordDialogProps {
  open: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AdminPasswordDialog({ open, onSuccess, onCancel }: AdminPasswordDialogProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('비밀번호를 입력하세요.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await verifyAdminPassword(password);
      setPassword('');
      onSuccess();
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('비밀번호가 올바르지 않습니다.');
      } else {
        setError('서버 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>관리자 인증</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-500)', marginBottom: '16px' }}>
          관리자 페이지에 접근하려면 비밀번호를 입력하세요.
        </p>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="admin-pw">비밀번호</label>
            <input
              id="admin-pw"
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="관리자 비밀번호"
              autoFocus
              disabled={loading}
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
              취소
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? '확인 중...' : '확인'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
