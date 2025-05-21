
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import MediaCapture from '@/components/media/MediaCapture';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Image, ListMusic } from 'lucide-react';
import MediaLibrary from '@/components/media/MediaLibrary';

const MediaPage = () => {
  const [lastProcessedMedia, setLastProcessedMedia] = useState<{
    type: 'image' | 'audio';
    text: string;
  } | null>(null);

  const handleMediaProcessed = (type: 'image' | 'audio', text: string) => {
    setLastProcessedMedia({ type, text });
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Media Processing</h1>
        <p className="text-muted-foreground">
          Capture, analyze, and manage images and audio recordings
        </p>
      </div>

      <Tabs defaultValue="capture" className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-md mb-4">
          <TabsTrigger value="capture" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Capture & Process
          </TabsTrigger>
          <TabsTrigger value="library" className="flex items-center gap-2">
            <ListMusic className="h-4 w-4" />
            Media Library
          </TabsTrigger>
        </TabsList>

        <TabsContent value="capture">
          <MediaCapture onMediaProcessed={handleMediaProcessed} />

          {lastProcessedMedia && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>
                  {lastProcessedMedia.type === 'image' ? 'OCR Result' : 'Transcription Result'}
                </CardTitle>
                <CardDescription>
                  {lastProcessedMedia.type === 'image' 
                    ? 'Extracted text from the processed image' 
                    : 'Transcribed text from the audio recording'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap">
                  {lastProcessedMedia.text}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="library">
          <MediaLibrary />
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default MediaPage;
