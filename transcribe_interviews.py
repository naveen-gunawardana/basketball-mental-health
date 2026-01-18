"""
Interview Transcription Script using OpenAI Whisper (Local)
Drop your MP3 files in the audio_interviews/ folder and run this script.
"""

import os
import whisper
from pathlib import Path

# Paths
AUDIO_DIR = Path("audio_interviews")
OUTPUT_DIR = Path("transcriptions")

def transcribe_audio_files():
    # Create output directory
    OUTPUT_DIR.mkdir(exist_ok=True)
    
    # Load Whisper model (options: tiny, base, small, medium, large)
    # "base" is a good balance of speed and accuracy
    # Use "medium" or "large" for better accuracy (slower, more VRAM)
    print("Loading Whisper model (base)...")
    model = whisper.load_model("base")
    
    # Find all audio files
    audio_extensions = {".mp3", ".wav", ".m4a", ".ogg", ".flac"}
    audio_files = [f for f in AUDIO_DIR.iterdir() 
                   if f.suffix.lower() in audio_extensions]
    
    if not audio_files:
        print(f"\nNo audio files found in {AUDIO_DIR}/")
        print("Please add your MP3 files and try again.")
        return
    
    print(f"\nFound {len(audio_files)} audio file(s):")
    for f in audio_files:
        print(f"  - {f.name}")
    
    # Transcribe each file
    for audio_file in audio_files:
        print(f"\n{'='*50}")
        print(f"Transcribing: {audio_file.name}")
        print("This may take a few minutes...")
        
        try:
            # Transcribe
            result = model.transcribe(str(audio_file))
            
            # Save transcription
            output_file = OUTPUT_DIR / f"{audio_file.stem}_transcript.txt"
            with open(output_file, "w", encoding="utf-8") as f:
                f.write(f"Transcription of: {audio_file.name}\n")
                f.write("=" * 50 + "\n\n")
                f.write(result["text"])
            
            print(f"[OK] Saved to: {output_file}")
            
            # Also save with timestamps
            output_file_detailed = OUTPUT_DIR / f"{audio_file.stem}_transcript_detailed.txt"
            with open(output_file_detailed, "w", encoding="utf-8") as f:
                f.write(f"Detailed Transcription of: {audio_file.name}\n")
                f.write("=" * 50 + "\n\n")
                for segment in result["segments"]:
                    start = segment["start"]
                    end = segment["end"]
                    text = segment["text"]
                    f.write(f"[{start:.1f}s - {end:.1f}s] {text}\n")
            
            print(f"[OK] Detailed version saved to: {output_file_detailed}")
            
        except Exception as e:
            print(f"[ERROR] Error transcribing {audio_file.name}: {e}")
    
    print(f"\n{'='*50}")
    print("Done! Check the transcriptions/ folder for your transcripts.")

if __name__ == "__main__":
    transcribe_audio_files()
