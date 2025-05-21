/**
 * AI Integration Services for OCR and Audio Transcription
 */

// OCR integration with OCR.space
export const performOCR = async (imageFile: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('apikey', 'K81647842288957'); // OCR.space API key
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');
    formData.append('filetype', 'jpg');
    formData.append('detectOrientation', 'true');
    formData.append('scale', 'true');
    formData.append('OCREngine', '2'); // More accurate OCR engine

    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (result.OCRExitCode !== 1) {
      throw new Error(result.ErrorMessage || 'OCR processing failed');
    }

    let parsedText = '';
    if (result.ParsedResults && result.ParsedResults.length > 0) {
      parsedText = result.ParsedResults[0].ParsedText;
    }

    return parsedText || 'No text detected';
  } catch (error) {
    console.error('OCR API error:', error);
    throw new Error('Failed to process image with OCR service');
  }
};

// Audio transcription with AssemblyAI
export const transcribeAudio = async (audioFile: File): Promise<string> => {
  try {
    // Step 1: Get upload URL from AssemblyAI
    const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: {
        'authorization': '28257cf1dcde4f1ba91145bd2864b3f5' // AssemblyAI API key
      },
      body: audioFile
    });

    const uploadData = await uploadResponse.json();
    const audioUrl = uploadData.upload_url;

    if (!audioUrl) {
      throw new Error('Failed to upload audio file');
    }

    // Step 2: Submit transcription request
    const transcriptResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'authorization': '28257cf1dcde4f1ba91145bd2864b3f5',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        language_code: 'en_us'
      })
    });

    const transcriptData = await transcriptResponse.json();
    const transcriptId = transcriptData.id;

    if (!transcriptId) {
      throw new Error('Failed to request transcription');
    }

    // Step 3: Poll for transcription result
    let status = 'processing';
    let transcriptText = '';

    while (status !== 'completed' && status !== 'error') {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between polls

      const pollingResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        method: 'GET',
        headers: {
          'authorization': '28257cf1dcde4f1ba91145bd2864b3f5'
        }
      });

      const pollingData = await pollingResponse.json();
      status = pollingData.status;

      if (status === 'completed') {
        transcriptText = pollingData.text;
      } else if (status === 'error') {
        throw new Error(`Transcription error: ${pollingData.error || 'Unknown error'}`);
      }
    }

    return transcriptText || 'No speech detected';
  } catch (error) {
    console.error('Transcription API error:', error);
    throw new Error('Failed to transcribe audio');
  }
};

// Types for report generation
export interface ReportGenerationInput {
  childName: string;
  childAge: string;
  date: string;
  theme: string;
  curiositySeed?: string;
  observerNotes?: string;
  ocrText?: string;
  transcription?: string;
}

export interface GrowthAreaData {
  area: string;
  rating: string;
  observation: string;
  emoji: string;
}

export interface GeneratedReport {
  growthAreas: GrowthAreaData[];
  activatedAreas: number;
  totalAreas: number;
  parentNote: string;
  overallScore: string;
  curiosityResponseIndex: number;
}

// Generate report with Google Gemini
export const generateReport = async (input: ReportGenerationInput): Promise<GeneratedReport> => {
  try {
    // Combine all input text for Gemini
    const allText = [
      `Child: ${input.childName}, Age: ${input.childAge}`,
      `Date: ${input.date}`,
      `Theme: ${input.theme}`,
      input.curiositySeed ? `Curiosity Seed: ${input.curiositySeed}` : '',
      input.observerNotes ? `Observer Notes: ${input.observerNotes}` : '',
      input.ocrText ? `OCR Text: ${input.ocrText}` : '',
      input.transcription ? `Transcription: ${input.transcription}` : '',
    ].filter(Boolean).join('\n\n');

    const reportText = await generateReportWithGemini(allText);
    
    // For now, generate a structured report as a placeholder
    // In production, this would parse the Gemini output in a more robust way
    const mockReport: GeneratedReport = {
      growthAreas: [
        {
          area: 'Intellectual',
          rating: 'excellent',
          observation: `${input.childName} demonstrated strong engagement with the theme of ${input.theme}.`,
          emoji: '🧠'
        },
        {
          area: 'Emotional',
          rating: 'good',
          observation: `${input.childName} showed appropriate emotional responses during activities.`,
          emoji: '❤️'
        },
        {
          area: 'Social',
          rating: 'good',
          observation: `${input.childName} interacted well with peers and teachers.`,
          emoji: '👥'
        },
        {
          area: 'Creativity',
          rating: 'excellent',
          observation: `${input.childName} approached tasks with unusual and innovative ideas.`,
          emoji: '🎨'
        },
        {
          area: 'Physical',
          rating: 'fair',
          observation: `${input.childName} participated in physical activities with moderate enthusiasm.`,
          emoji: '🏃'
        },
        {
          area: 'Values',
          rating: 'good',
          observation: `${input.childName} demonstrated good understanding of fairness and sharing.`,
          emoji: '⭐'
        },
        {
          area: 'Independence',
          rating: 'good',
          observation: `${input.childName} completed most tasks without requiring assistance.`,
          emoji: '🚀'
        }
      ],
      activatedAreas: 5,
      totalAreas: 7,
      parentNote: `${input.childName} had a productive session exploring ${input.theme}. Consider discussing this topic further at home to reinforce learning.`,
      overallScore: "71%",
      curiosityResponseIndex: input.curiositySeed ? 85 : 65,
    };

    return mockReport;
  } catch (error) {
    console.error('Report generation error:', error);
    throw new Error('Failed to generate report');
  }
};

// Generate report with Google Gemini (for future implementation)
export const generateReportWithGemini = async (text: string): Promise<string> => {
  try {
    // This is a placeholder for the Gemini API implementation
    // For now, we'll just return the text as-is

    // In a production environment, we would make an API call to Google Gemini:
    /*
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': 'AIzaSyBawYvfJorhZXY9xQ81kxQVr1967Tj3oaE'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Generate an observer report based on this text: ${text}`
          }]
        }]
      })
    });

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
    */

    // For now, we'll return a formatted version of the input text
    return `## Observer Report\n\nBased on the following text:\n\n${text}\n\n*This is a placeholder for the Gemini-generated report*`;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate report');
  }
};
