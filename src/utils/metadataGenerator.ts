import { FileItem, AppSettings, PlatformMetadata } from '../types';

export const generateMetadataForSingleFile = async (
  file: FileItem,
  settings: AppSettings,
  updateFile: (id: string, updates: Partial<FileItem>) => void,
  getNextWorkingApiKey?: () => string | null,
  markApiKeyAsFailed?: (keyId: string) => void
) => {
  const base64Data = await convertFileToBase64(file.file);
  
  // Start with the currently active API key
  let apiKey = settings.apiKey || settings.apiKeys.find(k => k.isActive)?.key;
  if (!apiKey) {
    throw new Error('No API key available');
  }
  
  let attempts = 0;
  const maxAttempts = Math.max(settings.apiKeys.length * 3, 10); // More attempts per key

  while (attempts < maxAttempts) {
    try {
      const metadata = await generatePlatformMetadata(
        base64Data,
        file.name,
        settings.selectedPlatform,
        settings.metadataSettings,
        apiKey
      );

      const platformKey = settings.selectedPlatform.toLowerCase() as keyof typeof file.metadata;
      updateFile(file.id, {
        metadata: {
          ...file.metadata,
          [platformKey]: metadata
        },
        isGenerating: false
      });
      return;
    } catch (error) {
      attempts++;
      console.log(`Attempt ${attempts} failed for ${file.name}:`, error);
      
      const isRateLimit = error instanceof Error && (
        error.message.includes('429') || 
        error.message.includes('quota') || 
        error.message.includes('rate limit') ||
        error.message.includes('RATE_LIMIT_EXCEEDED') ||
        error.message.includes('Resource has been exhausted')
      );
      
      // Mark key as failed more aggressively for rate limits
      if (getNextWorkingApiKey && markApiKeyAsFailed && attempts < maxAttempts) {
        // Mark key as failed for rate limits after 2 attempts, other errors immediately
        if (!isRateLimit || attempts % 2 === 0) {
          const currentKeyId = settings.activeApiKeyId;
          if (currentKeyId) {
            markApiKeyAsFailed(currentKeyId);
          }
        }
        
        // Try to get next working key
        const nextKey = getNextWorkingApiKey();
        if (nextKey && nextKey !== apiKey) {
          apiKey = nextKey;
          console.log(`Switching to backup API key for ${file.name}`);
          // Very short delay when switching keys
          await new Promise(resolve => setTimeout(resolve, 500));
          continue;
        }
      }
      
      // Shorter delays between retries
      if (attempts < maxAttempts) {
        const delay = isRateLimit ? 1500 : 300; // Reduced delays
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      // If this is the last attempt, throw the error
      if (attempts >= maxAttempts) {
        throw new Error(`Failed after ${maxAttempts} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }
};

export const generateMetadataForPlatform = async (
  files: FileItem[],
  settings: AppSettings,
  setProgress: (current: number, total: number) => void,
  addToast: (type: string, message: string) => void,
  updateFile: (id: string, updates: Partial<FileItem>) => void,
  getNextWorkingApiKey?: () => string | null,
  markApiKeyAsFailed?: (keyId: string) => void
) => {
  let completed = 0;
  const total = files.length;
  let consecutiveFailures = 0;
  const maxConsecutiveFailures = 5; // Reasonable tolerance

  for (const file of files) {
    try {
      updateFile(file.id, { isGenerating: true, error: undefined });
      
      const base64Data = await convertFileToBase64(file.file);
      
      // Start with the currently active API key
      let apiKey = settings.apiKey || settings.apiKeys.find(k => k.isActive)?.key;
      if (!apiKey) {
        throw new Error('No API key available');
      }
      
      let attempts = 0;
      const maxAttempts = Math.max(settings.apiKeys.length * 3, 10); // More attempts per key
      let success = false;

      while (attempts < maxAttempts && !success) {
        try {
          const metadata = await generatePlatformMetadata(
            base64Data,
            file.name,
            settings.selectedPlatform,
            settings.metadataSettings,
            apiKey
          );

          const platformKey = settings.selectedPlatform.toLowerCase() as keyof typeof file.metadata;
          updateFile(file.id, {
            metadata: {
              ...file.metadata,
              [platformKey]: metadata
            },
            isGenerating: false
          });
          success = true;
          consecutiveFailures = 0; // Reset consecutive failures on success
        } catch (error) {
          attempts++;
          console.log(`Attempt ${attempts} failed for ${file.name}:`, error);
          
          // Check if it's a rate limit error
          const isRateLimit = error instanceof Error && (
            error.message.includes('429') || 
            error.message.includes('quota') || 
            error.message.includes('rate limit') ||
            error.message.includes('RATE_LIMIT_EXCEEDED') ||
            error.message.includes('Resource has been exhausted')
          );
          
          // Mark key as failed more aggressively for rate limits
          if (getNextWorkingApiKey && markApiKeyAsFailed && attempts < maxAttempts) {
            // Mark key as failed for rate limits after 2 attempts, other errors immediately
            if (!isRateLimit || attempts % 2 === 0) {
              const currentKeyId = settings.activeApiKeyId;
              if (currentKeyId) {
                markApiKeyAsFailed(currentKeyId);
              }
            }
            
            // Try to get next working key
            const nextKey = getNextWorkingApiKey();
            if (nextKey && nextKey !== apiKey) {
              apiKey = nextKey;
              addToast('info', `Switched to next API key for ${file.name}`);
              
              // Very short delay for key switching
              await new Promise(resolve => setTimeout(resolve, 500));
              continue;
            }
          }
          
          // Shorter delays between retries
          if (attempts < maxAttempts) {
            const delay = isRateLimit ? 1500 : 300; // Reduced delays
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          
          // If this is the last attempt, handle the error
          if (attempts >= maxAttempts) {
            throw error;
          }
        }
      }
      
      completed++;
      setProgress(completed, total);
      
      // Shorter delays between files
      let delay = 200; // Base delay reduced to 200ms
      if (completed > 100) delay = 600; // Reduced delays
      else if (completed > 50) delay = 400;
      else if (completed > 20) delay = 300;
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
    } catch (error) {
      consecutiveFailures++;
      
      const errorMessage = error instanceof Error ? error.message : 'Generation failed';
      updateFile(file.id, { 
        error: errorMessage,
        isGenerating: false 
      });
      
      addToast('error', `Failed to generate metadata for ${file.name}: ${errorMessage}`);
      completed++;
      setProgress(completed, total);
      
      // Handle consecutive failures
      if (consecutiveFailures >= maxConsecutiveFailures) {
        addToast('warning', 'Multiple consecutive failures detected. Switching to next available API key...');
        
        // Try to switch to next working key
        if (getNextWorkingApiKey) {
          const nextKey = getNextWorkingApiKey();
          if (nextKey) {
            addToast('info', 'Switched to next API key due to consecutive failures');
          }
        }
        
        // Short delay after consecutive failures
        await new Promise(resolve => setTimeout(resolve, 1000));
        consecutiveFailures = 0; // Reset after warning
      } else {
        // Very short delay after failure
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
  }
};

export const exportPlatformCSV = (files: FileItem[], platform: string) => {
  const platformKey = platform.toLowerCase() as 'adobestock' | 'freepik' | 'shutterstock';
  const platformFiles = files.filter(f => f.metadata[platformKey]);
  
  if (platformFiles.length === 0) {
    throw new Error(`No ${platform} metadata found to export`);
  }

  // Get current settings for file extension
  const settings = JSON.parse(localStorage.getItem('metaking-settings-v12') || '{}');
  const fileExtension = settings.metadataSettings?.fileExtension || 'original';
  
  // Helper function to change file extension
  const changeFileExtension = (filename: string): string => {
    if (fileExtension === 'original') {
      return filename;
    }
    const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
    return `${nameWithoutExt}${fileExtension}`;
  };

  let csvContent = '';
  let filename = '';

  switch (platform) {
    case 'AdobeStock':
      csvContent = generateCSV(
        ['Filename', 'Title', 'Keywords'],
        platformFiles.map(f => [
          changeFileExtension(f.name),
          f.metadata.adobestock!.title,
          f.metadata.adobestock!.keywords.join(',')
        ])
      );
      filename = `AdobeStock-metadata_${new Date().toISOString().slice(0,10)}.csv`;
      break;
      
    case 'Freepik':
      csvContent = generateCSV(
        ['File name', 'Title', 'Keywords', 'Prompt', 'Base-Model'],
        platformFiles.map(f => [
          changeFileExtension(f.name),
          f.metadata.freepik!.title,
          f.metadata.freepik!.keywords.join(';'),
          '',
          ''
        ]),
        ';'
      );
      filename = `Freepik-metadata_${new Date().toISOString().slice(0,10)}.csv`;
      break;
      
    case 'Shutterstock':
      csvContent = generateCSV(
        ['Filename', 'Description', 'Keywords'],
        platformFiles.map(f => [
          changeFileExtension(f.name),
          f.metadata.shutterstock!.description,
          f.metadata.shutterstock!.keywords.join(',')
        ])
      );
      filename = `Shutterstock-metadata_${new Date().toISOString().slice(0,10)}.csv`;
      break;
      
    default:
      throw new Error('Unknown platform');
  }

  downloadCSV(csvContent, filename);
};

const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      resolve(base64.split(',')[1]); // Remove data:image/jpeg;base64, prefix
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const generatePlatformMetadata = async (
  base64Data: string,
  filename: string,
  platform: string,
  settings: any,
  apiKey: string
): Promise<PlatformMetadata> => {
  const prompt = constructPrompt(filename, platform, settings);
  
  const requestBody = {
    contents: [{
      parts: [
        { text: prompt },
        {
          inline_data: {
            mime_type: 'image/jpeg',
            data: base64Data
          }
        }
      ]
    }]
  };

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;
    
    // Parse specific error messages
    try {
      const errorData = JSON.parse(errorText);
      if (errorData.error?.message) {
        errorMessage = errorData.error.message;
      }
    } catch {
      // If can't parse JSON, use the raw text
      if (errorText) {
        errorMessage += ` - ${errorText}`;
      }
    }
    
    // Add specific handling for common errors
    if (response.status === 429) {
      errorMessage = 'Rate limit exceeded. Switching to next API key...';
    } else if (response.status === 403) {
      errorMessage = 'API key quota exceeded or invalid.';
    } else if (response.status === 400) {
      errorMessage = 'Invalid request. Please check your API key.';
    }
    
    throw new Error(errorMessage);
  }

  const data = await response.json();
  const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!generatedText) {
    throw new Error('No content generated from API response');
  }

  return parseAndProcessApiResponse(generatedText, settings);
};

const constructPrompt = (filename: string, platform: string, settings: any): string => {
  const { minTitleWords, maxTitleWords, minKeywords, maxKeywords, minDescriptionWords, maxDescriptionWords } = settings;
  
  return `[[PROMPT_START]]
PLATFORM: ${platform}
IMAGE_FILENAME: ${filename}
CONSTRAINTS_FOR_GENERATION (ADHERE STRICTLY TO THESE NUMBERS):
Title_Words_Min: ${minTitleWords}
Title_Words_Max: ${maxTitleWords}
Keywords_Count_Min: ${minKeywords}
Keywords_Count_Max: ${maxKeywords}
Description_Words_Min: ${minDescriptionWords}
Description_Words_Max: ${maxDescriptionWords}
---
INSTRUCTIONS:
1. Analyze this image carefully and generate a COMPLETE, DESCRIPTIVE title that fully describes what you see.
2. The title should be between ${minTitleWords} and ${maxTitleWords} words.
3. Generate a comprehensive list of ${minKeywords} to ${maxKeywords} relevant keywords that describe the image content, style, colors, objects, concepts, and themes.
4. Generate a detailed description between ${minDescriptionWords} and ${maxDescriptionWords} words.
5. Generate ONLY based on what you see in the image - do not include any external text or user inputs.

TASK: Analyze this image and provide complete metadata.

OUTPUT_FORMAT (EXACTLY AS FOLLOWS, EACH ON A NEW LINE, NO EXTRA TEXT OR INTRODUCTIONS):
TITLE_AI: [Generated Title Here]
KEYWORDS_AI: [keyword1,keyword2,keyword3,...,keywordN]
DESCRIPTION_AI: [Generated Description Here]
[[PROMPT_END]]`;
};

const parseAndProcessApiResponse = (text: string, settings: any): PlatformMetadata => {
  const lines = text.split('\n').filter(line => line.trim());
  
  let title = '';
  let keywords: string[] = [];
  let description = '';
  
  for (const line of lines) {
    if (line.includes('TITLE_AI:')) {
      title = line.split('TITLE_AI:')[1]?.trim() || '';
    } else if (line.includes('KEYWORDS_AI:')) {
      const keywordText = line.split('KEYWORDS_AI:')[1]?.trim() || '';
      keywords = keywordText.split(',').map(k => k.trim()).filter(k => k);
    } else if (line.includes('DESCRIPTION_AI:')) {
      description = line.split('DESCRIPTION_AI:')[1]?.trim() || '';
    }
  }
  
  // Step 1: Apply title prefix if provided - prepend to AI-generated title
  if (settings.titlePrefix && settings.titlePrefix.trim()) {
    const prefix = settings.titlePrefix.trim();
    title = title ? `${prefix} ${title}` : prefix;
  }
  
  // Step 2: Apply keyword suffix if provided - append to AI-generated keywords as separate elements
  if (settings.keywordSuffix && settings.keywordSuffix.trim()) {
    const userKeywords = settings.keywordSuffix
      .split(',')
      .map(k => k.trim())
      .filter(k => k);
    
    // Append user keywords as separate elements to AI-generated keywords
    if (userKeywords.length > 0) {
      // Remove duplicates by creating a Set and converting back to array
      const combinedKeywords = [...keywords, ...userKeywords];
      keywords = Array.from(new Set(combinedKeywords.map(k => k.toLowerCase())))
        .map(k => {
          // Find original case from combined list
          return combinedKeywords.find(orig => orig.toLowerCase() === k) || k;
        });
    }
  }
  
  // Step 3: Apply length constraints (post-processing)
  const targetMinKeywords = settings.minKeywords;
  const targetMaxKeywords = settings.maxKeywords;
  
  // Keywords: If total count exceeds max, truncate to max (prioritizing AI keywords)
  if (keywords.length > targetMaxKeywords) {
    keywords = keywords.slice(0, targetMaxKeywords);
  }
  
  // Title: If final title word count exceeds max, truncate while preserving meaning
  const titleWords = title.split(' ').filter(word => word.trim());
  if (titleWords.length > settings.maxTitleWords) {
    title = titleWords.slice(0, settings.maxTitleWords).join(' ');
  }
  
  // Description: If word count exceeds max, truncate
  const descriptionWords = description.split(' ').filter(word => word.trim());
  if (descriptionWords.length > settings.maxDescriptionWords) {
    description = descriptionWords.slice(0, settings.maxDescriptionWords).join(' ');
  }
  
  return { title, keywords, description };
};

const generateCSV = (headers: string[], rows: string[][], delimiter: string = ','): string => {
  const csvRows = [headers.join(delimiter)];
  
  for (const row of rows) {
    const escapedRow = row.map(field => {
      if (field.includes(delimiter) || field.includes('"') || field.includes('\n')) {
        return `"${field.replace(/"/g, '""')}"`;
      }
      return field;
    });
    csvRows.push(escapedRow.join(delimiter));
  }
  
  return csvRows.join('\n');
};

const downloadCSV = (csvContent: string, filename: string) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};