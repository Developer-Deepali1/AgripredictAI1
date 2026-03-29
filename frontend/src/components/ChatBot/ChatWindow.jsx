import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import {
  Box,
  Card,
  Chip,
  Fab,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import styles from './ChatBot.module.css';
import LanguageSelector from './LanguageSelector';
import VoiceInput from './VoiceInput';
import VoiceOutput from './VoiceOutput';
import { chatbotService } from '../../services/api';

// Stable session ID for this browser session
const SESSION_ID = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;

// Default suggestion prompts shown to users
const DEFAULT_SUGGESTIONS = [
  'What crop is best this month?',
  'Compare rice and wheat',
  'Check risks for cotton',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function RiskBadge({ level }) {
  if (!level) return null;
  const cls = level.toLowerCase();
  return <span className={`${styles.badge} ${styles[cls]}`}>{level}</span>;
}

function StructuredCard({ data }) {
  if (!data) return null;
  const rows = [
    data.predicted_price != null && {
      label: 'Price',
      value: `₹${Math.round(data.predicted_price)}/qtl`,
    },
    data.demand_level && { label: 'Demand', value: <RiskBadge level={data.demand_level} /> },
    data.risk_level   && { label: 'Risk',   value: <RiskBadge level={data.risk_level} /> },
    data.profitability != null && {
      label: 'Profitability',
      value: (
        <span>
          {Math.round(data.profitability)}%{' '}
          <span className={styles.profitBar}>
            <span
              className={styles.profitFill}
              style={{ width: `${Math.min(100, data.profitability)}%` }}
            />
          </span>
        </span>
      ),
    },
    data.trend && { label: 'Trend', value: data.trend },
  ].filter(Boolean);

  return (
    <Box className={styles.dataCard}>
      {rows.map((r) => (
        <Box key={r.label} className={styles.dataRow}>
          <span className={styles.dataLabel}>{r.label}</span>
          <span className={styles.dataValue}>{r.value}</span>
        </Box>
      ))}
    </Box>
  );
}

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <Box className={`${styles.messageBubble} ${isUser ? styles.user : styles.assistant}`}>
      <Box className={styles.bubbleContent}>
        {msg.content}
        {!isUser && msg.structured_data && <StructuredCard data={msg.structured_data} />}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {msg.timestamp && (
          <span className={styles.messageTime}>{formatTime(msg.timestamp)}</span>
        )}
        {!isUser && msg.content && <VoiceOutput text={msg.content} language={msg.language || 'en'} />}
      </Box>
    </Box>
  );
}

