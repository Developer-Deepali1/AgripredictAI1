import React, { useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  ListItemText,
} from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useLanguage } from '../../context/LanguageContext';

const LANGUAGES = [
  { code: 'en', label: 'EN', fullLabel: 'English' },
  { code: 'hi', label: 'HI', fullLabel: 'हिन्दी' },
  { code: 'od', label: 'OD', fullLabel: 'ଓଡ଼ିଆ' },
];

export default function LanguageSwitcher({ sx = {} }) {
  const { language, setLanguage } = useLanguage();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const current = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleSelect = (code) => {
    setLanguage(code);
    handleClose();
  };

  return (
    <>
      <Button
        size="small"
        startIcon={<LanguageIcon sx={{ fontSize: 18, color: '#059669' }} />}
        endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 18, color: '#64748B' }} />}
        onClick={handleOpen}
        aria-controls={open ? 'language-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        sx={{
          color: '#1E293B',
          borderColor: '#E2E8F0',
          border: '1px solid',
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '10px',
          px: 1.5,
          py: 0.5,
          fontSize: '13px',
          fontWeight: 600,
          textTransform: 'none',
          minWidth: 84,
          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
          '&:hover': {
            bgcolor: '#FFFFFF',
            borderColor: '#CBD5E1',
            boxShadow: '0 2px 4px rgba(15, 23, 42, 0.08)',
          },
          ...sx,
        }}
      >
        {current.label}
      </Button>

      <Menu
        id="language-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          elevation: 4,
          sx: {
            minWidth: 150,
            borderRadius: '12px',
            mt: 0.8,
            border: '1px solid #E2E8F0',
            boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.05)',
            p: 0.5,
            '& .MuiMenuItem-root': {
              px: 1.5,
              py: 0.9,
              borderRadius: '8px',
              mx: 0.5,
              my: 0.25,
            },
          },
        }}
      >
        {LANGUAGES.map((l) => (
          <MenuItem
            key={l.code}
            onClick={() => handleSelect(l.code)}
            selected={l.code === language}
            sx={{
              '&.Mui-selected': {
                bgcolor: 'rgba(16, 185, 129, 0.12)',
                color: '#065F46',
                fontWeight: 700,
                '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.18)' },
              },
            }}
          >
            <ListItemText
              primary={`${l.label} – ${l.fullLabel}`}
              primaryTypographyProps={{ fontSize: 13, fontWeight: l.code === language ? 700 : 500 }}
            />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
