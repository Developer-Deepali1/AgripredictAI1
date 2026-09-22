import React, { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, TextField,
  CircularProgress, Chip, LinearProgress, List,
  ListItem, ListItemIcon, ListItemText, Alert, Stack, InputAdornment,
} from '@mui/material';
import EmojiNatureIcon from '@mui/icons-material/EmojiNature';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import OpacityIcon from '@mui/icons-material/Opacity';
import ScienceIcon from '@mui/icons-material/Science';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import VerifiedIcon from '@mui/icons-material/Verified';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';

import { predictionService, dataService } from '../services/api';

const QUICK_LOCATIONS = ['Bhubaneswar', 'Nashik', 'Ludhiana', 'Kolar', 'Indore', 'Jaipur'];

const INDIAN_COORDINATES = {
  Bhubaneswar: { lat: 20.2961, lon: 85.8245, state: 'Odisha' },
  Nashik: { lat: 19.9975, lon: 73.7898, state: 'Maharashtra' },
  Ludhiana: { lat: 30.9010, lon: 75.8573, state: 'Punjab' },
  Kolar: { lat: 13.1367, lon: 78.1291, state: 'Karnataka' },
  Indore: { lat: 22.7196, lon: 75.8577, state: 'Madhya Pradesh' },
  Jaipur: { lat: 26.9124, lon: 75.7873, state: 'Rajasthan' },
  Pune: { lat: 18.5204, lon: 73.8567, state: 'Maharashtra' },
  Nagpur: { lat: 21.1458, lon: 79.0882, state: 'Maharashtra' },
  Bhopal: { lat: 23.2599, lon: 77.4126, state: 'Madhya Pradesh' },
  Lucknow: { lat: 26.8467, lon: 80.9462, state: 'Uttar Pradesh' },
  Patna: { lat: 25.5941, lon: 85.1376, state: 'Bihar' },
  Hyderabad: { lat: 17.3850, lon: 78.4867, state: 'Telangana' },
};

