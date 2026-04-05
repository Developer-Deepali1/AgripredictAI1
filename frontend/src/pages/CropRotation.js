import React, { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, Avatar,
  LinearProgress, Tabs, Tab, Divider, List, ListItem, ListItemIcon,
  ListItemText, TextField, MenuItem, CircularProgress,
} from '@mui/material';
import LoopIcon from '@mui/icons-material/Loop';
import SpaIcon from '@mui/icons-material/Spa';
import BarChartIcon from '@mui/icons-material/BarChart';
import NatureIcon from '@mui/icons-material/Nature';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import BoltIcon from '@mui/icons-material/Bolt';
import GrassIcon from '@mui/icons-material/Grass';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip,
  LineChart, Line, Legend, Cell,
} from 'recharts';

// ── Static mock data ────────────────────────────────────────────────────────

const SOIL_NUTRIENTS = [
  { nutrient: 'Nitrogen', value: 62, optimal: 80, unit: 'kg/ha' },
  { nutrient: 'Phosphorus', value: 45, optimal: 60, unit: 'kg/ha' },
  { nutrient: 'Potassium', value: 78, optimal: 90, unit: 'kg/ha' },
  { nutrient: 'Organic Carbon', value: 1.2, optimal: 2.0, unit: '%' },
  { nutrient: 'pH Level', value: 6.8, optimal: 7.0, unit: '' },
];

const RADAR_DATA = [
  { subject: 'Nitrogen', A: 62, fullMark: 100 },
  { subject: 'Phosphorus', A: 45, fullMark: 100 },
  { subject: 'Potassium', A: 78, fullMark: 100 },
  { subject: 'Moisture', A: 55, fullMark: 100 },
  { subject: 'Org. Carbon', A: 60, fullMark: 100 },
  { subject: 'pH Score', A: 85, fullMark: 100 },
];

const ROTATION_HISTORY = [
  { season: 'Kharif 2022', crop: 'Rice', yield: 5.2, profit: '₹48,000', health: 72 },
  { season: 'Rabi 2022', crop: 'Wheat', yield: 4.8, profit: '₹42,000', health: 78 },
  { season: 'Kharif 2023', crop: 'Maize', yield: 6.1, profit: '₹55,000', health: 82 },
  { season: 'Rabi 2023', crop: 'Mustard', yield: 2.3, profit: '₹38,000', health: 85 },
  { season: 'Kharif 2024', crop: 'Cotton', yield: 3.5, profit: '₹71,000', health: 88 },
];

const TREND_DATA = [
  { season: 'K\'22', yield: 5.2, health: 72 },
  { season: 'R\'22', yield: 4.8, health: 78 },
  { season: 'K\'23', yield: 6.1, health: 82 },
  { season: 'R\'23', yield: 2.3, health: 85 },
  { season: 'K\'24', yield: 3.5, health: 88 },
];

const CURRENT_ROTATION = [
  { season: 'Kharif 2024', crop: 'Cotton', status: 'active', months: 'Jun – Oct' },
  { season: 'Rabi 2024', crop: 'Wheat', status: 'planned', months: 'Nov – Mar' },
  { season: 'Zaid 2025', crop: 'Mung Bean', status: 'planned', months: 'Mar – May' },
];

const AI_PLANS = {
  Rice: [
    { season: 'Next Kharif', crop: 'Mung Bean', reason: 'Fixes nitrogen, improves soil texture', benefit: 'Soil Improvement' },
    { season: 'Rabi', crop: 'Wheat', reason: 'Classic rotation maximises grain yield', benefit: 'High Yield' },
    { season: 'Zaid', crop: 'Sunflower', reason: 'Deep-rooted, breaks pest cycles', benefit: 'Pest Control' },
  ],
  Wheat: [
    { season: 'Next Kharif', crop: 'Cotton', reason: 'Different nutrient demand, high market value', benefit: 'Profit' },
    { season: 'Rabi', crop: 'Mustard', reason: 'Short-duration, replenishes nitrogen', benefit: 'Nitrogen Fix' },
    { season: 'Zaid', crop: 'Watermelon', reason: 'Cash crop, loose soil structure', benefit: 'Cash Crop' },
  ],
  Cotton: [
    { season: 'Next Rabi', crop: 'Chickpea', reason: 'Legume restores nitrogen depleted by cotton', benefit: 'Nitrogen Fix' },
    { season: 'Kharif', crop: 'Maize', reason: 'Avoids soil disease carryover', benefit: 'Disease Break' },
    { season: 'Rabi', crop: 'Wheat', reason: 'Stable income, easy mechanisation', benefit: 'Stability' },
  ],
};

