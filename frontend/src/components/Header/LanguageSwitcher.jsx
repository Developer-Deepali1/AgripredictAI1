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

export default function LanguageSwitcher() {
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
        startIcon={<LanguageIcon />}
        endIcon={<KeyboardArrowDownIcon />}
        onClick={handleOpen}
        aria-controls={open ? 'language-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        sx={{
          color: 'white',
          borderColor: 'rgba(255,255,255,0.5)',
          border: '1px solid',
          borderRadius: 2,
          px: 1.5,
          py: 0.5,
          fontSize: '13px',
          fontWeight: 600,
          textTransform: 'none',
          minWidth: 80,
          '&:hover': {
            bgcolor: 'rgba(255,255,255,0.15)',
            borderColor: 'white',
          },
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
            minWidth: 140,
            borderRadius: 2,
            mt: 0.5,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1,
              borderRadius: 1,
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
                bgcolor: 'primary.light',
                color: 'primary.dark',
                fontWeight: 700,
                '&:hover': { bgcolor: 'primary.light' },
              },
            }}
          >
            <ListItemText
              primary={`${l.label} – ${l.fullLabel}`}
              primaryTypographyProps={{ fontSize: 13, fontWeight: l.code === language ? 700 : 400 }}
            />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