function TypingIndicator() {
  return (
    <Box className={styles.messageBubble} style={{ alignSelf: 'flex-start' }}>
      <Box className={styles.typingBubble}>
        <span className={styles.typingDot} />
        <span className={styles.typingDot} />
        <span className={styles.typingDot} />
      </Box>
    </Box>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ChatWindow() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(DEFAULT_SUGGESTIONS);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const greetingShownRef = useRef(false);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Show greeting on first open only
  useEffect(() => {
    if (open && !greetingShownRef.current) {
      greetingShownRef.current = true;
      setMessages([
        {
          role: 'assistant',
          content:
            '👋 Hello! I\'m your **AgriPredict AI Assistant**.\n\nI can help you with:\n• 🌾 Crop price predictions\n• ⚖️ Crop comparisons\n• 📍 Region-specific recommendations\n• ⚠️ Risk & profitability analysis\n\nTry: "What if I grow rice in Odisha?" or "Compare wheat and maize"',
          timestamp: new Date().toISOString(),
          language,
        },
      ]);
    }
  }, [open, language]);

  const sendMessage = useCallback(
    async (text) => {
      const trimmed = (text || input).trim();
      if (!trimmed || loading) return;

      const userMsg = {
        role: 'user',
        content: trimmed,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setSuggestions([]);
      setLoading(true);

      const isDev = process.env.NODE_ENV !== 'production';
      try {
        const payload = { message: trimmed, language, session_id: SESSION_ID };
        if (isDev) console.log('🚀 Chatbot Request:', payload);
        const res = await chatbotService.chat(payload);
        const data = res.data;
        if (isDev) console.log('📥 Chatbot Response:', data);

        const botMsg = {
          role: 'assistant',
          content: data.reply_text,
          timestamp: new Date().toISOString(),
          structured_data: data.structured_data,
          comparison: data.comparison,
          language: data.detected_language || language,
        };
        setMessages((prev) => [...prev, botMsg]);
        if (data.suggestions?.length) setSuggestions(data.suggestions);
      } catch (err) {
        const errDetail = err?.response?.data?.detail;
        const errMsg =
          (typeof errDetail === 'object' ? errDetail?.error : errDetail) ||
          err?.message ||
          'Sorry, I encountered an error. Please try again.';
        if (isDev) console.error('❌ Chatbot Error:', { status: err?.response?.status, detail: errDetail });
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `⚠️ ${errMsg}`,
            timestamp: new Date().toISOString(),
            language,
          },
        ]);
      } finally {
        setLoading(false);
        textareaRef.current?.focus();
      }
    },
    [input, language, loading]
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleVoiceTranscript = (transcript, error) => {
    if (error) return;   // silently ignore voice errors
    if (transcript) {
      setInput(transcript);
      // Auto-send after a short delay
      setTimeout(() => sendMessage(transcript), 300);
    }
  };

  const clearHistory = async () => {
    try {
      await chatbotService.clearHistory(SESSION_ID);
    } catch {
      // best-effort
    }
    setMessages([]);
    setSuggestions(DEFAULT_SUGGESTIONS);
  };

  return (
    <>
      {/* Floating Action Button */}
      <Fab
        className={styles.fabButton}
        onClick={() => setOpen((v) => !v)}
        aria-label="Open AI assistant"
      >
        <SmartToyIcon />
      </Fab>

      {/* Chat Window */}
      {open && (
        <Card className={styles.chatWindow} elevation={8}>
          {/* Header */}
          <Box className={styles.chatHeader}>
            <Box className={styles.headerLeft}>
              <Box className={styles.botAvatar}>🤖</Box>
              <Box>
                <Typography className={styles.headerTitle}>AgriPredict AI</Typography>
                <Typography className={styles.headerSubtitle}>Farmer Assistant</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LanguageSelector language={language} onChange={setLanguage} />
              <Tooltip title="Clear chat">
                <IconButton size="small" onClick={clearHistory} sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: 'white' }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {/* Messages */}
          <Box className={styles.messagesArea}>
            {messages.length === 0 && !loading && (
              <Box className={styles.emptyState}>
                <span className={styles.emptyIcon}>🌾</span>
                <Typography variant="body2">Ask me anything about crops!</Typography>
              </Box>
            )}

            {messages.map((msg, idx) => (
              <MessageBubble key={idx} msg={msg} />
            ))}

            {loading && <TypingIndicator />}

            {/* Suggestions */}
            {!loading && suggestions.length > 0 && (
              <Box className={styles.suggestionsArea}>
                {suggestions.map((s, i) => (
                  <Chip
                    key={i}
                    label={s}
                    size="small"
                    variant="outlined"
                    className={styles.suggestionChip}
                    onClick={() => sendMessage(s)}
                  />
                ))}
              </Box>
            )}

            <div ref={messagesEndRef} />
          </Box>

          {/* Input Area */}
          <Box className={styles.inputArea}>
            <VoiceInput language={language} onTranscript={handleVoiceTranscript} disabled={loading} />
            <textarea
              ref={textareaRef}
              className={styles.textInput}
              placeholder="Ask about crops, prices, risks…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={loading}
            />
            <Tooltip title="Send (Enter)">
              <span>
                <IconButton
                  size="small"
                  className={styles.sendButton}
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                >
                  <SendIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Card>
      )}
    </>
  );
}
