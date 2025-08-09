import React, { useState } from 'react';
import { X, Key, Plus, Trash2, Check, ExternalLink, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ApiSecretsModalProps {
  onClose: () => void;
}

export const ApiSecretsModal: React.FC<ApiSecretsModalProps> = ({ onClose }) => {
  const { apiKeys, addApiKey, removeApiKey, setActiveApiKey, resetApiKeyFailures, addToast } = useApp();
  const [newApiKey, setNewApiKey] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});

  const handleAddApiKey = async () => {
    if (!newApiKey.trim()) {
      addToast('error', 'Please enter an API key');
      return;
    }

    setIsAdding(true);
    try {
      const success = await addApiKey(newApiKey.trim());
      if (success) {
        setNewApiKey('');
        addToast('success', 'API key added successfully!');
      } else {
        addToast('error', 'Invalid API key. Please check your key and try again.');
      }
    } catch {
      addToast('error', 'Failed to validate API key');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveKey = (id: string) => {
    removeApiKey(id);
    addToast('success', 'API key removed');
  };

  const handleSetActiveKey = (id: string) => {
    setActiveApiKey(id);
    addToast('success', 'API key activated');
  };

  const handleResetFailures = () => {
    resetApiKeyFailures();
    addToast('success', 'All API key failure counts have been reset');
  };

  const toggleShowKey = (id: string) => {
    setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getKeyStatusColor = (key: any) => {
    if (!key.isValid) return 'bg-red-100 text-red-700';
    if (key.failureCount >= 10) return 'bg-yellow-100 text-yellow-700'; // Updated threshold
    return 'bg-green-100 text-green-700';
  };

  const getKeyStatusText = (key: any) => {
    if (!key.isValid) return 'Invalid';
    if (key.failureCount >= 10) return 'High Failures'; // Updated threshold
    if (key.failureCount >= 5) return 'Some Failures';
    return 'Valid';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-component rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Key className="w-6 h-6 text-primary-500" />
            <h2 className="text-xl font-semibold text-component-text">
              Manage Gemini API Keys
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-80px)] overflow-y-auto">
          {/* Add New Key Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-component-text mb-2">
              Add New API Key
            </label>
            <div className="flex gap-3">
              <input
                type="password"
                value={newApiKey}
                onChange={(e) => setNewApiKey(e.target.value)}
                placeholder="Enter your Gemini API key"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white text-component-text placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleAddApiKey()}
              />
              <button
                onClick={handleAddApiKey}
                disabled={isAdding || !newApiKey.trim()}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {isAdding ? 'Adding...' : 'Add Key'}
              </button>
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm text-component-text/70">
              <ExternalLink className="w-4 h-4" />
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-500 hover:text-primary-600 transition-colors"
              >
                Get your Gemini API key here
              </a>
            </div>
          </div>

          {/* Reset Failures Button */}
          {apiKeys.length > 0 && apiKeys.some(k => k.failureCount > 0) && (
            <div className="mb-6">
              <button
                onClick={handleResetFailures}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Reset All Failure Counts
              </button>
              <p className="text-sm text-component-text/70 mt-2">
                <strong>Improved:</strong> API keys are now much more tolerant. They only get marked as invalid after 20 failures instead of 5.
              </p>
            </div>
          )}

          {/* Existing Keys */}
          {apiKeys.length > 0 && (
            <div>
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>How it works:</strong> Select any API key to start with. The system will automatically switch to the next key in sequence when the current one reaches its limit.
                </p>
              </div>
              <h3 className="text-lg font-medium text-component-text mb-4">
                Your API Keys ({apiKeys.length})
              </h3>
              <div className="space-y-3">
                {apiKeys.map((key) => (
                  <div
                    key={key.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      key.isActive
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="font-mono text-sm text-component-text">
                            {showKeys[key.id] ? key.key : key.maskedKey}
                          </div>
                          <button
                            onClick={() => toggleShowKey(key.id)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            {showKeys[key.id] ? (
                              <EyeOff className="w-4 h-4 text-gray-500" />
                            ) : (
                              <Eye className="w-4 h-4 text-gray-500" />
                            )}
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${getKeyStatusColor(key)}`}>
                            {getKeyStatusText(key)}
                          </span>
                          {key.isActive && (
                            <span className="text-xs px-2 py-1 rounded-full bg-primary-100 text-primary-700 flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              Active
                            </span>
                          )}
                          {key.failureCount > 0 && (
                            <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700">
                              Failures: {key.failureCount}
                            </span>
                          )}
                          {key.lastUsed && (
                            <span className="text-xs text-gray-500">
                              Last used: {new Date(key.lastUsed).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!key.isActive && (
                          <button
                            onClick={() => handleSetActiveKey(key.id)}
                            className="px-3 py-1 text-sm bg-primary-500 hover:bg-primary-600 text-white rounded transition-colors"
                          >
                            Use
                          </button>
                        )}
                        <button
                          onClick={() => handleRemoveKey(key.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {apiKeys.length === 0 && (
            <div className="text-center py-8">
              <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-component-text mb-2">
                No API Keys Added
              </h3>
              <p className="text-component-text/70">
                Add your first Gemini API key to start generating content.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-component-text/70">
            <p className="mb-2">
              <strong>Sequential API Key Management:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>API keys are now much more tolerant - only marked invalid after 20 failures</li>
              <li>Faster switching between keys when rate limits are hit</li>
              <li>Select any API key to start generation from that key</li>
              <li>System automatically switches to next key when current one hits limits</li>
              <li>Keys are used in sequence - after the last key, it cycles back to the first</li>
              <li>Failed keys are marked and skipped until manually reset</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};