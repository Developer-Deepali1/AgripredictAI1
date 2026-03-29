import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip,
  Avatar, List, ListItem, ListItemText,
  ListItemIcon, LinearProgress,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import NatureIcon from '@mui/icons-material/Nature';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../utils/i18n';
import { dashboardService } from '../services/api';

const MOCK_PRICE_TRENDS = [
  { month: 'Aug', Rice: 2100, Wheat: 2200, Maize: 1800 },
  { month: 'Sep', Rice: 2150, Wheat: 2250, Maize: 1850 },
  { month: 'Oct', Rice: 2300, Wheat: 2180, Maize: 1920 },
  { month: 'Nov', Rice: 2280, Wheat: 2300, Maize: 2000 },
  { month: 'Dec', Rice: 2400, Wheat: 2350, Maize: 1980 },
  { month: 'Jan', Rice: 2450, Wheat: 2400, Maize: 2050 },
];

// Generic alerts used when no location is set
const GENERIC_ALERTS = [
  { id: 1, message: 'Rice prices at local mandi dropped 12% this week', severity: 'HIGH', type: 'Price Drop' },
  { id: 2, message: 'Heavy rainfall forecast for your district next 3 days', severity: 'HIGH', type: 'Weather' },
  { id: 3, message: 'Wheat demand spike – good time to sell', severity: 'MEDIUM', type: 'Demand Spike' },
];

const MOCK_RECOMMENDATIONS = [
  { crop: 'Rice', profit: '₹45,000/ha', risk: 'LOW', score: 88 },
  { crop: 'Wheat', profit: '₹38,000/ha', risk: 'LOW', score: 82 },
  { crop: 'Maize', profit: '₹32,000/ha', risk: 'MEDIUM', score: 74 },
];

const SEVERITY_COLOR = { HIGH: 'error', MEDIUM: 'warning', LOW: 'success' };
const RISK_COLOR = { LOW: 'success', MEDIUM: 'warning', HIGH: 'error' };