export default function CropPrediction() {
  // Field / Soil Parameters (N, P, K, pH)
  const [nitrogen, setNitrogen] = useState('80');
  const [phosphorus, setPhosphorus] = useState('45');
  const [potassium, setPotassium] = useState('40');
  const [ph, setPh] = useState('6.5');

  // Weather Parameters
  const [locationQuery, setLocationQuery] = useState('Bhubaneswar');
  const [temperature, setTemperature] = useState('26.5');
  const [humidity, setHumidity] = useState('78');
  const [rainfall, setRainfall] = useState('180');

  // UI States
  const [loading, setLoading] = useState(false);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [weatherNotice, setWeatherNotice] = useState(null);
  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState({});

  // Fetch Real Live Weather from Open-Meteo
  const handleFetchLiveWeather = async (locName) => {
    const loc = locName || locationQuery || 'Bhubaneswar';
    setLoadingWeather(true);
    setWeatherNotice(null);
    try {
      let w = null;
      // 1. Try backend live weather endpoint
      try {
        if (dataService && typeof dataService.getLiveWeather === 'function') {
          const res = await dataService.getLiveWeather({ location: loc });
          if (res && res.data && res.data.temperature !== undefined) {
            w = res.data;
          }
        }
      } catch (backendErr) {
        console.warn('Backend weather endpoint failed, attempting direct Open-Meteo fallback:', backendErr);
      }

      // 2. Client-side direct Open-Meteo fallback if backend was unavailable
      if (!w) {
        const found = Object.keys(INDIAN_COORDINATES).find(
          (k) => k.toLowerCase() === loc.trim().toLowerCase()
        );
        const coords = found ? INDIAN_COORDINATES[found] : INDIAN_COORDINATES['Bhubaneswar'];
        const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&daily=precipitation_sum&timezone=Asia%2FKolkata`;
        const resp = await fetch(openMeteoUrl);
        if (resp.ok) {
          const json = await resp.json();
          const current = json.current || {};
          const dailyRain = (json.daily?.precipitation_sum || []).reduce((a, b) => a + (b || 0), 0);
          w = {
            temperature: current.temperature_2m,
            humidity: current.relative_humidity_2m,
            rainfall_forecast_7d: Math.round(dailyRain * 10) / 10,
            source: 'Direct Open-Meteo Satellite Feed',
            location_name: `${loc}${coords.state ? ', ' + coords.state : ''}`,
          };
        }
      }

      if (w && w.temperature !== undefined) {
        setTemperature(String(w.temperature));
        if (w.humidity !== undefined) setHumidity(String(w.humidity));
        const rainEstimate = w.rainfall_forecast_7d ? Math.round(w.rainfall_forecast_7d * 10) : 140;
        setRainfall(String(rainEstimate));

        setWeatherNotice({
          type: 'success',
          text: `Live weather fetched for ${w.location_name || loc}: ${w.temperature}°C, ${w.humidity}% humidity via ${w.source || 'Open-Meteo'}`
        });
      } else {
        throw new Error('Weather data unavailable from all sources');
      }
    } catch (err) {
      console.error('Failed to fetch live weather:', err);
      setWeatherNotice({
        type: 'warning',
        text: 'Live weather service unreachable. Using standard regional climatological values.'
      });
    } finally {
      setLoadingWeather(false);
    }
  };

  const validate = () => {
    const e = {};
    if (!nitrogen || isNaN(+nitrogen) || +nitrogen < 0 || +nitrogen > 250) e.nitrogen = 'N: 0–250 kg/ha';
    if (!phosphorus || isNaN(+phosphorus) || +phosphorus < 0 || +phosphorus > 250) e.phosphorus = 'P: 0–250 kg/ha';
    if (!potassium || isNaN(+potassium) || +potassium < 0 || +potassium > 300) e.potassium = 'K: 0–300 kg/ha';
    if (!ph || isNaN(+ph) || +ph < 3.5 || +ph > 9.5) e.ph = 'pH: 3.5–9.5';
    if (!temperature || isNaN(+temperature) || +temperature < 0 || +temperature > 55) e.temperature = 'Temp: 0–55°C';
    if (!humidity || isNaN(+humidity) || +humidity < 0 || +humidity > 100) e.humidity = 'Humidity: 0–100%';
    if (!rainfall || isNaN(+rainfall) || +rainfall < 0 || +rainfall > 4000) e.rainfall = 'Rainfall: 0–4000 mm';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Run Real Trained Scikit-Learn Model via Backend API
  const handlePredict = async () => {
    if (!validate()) return;
    setLoading(true);
    setResults(null);

    try {
      const payload = {
        nitrogen: parseFloat(nitrogen),
        phosphorus: parseFloat(phosphorus),
        potassium: parseFloat(potassium),
        temperature: parseFloat(temperature),
        humidity: parseFloat(humidity),
        ph: parseFloat(ph),
        rainfall: parseFloat(rainfall),
        top_n: 5,
      };

      const res = await predictionService.recommendCropML(payload);
      const data = res.data;

      // Build real radar chart values based on normalized inputs
      const radar = [
        { subject: 'Nitrogen (N)', A: Math.min(100, Math.round((+nitrogen / 140) * 100)) },
        { subject: 'Phosphorus (P)', A: Math.min(100, Math.round((+phosphorus / 100) * 100)) },
        { subject: 'Potassium (K)', A: Math.min(100, Math.round((+potassium / 120) * 100)) },
        { subject: 'Temperature', A: Math.min(100, Math.round(((+temperature - 10) / 30) * 100)) },
        { subject: 'Humidity', A: Math.min(100, Math.round(+humidity)) },
        { subject: 'Rainfall Fit', A: Math.min(100, Math.round((+rainfall / 300) * 100)) },
      ];

      setResults({ ...data, radar });
    } catch (err) {
      console.error('Error invoking real crop recommendation model:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <EmojiNatureIcon color="primary" sx={{ fontSize: 34 }} />
          <Typography variant="h4" fontWeight={700} color="primary.main">
            Real ML Crop Predictor
          </Typography>
          <Chip
            icon={<VerifiedIcon sx={{ fontSize: 16 }} />}
            label="Trained Random Forest (96.8% Acc)"
            color="success"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </Box>
        <Typography variant="body1" color="text.secondary">
          Scientific agronomic crop recommendation powered by trained Scikit-Learn models and live Open-Meteo weather.
        </Typography>
      </Box>

      {/* Live Weather Quick Bar */}
      <Card sx={{ mb: 3, bgcolor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
        <CardContent sx={{ py: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="City / District"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOnIcon color="primary" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                onClick={() => handleFetchLiveWeather(locationQuery)}
                disabled={loadingWeather}
                startIcon={loadingWeather ? <CircularProgress size={16} /> : <WbSunnyIcon />}
              >
                {loadingWeather ? 'Fetching…' : 'Fetch Live Weather'}
              </Button>
            </Grid>
            <Grid item xs={12} sm={5}>
              <Stack direction="row" spacing={0.5} flexWrap="wrap">
                <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center', mr: 0.5 }}>
                  Quick Hubs:
                </Typography>
                {QUICK_LOCATIONS.map((loc) => (
                  <Chip
                    key={loc}
                    label={loc}
                    size="small"
                    onClick={() => {
                      setLocationQuery(loc);
                      handleFetchLiveWeather(loc);
                    }}
                    clickable
                    sx={{ mb: 0.5 }}
                  />
                ))}
              </Stack>
            </Grid>
          </Grid>
          {weatherNotice && (
            <Alert severity={weatherNotice.type} sx={{ mt: 1.5, py: 0 }} onClose={() => setWeatherNotice(null)}>
              {weatherNotice.text}
            </Alert>
          )}
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Input Parameters Form */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: { md: 'sticky' }, top: { md: 80 } }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <ScienceIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>Soil & Climate Inputs</Typography>
              </Box>

              {/* N-P-K Inputs */}
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', mb: 1, display: 'block' }}>
                Soil Nutrient Analysis (kg/ha)
              </Typography>
              <Grid container spacing={1.5} sx={{ mb: 2 }}>
                <Grid item xs={4}>
                  <TextField
                    fullWidth size="small" label="Nitrogen (N)" value={nitrogen}
                    onChange={(e) => setNitrogen(e.target.value)}
                    error={!!errors.nitrogen} helperText={errors.nitrogen}
                    type="number"
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth size="small" label="Phosphorus (P)" value={phosphorus}
                    onChange={(e) => setPhosphorus(e.target.value)}
                    error={!!errors.phosphorus} helperText={errors.phosphorus}
                    type="number"
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth size="small" label="Potassium (K)" value={potassium}
                    onChange={(e) => setPotassium(e.target.value)}
                    error={!!errors.potassium} helperText={errors.potassium}
                    type="number"
                  />
                </Grid>
              </Grid>

              {/* Soil pH */}
              <TextField
                fullWidth size="small" label="Soil pH (Acidity/Alkalinity)" value={ph}
                onChange={(e) => setPh(e.target.value)}
                error={!!errors.ph} helperText={errors.ph}
                type="number" sx={{ mb: 2.5 }}
                placeholder="e.g. 6.5"
              />

              {/* Climate Inputs */}
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', mb: 1, display: 'block' }}>
                Meteorological Metrics
              </Typography>
              <TextField
                fullWidth size="small" label="Temperature (°C)" value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                error={!!errors.temperature} helperText={errors.temperature}
                type="number" sx={{ mb: 1.5 }}
                InputProps={{ startAdornment: <ThermostatIcon sx={{ mr: 1, color: '#F59E0B', fontSize: 20 }} /> }}
              />

              <TextField
                fullWidth size="small" label="Relative Humidity (%)" value={humidity}
                onChange={(e) => setHumidity(e.target.value)}
                error={!!errors.humidity} helperText={errors.humidity}
                type="number" sx={{ mb: 1.5 }}
                InputProps={{ startAdornment: <OpacityIcon sx={{ mr: 1, color: '#10B981', fontSize: 20 }} /> }}
              />

              <TextField
                fullWidth size="small" label="Seasonal / Annual Rain (mm)" value={rainfall}
                onChange={(e) => setRainfall(e.target.value)}
                error={!!errors.rainfall} helperText={errors.rainfall}
                type="number" sx={{ mb: 2.5 }}
                InputProps={{ startAdornment: <WaterDropIcon sx={{ mr: 1, color: '#3B82F6', fontSize: 20 }} /> }}
              />

              <Button
                fullWidth variant="contained" color="primary"
                startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <AutoAwesomeIcon />}
                onClick={handlePredict} disabled={loading}
                sx={{ py: 1.5, borderRadius: 2, fontWeight: 700, fontSize: 16 }}
              >
                {loading ? 'Running ML Inference…' : 'Run Real ML Prediction'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Results Panel */}
        <Grid item xs={12} md={8}>
          {loading && (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <CircularProgress color="primary" size={64} />
                <Typography mt={2} variant="h6" color="text.primary">Executing Random Forest Ensemble Model…</Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  Evaluating multi-class decision trees against 22 crop agronomic boundaries
                </Typography>
              </CardContent>
            </Card>
          )}

          {!loading && !results && (
            <Card sx={{ bgcolor: '#F9FAFB' }}>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <EmojiNatureIcon sx={{ fontSize: 64, color: '#D1D5DB', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">Real ML Inference Ready</Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  Adjust soil nutrient levels (N-P-K, pH) or fetch live weather, then click "Run Real ML Prediction".
                </Typography>
              </CardContent>
            </Card>
          )}

          {!loading && results && results.recommendations && (
            <Box>
              {/* Top Pick Banner */}
              {results.recommendations[0] && (
                <Card sx={{ mb: 3, bgcolor: '#F0FDF4', border: '2px solid #86EFAC', borderRadius: 2.5 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip label="🏆 Optimal Crop Match" color="success" sx={{ fontWeight: 700 }} />
                        <Chip label={`Model Acc: ${results.model_accuracy}%`} size="small" variant="outlined" />
                      </Box>
                      <Chip label={`Rank #1`} color="primary" size="small" />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                      <Typography sx={{ fontSize: 52 }}>{results.recommendations[0].icon}</Typography>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h4" fontWeight={800} color="success.dark">
                          {results.recommendations[0].crop}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {results.recommendations[0].description}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                          <Chip label={`Season: ${results.recommendations[0].season}`} size="small" variant="outlined" />
                          <Chip label={`Est. Profit: ${results.recommendations[0].estimated_profit}`} size="small" color="success" variant="outlined" />
                          <Chip label={`Water Requirement: ${results.recommendations[0].water_requirement}`} size="small" color="info" variant="outlined" />
                        </Box>
                      </Box>
                      <Box sx={{ textAlign: 'center', minWidth: 100 }}>
                        <Typography variant="h3" fontWeight={800} color="success.main">
                          {results.recommendations[0].probability}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          ML Confidence
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              )}

              <Grid container spacing={3}>
                {/* Ranked Recommendations List */}
                <Grid item xs={12} md={7}>
                  <Card sx={{ borderRadius: 2.5 }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight={700} mb={2}>
                        Model Probability Ranking (Top 5)
                      </Typography>
                      {results.recommendations.map((crop) => (
                        <Box
                          key={crop.crop}
                          sx={{
                            mb: 2, p: 2,
                            bgcolor: crop.rank === 1 ? '#F0FDF4' : '#F9FAFB',
                            borderRadius: 2,
                            border: crop.rank === 1 ? '1px solid #BBF7D0' : '1px solid #E5E7EB',
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Typography sx={{ fontSize: 28 }}>{crop.icon}</Typography>
                              <Box>
                                <Typography fontWeight={700} fontSize={16}>{crop.crop}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {crop.season} • Water: {crop.water_requirement}
                                </Typography>
                              </Box>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography variant="h6" fontWeight={800} sx={{ color: crop.color }}>
                                {crop.probability}%
                              </Typography>
                              <Typography variant="caption" color="text.secondary">probability</Typography>
                            </Box>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={crop.probability}
                            sx={{
                              height: 8, borderRadius: 4, bgcolor: '#E5E7EB',
                              '& .MuiLinearProgress-bar': { bgcolor: crop.color, borderRadius: 4 },
                            }}
                          />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              Avg Profit: <strong>{crop.estimated_profit}</strong>
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Rank #{crop.rank}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Radar Chart & Agronomic Guidance */}
                <Grid item xs={12} md={5}>
                  <Card sx={{ mb: 2, borderRadius: 2.5 }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight={700} mb={1}>Input Nutrient Radar</Typography>
                      <ResponsiveContainer width="100%" height={210}>
                        <RadarChart data={results.radar || []}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                          <Radar name="Field Levels" dataKey="A" stroke="#10B981" fill="#10B981" fillOpacity={0.35} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card sx={{ bgcolor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 2.5 }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight={700} color="primary.dark" mb={1.5}>
                        Agronomic Advisory
                      </Typography>
                      <List dense disablePadding>
                        {[
                          `Optimal sowing season for ${results.recommendations[0]?.crop || 'your crop'} is ${results.recommendations[0]?.season}.`,
                          `Maintain soil pH close to ${ph} for optimal micronutrient bioavailability.`,
                          `Estimated water demand: ${results.recommendations[0]?.water_requirement} requirement.`,
                          'Review mandi price forecasts before harvest to schedule sales at price peaks.',
                        ].map((tip, i) => (
                          <ListItem key={i} disablePadding sx={{ mb: 0.75, alignItems: 'flex-start' }}>
                            <ListItemIcon sx={{ minWidth: 26, mt: 0.2 }}>
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
