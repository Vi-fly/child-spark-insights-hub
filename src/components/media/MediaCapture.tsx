
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Headphones, FileText, Upload, X, Check, Loader } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { performOCR, transcribeAudio } from '@/services/ai-integration';

const MediaCapture = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [processingImage, setProcessingImage] = useState(false);
  const [processingAudio, setProcessingAudio] = useState(false);
  const [ocrResult, setOcrResult] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  const { toast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Reset OCR result
      setOcrResult(null);
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
      // Reset transcription
      setTranscription(null);
    }
  };

  const processImage = async () => {
    if (!imageFile) return;
    
    setProcessingImage(true);
    
    try {
      const result = await performOCR(imageFile);
      setOcrResult(result);
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
    if (!audioFile) return;
    
    setProcessingAudio(true);
    
    try {
      const result = await transcribeAudio(audioFile);
      setTranscription(result);
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

  const clearImageUpload = () => {
    setImageFile(null);
    setImagePreview(null);
    setOcrResult(null);
  };

  const clearAudioUpload = () => {
    setAudioFile(null);
    setTranscription(null);
  };

  return (
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
              Upload images to extract text using optical character recognition
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!imageFile ? (
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-1">Upload an image</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Support for JPG, PNG files
                </p>
                <Button
                  variant="secondary"
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  Select Image
                </Button>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <img 
                    src={imagePreview || ''} 
                    alt="Preview" 
                    className="w-full rounded-lg border object-contain max-h-64 mx-auto"
                  />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={clearImageUpload}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium">{imageFile.name}</p>
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
                    <h3 className="font-medium mb-2">Extracted Text</h3>
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
              Powered by OCR.space technology. Image text can be used for generating reports.
            </p>
          </CardFooter>
        </Card>
      </TabsContent>
      
      <TabsContent value="audio">
        <Card>
          <CardHeader>
            <CardTitle>Audio Transcription</CardTitle>
            <CardDescription>
              Upload audio recordings for automatic transcription
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!audioFile ? (
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Headphones className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-1">Upload an audio file</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Support for MP3, WAV, M4A files
                </p>
                <Button
                  variant="secondary"
                  onClick={() => document.getElementById('audio-upload')?.click()}
                >
                  Select Audio
                </Button>
                <input
                  id="audio-upload"
                  type="file"
                  accept="audio/mpeg,audio/wav,audio/x-m4a"
                  className="hidden"
                  onChange={handleAudioUpload}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 border rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-observer-secondary flex items-center justify-center">
                      <Headphones className="h-5 w-5 text-white" />
                    </div>
                    <p className="font-medium">{audioFile.name}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={clearAudioUpload}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex justify-end">
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
                </div>
                
                {transcription && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Transcription Result</h3>
                    <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap">
                      {transcription}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <p className="text-sm text-muted-foreground w-full">
              Powered by AssemblyAI technology. Transcribed conversations can be used for generating reports.
            </p>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default MediaCapture;
