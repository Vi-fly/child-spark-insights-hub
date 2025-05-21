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
