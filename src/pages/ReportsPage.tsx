
import React from 'react';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Plus } from 'lucide-react';
import ReportGenerator from '@/components/reports/ReportGenerator';
import { useAuth } from '@/contexts/AuthContext';

const ReportsPage = () => {
  const { user } = useAuth();
  const isParent = user?.role === 'parent';

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          {isParent ? 'My Child\'s Reports' : 'Reports'}
        </h1>
        <p className="text-muted-foreground">
          {isParent 
            ? 'View development reports for your child' 
            : 'Create and manage child development reports'}
        </p>
      </div>

      {!isParent && (
        <ReportGenerator />
      )}

      {isParent && (
        <p className="text-center py-16 text-muted-foreground">
          Your child's reports will be displayed here
        </p>
      )}
    </Layout>
  );
};

export default ReportsPage;
