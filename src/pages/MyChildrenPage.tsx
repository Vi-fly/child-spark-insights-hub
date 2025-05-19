
import React from 'react';
import Layout from '@/components/Layout';

const MyChildrenPage = () => {
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2">My Children</h1>
        <p className="text-muted-foreground">
          View and manage your children's information
        </p>
      </div>

      <div className="text-center py-16 text-muted-foreground">
        Child management interface for parents will be implemented here
      </div>
    </Layout>
  );
};

export default MyChildrenPage;
