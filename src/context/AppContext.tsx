import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { FileItem, AppSettings, Toast, ApiKey } from '../types';

interface AppContextType {
  // Files
  files: FileItem[];
  addFiles: (newFiles: File[]) => void;
  clearFiles: () => void;
  updateFile: (id: string, updates: Partial<FileItem>) => void;
  
  // Settings
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  
  // API Keys Management
  apiKeys: ApiKey[];
  addApiKey: (key: string) => Promise<boolean>;
  removeApiKey: (id: string) => void;
  setActiveApiKey: (id: string) => void;
  getActiveApiKey: () => string | null;
  markApiKeyAsFailed: (keyId: string) => void;
  getNextWorkingApiKey: () => string | null;
  resetApiKeyFailures: () => void;
  
  // Progress
  progress: { current: number; total: number };
  setProgress: (current: number, total: number) => void;
  
  // Toast notifications
  toasts: Toast[];
  addToast: (type: Toast['type'], message: string) => void;
  removeToast: (id: string) => void;
  
  // Theme colors
  selectedBackgroundColor: string;
  setSelectedBackgroundColor: (color: string) => void;
  selectedAccentColor: string;
  setSelectedAccentColor: (color: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Validate API key with Gemini API
const validateApiKey = async (key: string): Promise<boolean> => {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    return response.ok;
  } catch {
    return false;
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('metaking-settings-v12');
    const defaultSettings: AppSettings = {
      selectedPlatform: 'AdobeStock',
      metadataSettings: {
        minTitleWords: 8,
        maxTitleWords: 15,
        minKeywords: 40,
        maxKeywords: 45,
        minDescriptionWords: 10,
        maxDescriptionWords: 20,
        titlePrefix: '',
        keywordSuffix: '',
        fileExtension: 'original',
      },
      apiKey: '',
      apiKeys: [],
      activeApiKeyId: undefined
    };
    
    if (saved) {
      const parsedSettings = JSON.parse(saved);
      // Migrate old single API key to new system
      if (parsedSettings.apiKey && !parsedSettings.apiKeys?.length) {
        const migratedKey: ApiKey = {
          id: crypto.randomUUID(),
          key: parsedSettings.apiKey,
          maskedKey: `${parsedSettings.apiKey.slice(0, 8)}...${parsedSettings.apiKey.slice(-4)}`,
          isActive: true,
          isValid: true,
          failureCount: 0
        };
        parsedSettings.apiKeys = [migratedKey];
        parsedSettings.activeApiKeyId = migratedKey.id;
      }
      return { ...defaultSettings, ...parsedSettings };
    }
    return defaultSettings;
  });
  
  const [progress, setProgressState] = useState({ current: 0, total: 0 });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [selectedBackgroundColor, setSelectedBackgroundColorState] = useState(() => {
    return localStorage.getItem('metaking-background-color-v12') || 'deepoceanblue';
  });
  const [selectedAccentColor, setSelectedAccentColorState] = useState(() => {
    return localStorage.getItem('metaking-accent-color-v12') || 'coralorange';
  });

  // Apply background color theme on load and change
  useEffect(() => {
    const backgroundColors = {
      deepoceanblue: '#004D66',
      steelblue: '#4682B4',
      cadetblue: '#5F9EA0',
      darkmidnightblue: '#003366',
      charcoalblue: '#2E4053',
      deeppurple: '#4A235A',
      richpurple: '#6C3483',
      forestgreen: '#145A32',
      darkslategray: '#4D5656',
      deepmaroon: '#78281F',
    };

    const color = backgroundColors[selectedBackgroundColor as keyof typeof backgroundColors] || backgroundColors.deepoceanblue;
    document.documentElement.style.setProperty('--color-page-bg', color);
    
    // Set text color based on background darkness (all these colors are dark)
    document.documentElement.style.setProperty('--color-page-text', '#FFFFFF');
  }, [selectedBackgroundColor]);

