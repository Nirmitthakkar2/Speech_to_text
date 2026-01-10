# PyTorch and Whisper Setup Guide

## Overview

This guide explains how to set up PyTorch and OpenAI Whisper for local speech-to-text transcription.

## Requirements

- Python 3.10 or higher
- pip package manager
- ~2GB disk space (for Whisper small model)
- GPU recommended but not required

## Installation

### Step 1: Install PyTorch

**CPU Only (works on any machine):**

```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
```

**With NVIDIA GPU (faster transcription):**

```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

**macOS with Apple Silicon:**

```bash
pip install torch torchvision torchaudio
```

### Step 2: Install Whisper

```bash
pip install openai-whisper
```

### Step 3: Verify Installation

```python
import whisper
model = whisper.load_model("small")
print("Whisper loaded successfully!")
```

## Whisper Model Sizes

| Model  | Size   | VRAM  | Speed  | Accuracy |
|--------|--------|-------|--------|----------|
| tiny   | 39M    | ~1GB  | Fast   | Basic    |
| base   | 74M    | ~1GB  | Fast   | Good     |
| small  | 244M   | ~2GB  | Medium | Better   |
| medium | 769M   | ~5GB  | Slow   | High     |
| large  | 1.5GB  | ~10GB | Slow   | Highest  |

This project uses `small` for balance of speed and accuracy.

## Usage Example

```python
import whisper

# Load model (downloads on first run)
model = whisper.load_model("small")

# Transcribe audio file
result = model.transcribe("audio.mp3")

# Get text
print(result["text"])

# Get with timestamps
for segment in result["segments"]:
    print(f"[{segment['start']:.2f}s] {segment['text']}")
```

## Supported Audio Formats

Whisper supports various audio formats:

- MP3
- WAV
- M4A
- FLAC
- OGG
- WebM

The audio is automatically converted internally using FFmpeg.

## FFmpeg Requirement

Whisper requires FFmpeg for audio processing. Install it if not present:

**Ubuntu/Debian:**

```bash
sudo apt update && sudo apt install ffmpeg
```

**macOS (Homebrew):**

```bash
brew install ffmpeg
```

**Windows:**

Download from https://ffmpeg.org/download.html and add to PATH.

## Using Different Models

To change the model size, edit `backend/main.py`:

```python
MODEL_NAME = "tiny"   # Fastest, less accurate
MODEL_NAME = "base"   # Fast, good accuracy
MODEL_NAME = "small"  # Default - balanced
MODEL_NAME = "medium" # Slower, high accuracy
MODEL_NAME = "large"  # Slowest, highest accuracy
```

## GPU Acceleration

### Check GPU Availability

```python
import torch
print(f"CUDA available: {torch.cuda.is_available()}")
print(f"GPU: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'None'}")
```

### Force CPU Mode

If you have GPU issues, force CPU mode:

```python
model = whisper.load_model("small", device="cpu")
```

## Troubleshooting

### "No module named whisper"

Run: `pip install openai-whisper`

Note: The package is `openai-whisper`, not `whisper`.

### "CUDA out of memory"

Options:

1. Use smaller model (tiny/base)
2. Force CPU mode: Set `CUDA_VISIBLE_DEVICES=""` before running
3. Close other GPU-intensive applications

### Slow transcription

- First run downloads the model (one-time delay)
- Use smaller model (tiny/base)
- Install GPU version of PyTorch
- Ensure no other GPU processes running

### "Could not find FFmpeg"

Install FFmpeg (see FFmpeg Requirement section above).

### Audio file not recognized

Ensure:

- File exists and is readable
- Format is supported (mp3, wav, webm, etc.)
- File is not corrupted
- FFmpeg is installed

## Performance Tips

1. **Use GPU:** ~10x faster than CPU for larger models
2. **Right-size model:** Use smallest model that meets accuracy needs
3. **Keep model loaded:** First transcription loads model; subsequent ones are faster
4. **Audio quality:** Cleaner audio = better results
5. **Language hint:** Specify language if known for faster processing:

```python
result = model.transcribe("audio.mp3", language="en")
```

## Advanced Options

### Transcription Parameters

```python
result = model.transcribe(
    "audio.mp3",
    language="en",          # Specify language
    task="transcribe",      # or "translate" for translation to English
    temperature=0,          # Lower = more deterministic
    best_of=5,              # Beam search samples
    beam_size=5,            # Beam search width
    fp16=False,             # Disable for CPU
    condition_on_previous_text=True,  # Use context
    initial_prompt="Meeting transcript:"  # Context hint
)
```

### Get Detailed Segments

```python
for segment in result["segments"]:
    print(f"[{segment['start']:.2f}s - {segment['end']:.2f}s] {segment['text']}")
    print(f"  Confidence: {segment.get('no_speech_prob', 0):.2%}")
```

## Resources

- [OpenAI Whisper GitHub](https://github.com/openai/whisper)
- [PyTorch Installation](https://pytorch.org/get-started/locally/)
- [Whisper Paper](https://arxiv.org/abs/2212.04356)
