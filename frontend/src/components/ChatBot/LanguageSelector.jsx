import React from 'react';
import { FormControl, Select, MenuItem } from '@mui/material';
import styles from './ChatBot.module.css';

const LANGUAGES = [
  { code: 'en', label: '🇬🇧 EN' },
  { code: 'hi', label: '🇮🇳 HI' },
  { code: 'od', label: '🪷  OD' },
];

export default function LanguageSelector({ language, onChange }) {
  return (
    <FormControl size="small" variant="standard">
      <Select
        value={language}
        onChange={(e) => onChange(e.target.value)}
        className={styles.langSelect}
        disableUnderline
        sx={{ fontSize: '11px', color: 'white' }}
      >
        {LANGUAGES.map((l) => (
          <MenuItem key={l.code} value={l.code} sx={{ fontSize: '12px' }}>
            {l.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
