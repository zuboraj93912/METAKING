import React from 'react';
import { Copy, Loader2, RefreshCw, Image, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FileItem } from '../types';
import { generateMetadataForSingleFile } from '../utils/metadataGenerator';

interface FileCardProps {
  file: FileItem;
}

export const FileCard: React.FC<FileCardProps> = ({ file }) => {
  const { settings, updateFile, addToast, getNextWorkingApiKey, markApiKeyAsFailed } = useApp();

  const handleGenerate = async () => {
    if (!settings.apiKey && settings.apiKeys.length === 0) {
      addToast('error', 'Please add at least one Gemini API key first.');
      return;
    }

    updateFile(file.id, { isGenerating: true, error: undefined });

    try {
      await generateMetadataForSingleFile(
        file, 
        settings, 
        updateFile, 
        getNextWorkingApiKey, 
        markApiKeyAsFailed
      );
      addToast('success', `Metadata generated for ${file.name}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Generation failed';
      updateFile(file.id, { 
        error: errorMessage,
        isGenerating: false 
      });
      addToast('error', errorMessage);
    }
  };

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      addToast('success', `${type} copied to clipboard!`);
    } catch {
      addToast('error', 'Failed to copy to clipboard');
    }
  };

  const currentMetadata = file.metadata[settings.selectedPlatform.toLowerCase() as keyof typeof file.metadata];
  const hasResult = !!currentMetadata;

  const getPlatformStatus = (platform: 'adobestock' | 'freepik' | 'shutterstock') => {
    const metadata = file.metadata[platform];
    if (metadata) return 'completed';
    if (file.isGenerating && settings.selectedPlatform.toLowerCase() === platform) return 'generating';
    return 'pending';
  };

  const StatusIcon: React.FC<{ status: 'completed' | 'generating' | 'pending'; platform: string }> = ({ status, platform }) => {
    const platformIcons = {
      adobestock: '🅰️',
      freepik: '🎨',
      shutterstock: '📸'
    };

    switch (status) {
      case 'completed':
        return (
          <div className="flex items-center gap-2 text-green-500" title={`${platform} - Completed`}>
            <span className="text-xl">{platformIcons[platform as keyof typeof platformIcons]}</span>
            <CheckCircle className="w-5 h-5" />
          </div>
        );
      case 'generating':
        return (
          <div className="flex items-center gap-2 text-primary-500" title={`${platform} - Generating`}>
            <span className="text-xl">{platformIcons[platform as keyof typeof platformIcons]}</span>
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 text-gray-400" title={`${platform} - Pending`}>
            <span className="text-xl">{platformIcons[platform as keyof typeof platformIcons]}</span>
            <Clock className="w-5 h-5" />
          </div>
        );
    }
  };

  return (
    <div className="bg-component rounded-xl shadow-xl overflow-hidden border border-gray-200 transition-all duration-200 hover:shadow-2xl">
      {/* File Preview */}
      <div className="relative aspect-video bg-gray-100">
        <img
          src={file.preview}
          alt={file.name}
          className="w-full h-full object-contain"
        />
        
        {/* File Type Badge */}
        <div className="absolute top-4 left-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-black bg-opacity-70 text-white text-sm rounded-full">
            <Image className="w-4 h-4" />
            <span className="uppercase font-bold">IMAGE</span>
          </div>
        </div>
      </div>

      {/* File Info */}
      <div className="p-6">
        <h3 className="font-bold text-component-text mb-3 truncate text-center text-lg" title={file.name}>
          {file.name}
        </h3>

        {/* Platform Status Indicators */}
        <div className="flex items-center justify-center gap-6 mb-6 p-3 bg-gray-50 rounded-xl">
          <StatusIcon status={getPlatformStatus('adobestock')} platform="Adobe Stock" />
          <StatusIcon status={getPlatformStatus('freepik')} platform="Freepik" />
          <StatusIcon status={getPlatformStatus('shutterstock')} platform="Shutterstock" />
        </div>

        {/* Error Display */}
        {file.error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-700 font-medium">{file.error}</p>
          </div>
        )}

        {/* Current Platform Results */}
        {hasResult && (
          <div className="mb-6 space-y-4">
            <div className="text-lg font-bold text-primary-500 mb-3 text-center">
              {settings.selectedPlatform} Metadata:
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">
                Title:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={currentMetadata?.title || ''}
                  readOnly
                  className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 pr-12 text-sm"
                />
                <button
                  onClick={() => handleCopy(currentMetadata?.title || '', 'Title')}
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {currentMetadata?.keywords && currentMetadata.keywords.length > 0 && (
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">
                  Keywords ({currentMetadata.keywords.length}):
                </label>
                <div className="flex flex-wrap gap-2 mb-3 max-h-20 overflow-y-auto">
                  {currentMetadata.keywords.slice(0, 8).map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full font-medium"
                    >
                      {keyword}
                    </span>
                  ))}
                  {currentMetadata.keywords.length > 8 && (
                    <span className="px-3 py-1 bg-gray-200 text-gray-600 text-sm rounded-full font-medium">
                      +{currentMetadata.keywords.length - 8} more
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleCopy(currentMetadata.keywords.join(', '), 'Keywords')}
                  className="text-sm text-primary-500 hover:text-primary-600 transition-colors font-medium"
                >
                  Copy all keywords
                </button>
              </div>
            )}

            {currentMetadata?.description && (
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">
                  Description:
                </label>
                <div className="relative">
                  <textarea
                    value={currentMetadata.description}
                    readOnly
                    className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 resize-none text-sm"
                    rows={3}
                  />
                  <button
                    onClick={() => handleCopy(currentMetadata.description, 'Description')}
                    className="absolute top-3 right-3 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={file.isGenerating}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 text-white rounded-xl transition-colors font-bold text-lg"
        >
          {file.isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <RefreshCw className="w-5 h-5" />
              {hasResult ? 'Regenerate' : 'Generate'} for {settings.selectedPlatform}
            </>
          )}
        </button>
      </div>
    </div>
  );
};