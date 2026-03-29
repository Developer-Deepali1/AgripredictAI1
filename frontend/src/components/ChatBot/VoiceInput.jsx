import React, { useState, useRef } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import styles from './ChatBot.module.css';

/**
 * VoiceInput – uses the browser's Web Speech API (SpeechRecognition) to capture
 * voice input and pass the transcript back to the parent via onTranscript.
 */
export default function VoiceInput({ language, onTranscript, disabled }) {
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  // Map internal lang codes to BCP-47 tags for Web Speech API
  const langMap = { en: 'en-IN', hi: 'hi-IN', od: 'or-IN' };

  const startRecording = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      onTranscript('', 'Voice input is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = langMap[language] || 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript, null);
    };

    recognition.onerror = (event) => {
      onTranscript('', `Voice error: ${event.error}`);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <Tooltip title={isRecording ? 'Stop recording' : 'Speak your query'}>
      <span>
        <IconButton
          size="small"
          onClick={handleClick}
          disabled={disabled}
          className={`${styles.micButton} ${isRecording ? styles.recording : ''}`}
        >
          {isRecording ? <MicOffIcon fontSize="small" /> : <MicIcon fontSize="small" />}
        </IconButton>
      </span>
    </Tooltip>
  );
}