const STATUS_COLOR = { active: 'success', planned: 'info', completed: 'default' };
const BENEFIT_COLOR = {
  'Soil Improvement': 'success',
  'High Yield': 'primary',
  'Pest Control': 'warning',
  Profit: 'secondary',
  'Nitrogen Fix': 'info',
  'Cash Crop': 'success',
  'Disease Break': 'error',
  Stability: 'default',
};

// ── Sub-components ────────────────────────────────────────────────────────────

function NutrientBar({ nutrient, value, optimal, unit }) {
  const pct = Math.min((value / optimal) * 100, 100);
  const color = pct < 60 ? 'error' : pct < 80 ? 'warning' : 'success';
  return (
    <Box mb={1.5}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2" fontWeight={500}>{nutrient}</Typography>
        <Typography variant="body2" color="text.secondary">
          {value}{unit} / {optimal}{unit}
        </Typography>
      </Box>
      <LinearProgress variant="determinate" value={pct} color={color} sx={{ height: 8, borderRadius: 4 }} />
    </Box>
  );
}

function SoilHealthDashboard() {
  const healthScore = 76;
  const healthColor = healthScore < 60 ? '#EF4444' : healthScore < 80 ? '#F59E0B' : '#10B981';

  return (
    <Grid container spacing={3}>
      {/* Score card */}
      <Grid item xs={12} md={4}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} mb={2}>Overall Soil Health</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                <CircularProgress
                  variant="determinate"
                  value={healthScore}
                  size={120}
                  thickness={8}
                  sx={{ color: healthColor }}
                />
                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                  <Typography variant="h4" fontWeight={700} sx={{ color: healthColor }}>{healthScore}</Typography>
                  <Typography variant="caption" color="text.secondary">/ 100</Typography>
                </Box>
              </Box>
            </Box>
            <Chip label="Moderate – Needs Improvement" color="warning" sx={{ width: '100%' }} />

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={1}>
              {[
                { label: 'Moisture', value: '55%', icon: <WaterDropIcon fontSize="small" />, color: '#3B82F6' },
                { label: 'Temperature', value: '24°C', icon: <BoltIcon fontSize="small" />, color: '#F59E0B' },
                { label: 'Organic Matter', value: '1.2%', icon: <GrassIcon fontSize="small" />, color: '#10B981' },
              ].map((m) => (
                <Grid item xs={4} key={m.label}>
                  <Box sx={{ textAlign: 'center', p: 1, bgcolor: '#F9FAFB', borderRadius: 2 }}>
                    <Box sx={{ color: m.color }}>{m.icon}</Box>
                    <Typography variant="caption" display="block" color="text.secondary">{m.label}</Typography>
                    <Typography variant="body2" fontWeight={600}>{m.value}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Nutrient levels */}
      <Grid item xs={12} md={4}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} mb={2}>Nutrient Levels</Typography>
            {SOIL_NUTRIENTS.map((n) => (
              <NutrientBar key={n.nutrient} {...n} />
            ))}
          </CardContent>
        </Card>
      </Grid>

      {/* Radar */}
      <Grid item xs={12} md={4}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} mb={2}>Soil Profile Radar</Typography>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={RADAR_DATA}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                <Radar name="Your Soil" dataKey="A" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
            <Box sx={{ p: 1.5, bgcolor: '#F0FDF4', borderRadius: 2 }}>
              <Typography variant="body2" color="success.dark" fontWeight={500}>
                💡 Tip: Add organic compost to boost nitrogen and carbon levels before the next season.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

function RotationPlanner() {
  const [currentCrop, setCurrentCrop] = useState('Rice');
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState(AI_PLANS['Rice']);
  const [soilType, setSoilType] = useState('Alluvial');
  const [landSize, setLandSize] = useState('2');

  const handleGenerate = () => {
    setGenerating(true);
    setPlan(null);
    setTimeout(() => {
      setPlan(AI_PLANS[currentCrop] || AI_PLANS['Rice']);
      setGenerating(false);
    }, 1500);
  };

  return (
    <Grid container spacing={3}>
      {/* Input form */}
      <Grid item xs={12} md={4}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <AutoAwesomeIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>AI Rotation Planner</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Enter your current crop and soil details to get an AI-optimised rotation plan.
            </Typography>

            <TextField
              select fullWidth label="Current / Last Crop" value={currentCrop}
              onChange={(e) => setCurrentCrop(e.target.value)} sx={{ mb: 2 }}
            >
              {['Rice', 'Wheat', 'Cotton', 'Maize', 'Sugarcane', 'Mustard'].map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </TextField>

            <TextField
              select fullWidth label="Soil Type" value={soilType}
              onChange={(e) => setSoilType(e.target.value)} sx={{ mb: 2 }}
            >
              {['Alluvial', 'Black Cotton', 'Red Laterite', 'Sandy Loam', 'Clay Loam'].map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth label="Land Size (acres)" value={landSize}
              onChange={(e) => setLandSize(e.target.value)} type="number" sx={{ mb: 3 }}
            />

            <Button
              fullWidth variant="contained" color="primary"
              startIcon={generating ? <CircularProgress size={18} color="inherit" /> : <AutoAwesomeIcon />}
              onClick={handleGenerate} disabled={generating}
              sx={{ py: 1.5, borderRadius: 2, fontWeight: 600 }}
            >
              {generating ? 'Generating Plan…' : 'Generate AI Plan'}
            </Button>
          </CardContent>
        </Card>
      </Grid>

      {/* Generated plan */}
      <Grid item xs={12} md={8}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Recommended Rotation Plan
              {plan && <Chip label="AI Generated" size="small" color="primary" sx={{ ml: 1 }} />}
            </Typography>

            {generating && (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <CircularProgress color="primary" size={56} />
                <Typography mt={2} color="text.secondary">Analysing soil data and market conditions…</Typography>
              </Box>
            )}

            {!generating && plan && (
              <>
                <Grid container spacing={2} mb={2}>
                  {plan.map((step, idx) => (
                    <Grid item xs={12} sm={4} key={idx}>
                      <Box sx={{ p: 2, bgcolor: '#F0FDF4', borderRadius: 3, border: '1px solid #BBF7D0', height: '100%' }}>
                        <Chip label={`Step ${idx + 1}`} size="small" color="success" sx={{ mb: 1 }} />
                        <Typography variant="subtitle1" fontWeight={700}>{step.crop}</Typography>
                        <Typography variant="caption" color="text.secondary" display="block" mb={1}>{step.season}</Typography>
                        <Chip label={step.benefit} size="small" color={BENEFIT_COLOR[step.benefit] || 'default'} sx={{ mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">{step.reason}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>

                <Box sx={{ p: 2, bgcolor: '#EFF6FF', borderRadius: 2 }}>
                  <Typography variant="body2" color="primary.dark" fontWeight={500}>
                    📊 Estimated benefit: +15–25% soil health improvement and 10–20% higher yield over 3 seasons with this rotation.
                  </Typography>
                </Box>
              </>
            )}

            {!generating && !plan && (
              <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                <AutoAwesomeIcon sx={{ fontSize: 48, mb: 1, opacity: 0.4 }} />
                <Typography>Fill in the form and click "Generate AI Plan" to get started.</Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

function HistoricalAnalytics() {
  return (
    <Grid container spacing={3}>
      {/* Trend chart */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} mb={2}>Yield & Soil Health Trends</Typography>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={TREND_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="season" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}t`} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} domain={[60, 100]} />
                <RechartTooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="yield" stroke="#10B981" strokeWidth={2} name="Yield (t/ha)" dot={{ r: 4 }} />
                <Line yAxisId="right" type="monotone" dataKey="health" stroke="#3B82F6" strokeWidth={2} name="Soil Health Score" dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Profit by season */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} mb={2}>Profit by Season</Typography>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={ROTATION_HISTORY} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v / 1000}k`} />
                <YAxis dataKey="season" type="category" tick={{ fontSize: 10 }} width={80} />
                <RechartTooltip formatter={(v) => [`₹${v.toLocaleString()}`, 'Profit']} />
                <Bar dataKey="health" fill="#10B981" radius={[0, 4, 4, 0]} name="Soil Health">
                  {ROTATION_HISTORY.map((entry, i) => (
                    <Cell key={i} fill={['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444'][i % 5]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* History table */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} mb={2}>Rotation History</Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: '#F0FDF4' }}>
                    {['Season', 'Crop', 'Yield (t/ha)', 'Net Profit', 'Soil Health Score', 'Status'].map((h) => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: '#065F46' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ROTATION_HISTORY.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #E5E7EB' }}>
                      <td style={{ padding: '10px 16px' }}>{row.season}</td>
                      <td style={{ padding: '10px 16px', fontWeight: 600 }}>{row.crop}</td>
                      <td style={{ padding: '10px 16px' }}>{row.yield}</td>
                      <td style={{ padding: '10px 16px', color: '#059669', fontWeight: 600 }}>{row.profit}</td>
                      <td style={{ padding: '10px 16px' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress variant="determinate" value={row.health} sx={{ flexGrow: 1, height: 6, borderRadius: 3 }} />
                          <Typography variant="caption">{row.health}</Typography>
                        </Box>
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        <Chip label="Completed" size="small" color="success" variant="outlined" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

function RotationOverview() {
  return (
    <Grid container spacing={3}>
      {/* Current plan */}
      <Grid item xs={12} md={7}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>Current Rotation Plan</Typography>
              <Chip label="2024 – 2025" color="primary" size="small" />
            </Box>
            {CURRENT_ROTATION.map((item, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, p: 1.5, bgcolor: '#FAFAFA', borderRadius: 2 }}>
                <Avatar sx={{ bgcolor: item.status === 'active' ? 'success.main' : 'primary.light', width: 44, height: 44 }}>
                  <NatureIcon />
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography fontWeight={600}>{item.crop}</Typography>
                  <Typography variant="caption" color="text.secondary">{item.season} • {item.months}</Typography>
                </Box>
                <Chip label={item.status} size="small" color={STATUS_COLOR[item.status]} />
              </Box>
            ))}
          </CardContent>
        </Card>
      </Grid>

      {/* Summary cards */}
      <Grid item xs={12} md={5}>
        <Grid container spacing={2} sx={{ height: '100%' }}>
          {[
            { title: 'Soil Health Score', value: '76/100', color: '#F59E0B', icon: <SpaIcon />, bg: '#FFFBEB' },
            { title: 'Seasons Tracked', value: '5', color: '#10B981', icon: <LoopIcon />, bg: '#F0FDF4' },
            { title: 'Avg Yield Gain', value: '+12%', color: '#3B82F6', icon: <BarChartIcon />, bg: '#EFF6FF' },
            { title: 'Next Crop', value: 'Wheat', color: '#8B5CF6', icon: <GrassIcon />, bg: '#F5F3FF' },
          ].map((s) => (
            <Grid item xs={6} key={s.title}>
              <Card sx={{ bgcolor: s.bg }}>
                <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Box sx={{ color: s.color }}>{s.icon}</Box>
                    <Typography variant="caption" color="text.secondary">{s.title}</Typography>
                  </Box>
                  <Typography variant="h5" fontWeight={700} sx={{ color: s.color }}>{s.value}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Grid>

      {/* Tips */}
      <Grid item xs={12}>
        <Card sx={{ bgcolor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} color="success.dark" mb={1.5}>
              🌱 AI Rotation Insights
            </Typography>
            <List dense disablePadding>
              {[
                'Legume crops every 2–3 seasons can reduce fertiliser costs by 20–30%.',
                'Rotating deep-rooted and shallow-rooted crops prevents soil compaction.',
                'Your current nitrogen level is below optimal. Consider green manure after cotton.',
                'Soil pH of 6.8 is near-ideal. Avoid acidic crops like blueberries next season.',
              ].map((tip, i) => (
                <ListItem key={i} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <CheckCircleIcon color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={tip} primaryTypographyProps={{ fontSize: 13 }} />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

const TABS = [
  { label: 'Overview', icon: <LoopIcon fontSize="small" /> },
  { label: 'Soil Health', icon: <SpaIcon fontSize="small" /> },
  { label: 'Rotation Planner', icon: <AutoAwesomeIcon fontSize="small" /> },
  { label: 'Historical Analytics', icon: <BarChartIcon fontSize="small" /> },
];

export default function CropRotation() {
  const [tab, setTab] = useState(0);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <LoopIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" fontWeight={700} color="primary.main">
            Crop Rotation
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Plan intelligent rotations, monitor soil health, and track seasonal performance.
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          textColor="primary"
          indicatorColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          {TABS.map((t, i) => (
            <Tab key={i} label={t.label} icon={t.icon} iconPosition="start" sx={{ fontWeight: 600, minHeight: 48 }} />
          ))}
        </Tabs>
      </Box>

      {/* Tab content */}
      {tab === 0 && <RotationOverview />}
      {tab === 1 && <SoilHealthDashboard />}
      {tab === 2 && <RotationPlanner />}
      {tab === 3 && <HistoricalAnalytics />}
    </Box>
  );
}
