// Recording stored in localStorage (no audio - text only)
export interface Recording {
  id: string;              // UUID
  timestamp: number;       // Unix timestamp (ms)
  duration: number;        // Recording duration in seconds
  rawText: string;         // Original Whisper output
  refinedText: string;     // LLM-refined output
}

// API response types
export interface TranscribeResponse {
  text: string;
  duration: number;
}

export interface RefineResponse {
  refined: string;
}

export interface ApiError {
  error: string;
  message: string;
}

// Component state
export interface RecorderState {
  status: 'idle' | 'recording' | 'processing';
  elapsedTime: number;
  error: string | null;
}

// Whisper backend response
export interface WhisperResponse {
  text: string;
  duration: number;
  language: string;
}
