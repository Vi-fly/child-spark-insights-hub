import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Headphones, Check, Loader, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { performOCR, transcribeAudio } from '@/services/ai-integration';
import { supabase } from '@/integrations/supabase/client';
import Webcam from 'react-webcam';
import { useReactMediaRecorder } from 'react-media-recorder';
import { Child } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface MediaCaptureProps {
  onMediaProcessed?: (type: 'image' | 'audio', text: string) => void;
}

const MediaCapture: React.FC<MediaCaptureProps> = ({ onMediaProcessed }) => {
  const [students, setStudents] = useState<Child[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [processingImage, setProcessingImage] = useState(false);
  const [processingAudio, setProcessingAudio] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  
  const webcamRef = useRef<Webcam>(null);
  const { toast } = useToast();

  const {
    status,
    startRecording,
    stopRecording,
    mediaBlobUrl,
    clearBlobUrl
  } = useReactMediaRecorder({
    audio: true,
    blobPropertyBag: { type: 'audio/wav' }
  });

  React.useEffect(() => {
    fetchStudents();
  }, []);

  React.useEffect(() => {
    if (mediaBlobUrl) {
      setAudioURL(mediaBlobUrl);
      // Convert mediaBlobUrl to File when it changes
      fetch(mediaBlobUrl)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], "recording.wav", { type: "audio/wav" });
          setAudioFile(file);
        });
    }
  }, [mediaBlobUrl]);

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

  const captureImage = () => {
    if (!selectedStudentId) {
      toast({
        title: "Select a Student",
        description: "Please select a student before capturing an image.",
        variant: "destructive",
      });
      return;
    }
    
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setOcrResult(null);
    }
  };

  const resetImageCapture = () => {
    setCapturedImage(null);
    setOcrResult(null);
  };

  const resetAudioRecording = () => {
    clearBlobUrl();
    setAudioURL(null);
    setAudioFile(null);
    setTranscription(null);
  };

  const processImage = async () => {
    if (!capturedImage || !selectedStudentId) return;
    
    setProcessingImage(true);
    
    try {
      // Convert base64 image to File
      const binaryString = atob(capturedImage.split(',')[1]);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const imageFile = new File([bytes], "capture.jpg", { type: "image/jpeg" });
      
      // Process with OCR
      const result = await performOCR(imageFile);
      setOcrResult(result);
      
      if (onMediaProcessed) {
        onMediaProcessed('image', result);
      }
      
      // Save to Supabase Storage
      const student = students.find(s => s.id === selectedStudentId);
      const fileName = `ocr_${student?.name.replace(/\s+/g, '_')}_${new Date().toISOString()}.jpg`;
      
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(`images/${fileName}`, imageFile);

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error('Failed to upload image to storage');
      }

      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('media')
        .getPublicUrl(`images/${fileName}`);
      
      // Save record to database
      const { error: dbError } = await supabase.from('media').insert({
        child_id: selectedStudentId,
        type: 'image',
        url: publicUrlData.publicUrl,
        description: `OCR processed image for ${student?.name}`,
        processed_text: result
      });

      if (dbError) {
        throw dbError;
      }

      toast({
        title: "OCR completed successfully",
        description: "The image has been processed and text has been extracted.",
      });
    } catch (error) {
      console.error('OCR processing error:', error);
      toast({
        title: "OCR processing failed",
        description: "There was an error processing the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingImage(false);
    }
  };

  const processAudio = async () => {
    if (!audioFile || !selectedStudentId) return;
    
    setProcessingAudio(true);
    
    try {
      // Process with transcription API
      const result = await transcribeAudio(audioFile);
      setTranscription(result);
      
      if (onMediaProcessed) {
        onMediaProcessed('audio', result);
      }

      // Save to Supabase Storage
      const student = students.find(s => s.id === selectedStudentId);
      const fileName = `audio_${student?.name.replace(/\s+/g, '_')}_${new Date().toISOString()}.wav`;
      
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(`audio/${fileName}`, audioFile);

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error('Failed to upload audio to storage');
      }

      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('media')
        .getPublicUrl(`audio/${fileName}`);
        
      // Save record to database
      const { error: dbError } = await supabase.from('media').insert({
        child_id: selectedStudentId,
        type: 'audio',
        url: publicUrlData.publicUrl,
        description: `Transcribed audio for ${student?.name}`,
        processed_text: result
      });

      if (dbError) {
        throw dbError;
      }

      toast({
        title: "Audio transcription completed",
        description: "The audio has been transcribed successfully.",
      });
    } catch (error) {
      console.error('Audio transcription error:', error);
      toast({
        title: "Transcription failed",
        description: "There was an error transcribing the audio. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingAudio(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Select Student</CardTitle>
          <CardDescription>Choose a student to capture media for</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a student" />
            </SelectTrigger>
            <SelectContent>
              {students.map((student) => (
                <SelectItem key={student.id} value={student.id}>
                  {student.name} - {student.class}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    
      <Tabs defaultValue="image" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="image" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Image OCR
          </TabsTrigger>
          <TabsTrigger value="audio" className="flex items-center gap-2">
            <Headphones className="h-4 w-4" />
            Audio Transcription
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="image">
          <Card>
            <CardHeader>
              <CardTitle>Image OCR Processing</CardTitle>
              <CardDescription>
                Capture images to extract text using optical character recognition
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!capturedImage ? (
                <div className="flex flex-col items-center">
                  <div className="w-full max-w-md mx-auto overflow-hidden rounded-lg border">
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      videoConstraints={{
                        width: 640,
                        height: 480,
                        facingMode: "environment"
                      }}
                      className="w-full"
                    />
                  </div>
                  <Button 
                    onClick={captureImage} 
                    className="mt-4"
                    disabled={!selectedStudentId}
                  >
                    <Camera className="h-4 w-4 mr-2" /> Capture Image
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <img 
                      src={capturedImage} 
                      alt="Captured" 
                      className="w-full rounded-lg border object-contain max-h-64 mx-auto"
                    />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={resetImageCapture}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium">Captured Image</p>
                    <Button 
                      onClick={processImage} 
                      disabled={processingImage}
                      variant="default"
                    >
                      {processingImage ? (
                        <>
                          <Loader className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : ocrResult ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Processed
                        </>
                      ) : (
                        'Process Image'
                      )}
                    </Button>
                  </div>
                  
                  {ocrResult && (
                    <div className="mt-4">
                      <Label className="mb-2 block">Extracted Text</Label>
                      <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap">
                        {ocrResult}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <p className="text-sm text-muted-foreground w-full">
                Using OCR.space technology to extract text from images.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="audio">
          <Card>
            <CardHeader>
              <CardTitle>Audio Transcription</CardTitle>
              <CardDescription>
                Record audio for automatic speech-to-text transcription
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <div className="flex items-center justify-center w-full h-32 bg-muted rounded-lg">
                  <div className="text-center">
                    {status === "recording" ? (
                      <div className="flex flex-col items-center">
                        <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse mb-2"></div>
                        <p className="text-sm font-medium">Recording in progress...</p>
                      </div>
                    ) : audioURL ? (
                      <div className="flex flex-col items-center">
                        <audio src={audioURL} controls className="w-full max-w-xs" />
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Ready to record audio</p>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2">
                  {status !== "recording" && !audioURL && (
                    <Button 
                      onClick={startRecording}
                      disabled={!selectedStudentId || status === "recording"}
                      variant="default"
                    >
                      <Headphones className="h-4 w-4 mr-2" /> Start Recording
                    </Button>
                  )}
                  
                  {status === "recording" && (
                    <Button 
                      onClick={stopRecording}
                      variant="destructive"
                    >
                      <X className="h-4 w-4 mr-2" /> Stop Recording
                    </Button>
                  )}
                  
                  {audioURL && (
                    <>
                      <Button 
                        onClick={processAudio} 
                        disabled={processingAudio}
                        variant="default"
                      >
                        {processingAudio ? (
                          <>
                            <Loader className="h-4 w-4 mr-2 animate-spin" />
                            Transcribing...
                          </>
                        ) : transcription ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Transcribed
                          </>
                        ) : (
                          'Transcribe Audio'
                        )}
                      </Button>
                      
                      <Button 
                        onClick={resetAudioRecording}
                        variant="outline"
                      >
                        <X className="h-4 w-4 mr-2" /> Reset
                      </Button>
                    </>
                  )}
                </div>
              </div>
              
              {transcription && (
                <div className="mt-4">
                  <Label className="mb-2 block">Transcription Result</Label>
                  <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap">
                    {transcription}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <p className="text-sm text-muted-foreground w-full">
                Using AssemblyAI to transcribe speech from audio recordings.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MediaCapture;
