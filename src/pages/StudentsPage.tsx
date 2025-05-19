
import React from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const StudentsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Students</h1>
          <p className="text-muted-foreground">
            {isAdmin ? 'Manage all students in the system' : 'View and manage your assigned students'}
          </p>
        </div>

        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Student
        </Button>
      </div>

      <div className="text-center py-16 text-muted-foreground">
        Student management interface will be implemented here
      </div>
    </Layout>
  );
};

export default StudentsPage;