function StatCard({ title, value, icon, color, subtitle }) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" color="text.secondary">{title}</Typography>
            <Typography variant="h4" fontWeight={700} color={color || 'text.primary'} mt={0.5}>
              {value}
            </Typography>
            {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
          </Box>
          <Avatar sx={{ bgcolor: `${color || 'primary'}.light` || '#D1FAE5', color: color || 'primary.main' }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { user, userProfile } = useAuth();
  useLanguage(); // subscribe to language changes so t() returns updated translations
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);

  const locationLabel = userProfile?.local_area
    ? `${userProfile.local_area}, ${userProfile.district}, ${userProfile.location}`
    : userProfile?.district
    ? `${userProfile.district}, ${userProfile.location}`
    : userProfile?.location || null;

  // Build location-aware alerts preview
  const recentAlerts = locationLabel ? [
    { id: 1, message: `Rice prices dropped 12% at ${userProfile.district || userProfile.location} mandi`, severity: 'HIGH', type: 'Price Drop' },
    { id: 2, message: `Heavy rainfall expected in ${userProfile.district || userProfile.location} next 3 days`, severity: 'HIGH', type: 'Weather' },
    { id: 3, message: 'Wheat demand spike – good time to sell at local mandi', severity: 'MEDIUM', type: 'Demand Spike' },
  ] : GENERIC_ALERTS;

  useEffect(() => {
    dashboardService.getSummary()
      .then((res) => setSummary(res.data))
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
  }, []);

  const stats = summary || {
    total_crops: 8,
    active_alerts: 3,
    profit_estimate: '₹1.2L',
    risk_level: 'MEDIUM',
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} color="primary.main">
          {t('dashboard.welcomeBack')}, {user?.name || t('sidebar.farmer')} 👋
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
          <Typography variant="body1" color="text.secondary">
            {t('dashboard.overview')}
          </Typography>
          {locationLabel && (
            <Chip
              icon={<LocationOnIcon />}
              label={locationLabel}
              size="small"
              color="success"
              variant="outlined"
            />
          )}
        </Box>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Stats */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title={t('dashboard.trackedCrops')} value={stats.total_crops || 8} icon={<NatureIcon />} color="success" subtitle={t('dashboard.inYourProfile')} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title={t('dashboard.activeAlerts')} value={stats.active_alerts || 3} icon={<NotificationsIcon />} color="warning" subtitle={t('dashboard.needsAttention')} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title={t('dashboard.profitEstimate')} value={stats.profit_estimate || '₹1.2L'} icon={<AttachMoneyIcon />} color="primary" subtitle={t('dashboard.thisSeason')} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title={t('dashboard.riskLevel')} value={stats.risk_level || 'MEDIUM'} icon={<WarningAmberIcon />} color="warning" subtitle={t('dashboard.portfolioRisk')} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Price Trends Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>{t('dashboard.priceTrends')}</Typography>
                <Button size="small" onClick={() => navigate('/predictions')}>{t('dashboard.viewDetails')}</Button>
              </Box>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={MOCK_PRICE_TRENDS}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip formatter={(v) => [`₹${v}`, '']} />
                  <Legend />
                  <Line type="monotone" dataKey="Rice" stroke="#10B981" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Wheat" stroke="#3B82F6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Maize" stroke="#F59E0B" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Recommended Crops */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>{t('dashboard.topPicks')}</Typography>
                <Button size="small" onClick={() => navigate('/recommendations')}>{t('dashboard.viewAll')}</Button>
              </Box>
              {MOCK_RECOMMENDATIONS.map((r) => (
                <Box key={r.crop} sx={{ mb: 2, p: 1.5, bgcolor: '#F0FDF4', borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography fontWeight={600}>{r.crop}</Typography>
                    <Chip label={r.risk} size="small" color={RISK_COLOR[r.risk]} />
                  </Box>
                  <Typography variant="body2" color="text.secondary" mb={0.5}>{r.profit}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress variant="determinate" value={r.score} sx={{ flexGrow: 1, height: 6, borderRadius: 3 }} />
                    <Typography variant="caption" fontWeight={600}>{r.score}%</Typography>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Alerts */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" fontWeight={600}>{t('dashboard.recentAlerts')}</Typography>
                <Button size="small" onClick={() => navigate('/alerts')}>{t('dashboard.viewAll2')}</Button>
              </Box>
              {locationLabel && (
                <Chip icon={<LocationOnIcon />} label={`Showing alerts for ${userProfile.district || userProfile.location}`} size="small" color="success" variant="outlined" sx={{ mb: 1.5 }} />
              )}
              <List disablePadding>
                {recentAlerts.map((a) => (
                  <ListItem key={a.id} disablePadding sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <NotificationsIcon color={SEVERITY_COLOR[a.severity]} fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={a.message}
                      secondary={a.type}
                      primaryTypographyProps={{ fontSize: 13 }}
                      secondaryTypographyProps={{ fontSize: 12 }}
                    />
                    <Chip label={a.severity} size="small" color={SEVERITY_COLOR[a.severity]} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>{t('dashboard.quickActions')}</Typography>
              <Grid container spacing={1.5}>
                {[
                  { labelKey: 'dashboard.checkFeasibility', path: '/feasibility', icon: <NatureIcon />, color: 'primary' },
                  { labelKey: 'dashboard.profitAnalysis', path: '/profit', icon: <AttachMoneyIcon />, color: 'success' },
                  { labelKey: 'dashboard.runSimulation', path: '/simulator', icon: <TrendingUpIcon />, color: 'info' },
                  { labelKey: 'dashboard.riskAssessment', path: '/risk', icon: <WarningAmberIcon />, color: 'warning' },
                ].map((a) => (
                  <Grid item xs={6} key={a.labelKey}>
                    <Button
                      fullWidth
                      variant="outlined"
                      color={a.color}
                      startIcon={a.icon}
                      onClick={() => navigate(a.path)}
                      sx={{ py: 1.5, borderRadius: 2 }}
                    >
                      {t(a.labelKey)}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
