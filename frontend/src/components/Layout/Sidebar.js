import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Box, Typography, Divider, IconButton, Tooltip, Avatar,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import NatureIcon from '@mui/icons-material/Nature';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import StarIcon from '@mui/icons-material/Star';
import ScienceIcon from '@mui/icons-material/Science';
import NotificationsIcon from '@mui/icons-material/Notifications';
import StorageIcon from '@mui/icons-material/Storage';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import LoopIcon from '@mui/icons-material/Loop';
import SensorsIcon from '@mui/icons-material/Sensors';
import EmojiNatureIcon from '@mui/icons-material/EmojiNature';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import SpaIcon from '@mui/icons-material/Spa';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { t } from '../../utils/i18n';

export const EXPANDED_WIDTH = 260;
export const COLLAPSED_WIDTH = 74;

// Group navigation logically for premium UX
const NAV_GROUPS = [
  {
    groupKey: 'intelligence',
    groupTitle: 'CORE INTELLIGENCE',
    items: [
      { key: 'dashboard', path: '/dashboard', icon: <DashboardIcon sx={{ fontSize: 20 }} /> },
      { key: 'diseaseDetection', path: '/disease-detection', icon: <SpaIcon sx={{ fontSize: 20 }} />, label: 'Crop Doctor' },
      { key: 'predictions', path: '/predictions', icon: <TrendingUpIcon sx={{ fontSize: 20 }} /> },
      { key: 'cropPrediction', path: '/crop-prediction', icon: <EmojiNatureIcon sx={{ fontSize: 20 }} /> },
    ],
  },
  {
    groupKey: 'planning',
    groupTitle: 'FARM PLANNING',
    items: [
      { key: 'simulator', path: '/simulator', icon: <ScienceIcon sx={{ fontSize: 20 }} /> },
      { key: 'feasibility', path: '/feasibility', icon: <NatureIcon sx={{ fontSize: 20 }} /> },
      { key: 'profit', path: '/profit', icon: <AttachMoneyIcon sx={{ fontSize: 20 }} /> },
      { key: 'risk', path: '/risk', icon: <WarningAmberIcon sx={{ fontSize: 20 }} /> },
      { key: 'recommendations', path: '/recommendations', icon: <StarIcon sx={{ fontSize: 20 }} /> },
      { key: 'rotation', path: '/rotation', icon: <LoopIcon sx={{ fontSize: 20 }} /> },
    ],
  },
  {
    groupKey: 'field',
    groupTitle: 'FIELD & SENSORS',
    items: [
      { key: 'iot', path: '/iot', icon: <SensorsIcon sx={{ fontSize: 20 }} /> },
      { key: 'climatePredictor', path: '/climate-predictor', icon: <AcUnitIcon sx={{ fontSize: 20 }} /> },
      { key: 'alerts', path: '/alerts', icon: <NotificationsIcon sx={{ fontSize: 20 }} /> },
      { key: 'dataSources', path: '/data-sources', icon: <StorageIcon sx={{ fontSize: 20 }} /> },
    ],
  },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, sidebarCollapsed, toggleSidebar } = useAuth();
  useLanguage(); // subscribe to language changes so t() returns updated translations
  const [mobileOpen, setMobileOpen] = useState(false);

  // Keyboard shortcut: Alt+S toggles sidebar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && e.key === 's') {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  const handleNavClick = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const drawerWidth = sidebarCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

  const drawerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflowX: 'hidden',
        background: 'linear-gradient(180deg, #051A14 0%, #08241C 45%, #051410 100%)',
        color: '#F8FAFC',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      {/* ── Brand + Toggle Header ── */}
      <Box
        sx={{
          p: sidebarCollapsed ? 1.5 : 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarCollapsed ? 'center' : 'space-between',
          minHeight: 72,
          borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
          background: 'rgba(255, 255, 255, 0.02)',
        }}
      >
        <Box
          onClick={() => handleNavClick('/dashboard')}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            cursor: 'pointer',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              boxShadow: '0 0 16px rgba(16, 185, 129, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AgricultureIcon sx={{ color: '#FFFFFF', fontSize: 24 }} />
          </Box>

          {!sidebarCollapsed && (
            <Box sx={{ minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontFamily: '"Plus Jakarta Sans", sans-serif',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    letterSpacing: '-0.3px',
                    fontSize: '1.05rem',
                    lineHeight: 1.2,
                  }}
                >
                  AgriPredict
                </Typography>
                <Box
                  component="span"
                  sx={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    px: 0.7,
                    py: 0.2,
                    borderRadius: '4px',
                    bgcolor: 'rgba(16, 185, 129, 0.25)',
                    color: '#34D399',
                    border: '1px solid rgba(52, 211, 153, 0.3)',
                    letterSpacing: '0.5px',
                  }}
                >
                  AI
                </Box>
              </Box>
              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(148, 163, 184, 0.8)',
                  fontSize: '0.72rem',
                  fontWeight: 500,
                  display: 'block',
                  letterSpacing: '0.2px',
                }}
              >
                Farm Decision Intelligence
              </Typography>
            </Box>
          )}
        </Box>

        {/* Toggle button – desktop only */}
        {!sidebarCollapsed && (
          <Tooltip title={t('sidebar.collapseTooltip')} placement="right">
            <IconButton
              onClick={toggleSidebar}
              size="small"
              sx={{
                color: 'rgba(255, 255, 255, 0.65)',
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.15)', color: '#FFFFFF' },
                display: { xs: 'none', sm: 'flex' },
                flexShrink: 0,
              }}
            >
              <MenuOpenIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {sidebarCollapsed && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
          <Tooltip title={t('sidebar.expandTooltip')} placement="right">
            <IconButton
              onClick={toggleSidebar}
              size="small"
              sx={{
                color: 'rgba(255, 255, 255, 0.65)',
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.15)', color: '#FFFFFF' },
                display: { xs: 'none', sm: 'flex' },
              }}
            >
              <MenuIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* ── Navigation Items Grouped ── */}
      <List
        sx={{
          flexGrow: 1,
          px: sidebarCollapsed ? 1 : 1.5,
          py: 1.5,
          overflowY: 'auto',
          overflowX: 'hidden',
          '&::-webkit-scrollbar': { width: '4px' },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255, 255, 255, 0.15)', borderRadius: '4px' },
        }}
      >
        {NAV_GROUPS.map((group, groupIdx) => {
          return (
            <Box key={group.groupKey} sx={{ mb: 2 }}>
              {/* Category label */}
              {!sidebarCollapsed ? (
                <Typography
                  variant="caption"
                  sx={{
                    px: 1.5,
                    mb: 0.8,
                    display: 'block',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    letterSpacing: '1px',
                    color: 'rgba(52, 211, 153, 0.75)',
                    textTransform: 'uppercase',
                  }}
                >
                  {group.groupTitle}
                </Typography>
              ) : (
                groupIdx > 0 && (
                  <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', my: 1, mx: 0.5 }} />
                )
              )}

              {/* Items in this group */}
              {group.items.map(({ key, path, icon, label }) => {
                const isActive = location.pathname === path;
                const translated = t(`sidebar.nav.${key}`);
                const displayLabel = (translated && translated !== `sidebar.nav.${key}`) ? translated : (label || key);

                return (
                  <ListItem key={path} disablePadding sx={{ display: 'block', mb: 0.4 }}>
                    <Tooltip title={sidebarCollapsed ? displayLabel : ''} placement="right" arrow>
                      <ListItemButton
                        onClick={() => handleNavClick(path)}
                        aria-label={displayLabel}
                        sx={{
                          borderRadius: '10px',
                          justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                          px: sidebarCollapsed ? 1 : 1.5,
                          py: 1,
                          position: 'relative',
                          background: isActive
                            ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.22) 0%, rgba(16, 185, 129, 0.05) 100%)'
                            : 'transparent',
                          borderLeft: isActive ? '3px solid #10B981' : '3px solid transparent',
                          color: isActive ? '#FFFFFF' : 'rgba(203, 213, 225, 0.8)',
                          '&:hover': {
                            bgcolor: isActive ? 'rgba(16, 185, 129, 0.28)' : 'rgba(255, 255, 255, 0.06)',
                            color: '#FFFFFF',
                            '& .MuiListItemIcon-root': {
                              color: '#34D399',
                              transform: 'scale(1.08)',
                            },
                          },
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: sidebarCollapsed ? 0 : 34,
                            color: isActive ? '#34D399' : 'rgba(148, 163, 184, 0.85)',
                            justifyContent: 'center',
                            transition: 'transform 0.2s ease, color 0.2s ease',
                          }}
                        >
                          {icon}
                        </ListItemIcon>
                        {!sidebarCollapsed && (
                          <ListItemText
                            primary={displayLabel}
                            primaryTypographyProps={{
                              fontSize: '0.85rem',
                              fontWeight: isActive ? 600 : 450,
                              noWrap: true,
                              letterSpacing: '0.1px',
                            }}
                          />
                        )}
                        {/* Subtle glow dot for active tab */}
                        {isActive && !sidebarCollapsed && (
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              bgcolor: '#10B981',
                              boxShadow: '0 0 8px #10B981',
                              ml: 'auto',
                            }}
                          />
                        )}
                      </ListItemButton>
                    </Tooltip>
                  </ListItem>
                );
              })}
            </Box>
          );
        })}
      </List>

      {/* ── Footer Farmer Status & Actions ── */}
      <Box
        sx={{
          p: sidebarCollapsed ? 1 : 1.5,
          borderTop: '1px solid rgba(255, 255, 255, 0.07)',
          background: 'rgba(0, 0, 0, 0.2)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: sidebarCollapsed ? 'center' : 'space-between',
            p: sidebarCollapsed ? 0.5 : 1,
            borderRadius: '12px',
            bgcolor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <Box
            onClick={() => handleNavClick('/profile')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.2,
              cursor: 'pointer',
              minWidth: 0,
              flexGrow: 1,
            }}
          >
            <Box sx={{ position: 'relative', flexShrink: 0 }}>
              <Avatar
                sx={{
                  bgcolor: 'rgba(16, 185, 129, 0.2)',
                  color: '#34D399',
                  border: '1px solid rgba(52, 211, 153, 0.4)',
                  width: 34,
                  height: 34,
                  fontSize: '0.85rem',
                  fontWeight: 700,
                }}
              >
                {user?.name ? user.name[0].toUpperCase() : <PersonIcon sx={{ fontSize: 18 }} />}
              </Avatar>
              {/* Online indicator */}
              <Box
                sx={{
                  width: 9,
                  height: 9,
                  bgcolor: '#10B981',
                  borderRadius: '50%',
                  position: 'absolute',
                  bottom: -1,
                  right: -1,
                  border: '2px solid #051A14',
                }}
              />
            </Box>

            {!sidebarCollapsed && (
              <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#FFFFFF',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {user?.name || user?.email || t('sidebar.farmer')}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(148, 163, 184, 0.8)',
                    fontSize: '0.7rem',
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {user?.location || 'Verified Farmer'}
                </Typography>
              </Box>
            )}
          </Box>

          {!sidebarCollapsed && (
            <Tooltip title={t('common.logout')} placement="top">
              <IconButton
                onClick={handleLogout}
                size="small"
                sx={{
                  color: 'rgba(239, 68, 68, 0.75)',
                  p: 0.8,
                  '&:hover': {
                    bgcolor: 'rgba(239, 68, 68, 0.15)',
                    color: '#EF4444',
                  },
                }}
              >
                <LogoutIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile hamburger – always visible on small screens */}
      <IconButton
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation menu"
        sx={{
          position: 'fixed',
          top: 12,
          left: 12,
          zIndex: 1300,
          bgcolor: '#064E3B',
          color: 'white',
          boxShadow: '0 4px 12px rgba(6, 78, 59, 0.3)',
          display: { xs: 'flex', sm: 'none' },
          '&:hover': { bgcolor: '#047857' },
        }}
      >
        <MenuIcon />
      </IconButton>

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            width: EXPANDED_WIDTH,
            boxSizing: 'border-box',
            border: 'none',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop drawer – collapsible */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          width: drawerWidth,
          flexShrink: 0,
          transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            overflowX: 'hidden',
            transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </>
  );
}
