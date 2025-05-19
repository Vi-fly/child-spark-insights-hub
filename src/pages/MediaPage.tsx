
import React from 'react';
import Layout from '@/components/Layout';
import MediaCapture from '@/components/media/MediaCapture';

const MediaPage = () => {
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Media Processing</h1>
        <p className="text-muted-foreground">
          Capture and analyze images and audio recordings
        </p>
      </div>

      <MediaCapture />
    </Layout>
  );
};

export default MediaPage;
