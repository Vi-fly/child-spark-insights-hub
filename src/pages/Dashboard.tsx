
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import ObserverDashboard from '@/components/dashboards/ObserverDashboard';
import ParentDashboard from '@/components/dashboards/ParentDashboard';
import Layout from '@/components/Layout';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const renderDashboardByRole = () => {
    switch (user.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'observer':
        return <ObserverDashboard />;
      case 'parent':
        return <ParentDashboard />;
      default:
        return <div>Unknown role</div>;
    }
  };

  return <Layout>{renderDashboardByRole()}</Layout>;
};

export default Dashboard;
