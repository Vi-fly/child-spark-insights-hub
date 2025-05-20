
import React from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const ObserversPage = () => {
  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Observers</h1>
          <p className="text-muted-foreground">
            Manage all observers in the system
          </p>
        </div>

        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Observer
        </Button>
      </div>

      <div className="text-center py-16 text-muted-foreground">
        Observer management interface will be implemented here
      </div>
    </Layout>
  );
};

export default ObserversPage;
