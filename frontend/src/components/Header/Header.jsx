import React from 'react';
import { Box, Typography, Avatar, Tooltip } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SensorsIcon from '@mui/icons-material/Sensors';
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
        flexWrap: 'wrap',
        gap: 1.5,
        mb: 3,
        px: { xs: 2, sm: 2.5 },
        py: 1.5,
        borderRadius: '16px',
        bgcolor: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(226, 232, 240, 0.85)',
        boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.02)',
      }}
    >
      {/* Left: Page Title & Realtime AI telemetry pill */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            color: '#0F172A',
            fontWeight: 800,
            fontSize: { xs: '1.1rem', sm: '1.25rem' },
            letterSpacing: '-0.3px',
          }}
        >
          {title || 'AgriPredict AI'}
        </Typography>

        {/* Live Telemetry Pill */}
        <Box
          sx={{
            display: { xs: 'none', md: 'inline-flex' },
            alignItems: 'center',
            gap: 1,
            px: 1.4,
            py: 0.4,
            borderRadius: 999,
            bgcolor: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: '#10B981',
              boxShadow: '0 0 8px #10B981',
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.7)' },
                '70%': { transform: 'scale(1)', boxShadow: '0 0 0 6px rgba(16, 185, 129, 0)' },
                '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(16, 185, 129, 0)' },
              },
            }}
          />
          <Typography
            variant="caption"
            sx={{
              color: '#065F46',
              fontWeight: 700,
              fontSize: '0.74rem',
              letterSpacing: '0.2px',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <SensorsIcon sx={{ fontSize: 13, color: '#10B981' }} />
            AI Models Online • 96.8% Accuracy
          </Typography>
        </Box>
      </Box>

      {/* Right: Telemetry sync + Language Switcher + User Profile */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 'auto' }}>
        <LanguageSwitcher />

        {/* Profile Chip */}
        <Tooltip title={t('common.profile')}>
          <Box
            onClick={() => navigate('/profile')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.2,
              px: 1.2,
              py: 0.5,
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              bgcolor: '#FFFFFF',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: '#F8FAFC',
                borderColor: '#CBD5E1',
                boxShadow: '0 2px 6px rgba(15, 23, 42, 0.07)',
              },
            }}
          >
            <Avatar
              sx={{
                width: 30,
                height: 30,
                bgcolor: 'rgba(16, 185, 129, 0.15)',
                color: '#059669',
                border: '1.5px solid rgba(16, 185, 129, 0.4)',
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {user?.name ? user.name[0].toUpperCase() : <PersonIcon sx={{ fontSize: 17 }} />}
            </Avatar>

            {user?.name && (
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#0F172A',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    lineHeight: 1.2,
                  }}
                >
                  {user.name}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#64748B',
                    fontSize: '0.68rem',
                    display: 'block',
                    lineHeight: 1,
                  }}
                >
                  {user.role || 'Farmer Pro'}
                </Typography>
              </Box>
            )}
          </Box>
        </Tooltip>
      </Box>
    </Box>
  );
}
