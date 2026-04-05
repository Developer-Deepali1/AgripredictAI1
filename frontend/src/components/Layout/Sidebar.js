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
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { t } from '../../utils/i18n';

const NAV_ITEM_DEFS = [
  { key: 'dashboard',      path: '/dashboard',       icon: <DashboardIcon /> },
  { key: 'predictions',    path: '/predictions',     icon: <TrendingUpIcon /> },
  { key: 'feasibility',    path: '/feasibility',     icon: <NatureIcon /> },
  { key: 'profit',         path: '/profit',          icon: <AttachMoneyIcon /> },
  { key: 'risk',           path: '/risk',            icon: <WarningAmberIcon /> },
  { key: 'recommendations',path: '/recommendations', icon: <StarIcon /> },
  { key: 'cropPrediction', path: '/crop-prediction', icon: <EmojiNatureIcon /> },
  { key: 'rotation',       path: '/rotation',        icon: <LoopIcon /> },
  { key: 'iot',            path: '/iot',             icon: <SensorsIcon /> },
  { key: 'simulator',      path: '/simulator',       icon: <ScienceIcon /> },
  { key: 'alerts',         path: '/alerts',          icon: <NotificationsIcon /> },
  { key: 'dataSources',    path: '/data-sources',    icon: <StorageIcon /> },
];