  // Apply accent color theme on load and change
  useEffect(() => {
    const accentColors = {
      coralorange: { r: 255, g: 127, b: 80 },
      brightorange: { r: 255, g: 107, b: 53 },
      electricblue: { r: 0, g: 127, b: 255 },
      limegreen: { r: 50, g: 205, b: 50 },
      deeppink: { r: 255, g: 20, b: 147 },
      goldenyellow: { r: 255, g: 215, b: 0 },
      royalpurple: { r: 120, g: 81, b: 169 },
      crimsonred: { r: 220, g: 20, b: 60 },
      oceanblue: { r: 0, g: 105, b: 148 },
      emeraldgreen: { r: 80, g: 200, b: 120 },
    };

    const color = accentColors[selectedAccentColor as keyof typeof accentColors] || accentColors.coralorange;
    const root = document.documentElement;
    
    root.style.setProperty('--color-primary-500', `${color.r} ${color.g} ${color.b}`);
    root.style.setProperty('--color-primary-600', `${Math.max(0, color.r-20)} ${Math.max(0, color.g-20)} ${Math.max(0, color.b-20)}`);
    root.style.setProperty('--color-primary-400', `${Math.min(255, color.r+20)} ${Math.min(255, color.g+20)} ${Math.min(255, color.b+20)}`);
    root.style.setProperty('--color-primary-100', `${Math.min(255, color.r+100)} ${Math.min(255, color.g+100)} ${Math.min(255, color.b+100)}`);
  }, [selectedAccentColor]);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('metaking-settings-v12', JSON.stringify(settings));
  }, [settings]);

  const addFiles = useCallback((newFiles: File[]) => {
    const fileItems: FileItem[] = newFiles.map(file => ({
      id: crypto.randomUUID(),
      file,
      name: file.name,
      preview: URL.createObjectURL(file),
      type: 'image', // All files are now images (JPG/PNG only)
      metadata: {}
    }));
    
    setFiles(prev => [...prev, ...fileItems]);
  }, []);

  const clearFiles = useCallback(() => {
    files.forEach(file => URL.revokeObjectURL(file.preview));
    setFiles([]);
    setProgressState({ current: 0, total: 0 });
  }, [files]);

  const updateFile = useCallback((id: string, updates: Partial<FileItem>) => {
    setFiles(prev => prev.map(file => 
      file.id === id ? { ...file, ...updates } : file
    ));
  }, []);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  // API Keys Management - IMPROVED VERSION
  const addApiKey = useCallback(async (key: string): Promise<boolean> => {
    try {
      const isValid = await validateApiKey(key);
      if (!isValid) return false;

      const newApiKey: ApiKey = {
        id: crypto.randomUUID(),
        key: key.trim(),
        maskedKey: `${key.slice(0, 8)}...${key.slice(-4)}`,
        isActive: false, // Don't auto-activate, let user choose
        isValid: true,
        failureCount: 0,
        lastUsed: new Date().toISOString()
      };

      const updatedApiKeys = [...settings.apiKeys, newApiKey];
      
      // If no active key exists, make this the first active key
      if (!settings.activeApiKeyId) {
        newApiKey.isActive = true;
      }
      
      const updatedSettings = {
        ...settings,
        apiKeys: updatedApiKeys,
        activeApiKeyId: newApiKey.isActive ? newApiKey.id : settings.activeApiKeyId,
        apiKey: newApiKey.isActive ? newApiKey.key : settings.apiKey
      };

      setSettings(updatedSettings);
      return true;
    } catch {
      return false;
    }
  }, [settings]);

  const removeApiKey = useCallback((id: string) => {
    const keyToRemove = settings.apiKeys.find(k => k.id === id);
    const updatedApiKeys = settings.apiKeys.filter(k => k.id !== id);
    
    let newActiveKeyId = settings.activeApiKeyId;
    let newApiKey = settings.apiKey;

    // If we're removing the active key, set a new active key
    if (keyToRemove?.isActive && updatedApiKeys.length > 0) {
      // Find the next key in sequence or use the first one
      const currentIndex = settings.apiKeys.findIndex(k => k.id === id);
      const nextIndex = currentIndex < updatedApiKeys.length ? currentIndex : 0;
      const newActiveKey = updatedApiKeys[nextIndex];
      newActiveKey.isActive = true;
      newActiveKeyId = newActiveKey.id;
      newApiKey = newActiveKey.key;
    } else if (updatedApiKeys.length === 0) {
      newActiveKeyId = undefined;
      newApiKey = '';
    }

    setSettings(prev => ({
      ...prev,
      apiKeys: updatedApiKeys,
      activeApiKeyId: newActiveKeyId,
      apiKey: newApiKey
    }));
  }, [settings]);

  const setActiveApiKey = useCallback((id: string) => {
    const updatedApiKeys = settings.apiKeys.map(key => ({
      ...key,
      isActive: key.id === id,
      lastUsed: key.id === id ? new Date().toISOString() : key.lastUsed
    }));

    const activeKey = updatedApiKeys.find(k => k.id === id);
    
    setSettings(prev => ({
      ...prev,
      apiKeys: updatedApiKeys,
      activeApiKeyId: id,
      apiKey: activeKey?.key || ''
    }));
  }, [settings]);

  const getActiveApiKey = useCallback((): string | null => {
    const activeKey = settings.apiKeys.find(k => k.isActive);
    return activeKey?.key || null;
  }, [settings.apiKeys]);

  // Mark API key as failed and update last used
  const markApiKeyAsFailed = useCallback((keyId: string) => {
    const updatedApiKeys = settings.apiKeys.map(key => {
      if (key.id === keyId) {
        const newFailureCount = key.failureCount + 1;
        return {
          ...key,
          failureCount: newFailureCount,
          lastUsed: new Date().toISOString(),
          // Mark as invalid after 15 failures (reasonable threshold)
          isValid: newFailureCount < 15
        };
      }
      return key;
    });

    setSettings(prev => ({
      ...prev,
      apiKeys: updatedApiKeys
    }));
  }, [settings.apiKeys]);

  // Get next working API key in sequence
  const getNextWorkingApiKey = useCallback((): string | null => {
    const currentActiveIndex = settings.apiKeys.findIndex(k => k.isActive);
    
    // Try to find the next working key in sequence starting from current active key
    for (let i = 1; i <= settings.apiKeys.length; i++) {
      const nextIndex = (currentActiveIndex + i) % settings.apiKeys.length;
      const nextKey = settings.apiKeys[nextIndex];
      
      // Check if this key is still valid and has reasonable failure count
      if (nextKey && nextKey.isValid && nextKey.failureCount < 10) {
        // Switch to this key
        setActiveApiKey(nextKey.id);
        return nextKey.key;
      }
    }
    
    // If no good keys found in sequence, try any valid key with lower failure count
    const fallbackKeys = settings.apiKeys
      .filter(k => k.isValid && k.failureCount < 15)
      .sort((a, b) => a.failureCount - b.failureCount);
      
    if (fallbackKeys.length > 0) {
      const fallbackKey = fallbackKeys[0];
      setActiveApiKey(fallbackKey.id);
      return fallbackKey.key;
    }

    // Last resort: try any key with less than 20 failures
    const lastResortKeys = settings.apiKeys
      .filter(k => k.failureCount < 20)
      .sort((a, b) => a.failureCount - b.failureCount);
      
    if (lastResortKeys.length > 0) {
      const lastResortKey = lastResortKeys[0];
      setActiveApiKey(lastResortKey.id);
      return lastResortKey.key;
    }

    return null;
  }, [settings.apiKeys, setActiveApiKey]);

  const resetApiKeyFailures = useCallback(() => {
    const updatedApiKeys = settings.apiKeys.map(key => ({
      ...key,
      failureCount: 0,
      isValid: true
    }));

    setSettings(prev => ({
      ...prev,
      apiKeys: updatedApiKeys
    }));
  }, [settings.apiKeys]);

  const setProgress = useCallback((current: number, total: number) => {
    setProgressState({ current, total });
  }, []);

  const addToast = useCallback((type: Toast['type'], message: string) => {
    const id = crypto.randomUUID();
    const toast: Toast = { id, type, message };
    
    setToasts(prev => [...prev, toast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const setSelectedBackgroundColor = useCallback((color: string) => {
    setSelectedBackgroundColorState(color);
    localStorage.setItem('metaking-background-color-v12', color);
  }, []);

  const setSelectedAccentColor = useCallback((color: string) => {
    setSelectedAccentColorState(color);
    localStorage.setItem('metaking-accent-color-v12', color);
  }, []);

  return (
    <AppContext.Provider value={{
      files,
      addFiles,
      clearFiles,
      updateFile,
      settings,
      updateSettings,
      apiKeys: settings.apiKeys,
      addApiKey,
      removeApiKey,
      setActiveApiKey,
      getActiveApiKey,
      markApiKeyAsFailed,
      getNextWorkingApiKey,
      resetApiKeyFailures,
      progress,
      setProgress,
      toasts,
      addToast,
      removeToast,
      selectedBackgroundColor,
      setSelectedBackgroundColor,
      selectedAccentColor,
      setSelectedAccentColor
    }}>
      {children}
    </AppContext.Provider>
  );
};