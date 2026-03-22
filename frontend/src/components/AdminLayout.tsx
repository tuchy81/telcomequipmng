import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';
import AdminPasswordDialog from './AdminPasswordDialog';
import Layout from './Layout';

export default function AdminLayout() {
  const { isAuthenticated, login } = useAdminAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <AdminPasswordDialog
        open={true}
        onSuccess={login}
        onCancel={() => navigate('/')}
      />
    );
  }

  return <Layout type="admin" />;
}
