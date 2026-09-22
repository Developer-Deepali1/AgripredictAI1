import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip,
  List, ListItem, ListItemText,
  ListItemIcon, LinearProgress,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import NatureIcon from '@mui/icons-material/Nature';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../utils/i18n';
import { dashboardService } from '../services/api';

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

const SEVERITY_CONFIG = {
  HIGH: { color: 'error', bg: 'rgba(239, 68, 68, 0.1)', text: '#DC2626' },
  MEDIUM: { color: 'warning', bg: 'rgba(245, 158, 11, 0.1)', text: '#D97706' },
  LOW: { color: 'success', bg: 'rgba(16, 185, 129, 0.1)', text: '#059669' },
};

const RISK_COLOR = { LOW: 'success', MEDIUM: 'warning', HIGH: 'error' };

function StatCard({ title, value, icon, gradient, subtitle, trend }) {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 12px 24px -4px rgba(15, 23, 42, 0.08), 0 4px 6px -2px rgba(15, 23, 42, 0.04)',
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: '#64748B',
                fontWeight: 600,
                fontSize: '0.78rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                fontWeight: 800,
                color: '#0F172A',
                mt: 0.5,
                fontSize: { xs: '1.6rem', md: '1.85rem' },
                letterSpacing: '-0.5px',
              }}
            >
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              background: gradient || 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.12)',
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1, borderTop: '1px solid #F1F5F9' }}>
          {subtitle && (
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500, fontSize: '0.75rem' }}>
              {subtitle}
            </Typography>
          )}
          {trend && (
            <Chip
              label={trend}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.68rem',
                fontWeight: 700,
                bgcolor: 'rgba(16, 185, 129, 0.1)',
                color: '#059669',
                borderRadius: '6px',
              }}
            />
          )}
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
      {/* ── Welcome Hero Banner ── */}
      <Card
        sx={{
          mb: 3.5,
          p: { xs: 2.5, sm: 3 },
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F0FDF4 50%, #ECFDF5 100%)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.08), 0 4px 6px -2px rgba(16, 185, 129, 0.04)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle decorative background circle */}
        <Box
          sx={{
            position: 'absolute',
            top: -40,
            right: -40,
            width: 220,
            height: 220,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, rgba(255,255,255,0) 70%)',
            pointerEvents: 'none',
          }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 0.8 }}>
              <Typography
                variant="h4"
                sx={{
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                  fontWeight: 800,
                  color: '#064E3B',
                  letterSpacing: '-0.5px',
                  fontSize: { xs: '1.5rem', sm: '1.9rem' },
                }}
              >
                {t('dashboard.welcomeBack')}, {user?.name || t('sidebar.farmer')} 👋
              </Typography>
              <Chip
                icon={<CheckCircleIcon sx={{ fontSize: 16, color: '#10B981 !important' }} />}
                label="Farm Live"
                size="small"
                sx={{
                  bgcolor: 'rgba(16, 185, 129, 0.15)',
                  color: '#065F46',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Typography variant="body1" sx={{ color: '#475569', fontSize: '0.92rem' }}>
                {t('dashboard.overview')}
              </Typography>
              {locationLabel && (
                <Chip
                  icon={<LocationOnIcon sx={{ fontSize: 16, color: '#059669 !important' }} />}
                  label={locationLabel}
                  size="small"
                  sx={{
                    bgcolor: '#FFFFFF',
                    color: '#0F172A',
                    fontWeight: 600,
                    border: '1px solid #CBD5E1',
                    fontSize: '0.75rem',
                  }}
                />
              )}
            </Box>
          </Box>

          {/* Weather status chip */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.2,
              px: 2,
              py: 1,
              borderRadius: '12px',
              bgcolor: '#FFFFFF',
              border: '1px solid rgba(226, 232, 240, 0.9)',
              boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
            }}
          >
            <WbSunnyIcon sx={{ color: '#F59E0B', fontSize: 24 }} />
            <Box>
              <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontWeight: 600, fontSize: '0.7rem' }}>
                LOCAL CLIMATE
              </Typography>
              <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 700, fontSize: '0.85rem' }}>
                28°C • Optimal Growing
              </Typography>
            </Box>
          </Box>
        </Box>
      </Card>

      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1, height: 4 }} />}

      {/* ── Stat Cards ── */}
      <Grid container spacing={2.5} mb={3.5}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('dashboard.trackedCrops')}
            value={stats.total_crops || 8}
            icon={<NatureIcon sx={{ fontSize: 26 }} />}
            gradient="linear-gradient(135deg, #10B981 0%, #047857 100%)"
            subtitle={t('dashboard.inYourProfile')}
            trend="Active"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('dashboard.activeAlerts')}
            value={stats.active_alerts || 3}
            icon={<NotificationsIcon sx={{ fontSize: 26 }} />}
            gradient="linear-gradient(135deg, #F59E0B 0%, #D97706 100%)"
            subtitle={t('dashboard.needsAttention')}
            trend="Monitored"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('dashboard.profitEstimate')}
            value={stats.profit_estimate || '₹1.2L'}
            icon={<AttachMoneyIcon sx={{ fontSize: 26 }} />}
            gradient="linear-gradient(135deg, #0D9488 0%, #0F766E 100%)"
            subtitle={t('dashboard.thisSeason')}
            trend="+14% YoY"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('dashboard.riskLevel')}
            value={stats.risk_level || 'MEDIUM'}
            icon={<WarningAmberIcon sx={{ fontSize: 26 }} />}
            gradient="linear-gradient(135deg, #6366F1 0%, #4338CA 100%)"
            subtitle={t('dashboard.portfolioRisk')}
            trend="Controlled"
          />
        </Grid>
      </Grid>

      {/* ── Main Content Charts & Recommendations ── */}
      <Grid container spacing={3}>
        {/* Price Trends Chart */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 700, color: '#0F172A', fontSize: '1.05rem' }}>
                    {t('dashboard.priceTrends')}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.2 }}>
                    Historical & forecast mandi prices (₹/quintal)
                  </Typography>
                </Box>
                <Button
                  size="small"
                  endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
                  onClick={() => navigate('/predictions')}
                  sx={{ textTransform: 'none', fontWeight: 600, color: '#059669' }}
                >
                  {t('dashboard.viewDetails')}
                </Button>
              </Box>

              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={summary?.price_trend_data && summary.price_trend_data.length > 0 ? summary.price_trend_data : []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} stroke="#CBD5E1" />
                  <YAxis tick={{ fontSize: 12, fill: '#64748B' }} tickFormatter={(v) => `₹${v}`} stroke="#CBD5E1" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '10px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                      fontSize: '12px',
                    }}
                    formatter={(v) => [`₹${v}`, '']}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="Rice" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="Wheat" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="Maize" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="Cotton" stroke="#8B5CF6" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Recommended Crops */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 700, color: '#0F172A', fontSize: '1.05rem' }}>
                  {t('dashboard.topPicks')}
                </Typography>
                <Button
                  size="small"
                  onClick={() => navigate('/recommendations')}
                  sx={{ textTransform: 'none', fontWeight: 600, color: '#059669' }}
                >
                  {t('dashboard.viewAll')}
                </Button>
              </Box>

              {(summary?.top_recommendations && summary.top_recommendations.length > 0 ? summary.top_recommendations : MOCK_RECOMMENDATIONS).map((r, idx) => (
                <Box
                  key={r.crop}
                  sx={{
                    mb: 1.5,
                    p: 1.8,
                    bgcolor: '#F8FAFC',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: '#F0FDF4',
                      borderColor: 'rgba(16, 185, 129, 0.4)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 22,
                          height: 22,
                          borderRadius: '6px',
                          bgcolor: idx === 0 ? '#10B981' : 'rgba(148, 163, 184, 0.2)',
                          color: idx === 0 ? '#FFFFFF' : '#475569',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                        }}
                      >
                        #{idx + 1}
                      </Box>
                      <Typography fontWeight={700} sx={{ color: '#0F172A', fontSize: '0.95rem' }}>
                        {r.crop}
                      </Typography>
                    </Box>
                    <Chip
                      label={r.risk}
                      size="small"
                      color={RISK_COLOR[r.risk] || 'default'}
                      sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700 }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500 }}>
                      Expected Profit
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#059669', fontSize: '0.85rem' }}>
                      {r.profit}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={r.score}
                      sx={{
                        flexGrow: 1,
                        height: 7,
                        borderRadius: 4,
                        bgcolor: '#E2E8F0',
                        '& .MuiLinearProgress-bar': {
                          background: 'linear-gradient(90deg, #34D399 0%, #059669 100%)',
                          borderRadius: 4,
                        },
                      }}
                    />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.75rem', minWidth: 32, textAlign: 'right' }}>
                      {r.score}%
                    </Typography>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Alerts */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="h6" sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 700, color: '#0F172A', fontSize: '1.05rem' }}>
                  {t('dashboard.recentAlerts')}
                </Typography>
                <Button
                  size="small"
                  onClick={() => navigate('/alerts')}
                  sx={{ textTransform: 'none', fontWeight: 600, color: '#059669' }}
                >
                  {t('dashboard.viewAll2')}
                </Button>
              </Box>

              {locationLabel && (
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <LocationOnIcon sx={{ fontSize: 16, color: '#10B981' }} />
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                    Location alerts for: <strong style={{ color: '#0F172A' }}>{userProfile.district || userProfile.location}</strong>
                  </Typography>
                </Box>
              )}

              <List disablePadding>
                {recentAlerts.map((a) => {
                  const sev = SEVERITY_CONFIG[a.severity] || SEVERITY_CONFIG.LOW;
                  return (
                    <ListItem
                      key={a.id}
                      disablePadding
                      sx={{
                        py: 1.2,
                        px: 1.5,
                        mb: 1,
                        borderRadius: '10px',
                        bgcolor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        borderLeft: `4px solid ${sev.text}`,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <NotificationsIcon sx={{ fontSize: 18, color: sev.text }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={a.message}
                        secondary={a.type}
                        primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F172A' }}
                        secondaryTypographyProps={{ fontSize: '0.74rem', color: '#64748B', mt: 0.2 }}
                      />
                      <Chip
                        label={a.severity}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          bgcolor: sev.bg,
                          color: sev.text,
                          borderRadius: '6px',
                        }}
                      />
                    </ListItem>
                  );
                })}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 700, color: '#0F172A', fontSize: '1.05rem', mb: 2 }}>
                {t('dashboard.quickActions')}
              </Typography>
              <Grid container spacing={2}>
                {[
                  { labelKey: 'dashboard.checkFeasibility', path: '/feasibility', icon: <NatureIcon sx={{ fontSize: 22 }} />, color: '#059669', bg: 'rgba(16, 185, 129, 0.08)' },
                  { labelKey: 'dashboard.profitAnalysis', path: '/profit', icon: <AttachMoneyIcon sx={{ fontSize: 22 }} />, color: '#0D9488', bg: 'rgba(13, 148, 136, 0.08)' },
                  { labelKey: 'dashboard.runSimulation', path: '/simulator', icon: <TrendingUpIcon sx={{ fontSize: 22 }} />, color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.08)' },
                  { labelKey: 'dashboard.riskAssessment', path: '/risk', icon: <WarningAmberIcon sx={{ fontSize: 22 }} />, color: '#D97706', bg: 'rgba(245, 158, 11, 0.08)' },
                ].map((a) => (
                  <Grid item xs={12} sm={6} key={a.labelKey}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => navigate(a.path)}
                      sx={{
                        py: 2,
                        px: 2,
                        borderRadius: '12px',
                        border: '1px solid #E2E8F0',
                        bgcolor: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        gap: 1.5,
                        textTransform: 'none',
                        color: '#0F172A',
                        textAlign: 'left',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: a.bg,
                          borderColor: a.color,
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: '8px',
                          bgcolor: a.bg,
                          color: a.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {a.icon}
                      </Box>
                      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                        <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>
                          {t(a.labelKey)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.72rem', display: 'block', mt: 0.3 }}>
                          Launch tool & analytics →
                        </Typography>
                      </Box>
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
