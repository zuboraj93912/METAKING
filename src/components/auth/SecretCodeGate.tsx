import React, { useState } from 'react';
import { X, Lock, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SecretCodeGateProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const SecretCodeGate: React.FC<SecretCodeGateProps> = ({ onClose, onSuccess }) => {
  const { validateSecretCode } = useAuth();
  const [secretCode, setSecretCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!secretCode.trim()) {
      setError('Please enter the secret code');
      return;
    }

    setIsValidating(true);
    setError('');

    // Simulate validation delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (validateSecretCode(secretCode.trim())) {
      onSuccess();
    } else {
      setError('Invalid Secret Code. Please try again or contact for access.');
    }

    setIsValidating(false);
  };

  const handleContactWhatsApp = () => {
    window.open('https://wa.me/8801521549709', '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-component rounded-xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Lock className="w-6 h-6 text-primary-500" />
            <h2 className="text-xl font-semibold text-component-text">
              Access Required
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
        <div className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold text-component-text mb-2">
              Enter Secret Code to Sign Up
            </h3>
            <p className="text-component-text/70">
              You need a secret code to create an account and access the metadata generator.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-component-text mb-2">
                Secret Code
              </label>
              <div className="relative">
                <input
                  type={showCode ? 'text' : 'password'}
                  value={secretCode}
                  onChange={(e) => setSecretCode(e.target.value)}
                  placeholder="Enter your secret code"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-component-text placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowCode(!showCode)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                >
                  {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isValidating}
              className="w-full px-4 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium"
            >
              {isValidating ? 'Validating...' : 'Verify Code'}
            </button>
          </form>

          {/* Contact Button */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-component-text/70 mb-3">
                Don't have a secret code?
              </p>
              <button
                onClick={handleContactWhatsApp}
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-bold text-lg shadow-lg"
              >
                <ExternalLink className="w-5 h-5" />
                TO GET SECRET CODE CONTACT HERE
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};