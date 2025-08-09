export interface FileItem {
  id: string;
  file: File;
  name: string;
  preview: string;
  type: 'image'; // Only image type now (JPG/PNG)
  metadata: {
    adobestock?: PlatformMetadata;
    freepik?: PlatformMetadata;
    shutterstock?: PlatformMetadata;
  };
  isGenerating?: boolean;
  error?: string;
}

export interface PlatformMetadata {
  title: string;
  keywords: string[];
  description: string;
}

export interface MetadataSettings {
  minTitleWords: number;
  maxTitleWords: number;
  minKeywords: number;
  maxKeywords: number;
  minDescriptionWords: number;
  maxDescriptionWords: number;
}

export interface ApiKey {
  id: string;
  key: string;
  maskedKey: string;
  isActive: boolean;
  isValid: boolean;
  lastUsed?: string;
  failureCount: number;
}

export interface AppSettings {
  selectedPlatform: 'AdobeStock' | 'Freepik' | 'Shutterstock';
  metadataSettings: MetadataSettings;
  apiKey: string; // Keep for backward compatibility
  apiKeys: ApiKey[];
  activeApiKeyId?: string;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}