export const EXPANDED_WIDTH = 250;
export const COLLAPSED_WIDTH = 70;

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, sidebarCollapsed, toggleSidebar } = useAuth();
  useLanguage(); // subscribe to language changes so t() returns updated translations
  const [mobileOpen, setMobileOpen] = useState(false);

  // Build nav items with translated labels
  const NAV_ITEMS = NAV_ITEM_DEFS.map(({ key, path, icon }) => ({
    label: t(`sidebar.nav.${key}`),
    path,
    icon,
  }));

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

  // Shared content for both mobile & desktop drawers
  const drawerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflowX: 'hidden',
      }}
    >
      {/* ── Brand + Toggle ── */}
      <Box
        sx={{
          p: sidebarCollapsed ? 1 : 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarCollapsed ? 'center' : 'space-between',
          bgcolor: 'primary.main',
          minHeight: 64,
          transition: 'padding 0.3s ease',
        }}
      >
        {/* Logo icon always visible */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden' }}>
          <AgricultureIcon sx={{ color: 'white', fontSize: 30, flexShrink: 0 }} />
          {!sidebarCollapsed && (
            <Box>
              <Typography
                variant="subtitle1"
                sx={{ color: 'white', fontWeight: 700, lineHeight: 1.2, whiteSpace: 'nowrap' }}
              >
                {t('sidebar.brand')}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                {t('sidebar.tagline')}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Toggle button – desktop only */}
        <Tooltip title={sidebarCollapsed ? t('sidebar.expandTooltip') : t('sidebar.collapseTooltip')} placement="right">
          <IconButton
            onClick={toggleSidebar}
            aria-label={sidebarCollapsed ? t('sidebar.expandTooltip') : t('sidebar.collapseTooltip')}
            size="small"
            sx={{
              color: 'white',
              ml: sidebarCollapsed ? 0 : 1,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' },
              display: { xs: 'none', sm: 'flex' },
              flexShrink: 0,
            }}
          >
            {sidebarCollapsed ? <MenuIcon /> : <MenuOpenIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* ── User Info ── */}
      <Box
        sx={{
          p: sidebarCollapsed ? 1 : 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
          gap: sidebarCollapsed ? 0 : 1,
          bgcolor: '#065F46',
          transition: 'padding 0.3s ease',
        }}
      >
        <Tooltip title={sidebarCollapsed ? (user?.name || user?.email || t('sidebar.farmer')) : ''} placement="right">
          <Avatar
            className="sidebar-avatar"
            sx={{ bgcolor: 'primary.main', width: 36, height: 36, flexShrink: 0, cursor: 'default' }}
          >
            <PersonIcon sx={{ fontSize: 20 }} />
          </Avatar>
        </Tooltip>
        {!sidebarCollapsed && (
          <Box sx={{ overflow: 'hidden' }}>
            <Typography
              variant="body2"
              sx={{ color: 'white', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {user?.name || user?.email || t('sidebar.farmer')}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              {user?.location || t('sidebar.location')}
            </Typography>
          </Box>
        )}
      </Box>

      <Divider />

      {/* ── Navigation ── */}
      <List sx={{ flexGrow: 1, pt: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {NAV_ITEMS.map(({ label, path, icon }) => {
          const isActive = location.pathname === path;
          return (
            <ListItem key={path} disablePadding sx={{ display: 'block' }}>
              <Tooltip title={sidebarCollapsed ? label : ''} placement="right" arrow>
                <ListItemButton
                  onClick={() => handleNavClick(path)}
                  aria-label={label}
                  sx={{
                    mx: 1,
                    borderRadius: 2,
                    mb: 0.5,
                    justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                    px: sidebarCollapsed ? 1 : 2,
                    bgcolor: isActive ? 'primary.main' : 'transparent',
                    '&:hover': { bgcolor: isActive ? 'primary.dark' : 'action.hover' },
                    color: isActive ? 'white' : 'text.primary',
                    transition: 'padding 0.3s ease',
                    minWidth: 0,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: sidebarCollapsed ? 0 : 40,
                      color: isActive ? 'white' : 'primary.main',
                      justifyContent: 'center',
                    }}
                  >
                    {icon}
                  </ListItemIcon>
                  {!sidebarCollapsed && (
                    <ListItemText
                      primary={label}
                      primaryTypographyProps={{ fontSize: 14, fontWeight: isActive ? 600 : 400, noWrap: true }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      {/* ── Bottom Actions ── */}
      <List sx={{ pb: 1 }}>
        {/* Profile */}
        <ListItem disablePadding>
          <Tooltip title={sidebarCollapsed ? t('common.profile') : ''} placement="right" arrow>
            <ListItemButton
              onClick={() => handleNavClick('/profile')}
              aria-label={t('common.profile')}
              sx={{
                mx: 1,
                borderRadius: 2,
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                px: sidebarCollapsed ? 1 : 2,
                transition: 'padding 0.3s ease',
              }}
            >
              <ListItemIcon sx={{ minWidth: sidebarCollapsed ? 0 : 40, color: 'primary.main', justifyContent: 'center' }}>
                <PersonIcon />
              </ListItemIcon>
              {!sidebarCollapsed && (
                <ListItemText primary={t('common.profile')} primaryTypographyProps={{ fontSize: 14 }} />
              )}
            </ListItemButton>
          </Tooltip>
        </ListItem>

        {/* Logout */}
        <ListItem disablePadding>
          <Tooltip title={sidebarCollapsed ? t('common.logout') : ''} placement="right" arrow>
            <ListItemButton
              onClick={handleLogout}
              aria-label={t('common.logout')}
              sx={{
                mx: 1,
                borderRadius: 2,
                mb: 1,
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                px: sidebarCollapsed ? 1 : 2,
                transition: 'padding 0.3s ease',
              }}
            >
              <ListItemIcon sx={{ minWidth: sidebarCollapsed ? 0 : 40, color: 'error.main', justifyContent: 'center' }}>
                <LogoutIcon />
              </ListItemIcon>
              {!sidebarCollapsed && (
                <ListItemText primary={t('common.logout')} primaryTypographyProps={{ fontSize: 14, color: 'error.main' }} />
              )}
            </ListItemButton>
          </Tooltip>
        </ListItem>
      </List>
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
          top: 8,
          left: 8,
          zIndex: 1300,
          bgcolor: 'primary.main',
          color: 'white',
          display: { xs: 'flex', sm: 'none' },
          '&:hover': { bgcolor: 'primary.dark' },
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
          transition: 'width 0.3s ease',
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid #E5E7EB',
            overflowX: 'hidden',
            transition: 'width 0.3s ease',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </>
  );
}
