
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageUp, Mic, Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { performOCR, transcribeAudio } from '@/services/ai-integration';
import { Child } from '@/types';
import { supabase } from '@/integrations/supabase/client';

interface MediaUploaderProps {
  selectedStudent?: Child;
  onOCRResult: (text: string) => void;
  onTranscriptionResult: (text: string) => void;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({ 
  selectedStudent, 
  onOCRResult, 
  onTranscriptionResult 
}) => {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [ocrResult, setOCRResult] = useState('');
  const [transcriptionResult, setTranscriptionResult] = useState('');
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
    }
  };

  const processImage = async () => {
    if (!imageFile || !selectedStudent) {
      toast({
        title: "Missing Information",
        description: "Please select a student and upload an image.",
        variant: "destructive",
      });
      return;
    }

    setUploadingImage(true);
    
    try {
      // 1. Upload image to Supabase Storage (in a real implementation)
      // For simplicity, we'll skip actual upload to Supabase storage here
      
      // 2. Perform OCR on the image
      const ocrText = await performOCR(imageFile);
      
      // 3. Store the OCR result
      setOCRResult(ocrText);
      onOCRResult(ocrText);
      
      // 4. Save the media record in the database
      const { data, error } = await supabase
        .from('media')
        .insert({
          child_id: selectedStudent.id,
          type: 'image',
          url: 'https://placeholder-url.com/image.jpg', // In a real implementation, use the actual URL
          description: `OCR processed image for ${selectedStudent.name}`,
          processed_text: ocrText
        })
        .select();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Image processed successfully.",
      });
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: "Error",
        description: "Failed to process image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const processAudio = async () => {
    if (!audioFile || !selectedStudent) {
      toast({
        title: "Missing Information",
        description: "Please select a student and upload an audio file.",
        variant: "destructive",
      });
      return;
    }

    setUploadingAudio(true);
    
    try {
      // 1. Upload audio to Supabase Storage (in a real implementation)
      // For simplicity, we'll skip actual upload to Supabase storage here
      
      // 2. Transcribe the audio
      const transcription = await transcribeAudio(audioFile);
      
      // 3. Store the transcription result
      setTranscriptionResult(transcription);
      onTranscriptionResult(transcription);
      
      // 4. Save the media record in the database
      const { data, error } = await supabase
        .from('media')
        .insert({
          child_id: selectedStudent.id,
          type: 'audio',
          url: 'https://placeholder-url.com/audio.mp3', // In a real implementation, use the actual URL
          description: `Transcribed audio for ${selectedStudent.name}`,
          processed_text: transcription
        })
        .select();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Audio transcribed successfully.",
      });
    } catch (error) {
      console.error('Error transcribing audio:', error);
      toast({
        title: "Error",
        description: "Failed to transcribe audio. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingAudio(false);
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Upload Media</CardTitle>
        <CardDescription>
          Upload images or audio to process for the report
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="image" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="image" className="flex items-center gap-2">
              <ImageUp className="h-4 w-4" />
              Upload Image
            </TabsTrigger>
            <TabsTrigger value="audio" className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              Upload Audio
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="image">
            <div className="space-y-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="imageUpload">Image File</Label>
                <Input 
                  id="imageUpload" 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={uploadingImage || !selectedStudent}
                />
              </div>
              
              <Button 
                onClick={processImage} 
                disabled={!imageFile || uploadingImage || !selectedStudent}
                className="w-full"
              >
                {uploadingImage ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Process Image with OCR'
                )}
              </Button>
              
              {ocrResult && (
                <div className="mt-4 space-y-2">
                  <Label>OCR Result</Label>
                  <Textarea 
                    value={ocrResult} 
                    readOnly 
                    rows={6}
                    className="resize-none"
                  />
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="audio">
            <div className="space-y-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="audioUpload">Audio File</Label>
                <Input 
                  id="audioUpload" 
                  type="file" 
                  accept="audio/*"
                  onChange={handleAudioChange}
                  disabled={uploadingAudio || !selectedStudent}
                />
              </div>
              
              <Button 
                onClick={processAudio} 
                disabled={!audioFile || uploadingAudio || !selectedStudent}
                className="w-full"
              >
                {uploadingAudio ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Transcribing...
                  </>
                ) : (
                  'Transcribe Audio'
                )}
              </Button>
              
              {transcriptionResult && (
                <div className="mt-4 space-y-2">
                  <Label>Transcription Result</Label>
                  <Textarea 
                    value={transcriptionResult} 
                    readOnly 
                    rows={6}
                    className="resize-none"
                  />
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MediaUploader;
