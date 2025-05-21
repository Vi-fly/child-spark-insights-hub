
// API Keys
const OCR_API_KEY = "K81647842288957";
const ASSEMBLYAI_API_KEY = "28257cf1dcde4f1ba91145bd2864b3f5";
const GOOGLE_API_KEY = "AIzaSyBawYvfJorhZXY9xQ81kxQVr1967Tj3oaE";

// OCR Integration using OCR.space API
export const performOCR = async (imageFile: File): Promise<string> => {
  console.log('Performing OCR on file using OCR.space API:', imageFile.name);
  
  const formData = new FormData();
  formData.append('apikey', OCR_API_KEY);
  formData.append('language', 'eng');
  formData.append('isOverlayRequired', 'false');
  formData.append('file', imageFile);
  formData.append('OCREngine', '2'); // More accurate OCR engine
  
  try {
    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: formData,
    });
    
    const result = await response.json();
    
    if (!result.IsErroredOnProcessing) {
      let extractedText = '';
      if (result.ParsedResults && result.ParsedResults.length > 0) {
        result.ParsedResults.forEach((parsedResult: any) => {
          extractedText += parsedResult.ParsedText;
        });
      }
      
      if (!extractedText.trim()) {
        extractedText = "No text was extracted from the image. The image may not contain text or the text might be unclear.";
      }
      
      return extractedText;
    } else {
      throw new Error(result.ErrorMessage || 'OCR processing failed');
    }
  } catch (error) {
    console.error('OCR API error:', error);
    throw new Error('Failed to process the image. Please try again.');
  }
};

// Audio Transcription using AssemblyAI
export const transcribeAudio = async (audioFile: File): Promise<string> => {
  console.log('Transcribing audio file using AssemblyAI:', audioFile.name);

  try {
    // Step 1: Get upload URL from AssemblyAI
    const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: {
        'Authorization': ASSEMBLYAI_API_KEY
      }
    });
    
    const uploadData = await uploadResponse.json();
    const uploadUrl = uploadData.upload_url;

    // Step 2: Upload the file to AssemblyAI
    const fileArrayBuffer = await audioFile.arrayBuffer();
    await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/octet-stream'
      },
      body: fileArrayBuffer
    });

    // Step 3: Start the transcription
    const transcriptResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'Authorization': ASSEMBLYAI_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        audio_url: uploadUrl,
        speaker_labels: true
      })
    });
    
    const transcriptData = await transcriptResponse.json();
    const transcriptId = transcriptData.id;

    // Step 4: Poll for transcription completion
    let status = 'processing';
    let transcriptText = '';
    
    while (status !== 'completed' && status !== 'error') {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for a second
      
      const checkResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        method: 'GET',
        headers: {
          'Authorization': ASSEMBLYAI_API_KEY
        }
      });
      
      const checkData = await checkResponse.json();
      status = checkData.status;
      
      if (status === 'completed') {
        transcriptText = checkData.text || '';
        
        // Format with speaker labels if available
        if (checkData.utterances && checkData.utterances.length > 0) {
          transcriptText = checkData.utterances.map((utterance: any) => {
            return `${utterance.speaker}: "${utterance.text}"`;
          }).join('\n');
        }
      } else if (status === 'error') {
        throw new Error(checkData.error || 'Transcription failed');
      }
    }
    
    return transcriptText || 'No speech detected in the audio file.';
  } catch (error) {
    console.error('AssemblyAI API error:', error);
    throw new Error('Failed to transcribe the audio. Please try again.');
  }
};

// AI Report Generation using Google Gemini API
import { GrowthAreaRating, GrowthAreaType } from '@/types';

export interface ReportGenerationInput {
  childName: string;
  childAge: string;
  date: string;
  theme: string;
  curiositySeed: string;
  ocrText?: string;
  transcription?: string;
  observerNotes?: string;
}

export interface GeneratedReport {
  growthAreas: {
    area: GrowthAreaType;
    rating: GrowthAreaRating;
    observation: string;
    emoji: string;
  }[];
  curiosityResponseIndex: number;
  activatedAreas: number;
  totalAreas: number;
  parentNote: string;
  overallScore: string;
}

export const generateReport = async (input: ReportGenerationInput): Promise<GeneratedReport> => {
  console.log('Generating report with Google Gemini using input:', input);

  try {
    // Prepare the prompt for Gemini
    const prompt = `
    Generate a comprehensive child development report based on the following information:
    
    Child's Name: ${input.childName}
    Child's Age: ${input.childAge}
    Date: ${input.date}
    Theme of the Day: ${input.theme}
    ${input.curiositySeed ? `Curiosity Seed Explored: ${input.curiositySeed}` : ''}
    
    ${input.transcription ? `Audio Transcription: ${input.transcription}` : ''}
    ${input.ocrText ? `OCR Text from Image: ${input.ocrText}` : ''}
    ${input.observerNotes ? `Observer Notes: ${input.observerNotes}` : ''}
    
    Return the output as a JSON object with the following structure:
    {
      "growthAreas": [
        {
          "area": "Intellectual", // One of: Intellectual, Emotional, Social, Creativity, Physical, Values, Independence
          "rating": "excellent", // One of: excellent, good, fair, needs-work
          "observation": "Detailed observation here",
          "emoji": "🧠" // Appropriate emoji for the area
        },
        // More growth areas...
      ],
      "curiosityResponseIndex": 7.5, // Scale of 1-10
      "activatedAreas": 6, // Count of areas with good or excellent ratings
      "totalAreas": 7, // Total number of areas assessed
      "parentNote": "Summary note for parents",
      "overallScore": "Balanced Growth – X/7 Areas Active" // Overall assessment
    }
    
    Ensure all 7 growth areas (Intellectual, Emotional, Social, Creativity, Physical, Values, Independence) are included in the assessment.
    `;

    // Call Gemini API
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GOOGLE_API_KEY
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024
        }
      })
    });

    const responseData = await response.json();
    
    if (responseData.error) {
      throw new Error(responseData.error.message || 'Failed to generate report with AI');
    }

    // Extract the JSON response from the generated text
    const generatedText = responseData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Find JSON within the response if it's wrapped in text
    let jsonMatch = generatedText.match(/(\{[\s\S]*\})/);
    let reportJson = jsonMatch ? jsonMatch[0] : generatedText;
    
    try {
      const report = JSON.parse(reportJson) as GeneratedReport;
      
      // Ensure all required fields are present
      if (!report.growthAreas || !Array.isArray(report.growthAreas)) {
        throw new Error('Missing growth areas in the generated report');
      }
      
      return report;
    } catch (parseError) {
      console.error('Error parsing AI response as JSON:', parseError);
      throw new Error('Failed to parse AI-generated report. Please try again.');
    }
  } catch (error) {
    console.error('Google Gemini API error:', error);
    throw new Error('Failed to generate the report. Please try again.');
  }
};
