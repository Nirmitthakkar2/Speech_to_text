"""
FastAPI backend for Whisper speech-to-text transcription.

This server loads the Whisper model on startup and provides an endpoint
for transcribing audio files.
"""

import os
import uuid
import tempfile
from typing import Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import whisper

# Global model variable
model: Optional[whisper.Whisper] = None
MODEL_NAME = "small"


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load Whisper model on startup."""
    global model
    print(f"Loading Whisper '{MODEL_NAME}' model...")
    model = whisper.load_model(MODEL_NAME)
    print(f"Whisper '{MODEL_NAME}' model loaded successfully!")
    yield
    # Cleanup on shutdown
    model = None


app = FastAPI(
    title="Whisper Transcription API",
    description="Local speech-to-text transcription using OpenAI Whisper",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "model": MODEL_NAME,
        "model_loaded": model is not None
    }


@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    """
    Transcribe an audio file using Whisper.

    Accepts: multipart/form-data with 'file' field containing audio
    Supports: webm, wav, mp3, m4a, and other common audio formats

    Returns:
        {
            "text": "transcribed text",
            "duration": 12.5,
            "language": "en"
        }
    """
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="Whisper model not loaded. Please wait for initialization."
        )

    # Generate unique temp filename
    file_extension = os.path.splitext(file.filename or "audio.webm")[1] or ".webm"
    temp_filename = f"audio_{uuid.uuid4()}{file_extension}"
    temp_path = os.path.join(tempfile.gettempdir(), temp_filename)

    try:
        # Save uploaded file to temp location
        contents = await file.read()
        if len(contents) == 0:
            raise HTTPException(status_code=400, detail="Empty audio file")

        with open(temp_path, "wb") as f:
            f.write(contents)

        # Transcribe with Whisper
        result = model.transcribe(temp_path)

        # Extract results
        text = result.get("text", "").strip()
        language = result.get("language", "en")

        # Calculate duration from segments if available
        duration = 0.0
        segments = result.get("segments", [])
        if segments:
            duration = segments[-1].get("end", 0.0)

        return JSONResponse(content={
            "text": text,
            "duration": duration,
            "language": language
        })

    except HTTPException:
        raise
    except Exception as e:
        print(f"Transcription error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Transcription failed: {str(e)}"
        )
    finally:
        # Clean up temp file
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
