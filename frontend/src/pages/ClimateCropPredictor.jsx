import React, { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, TextField,
  CircularProgress, Chip, LinearProgress, List, ListItem,
  ListItemIcon, ListItemText, Alert, Divider, Tooltip,
} from '@mui/material';
import PublicIcon from '@mui/icons-material/Public';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import SpaIcon from '@mui/icons-material/Spa';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import DownloadIcon from '@mui/icons-material/Download';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import GrassIcon from '@mui/icons-material/Grass';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer, BarChart, Bar, Cell,
} from 'recharts';
import api from '../services/api';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RESILIENCE_COLORS = ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5'];

const CROP_ICONS = {
  Millet: '🌾', Sorghum: '🌿', 'Pigeon Pea': '🫘', Groundnut: '🥜',
  Cotton: '☁️', Maize: '🌽', Rice: '🍚', Wheat: '🌾',
  Chickpea: '🟡', Lentil: '🟤',
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionHeader({ icon, title, subtitle }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
        {icon}
        <Typography variant="h4" fontWeight={700} color="primary.main">
          {title}
        </Typography>
      </Box>
      {subtitle && (
        <Typography variant="body1" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}

function CropCard({ crop, index }) {
  const icon = CROP_ICONS[crop.crop] || '🌱';
  const color = RESILIENCE_COLORS[Math.min(index, RESILIENCE_COLORS.length - 1)];
  const scorePercent = Math.round(crop.resilience_score * 100);

  return (
    <Card
      sx={{
        mb: 2,
        p: 0,
        border: index === 0 ? '2px solid #10B981' : '1px solid #E5E7EB',
        bgcolor: index === 0 ? '#F0FDF4' : 'background.paper',
        transition: 'transform 0.2s',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography sx={{ fontSize: 36, lineHeight: 1 }}>{icon}</Typography>
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {crop.crop}
                  {index === 0 && (
                    <Chip label="Best Pick" color="success" size="small" sx={{ ml: 1 }} />
                  )}
                </Typography>
                <Chip
                  icon={<WbSunnyIcon fontSize="small" />}
                  label={`Planting: ${crop.planting_season}`}
                  size="small" variant="outlined" color="warning"
                  sx={{ mt: 0.5 }}
                />
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h5" fontWeight={800} sx={{ color }}>
                  {scorePercent}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Resilience
                </Typography>
              </Box>
            </Box>
            <LinearProgress
              variant="determinate"
              value={scorePercent}
              sx={{
                mt: 1.5, height: 10, borderRadius: 5,
                '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 5 },
                bgcolor: '#E5E7EB',
              }}
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function ClimateSummaryCard({ summary, confidence }) {
  const items = [
    {
      icon: <ThermostatIcon sx={{ color: '#EF4444' }} />,
      label: 'Temperature Change',
      value: summary.temperature_change,
      color: '#EF4444',
    },
    {
      icon: <WaterDropIcon sx={{ color: '#3B82F6' }} />,
      label: 'Rainfall Variation',
      value: summary.rainfall_variation,
      color: '#3B82F6',
    },
    {
      icon: <SpaIcon sx={{ color: '#10B981' }} />,
      label: 'Humidity Change',
      value: summary.humidity_change,
      color: '#10B981',
    },
  ];

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" fontWeight={600} mb={2}>
          Future Climate Summary
        </Typography>
        <Grid container spacing={2}>
          {items.map(({ icon, label, value, color }) => (
            <Grid item xs={12} sm={4} key={label}>
              <Box
                sx={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  p: 2, borderRadius: 2, bgcolor: '#F9FAFB', textAlign: 'center',
                }}
              >
                {icon}
                <Typography variant="h5" fontWeight={700} sx={{ color, mt: 0.5 }}>
                  {value}
                </Typography>
                <Typography variant="caption" color="text.secondary">{label}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Climate Zone: <strong>{summary.climate_zone}</strong>
          </Typography>
          <Tooltip title="Köppen-Geiger classification based on your location">
            <InfoIcon fontSize="small" color="action" />
          </Tooltip>
        </Box>

        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Model confidence:
          </Typography>
          <LinearProgress
            variant="determinate"
            value={Math.round(confidence * 100)}
            sx={{
              flexGrow: 1, height: 8, borderRadius: 4,
              '& .MuiLinearProgress-bar': { bgcolor: '#10B981' },
            }}
          />
          <Typography variant="body2" fontWeight={700} color="success.main">
            {Math.round(confidence * 100)}%
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// CSV export helper
// ---------------------------------------------------------------------------

function exportToCsv(crops, climateSummary) {
  const headers = ['Crop', 'Resilience Score', 'Planting Season'];
  const rows = crops.map(c => [
    c.crop,
    (c.resilience_score * 100).toFixed(1) + '%',
    c.planting_season,
  ]);

  const meta = [
    ['Temperature Change', climateSummary.temperature_change],
    ['Rainfall Variation', climateSummary.rainfall_variation],
    ['Humidity Change', climateSummary.humidity_change],
    ['Climate Zone', climateSummary.climate_zone],
  ];

  const csv = [
    '# Climate-Resilient Crop Recommendations – AgriPredict AI',
    '',
    headers.join(','),
    ...rows.map(r => r.join(',')),
    '',
    '# Climate Summary',
    ...meta.map(m => m.join(',')),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'climate_crop_recommendations.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function ClimateCropPredictor() {
  const [latitude, setLatitude]   = useState('20.2961');
  const [longitude, setLongitude] = useState('85.8245');
  const [soilPh, setSoilPh]       = useState('6.5');
  const [nitrogen, setNitrogen]   = useState('80');
  const [phosphorus, setPhosphorus] = useState('45');
  const [potassium, setPotassium] = useState('50');
  const [horizonYears, setHorizonYears] = useState('7');

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError]     = useState(null);
  const [errors, setErrors]   = useState({});

  const validate = () => {
    const e = {};
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    if (isNaN(lat) || lat < -90 || lat > 90)
      e.latitude = 'Enter a value between -90 and 90';
    if (isNaN(lon) || lon < -180 || lon > 180)
      e.longitude = 'Enter a value between -180 and 180';
    if (isNaN(parseFloat(soilPh)) || parseFloat(soilPh) < 0 || parseFloat(soilPh) > 14)
      e.soilPh = 'Enter a value between 0 and 14';
    if (isNaN(parseFloat(nitrogen)) || parseFloat(nitrogen) < 0)
      e.nitrogen = 'Must be ≥ 0 kg/ha';
    if (isNaN(parseFloat(phosphorus)) || parseFloat(phosphorus) < 0)
      e.phosphorus = 'Must be ≥ 0 kg/ha';
    if (isNaN(parseFloat(potassium)) || parseFloat(potassium) < 0)
      e.potassium = 'Must be ≥ 0 kg/ha';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePredict = async () => {
    if (!validate()) return;
    setLoading(true);
    setResults(null);
    setError(null);

    try {
      const response = await api.post('/api/predict/future-crops', {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        soil_ph: parseFloat(soilPh),
        nitrogen: parseFloat(nitrogen),
        phosphorus: parseFloat(phosphorus),
        potassium: parseFloat(potassium),
        horizon_years: parseInt(horizonYears, 10),
      });
      setResults(response.data);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
        'Failed to get predictions. Please check the backend is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const tempChartData = results?.temperature_trend?.map(d => ({
    year: d.year,
    temperature: d.temperature,
  })) ?? [];

  const rainChartData = results?.rainfall_trend?.map(d => ({
    year: d.year,
    rainfall: d.rainfall,
  })) ?? [];

  const barChartData = results?.recommended_crops?.map(c => ({
    name: c.crop,
    score: Math.round(c.resilience_score * 100),
  })) ?? [];

  return (
    <Box>
      <SectionHeader
        icon={<GrassIcon color="primary" sx={{ fontSize: 32 }} />}
        title="Climate-Resilient Crop Predictor"
        subtitle="Enter your farm location and soil data to discover crops that will thrive in your region over the next 5–10 years."
      />

      <Grid container spacing={3}>
        {/* ── Input Panel ── */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: { md: 'sticky' }, top: { md: 80 } }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <AutoAwesomeIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>Farm Parameters</Typography>
              </Box>

              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                📍 Location
              </Typography>
              <Grid container spacing={1} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth size="small" label="Latitude" value={latitude}
                    onChange={e => setLatitude(e.target.value)}
                    error={!!errors.latitude} helperText={errors.latitude}
                    type="number" inputProps={{ step: 0.0001 }}
                    InputProps={{ startAdornment: <PublicIcon sx={{ mr: 0.5, fontSize: 16, color: 'primary.main' }} /> }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth size="small" label="Longitude" value={longitude}
                    onChange={e => setLongitude(e.target.value)}
                    error={!!errors.longitude} helperText={errors.longitude}
                    type="number" inputProps={{ step: 0.0001 }}
                  />
                </Grid>
              </Grid>

              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                🌱 Soil Parameters
              </Typography>
              <TextField
                fullWidth size="small" label="Soil pH" value={soilPh}
                onChange={e => setSoilPh(e.target.value)}
                error={!!errors.soilPh} helperText={errors.soilPh}
                type="number" inputProps={{ step: 0.1, min: 0, max: 14 }}
                sx={{ mb: 1.5 }}
              />
              <Grid container spacing={1} sx={{ mb: 1.5 }}>
                <Grid item xs={4}>
                  <TextField
                    fullWidth size="small" label="N (kg/ha)" value={nitrogen}
                    onChange={e => setNitrogen(e.target.value)}
                    error={!!errors.nitrogen} helperText={errors.nitrogen}
                    type="number"
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth size="small" label="P (kg/ha)" value={phosphorus}
                    onChange={e => setPhosphorus(e.target.value)}
                    error={!!errors.phosphorus} helperText={errors.phosphorus}
                    type="number"
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth size="small" label="K (kg/ha)" value={potassium}
                    onChange={e => setPotassium(e.target.value)}
                    error={!!errors.potassium} helperText={errors.potassium}
                    type="number"
                  />
                </Grid>
              </Grid>

              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                📅 Forecast Horizon
              </Typography>
              <TextField
                fullWidth size="small" label="Years ahead (1–10)" value={horizonYears}
                onChange={e => setHorizonYears(e.target.value)}
                type="number" inputProps={{ min: 1, max: 10 }}
                sx={{ mb: 2.5 }}
              />

              <Button
                fullWidth variant="contained" color="primary"
                startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <AutoAwesomeIcon />}
                onClick={handlePredict}
                disabled={loading}
                sx={{ py: 1.5, borderRadius: 2, fontWeight: 600, fontSize: 15 }}
              >
                {loading ? 'Predicting…' : 'Predict Future Crops'}
              </Button>

              {results && (
                <Button
                  fullWidth variant="outlined" color="primary"
                  startIcon={<DownloadIcon />}
                  onClick={() => exportToCsv(results.recommended_crops, results.future_climate_summary)}
                  sx={{ mt: 1, borderRadius: 2 }}
                >
                  Export CSV
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* ── Results Panel ── */}
        <Grid item xs={12} md={8}>
          {/* Loading state */}
          {loading && (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <CircularProgress color="primary" size={64} />
                <Typography mt={2} variant="h6" color="text.secondary">
                  Analyzing climate projections…
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  Training ML model on historical data and forecasting future conditions
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Error state */}
          {!loading && error && (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          )}

          {/* Empty state */}
          {!loading && !results && !error && (
            <Card sx={{ bgcolor: '#F9FAFB' }}>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <GrassIcon sx={{ fontSize: 64, color: '#D1D5DB', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  Enter farm parameters on the left
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  The AI will predict future climate conditions and recommend the
                  most resilient crops for your location.
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {!loading && results && (
            <Box>
              {/* Climate Summary */}
              <ClimateSummaryCard
                summary={results.future_climate_summary}
                confidence={results.confidence_score}
              />

              {/* Explanation */}
              <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3 }}>
                <Typography variant="body2">{results.explanation}</Typography>
                <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                  Model: {results.model_type}
                </Typography>
              </Alert>

              <Grid container spacing={3}>
                {/* Crop recommendations */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    🏆 Top Climate-Resilient Crops
                  </Typography>
                  {results.recommended_crops.map((crop, i) => (
                    <CropCard key={crop.crop} crop={crop} index={i} />
                  ))}
                </Grid>

                {/* Resilience bar chart */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight={600} mb={2}>
                        Resilience Scores
                      </Typography>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={barChartData} layout="vertical" margin={{ left: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                          <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                          <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={75} />
                          <RechartsTooltip formatter={v => [`${v}%`, 'Resilience']} />
                          <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                            {barChartData.map((_, index) => (
                              <Cell key={index}
                                fill={RESILIENCE_COLORS[Math.min(index, RESILIENCE_COLORS.length - 1)]}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Temperature trend chart */}
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight={600} mb={2}>
                        🌡️ Predicted Temperature Trend
                      </Typography>
                      <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={tempChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                          <YAxis unit="°C" tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
                          <RechartsTooltip formatter={v => [`${v} °C`, 'Avg Temperature']} />
                          <Line
                            type="monotone" dataKey="temperature"
                            stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }}
                            activeDot={{ r: 5 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Rainfall trend chart */}
                  <Card>
                    <CardContent>
                      <Typography variant="h6" fontWeight={600} mb={2}>
                        💧 Predicted Rainfall Trend
                      </Typography>
                      <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={rainChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                          <YAxis unit=" mm" tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
                          <RechartsTooltip formatter={v => [`${v} mm`, 'Total Rainfall']} />
                          <Line
                            type="monotone" dataKey="rainfall"
                            stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }}
                            activeDot={{ r: 5 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
