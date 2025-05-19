
import React from 'react';
import Layout from '@/components/Layout';

const MessagesPage = () => {
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Messages</h1>
        <p className="text-muted-foreground">
          Communicate with parents and observers
        </p>
      </div>

      <div className="text-center py-16 text-muted-foreground">
        Messaging interface will be implemented here
      </div>
    </Layout>
  );
};

export default MessagesPage;
