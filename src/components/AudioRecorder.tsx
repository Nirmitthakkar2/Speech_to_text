import { useState, useRef, useCallback, useEffect } from 'react';
import { Recording, RecorderState } from '../types';

interface AudioRecorderProps {
  onRecordingComplete: (recording: Recording) => void;
  onError: (error: string) => void;
}

const MAX_RECORDING_TIME = 5 * 60 * 1000; // 5 minutes in ms
const MIN_RECORDING_TIME = 1000; // 1 second in ms

// Extend Window interface for speech recognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

export default function AudioRecorder({ onRecordingComplete, onError }: AudioRecorderProps) {
  const [state, setState] = useState<RecorderState>({
    status: 'idle',
    elapsedTime: 0,
    error: null
  });
  const [waveformData, setWaveformData] = useState<number[]>(new Array(12).fill(10));
  const [transcribedText, setTranscribedText] = useState('');

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const transcriptRef = useRef<string>('');

  // Cleanup function
  const cleanup = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    analyserRef.current = null;
    setWaveformData(new Array(12).fill(10));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Format time as MM:SS
  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Animate waveform based on audio data
  const updateWaveform = useCallback(() => {
    if (!analyserRef.current || state.status !== 'recording') {
      setWaveformData(new Array(12).fill(10));
      return;
    }

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Sample 12 frequency bands for the bars
    const bars: number[] = [];
    const step = Math.floor(dataArray.length / 12);
    for (let i = 0; i < 12; i++) {
      const value = dataArray[i * step];
      // Map 0-255 to 10-40px height
      const height = 10 + (value / 255) * 30;
      bars.push(height);
    }
    setWaveformData(bars);

    animationFrameRef.current = requestAnimationFrame(updateWaveform);
  }, [state.status]);

  // Refine text with OpenRouter
  const refineText = async (rawText: string): Promise<string> => {
    const apiKey = localStorage.getItem('openrouter_api_key');
    const modelId = localStorage.getItem('openrouter_model_id') || 'xiaomi/mimo-v2-flash:free';

    if (!apiKey) {
      return rawText; // Return raw text if no API key
    }

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Speech to Text Pro'
        },
        body: JSON.stringify({
          model: modelId,
          messages: [
            {
              role: 'system',
              content: `Transform speech-to-text output into clear, professional text. Preserve meaning and intent.

Rules:
- Add proper punctuation and capitalization
- Remove filler words (um, uh, like, you know)
- Fix grammar and awkward phrasing
- Break run-on sentences
- Correct speech recognition errors
- Keep speaker's voice, tone, terminology
- Preserve names and technical terms
- Do not add new information

Output only the refined text.`
            },
            { role: 'user', content: rawText }
          ],
          temperature: 0.3,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        return rawText;
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || rawText;
    } catch {
      return rawText;
    }
  };

  // Start recording
  const startRecording = async () => {
    // Check for speech recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      onError('Speech recognition not supported. Try Chrome, Edge, or Safari.');
      return;
    }

    try {
      cleanup();
      setState({ status: 'recording', elapsedTime: 0, error: null });
      transcriptRef.current = '';
      setTranscribedText('');

      // Request microphone access for waveform visualization
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Set up audio analyser for waveform
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Start waveform animation
      animationFrameRef.current = requestAnimationFrame(updateWaveform);

      // Initialize speech recognition
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognitionRef.current = recognition;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          transcriptRef.current += finalTranscript;
        }
        setTranscribedText(transcriptRef.current + interimTranscript);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error === 'no-speech') {
          // Ignore no-speech errors, they're common
          return;
        }
        console.error('Speech recognition error:', event.error);
      };

      recognition.onend = () => {
        // Restart if still recording
        if (state.status === 'recording' && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch {
            // Ignore errors when restarting
          }
        }
      };

      recognition.start();
      startTimeRef.current = Date.now();

      timerIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        setState(prev => ({ ...prev, elapsedTime: elapsed }));

        // Auto-stop at max recording time
        if (elapsed >= MAX_RECORDING_TIME) {
          stopRecording();
        }
      }, 100);
    } catch (error) {
      cleanup();
      setState({ status: 'idle', elapsedTime: 0, error: null });
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          onError('Please allow microphone access');
        } else {
          onError(error.message);
        }
      } else {
        onError('Failed to start recording');
      }
    }
  };

  // Stop recording
  const stopRecording = async () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    const elapsed = Date.now() - startTimeRef.current;

    // Check minimum recording length
    if (elapsed < MIN_RECORDING_TIME) {
      cleanup();
      setState({ status: 'idle', elapsedTime: 0, error: null });
      onError('Recording too short, try again');
      return;
    }

    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    setState(prev => ({ ...prev, status: 'processing' }));
    setWaveformData(new Array(12).fill(10));

    // Get final transcript
    const rawText = transcriptRef.current.trim();
    
    if (!rawText) {
      cleanup();
      setState({ status: 'idle', elapsedTime: 0, error: null });
      onError('No speech detected. Try speaking louder.');
      return;
    }

    // Refine the text
    const refinedText = await refineText(rawText);

    // Create recording object
    const recording: Recording = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      duration: elapsed / 1000,
      rawText,
      refinedText
    };

    onRecordingComplete(recording);
    setState({ status: 'idle', elapsedTime: 0, error: null });
    setTranscribedText('');
    cleanup();
  };

  // Toggle recording
  const handleClick = () => {
    if (state.status === 'idle') {
      startRecording();
    } else if (state.status === 'recording') {
      stopRecording();
    }
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg">
      <h2 className="text-xl font-semibold text-gray-800 text-center mb-6">
        {state.status === 'idle' && 'Tap to start recording'}
        {state.status === 'recording' && 'Recording...'}
        {state.status === 'processing' && 'Processing...'}
      </h2>

      {/* Record Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={handleClick}
          disabled={state.status === 'processing'}
          className={`
            relative w-[100px] h-[100px] rounded-full
            bg-gradient-to-br from-[#f43f5e] to-[#ec4899]
            shadow-lg shadow-pink-300/50
            flex items-center justify-center
            transition-all duration-200
            ${state.status === 'processing' ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
          `}
          aria-label={state.status === 'recording' ? 'Stop recording' : 'Start recording'}
        >
          {state.status === 'processing' ? (
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
          ) : state.status === 'recording' ? (
            <div className="w-8 h-8 bg-white rounded-sm" />
          ) : (
            <div className="w-9 h-9 bg-white rounded-full" />
          )}
        </button>
      </div>

      {/* Timer */}
      <div className="text-center mb-6">
        <span className="text-3xl font-bold text-gray-800 font-mono">
          {formatTime(state.elapsedTime)}
        </span>
      </div>

      {/* Waveform Visualization */}
      <div className="flex items-end justify-center gap-1 h-12 mb-4">
        {waveformData.map((height, index) => (
          <div
            key={index}
            className="w-2 rounded-full bg-gradient-to-t from-[#7c3aed] to-[#06b6d4] transition-all duration-100"
            style={{ height: `${height}px` }}
          />
        ))}
      </div>

      {/* Live Transcript Preview */}
      {transcribedText && state.status === 'recording' && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg max-h-24 overflow-y-auto">
          <p className="text-sm text-gray-600">{transcribedText}</p>
        </div>
      )}

      {/* Hint */}
      <p className="text-center text-gray-500 text-sm">
        Max recording: 5 minutes
      </p>
    </div>
  );
}
