import React, { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, MenuItem, TextField,
  CircularProgress, Chip, Avatar, Divider, LinearProgress, List,
  ListItem, ListItemIcon, ListItemText,
} from '@mui/material';
import EmojiNatureIcon from '@mui/icons-material/EmojiNature';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import OpacityIcon from '@mui/icons-material/Opacity';
import SpaIcon from '@mui/icons-material/Spa';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';

const SOIL_TYPES = ['Alluvial', 'Black Cotton', 'Red Laterite', 'Sandy Loam', 'Clay Loam', 'Loamy'];

// Deterministic mock predictions based on inputs
const CROP_CONFIGS = {
  Alluvial: ['Rice', 'Wheat', 'Maize'],
  'Black Cotton': ['Cotton', 'Sorghum', 'Wheat'],
  'Red Laterite': ['Groundnut', 'Cassava', 'Millets'],
  'Sandy Loam': ['Groundnut', 'Watermelon', 'Sunflower'],
  'Clay Loam': ['Rice', 'Cotton', 'Sugarcane'],
  Loamy: ['Wheat', 'Vegetables', 'Maize'],
};

const CROP_DETAILS = {
  Rice: { icon: '🌾', color: '#10B981', season: 'Kharif', profit: '₹49,000/ha', water: 'High' },
  Wheat: { icon: '🌿', color: '#F59E0B', season: 'Rabi', profit: '₹38,000/ha', water: 'Moderate' },
  Maize: { icon: '🌽', color: '#EF4444', season: 'Kharif/Rabi', profit: '₹32,000/ha', water: 'Moderate' },
  Cotton: { icon: '☁️', color: '#8B5CF6', season: 'Kharif', profit: '₹77,000/ha', water: 'Low-Moderate' },
  Sorghum: { icon: '🌱', color: '#6B7280', season: 'Kharif', profit: '₹22,000/ha', water: 'Low' },
  Groundnut: { icon: '🥜', color: '#D97706', season: 'Kharif', profit: '₹35,000/ha', water: 'Low' },
  Cassava: { icon: '🍠', color: '#92400E', season: 'Annual', profit: '₹28,000/ha', water: 'Low' },
  Millets: { icon: '🌾', color: '#059669', season: 'Kharif', profit: '₹18,000/ha', water: 'Very Low' },
  Watermelon: { icon: '🍉', color: '#EF4444', season: 'Zaid', profit: '₹55,000/ha', water: 'Moderate' },
  Sunflower: { icon: '🌻', color: '#F59E0B', season: 'Rabi/Zaid', profit: '₹30,000/ha', water: 'Low' },
  Sugarcane: { icon: '🎋', color: '#10B981', season: 'Annual', profit: '₹85,000/ha', water: 'Very High' },
  Vegetables: { icon: '🥦', color: '#059669', season: 'All year', profit: '₹60,000/ha', water: 'Moderate' },
};

function buildScores(soilType, temperature, rainfall, humidity) {
  const crops = CROP_CONFIGS[soilType] || CROP_CONFIGS['Alluvial'];
  return crops.map((name, i) => {
    const base = [92, 81, 73][i] ?? 65;
    // Small adjustments based on inputs
    const tempAdj = temperature >= 20 && temperature <= 32 ? 3 : -5;
    const rainAdj = rainfall >= 600 ? 4 : rainfall >= 300 ? 0 : -6;
    const humAdj = humidity >= 50 ? 2 : -3;
    const score = Math.min(99, Math.max(40, base + tempAdj + rainAdj + humAdj));
    const detail = CROP_DETAILS[name] || { icon: '🌱', color: '#10B981', season: 'N/A', profit: 'N/A', water: 'Moderate' };
    return { name, score, ...detail };
  });
}

