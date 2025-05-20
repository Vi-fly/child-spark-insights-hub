
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileText, Wand2, Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateReport, ReportGenerationInput, GeneratedReport } from '@/services/ai-integration';
import ReportDetail from './ReportDetail';
import { Report, GrowthAreaType, GrowthAreaRating, Child } from '@/types';
import StudentSelector from './StudentSelector';
import MediaUploader from './MediaUploader';
import { supabase } from '@/integrations/supabase/client';

const ReportGenerator = () => {
  const [selectedStudent, setSelectedStudent] = useState<Child | undefined>();
  const [formData, setFormData] = useState<ReportGenerationInput>({
    childName: '',
    childAge: '',
    date: new Date().toISOString().split('T')[0],
    theme: '',
    curiositySeed: '',
    observerNotes: '',
  });

  const [generatingReport, setGeneratingReport] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<GeneratedReport | null>(null);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOCRResult = (text: string) => {
    setFormData(prev => ({ ...prev, ocrText: text }));
  };

  const handleTranscriptionResult = (text: string) => {
    setFormData(prev => ({ ...prev, transcription: text }));
  };

  const handleStudentSelect = (student: Child) => {
    setSelectedStudent(student);
    
    // Calculate age from date of birth
    const birthDate = new Date(student.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    setFormData(prev => ({
      ...prev,
      childName: student.name,
      childAge: `${age} years`,
    }));
  };

  const handleGenerateReport = async () => {
    if (!selectedStudent) {
      toast({
        title: "Missing student",
        description: "Please select a student before generating a report.",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields
    if (!formData.childName || !formData.date || !formData.theme) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields before generating a report.",
        variant: "destructive",
      });
      return;
    }

    setGeneratingReport(true);
    
    try {
      const result = await generateReport(formData);
      setGeneratedReport(result);

      // Save the report to the database
      const { data, error } = await supabase
        .from('reports')
        .insert({
          child_id: selectedStudent.id,
          observer_id: '00000000-0000-0000-0000-000000000000', // This should be the actual observer ID in a real implementation
          date: formData.date,
          theme: formData.theme,
          curiosity_seed: formData.curiositySeed || '',
          overall_score: result.overallScore,
          curiosity_response_index: result.curiosityResponseIndex,
          parent_note: result.parentNote,
        })
        .select();

      if (error) {
        throw error;
      }

      // Get the inserted report ID
      const reportId = data[0].id;

      // Save the growth areas
      for (const area of result.growthAreas) {
        const { error: growthError } = await supabase
          .from('growth_areas')
          .insert({
            report_id: reportId,
            area: area.area,
            rating: area.rating,
            observation: area.observation,
            emoji: area.emoji
          });

        if (growthError) {
          console.error('Error saving growth area:', growthError);
        }
      }
      
      toast({
        title: "Report generated and saved",
        description: "Your AI-powered report has been created and saved to the database.",
      });
    } catch (error) {
      console.error('Report generation error:', error);
      toast({
        title: "Report generation failed",
        description: "There was an error generating the report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGeneratingReport(false);
    }
  };

  const fullReport: Report | null = generatedReport ? {
    id: 'new-report',
    childId: selectedStudent?.id || 'child-1',
    observerId: 'observer-1',
    date: formData.date,
    theme: formData.theme,
    curiositySeed: formData.curiositySeed || '',
    growthAreas: generatedReport.growthAreas.map(area => ({
      area: area.area as GrowthAreaType,
      rating: area.rating as GrowthAreaRating,
      observation: area.observation,
      emoji: area.emoji
    })),
    activatedAreas: generatedReport.activatedAreas,
    totalAreas: generatedReport.totalAreas,
    parentNote: generatedReport.parentNote,
    overallScore: generatedReport.overallScore,
    curiosityResponseIndex: generatedReport.curiosityResponseIndex,
  } : null;

  return (
    <Tabs defaultValue="input" className="w-full">
      <TabsList className="grid grid-cols-2 mb-4">
        <TabsTrigger value="input" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Report Input
        </TabsTrigger>
        <TabsTrigger 
          value="preview" 
          className="flex items-center gap-2"
          disabled={!generatedReport}
        >
          <Wand2 className="h-4 w-4" />
          Generated Report
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="input">
        <div className="space-y-4">
          <StudentSelector onStudentSelect={handleStudentSelect} />
          
          {selectedStudent && <MediaUploader 
            selectedStudent={selectedStudent} 
            onOCRResult={handleOCRResult}
            onTranscriptionResult={handleTranscriptionResult}
          />}
          
          {selectedStudent && (
            <Card>
              <CardHeader>
                <CardTitle>Create New Report</CardTitle>
                <CardDescription>
                  Enter details to generate an AI-powered child development report
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="childName">Child's Name *</Label>
                    <Input
                      id="childName"
                      name="childName"
                      value={formData.childName}
                      onChange={handleInputChange}
                      placeholder="Enter child's name"
                      required
                      readOnly
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="childAge">Child's Age</Label>
                    <Input
                      id="childAge"
                      name="childAge"
                      value={formData.childAge}
                      onChange={handleInputChange}
                      placeholder="e.g., 6 years"
                      readOnly
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Report Date *</Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme of the Day *</Label>
                    <Input
                      id="theme"
                      name="theme"
                      value={formData.theme}
                      onChange={handleInputChange}
                      placeholder="e.g., Museum Visit + Finance Reading"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="curiositySeed">Curiosity Seed Explored</Label>
                  <Input
                    id="curiositySeed"
                    name="curiositySeed"
                    value={formData.curiositySeed}
                    onChange={handleInputChange}
                    placeholder="e.g., Scuba Diving, Space Exploration"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="observerNotes">Observer Notes</Label>
                  <Textarea
                    id="observerNotes"
                    name="observerNotes"
                    value={formData.observerNotes}
                    onChange={handleInputChange}
                    placeholder="Add your observations about the child's activities, responses, and development"
                    rows={5}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ocrText">Captured OCR Text</Label>
                  <Textarea
                    id="ocrText"
                    name="ocrText"
                    value={formData.ocrText}
                    onChange={handleInputChange}
                    placeholder="Text extracted from images will appear here"
                    rows={3}
                    readOnly
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="transcription">Audio Transcription</Label>
                  <Textarea
                    id="transcription"
                    name="transcription"
                    value={formData.transcription}
                    onChange={handleInputChange}
                    placeholder="Transcribed audio conversations will appear here"
                    rows={3}
                    readOnly
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleGenerateReport}
                  disabled={generatingReport}
                  className="w-full"
                >
                  {generatingReport ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Generating Report...
                    </>
                  ) : (
                    'Generate Report'
                  )}
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="preview">
        {fullReport && <ReportDetail report={fullReport} />}
      </TabsContent>
    </Tabs>
  );
};

export default ReportGenerator;
