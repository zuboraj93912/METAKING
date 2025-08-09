import React, { useState, useEffect } from 'react';
import { X, Key, ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ApiKeyModalProps {
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onClose }) => {
  const { settings, updateSettings, addToast } = useApp();
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');

  useEffect(() => {
    if (settings.apiKey) {
      setValidationStatus('valid');
    }
  }, [settings.apiKey]);

  const validateApiKey = async (key: string): Promise<boolean> => {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
      return response.ok;
    } catch {
      return false;
    }
  };

  const handleSaveAndValidate = async () => {
    if (!apiKey.trim()) {
      addToast('error', 'Please enter an API key');
      return;
    }

    setIsValidating(true);
    setValidationStatus('idle');

    try {
      const isValid = await validateApiKey(apiKey.trim());
      
      if (isValid) {
        updateSettings({ apiKey: apiKey.trim() });
        setValidationStatus('valid');
        addToast('success', 'API key saved and validated successfully!');
      } else {
        setValidationStatus('invalid');
        addToast('error', 'Invalid API key. Please check your key and try again.');
      }
    } catch {
      setValidationStatus('invalid');
      addToast('error', 'Failed to validate API key');
    } finally {
      setIsValidating(false);
    }
  };

  const getStatusDisplay = () => {
    switch (validationStatus) {
      case 'valid':
        return (
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle className="w-4 h-4" />
            <span>Valid</span>
          </div>
        );
      case 'invalid':
        return (
          <div className="flex items-center gap-2 text-red-400">
            <XCircle className="w-4 h-4" />
            <span>Invalid</span>
          </div>
        );
      default:
        return <span className="text-gray-400">Not validated</span>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Key className="w-6 h-6 text-primary-500" />
            <h2 className="text-xl font-semibold text-white">
              Set Your Gemini API Key
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Enter your Gemini API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Gemini API key"
              className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleSaveAndValidate()}
            />
          </div>

          <button
            onClick={handleSaveAndValidate}
            disabled={isValidating || !apiKey.trim()}
            className="w-full px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 text-white rounded-lg transition-colors"
          >
            {isValidating ? 'Validating...' : 'Save & Validate API Key'}
          </button>

          <div className="flex items-center gap-2 text-sm">
            <ExternalLink className="w-4 h-4 text-gray-400" />
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-400 hover:text-primary-300 transition-colors"
            >
              Get Gemini API Key
            </a>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <span className="text-sm text-gray-300">API Key Status:</span>
            {getStatusDisplay()}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 bg-gray-700/50">
          <div className="text-sm text-gray-400">
            <p>
              <strong>Note:</strong> Your API key is stored locally in your browser and is used only to communicate directly with Google's Gemini API.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};