function buildRadar(temperature, rainfall, humidity, soilType) {
  const tempScore = Math.min(100, Math.max(10, ((temperature - 10) / 30) * 100));
  const rainScore = Math.min(100, (rainfall / 1200) * 100);
  const humScore = Math.min(100, humidity);
  const soilScore = { Alluvial: 88, 'Black Cotton': 80, 'Red Laterite': 65, 'Sandy Loam': 72, 'Clay Loam': 76, Loamy: 85 }[soilType] ?? 75;
  return [
    { subject: 'Temperature', A: +tempScore.toFixed(0) },
    { subject: 'Rainfall', A: +rainScore.toFixed(0) },
    { subject: 'Humidity', A: +humScore.toFixed(0) },
    { subject: 'Soil Quality', A: soilScore },
    { subject: 'Climate Fit', A: Math.round((tempScore + rainScore) / 2) },
  ];
}

export default function CropPrediction() {
  const [soilType, setSoilType] = useState('Alluvial');
  const [temperature, setTemperature] = useState('');
  const [rainfall, setRainfall] = useState('');
  const [humidity, setHumidity] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!temperature || isNaN(+temperature) || +temperature < 0 || +temperature > 50)
      e.temperature = 'Enter a value between 0–50°C';
    if (!rainfall || isNaN(+rainfall) || +rainfall < 0 || +rainfall > 5000)
      e.rainfall = 'Enter a value between 0–5000 mm';
    if (!humidity || isNaN(+humidity) || +humidity < 0 || +humidity > 100)
      e.humidity = 'Enter a value between 0–100%';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePredict = () => {
    if (!validate()) return;
    setLoading(true);
    setResults(null);
    setTimeout(() => {
      const scores = buildScores(soilType, +temperature, +rainfall, +humidity);
      const radar = buildRadar(+temperature, +rainfall, +humidity, soilType);
      setResults({ crops: scores, radar });
      setLoading(false);
    }, 1800);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <EmojiNatureIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" fontWeight={700} color="primary.main">
            Crop Prediction
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Enter your field conditions and let AI recommend the best crops for your land.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Input form */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: { md: 'sticky' }, top: { md: 80 } }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <AutoAwesomeIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>Field Parameters</Typography>
              </Box>

              <TextField
                select fullWidth label="Soil Type" value={soilType}
                onChange={(e) => setSoilType(e.target.value)} sx={{ mb: 2 }}
                InputProps={{ startAdornment: <SpaIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} /> }}
              >
                {SOIL_TYPES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>

              <TextField
                fullWidth label="Temperature (°C)" value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                error={!!errors.temperature} helperText={errors.temperature}
                placeholder="e.g. 26"
                type="number" sx={{ mb: 2 }}
                InputProps={{ startAdornment: <ThermostatIcon sx={{ mr: 1, color: '#F59E0B', fontSize: 20 }} /> }}
              />

              <TextField
                fullWidth label="Annual Rainfall (mm)" value={rainfall}
                onChange={(e) => setRainfall(e.target.value)}
                error={!!errors.rainfall} helperText={errors.rainfall}
                placeholder="e.g. 850"
                type="number" sx={{ mb: 2 }}
                InputProps={{ startAdornment: <WaterDropIcon sx={{ mr: 1, color: '#3B82F6', fontSize: 20 }} /> }}
              />

              <TextField
                fullWidth label="Humidity (%)" value={humidity}
                onChange={(e) => setHumidity(e.target.value)}
                error={!!errors.humidity} helperText={errors.humidity}
                placeholder="e.g. 65"
                type="number" sx={{ mb: 3 }}
                InputProps={{ startAdornment: <OpacityIcon sx={{ mr: 1, color: '#10B981', fontSize: 20 }} /> }}
              />

              <Button
                fullWidth variant="contained" color="primary"
                startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <AutoAwesomeIcon />}
                onClick={handlePredict} disabled={loading}
                sx={{ py: 1.5, borderRadius: 2, fontWeight: 600, fontSize: 16 }}
              >
                {loading ? 'Predicting…' : 'Predict Best Crops'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Results */}
        <Grid item xs={12} md={8}>
          {loading && (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <CircularProgress color="primary" size={64} />
                <Typography mt={2} variant="h6" color="text.secondary">Analysing field conditions…</Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>Our AI is evaluating soil, climate, and market data</Typography>
              </CardContent>
            </Card>
          )}

          {!loading && !results && (
            <Card sx={{ bgcolor: '#F9FAFB' }}>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <EmojiNatureIcon sx={{ fontSize: 64, color: '#D1D5DB', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">Enter your field parameters</Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  Fill in the form on the left and click "Predict Best Crops" to see AI recommendations.
                </Typography>
              </CardContent>
            </Card>
          )}

          {!loading && results && (
            <Box>
              {/* Top pick */}
              <Card sx={{ mb: 3, bgcolor: '#F0FDF4', border: '2px solid #BBF7D0' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Chip label="🏆 Top Recommendation" color="success" />
                    <Chip label="AI Powered" icon={<AutoAwesomeIcon />} size="small" color="primary" />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography sx={{ fontSize: 48 }}>{results.crops[0].icon}</Typography>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h4" fontWeight={700} color="success.dark">
                        {results.crops[0].name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                        <Chip label={`Season: ${results.crops[0].season}`} size="small" variant="outlined" />
                        <Chip label={`Est. Profit: ${results.crops[0].profit}`} size="small" color="success" variant="outlined" />
                        <Chip label={`Water: ${results.crops[0].water}`} size="small" color="info" variant="outlined" />
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" fontWeight={700} color="success.main">{results.crops[0].score}%</Typography>
                      <Typography variant="caption" color="text.secondary">Suitability</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              <Grid container spacing={3}>
                {/* All recommendations */}
                <Grid item xs={12} md={7}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" fontWeight={600} mb={2}>All Recommendations</Typography>
                      {results.crops.map((crop, i) => (
                        <Box key={crop.name} sx={{ mb: 2, p: 1.5, bgcolor: i === 0 ? '#F0FDF4' : '#FAFAFA', borderRadius: 2, border: i === 0 ? '1px solid #BBF7D0' : '1px solid #E5E7EB' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography sx={{ fontSize: 24 }}>{crop.icon}</Typography>
                              <Box>
                                <Typography fontWeight={600}>{crop.name}</Typography>
                                <Typography variant="caption" color="text.secondary">{crop.season}</Typography>
                              </Box>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography variant="h6" fontWeight={700} sx={{ color: crop.color }}>{crop.score}%</Typography>
                              <Typography variant="caption" color="text.secondary">match</Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress variant="determinate" value={crop.score} sx={{ flexGrow: 1, height: 8, borderRadius: 4, '& .MuiLinearProgress-bar': { bgcolor: crop.color } }} />
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <Chip label={crop.profit} size="small" color="success" variant="outlined" />
                            <Chip label={`Water: ${crop.water}`} size="small" color="info" variant="outlined" />
                          </Box>
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Radar + tips */}
                <Grid item xs={12} md={5}>
                  <Card sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight={600} mb={1}>Condition Analysis</Typography>
                      <ResponsiveContainer width="100%" height={200}>
                        <RadarChart data={results.radar}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                          <Radar name="Your Field" dataKey="A" stroke="#10B981" fill="#10B981" fillOpacity={0.35} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card sx={{ bgcolor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight={600} color="primary.dark" mb={1.5}>Growing Tips</Typography>
                      <List dense disablePadding>
                        {[
                          `Plant ${results.crops[0].name} before the season onset for best yield.`,
                          'Ensure proper drainage for your soil type to prevent waterlogging.',
                          'Apply recommended fertilisers based on soil nutrient analysis.',
                          'Monitor local mandi prices before harvesting to maximise profit.',
                        ].map((tip, i) => (
                          <ListItem key={i} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 28 }}>
                              <CheckCircleIcon color="primary" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={tip} primaryTypographyProps={{ fontSize: 12 }} />
                          </ListItem>
                        ))}
                      </List>
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
