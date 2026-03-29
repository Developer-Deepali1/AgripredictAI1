import React, { useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import StopIcon from '@mui/icons-material/Stop';
import styles from './ChatBot.module.css';

/**
 * VoiceOutput – reads the provided text aloud using the browser's
 * Web Speech API (SpeechSynthesis).  Falls back silently if unavailable.
 */
export default function VoiceOutput({ text, language }) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Use 'or-IN' for Odia; fall back to 'en-IN' if browser doesn't support it
  const langMap = { en: 'en-IN', hi: 'hi-IN', od: 'or-IN' };

  const speak = () => {
    if (!window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langMap[language] || 'en-IN';
    utterance.rate = 0.95;

    // Pick a voice that matches the language if available
    const voices = window.speechSynthesis.getVoices();
    const match = voices.find((v) => v.lang.startsWith(langMap[language]?.split('-')[0] || 'en'));
    if (match) utterance.voice = match;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  if (!text) return null;

  return (
    <Tooltip title={isSpeaking ? 'Stop audio' : 'Listen to response'}>
      <IconButton
        size="small"
        onClick={speak}
        className={styles.audioButton}
      >
        {isSpeaking ? <StopIcon sx={{ fontSize: 14 }} /> : <VolumeUpIcon sx={{ fontSize: 14 }} />}
      </IconButton>
    </Tooltip>
  );
}
