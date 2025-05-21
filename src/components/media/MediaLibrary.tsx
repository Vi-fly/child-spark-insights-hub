
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Image, File, Download, Search, FileText, Headphones, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Child } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface Media {
  id: string;
  child_id: string;
  type: 'audio' | 'image';
  url: string;
  date_created: string;
  description?: string;
  processed_text?: string;
  childName?: string;
}

const MediaLibrary: React.FC = () => {
  const [mediaFiles, setMediaFiles] = useState<Media[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    type: 'all',
    search: '',
    student: 'all'
  });
  const [students, setStudents] = useState<Child[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchStudents();
    fetchMediaFiles();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filter, mediaFiles]);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('children')
        .select('*');

      if (error) {
        throw error;
      }

      const formattedStudents: Child[] = data.map(student => ({
        id: student.id,
        name: student.name,
        dateOfBirth: student.date_of_birth,
        class: student.class,
        parentIds: []
      }));

      setStudents(formattedStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: 'Error',
        description: 'Failed to load students. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const fetchMediaFiles = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .order('date_created', { ascending: false });

      if (error) {
        throw error;
      }

      // Enhance media files with student names
      const enhancedData = await Promise.all(data.map(async (item) => {
        const { data: studentData } = await supabase
          .from('children')
          .select('name')
          .eq('id', item.child_id)
          .single();
          
        return {
          ...item,
          childName: studentData?.name || 'Unknown'
        };
      }));

      setMediaFiles(enhancedData);
    } catch (error) {
      console.error('Error fetching media files:', error);
      toast({
        title: 'Error',
        description: 'Failed to load media files. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...mediaFiles];

    // Filter by type
    if (filter.type !== 'all') {
      result = result.filter(file => file.type === filter.type);
    }

    // Filter by student
    if (filter.student !== 'all') {
      result = result.filter(file => file.child_id === filter.student);
    }

    // Filter by search term
    if (filter.search) {
      const searchTerm = filter.search.toLowerCase();
      result = result.filter(file => 
        file.childName?.toLowerCase().includes(searchTerm) ||
        file.description?.toLowerCase().includes(searchTerm) ||
        file.processed_text?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredFiles(result);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilter(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const downloadMedia = async (media: Media) => {
    try {
      window.open(media.url, '_blank');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: 'Download failed',
        description: 'Could not download the file. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const exportAsReport = async (media: Media) => {
    try {
      // Create a formatted text file for download
      const reportText = `
Media Report
===========

Student: ${media.childName || 'Unknown'}
Date: ${formatDate(media.date_created)}
Type: ${media.type === 'image' ? 'Image (OCR)' : 'Audio Transcription'}
Description: ${media.description || 'No description'}

Processed Content:
----------------
${media.processed_text || 'No processed text available'}
      `;
      
      const blob = new Blob([reportText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${media.type}_report_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting report:', error);
      toast({
        title: 'Export failed',
        description: 'Could not export the report. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Media Library</CardTitle>
          <CardDescription>View and manage all uploaded media files</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="w-full md:w-1/3">
              <Label htmlFor="search" className="mb-2 block">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search media files..."
                  className="pl-8"
                  value={filter.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>
            
            <div className="w-full md:w-1/3">
              <Label htmlFor="type-filter" className="mb-2 block">Media Type</Label>
              <Select 
                value={filter.type} 
                onValueChange={(value) => handleFilterChange('type', value)}
              >
                <SelectTrigger id="type-filter">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="image">Images</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full md:w-1/3">
              <Label htmlFor="student-filter" className="mb-2 block">Student</Label>
              <Select 
                value={filter.student} 
                onValueChange={(value) => handleFilterChange('student', value)}
              >
                <SelectTrigger id="student-filter">
                  <SelectValue placeholder="All Students" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} - {student.class}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center p-12">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center p-12 border rounded-lg bg-muted/30">
              <File className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <h3 className="font-medium text-lg mb-1">No media files found</h3>
              <p className="text-muted-foreground">
                {filter.search || filter.type !== 'all' || filter.student !== 'all' 
                  ? 'Try changing your search filters'
                  : 'Upload media using the capture tools'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFiles.map((file) => (
                <Card key={file.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <div 
                    className="h-40 bg-muted flex items-center justify-center cursor-pointer"
                    onClick={() => setSelectedMedia(file)}
                  >
                    {file.type === 'image' ? (
                      <div className="relative w-full h-full">
                        <img 
                          src={file.url} 
                          alt={file.description || 'Image'} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <Headphones className="h-10 w-10 text-muted-foreground" />
                        <p className="text-sm mt-2">Audio Recording</p>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium truncate">{file.childName}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(file.date_created)}</p>
                      </div>
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => downloadMedia(file)}
                          className="h-8 w-8 p-0"
                        >
                          <Download className="h-4 w-4" />
                          <span className="sr-only">Download</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedMedia(file)}
                          className="h-8 w-8 p-0"
                        >
                          <FileText className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm line-clamp-2">
                      {file.description || (file.type === 'image' ? 'OCR processed image' : 'Audio recording')}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedMedia && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>{selectedMedia.type === 'image' ? 'Image OCR Results' : 'Audio Transcription'}</CardTitle>
                <CardDescription>
                  {selectedMedia.childName} - {formatDate(selectedMedia.date_created)}
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => exportAsReport(selectedMedia)}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedMedia(null)}>
                  Close
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedMedia.type === 'image' && (
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/3">
                  <div className="rounded-lg border overflow-hidden">
                    <img 
                      src={selectedMedia.url} 
                      alt={selectedMedia.description || 'Image'}
                      className="w-full h-auto"
                    />
                  </div>
                  <div className="mt-2 flex justify-center">
                    <Button variant="outline" size="sm" asChild>
                      <a href={selectedMedia.url} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open Full Size
                      </a>
                    </Button>
                  </div>
                </div>
                <div className="w-full md:w-2/3">
                  <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap">
                    {selectedMedia.processed_text || 'No text was extracted from this image.'}
                  </div>
                </div>
              </div>
            )}
            
            {selectedMedia.type === 'audio' && (
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block">Audio Recording</Label>
                  <div className="bg-muted p-4 rounded-lg">
                    <audio src={selectedMedia.url} controls className="w-full" />
                  </div>
                </div>
                <div>
                  <Label className="mb-2 block">Transcription</Label>
                  <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap">
                    {selectedMedia.processed_text || 'No transcription available for this audio.'}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MediaLibrary;
