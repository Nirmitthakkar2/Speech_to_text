'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Recording, RecorderState } from '@/types';

interface AudioRecorderProps {
  onRecordingComplete: (recording: Recording) => void;
  onError: (error: string) => void;
}

const MAX_RECORDING_TIME = 5 * 60 * 1000; // 5 minutes in ms
const MIN_RECORDING_TIME = 1000; // 1 second in ms

export default function AudioRecorder({ onRecordingComplete, onError }: AudioRecorderProps) {
  const [state, setState] = useState<RecorderState>({
    status: 'idle',
    elapsedTime: 0,
    error: null
  });
  const [waveformData, setWaveformData] = useState<number[]>(new Array(12).fill(10));

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

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
    analyserRef.current = null;
    audioChunksRef.current = [];
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

  // Start recording
  const startRecording = async () => {
    try {
      cleanup();
      setState({ status: 'recording', elapsedTime: 0, error: null });

      // Request microphone access
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

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processRecording(audioBlob);
      };

      // Start recording and timer
      mediaRecorder.start();
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
  const stopRecording = () => {
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

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    setState(prev => ({ ...prev, status: 'processing' }));
    setWaveformData(new Array(12).fill(10));
  };

  // Process the recorded audio
  const processRecording = async (audioBlob: Blob) => {
    const recordingDuration = (Date.now() - startTimeRef.current) / 1000;

    try {
      // Transcribe audio
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');

      const transcribeResponse = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      });

      const transcribeData = await transcribeResponse.json();

      if (!transcribeResponse.ok) {
        throw new Error(transcribeData.message || 'Transcription failed');
      }

      const rawText = transcribeData.text;

      // Refine text with LLM
      let refinedText = rawText;
      try {
        // Get API key from localStorage
        const apiKey = localStorage.getItem('openrouter_api_key');
        
        const refineResponse = await fetch('/api/refine', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: rawText, apiKey })
        });

        if (refineResponse.ok) {
          const refineData = await refineResponse.json();
          refinedText = refineData.refined;
        }
        // If refinement fails, we'll use raw text
      } catch {
        // Silently fall back to raw text
      }

      // Create recording object
      const recording: Recording = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        duration: recordingDuration,
        rawText,
        refinedText
      };

      onRecordingComplete(recording);
      setState({ status: 'idle', elapsedTime: 0, error: null });
    } catch (error) {
      setState({ status: 'idle', elapsedTime: 0, error: null });
      onError(error instanceof Error ? error.message : 'Processing failed');
    } finally {
      cleanup();
    }
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
        {state.status === 'processing' && 'Transcribing...'}
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

      {/* Hint */}
      <p className="text-center text-gray-500 text-sm">
        Max recording: 5 minutes
      </p>
    </div>
  );
}
