export enum UserRole {
  NONE = 'NONE',
  HOST = 'HOST', // The "Android" device
  OPERATOR = 'OPERATOR' // The controller
}

export interface PermissionStep {
  id: string;
  title: string;
  description: string;
  required: boolean;
  granted: boolean;
  iconName: 'Shield' | 'Cast' | 'Accessibility' | 'Wifi' | 'Layers';
}

export interface CommandLog {
  id: string;
  timestamp: number;
  type: 'CLICK' | 'SCROLL' | 'KEY' | 'SYSTEM';
  details: string;
}

export interface RemoteSessionState {
  isConnected: boolean;
  isStreaming: boolean;
  sessionId: string | null;
}

// WebRTC Mock Interface
export interface StreamContextType {
  stream: MediaStream | null;
  startSharing: () => Promise<void>;
  stopSharing: () => void;
  error: string | null;
}
