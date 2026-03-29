import React from 'react';
import { Box, Typography, Avatar, IconButton, Tooltip } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { t } from '../../utils/i18n';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header({ title }) {
  useLanguage(); // subscribe to language changes so t() returns updated translations
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 3,
        px: 2,
        py: 1.5,
        borderRadius: 3,
        background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
        boxShadow: '0 4px 20px rgba(6, 78, 59, 0.2)',
      }}
    >
      {/* Left: Page title */}
      <Typography
        variant="h6"
        fontWeight={700}
        sx={{ color: 'white', letterSpacing: 0.5 }}
      >
        {title || 'AgriPredict AI'}
      </Typography>

      {/* Right: Language switcher + Profile */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <LanguageSwitcher />
        <Tooltip title={t('common.profile')}>
          <IconButton
            size="small"
            onClick={() => navigate('/profile')}
            aria-label={t('common.profile')}
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.35)' },
            }}
          >
            <Avatar
              sx={{
                width: 28,
                height: 28,
                bgcolor: 'transparent',
                fontSize: 14,
              }}
            >
              {user?.name ? user.name[0].toUpperCase() : <PersonIcon sx={{ fontSize: 18 }} />}
            </Avatar>
          </IconButton>
        </Tooltip>
        {user?.name && (
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255,255,255,0.9)',
              fontWeight: 500,
              display: { xs: 'none', sm: 'block' },
            }}
          >
            {user.name}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
