
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Image, FileAudio, Download, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Media } from '@/types';

const MediaLibrary = () => {
  const [mediaItems, setMediaItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'image' | 'audio'>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchMediaItems();
  }, [selectedType]);

  const fetchMediaItems = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('media')
        .select(`
          *,
          children(name)
        `)
        .order('created_at', { ascending: false });

      if (selectedType !== 'all') {
        query = query.eq('type', selectedType);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      const formattedMedia: Media[] = data.map(item => ({
        id: item.id,
        childId: item.child_id,
        type: item.type === 'image' ? 'image' : 'audio',
        url: item.url,
        dateCreated: new Date(item.created_at).toLocaleDateString(),
        description: item.description || '',
        processedText: item.processed_text || ''
      }));

      setMediaItems(formattedMedia);
    } catch (error) {
      console.error('Error fetching media:', error);
      toast({
        title: 'Error',
        description: 'Failed to load media items',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('media')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMediaItems(prev => prev.filter(item => item.id !== id));
      
      toast({
        title: 'Media deleted',
        description: 'The media has been removed successfully'
      });
    } catch (error) {
      console.error('Error deleting media:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete media',
        variant: 'destructive'
      });
    }
  };

  const filteredMedia = mediaItems.filter(media => {
    const matchesSearch = searchTerm === '' || 
      media.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (media.processedText && media.processedText.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Media Library</CardTitle>
          <CardDescription>View and manage captured images and audio recordings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search media by description or content..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Tabs defaultValue="all" value={selectedType} onValueChange={(value) => setSelectedType(value as 'all' | 'image' | 'audio')}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="image">Images</TabsTrigger>
                <TabsTrigger value="audio">Audio</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No media found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMedia.map((media) => (
                <Card key={media.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      {media.type === 'image' ? (
                        <Image className="h-4 w-4 mr-2" />
                      ) : (
                        <FileAudio className="h-4 w-4 mr-2" />
                      )}
                      {media.description.substring(0, 30)}
                      {media.description.length > 30 ? '...' : ''}
                    </CardTitle>
                    <CardDescription>{media.dateCreated}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {media.type === 'image' ? (
                      <div className="aspect-video relative rounded-md overflow-hidden">
                        <img 
                          src={media.url} 
                          alt={media.description} 
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[4/1] flex items-center justify-center bg-muted rounded-md">
                        <audio 
                          src={media.url} 
                          controls 
                          className="w-full max-w-full h-10"
                        />
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-0 flex justify-between">
                    <Button size="sm" variant="outline" asChild>
                      <a href={media.url} download target="_blank" rel="noopener noreferrer">
                        <Download className="h-3.5 w-3.5 mr-1.5" />
                        Download
                      </a>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDelete(media.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MediaLibrary;
