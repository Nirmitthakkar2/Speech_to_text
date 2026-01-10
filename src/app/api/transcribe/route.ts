import { NextRequest, NextResponse } from 'next/server';
import { TranscribeResponse, ApiError } from '@/types';

const WHISPER_BACKEND_URL = process.env.WHISPER_BACKEND_URL || 'http://localhost:8000';
const TIMEOUT_MS = 60000; // 60 second timeout for transcription

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio');

    if (!audioFile || !(audioFile instanceof Blob)) {
      return NextResponse.json<ApiError>(
        { error: 'Invalid request', message: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Create form data for Python backend
    const backendFormData = new FormData();
    backendFormData.append('file', audioFile, 'audio.webm');

    // Forward to Python Whisper backend with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(`${WHISPER_BACKEND_URL}/transcribe`, {
        method: 'POST',
        body: backendFormData,
        signal: controller.signal
      });
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        return NextResponse.json<ApiError>(
          { error: 'Timeout', message: 'Transcription taking too long. Try shorter recording.' },
          { status: 504 }
        );
      }
      return NextResponse.json<ApiError>(
        { error: 'Connection failed', message: 'Cannot connect to transcription server. Is the backend running?' },
        { status: 503 }
      );
    }
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json<ApiError>(
        {
          error: 'Transcription failed',
          message: errorData.detail || `Backend error: ${response.status}`
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Check for empty transcription
    if (!data.text || data.text.trim() === '') {
      return NextResponse.json<ApiError>(
        { error: 'Empty transcription', message: 'No speech detected. Try speaking louder.' },
        { status: 422 }
      );
    }

    return NextResponse.json<TranscribeResponse>({
      text: data.text,
      duration: data.duration || 0
    });
  } catch (error) {
    console.error('Transcribe API error:', error);
    return NextResponse.json<ApiError>(
      {
        error: 'Transcription failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
