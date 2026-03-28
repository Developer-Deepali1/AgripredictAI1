import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Box, Typography, Divider, IconButton, useTheme, useMediaQuery, Tooltip,
  Avatar,
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
import AgricultureIcon from '@mui/icons-material/Agriculture';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
  { label: 'Market Predictions', path: '/predictions', icon: <TrendingUpIcon /> },
  { label: 'Feasibility', path: '/feasibility', icon: <NatureIcon /> },
  { label: 'Profit Analysis', path: '/profit', icon: <AttachMoneyIcon /> },
  { label: 'Risk Assessment', path: '/risk', icon: <WarningAmberIcon /> },
  { label: 'Smart Recommendations', path: '/recommendations', icon: <StarIcon /> },
  { label: 'Simulator', path: '/simulator', icon: <ScienceIcon /> },
  { label: 'Alerts', path: '/alerts', icon: <NotificationsIcon /> },
  { label: 'Data Sources', path: '/data-sources', icon: <StorageIcon /> },
];

export default function Sidebar({ drawerWidth }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleNavClick = (path) => {
    navigate(path);
    if (isMobile) setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'primary.main' }}>
        <AgricultureIcon sx={{ color: 'white', fontSize: 32 }} />
        <Box>
          <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 700, lineHeight: 1.2 }}>
            AgripredictAI
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            Smart Farming
          </Typography>
        </Box>
      </Box>

      {/* User Info */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#065F46' }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
          <PersonIcon sx={{ fontSize: 20 }} />
        </Avatar>
        <Box>
          <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
            {user?.name || user?.email || 'Farmer'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            {user?.location || 'India'}
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* Navigation */}
      <List sx={{ flexGrow: 1, pt: 1 }}>
        {NAV_ITEMS.map(({ label, path, icon }) => {
          const isActive = location.pathname === path;
          return (
            <ListItem key={path} disablePadding>
              <Tooltip title={label} placement="right" disableHoverListener>
                <ListItemButton
                  onClick={() => handleNavClick(path)}
                  sx={{
                    mx: 1,
                    borderRadius: 2,
                    mb: 0.5,
                    bgcolor: isActive ? 'primary.main' : 'transparent',
                    '&:hover': { bgcolor: isActive ? 'primary.dark' : 'action.hover' },
                    color: isActive ? 'white' : 'text.primary',
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: isActive ? 'white' : 'primary.main' }}>
                    {icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={label}
                    primaryTypographyProps={{ fontSize: 14, fontWeight: isActive ? 600 : 400 }}
                  />
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      {/* Bottom actions */}
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={() => handleNavClick('/profile')} sx={{ mx: 1, borderRadius: 2 }}>
            <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}><PersonIcon /></ListItemIcon>
            <ListItemText primary="Profile" primaryTypographyProps={{ fontSize: 14 }} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout} sx={{ mx: 1, borderRadius: 2, mb: 1 }}>
            <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: 14, color: 'error.main' }} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      {isMobile && (
        <IconButton
          onClick={() => setMobileOpen(true)}
          sx={{ position: 'fixed', top: 8, left: 8, zIndex: 1300, bgcolor: 'primary.main', color: 'white' }}
        >
          <MenuIcon />
        </IconButton>
      )}

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth } }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', borderRight: '1px solid #E5E7EB' },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </>
  );
}
