import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Chip, Avatar, Divider,
  LinearProgress, IconButton, Tooltip, TextField, Button, MenuItem, Stack
} from '@mui/material';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import OpacityIcon from '@mui/icons-material/Opacity';
import BoltIcon from '@mui/icons-material/Bolt';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import RefreshIcon from '@mui/icons-material/Refresh';
import SensorsIcon from '@mui/icons-material/Sensors';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import Co2Icon from '@mui/icons-material/Co2';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import SpeedIcon from '@mui/icons-material/Speed';
import {
  LineChart, Line, ResponsiveContainer
} from 'recharts';

import { irrigationService, dataService } from '../services/api';
import { useAuth } from '../context/AuthContext';

// ── Helpers ────────────────────────────────────────────────────────────────────

const rand = (min, max) => +(min + Math.random() * (max - min)).toFixed(1);

const generateHistory = (base, variance, count = 12) =>
  Array.from({ length: count }, (_, i) => ({
    t: `${i * 5}m ago`,
    v: rand(base - variance, base + variance),
  })).reverse();

// ── Sensor thresholds ──────────────────────────────────────────────────────────

const SENSORS = [
  {
    id: 'moisture',
    label: 'Soil Moisture',
    unit: '%',
    icon: <WaterDropIcon />,
    color: '#3B82F6',
    bg: '#EFF6FF',
    min: 40,
    max: 80,
    base: 58,
    variance: 8,
    description: 'Volumetric water content in root zone',
  },
  {
    id: 'temperature',
    label: 'Soil Temperature',
    unit: '°C',
    icon: <ThermostatIcon />,
    color: '#F59E0B',
    bg: '#FFFBEB',
    min: 15,
    max: 35,
    base: 24,
    variance: 4,
    description: 'Temperature at 10 cm depth',
  },
  {
    id: 'humidity',
    label: 'Air Humidity',
    unit: '%',
    icon: <OpacityIcon />,
    color: '#10B981',
    bg: '#ECFDF5',
    min: 40,
    max: 90,
    base: 65,
    variance: 10,
    description: 'Relative humidity around canopy',
  },
  {
    id: 'npk',
    label: 'Electrical Cond. (EC)',
    unit: 'mS/cm',
    icon: <BoltIcon />,
    color: '#8B5CF6',
    bg: '#F5F3FF',
    min: 1.0,
    max: 3.5,
    base: 2.2,
    variance: 0.4,
    description: 'Soil salinity and nutrient salt indicator',
  },
];

const getStatus = (val, min, max) => {
  if (val < min) return { label: 'Low', color: 'warning' };
  if (val > max) return { label: 'High', color: 'error' };
  return { label: 'Optimal', color: 'success' };
};

export default function IoTMonitoring() {
  const { userProfile } = useAuth();
  const [readings, setReadings] = useState(() =>
    SENSORS.reduce((acc, s) => ({ ...acc, [s.id]: s.base }), {})
  );
  const [history, setHistory] = useState(() =>
    SENSORS.reduce((acc, s) => ({ ...acc, [s.id]: generateHistory(s.base, s.variance) }), {})
  );
  const [connected, setConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Smart Irrigation State
  const [crop, setCrop] = useState('Rice');
  const [forecastRain, setForecastRain] = useState(0);
  const [fieldArea, setFieldArea] = useState(1.0);
  const [adviceData, setAdviceData] = useState(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  // Carbon Footprint State
  const [motorPower, setMotorPower] = useState(0.75); // 1 HP = ~0.75 kW
  const [hoursPerDay, setHoursPerDay] = useState(3.0);
  const [powerSource, setPowerSource] = useState('Grid Electricity');
  const [carbonResult, setCarbonResult] = useState(null);
  const [loadingCarbon, setLoadingCarbon] = useState(false);

  const locName = userProfile?.district || userProfile?.location || 'Nashik';

  const refreshData = useCallback(() => {
    dataService.getLiveWeather({ location: locName })
      .then((res) => {
        const w = res.data;
        const temp = w?.temperature !== undefined ? w.temperature : 26;
        const hum = w?.humidity !== undefined ? w.humidity : 68;
        const rain = w?.rainfall_forecast_7d !== undefined ? w.rainfall_forecast_7d : 12;
        const moisture = Math.min(85, Math.max(35, Math.round(hum * 0.55 + 15)));

        const updated = {
          moisture,
          temperature: temp,
          humidity: hum,
          light: temp > 30 ? 75000 : 52000,
          soil_ph: 6.6,
          nitrogen: 85,
        };

        setReadings(updated);
        setForecastRain(rain);
        setHistory((prev) => {
          const next = {};
          SENSORS.forEach((s) => {
            const prevH = prev[s.id] || [];
            next[s.id] = [
              ...prevH.slice(1),
              { t: 'Just now', v: updated[s.id] || s.base },
            ];
          });
          return next;
        });
        setLastUpdate(new Date());
        setConnected(true);
      })
      .catch(() => {
        const updated = {};
        SENSORS.forEach((s) => {
          updated[s.id] = s.base;
        });
        setReadings(updated);
        setLastUpdate(new Date());
      });
  }, [locName]);

  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(refreshData, 10000);
    return () => clearInterval(timer);
  }, [autoRefresh, refreshData]);

  // Fetch Smart Irrigation Advice whenever soil moisture or parameters change
  const handleFetchAdvice = useCallback(async () => {
    setLoadingAdvice(true);
    try {
      const payload = {
        crop,
        soil_moisture: readings.moisture || 58.0,
        temperature: readings.temperature || 28.0,
        humidity: readings.humidity || 65.0,
        forecast_rain_mm_3d: Number(forecastRain) || 0.0,
        field_area_ha: Number(fieldArea) || 1.0,
      };
      const res = await irrigationService.getAdvice(payload);
      setAdviceData(res.data);
    } catch (err) {
      console.error('Error getting irrigation advice:', err);
    } finally {
      setLoadingAdvice(false);
    }
  }, [crop, readings.moisture, readings.temperature, readings.humidity, forecastRain, fieldArea]);

  // Calculate Carbon Footprint
  const handleCalculateCarbon = useCallback(async () => {
    setLoadingCarbon(true);
    try {
      const payload = {
        motor_power_kw: Number(motorPower) || 0.75,
        daily_hours_used: Number(hoursPerDay) || 3.0,
        days_per_month: 25,
        power_source: powerSource,
      };
      const res = await irrigationService.calculateCarbon(payload);
      setCarbonResult(res.data);
    } catch (err) {
      console.error('Error calculating carbon footprint:', err);
    } finally {
      setLoadingCarbon(false);
    }
  }, [motorPower, hoursPerDay, powerSource]);

  useEffect(() => {
    handleFetchAdvice();
    handleCalculateCarbon();
  }, [handleFetchAdvice, handleCalculateCarbon]);

  // Compute live plant stress index: (temp / 40) * (100 - moisture)
  const plantStress = Math.min(
    100,
    Math.max(
      0,
      ((readings.temperature || 25) / 40.0) * (100 - (readings.moisture || 60))
    )
  ).toFixed(1);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1300, mx: 'auto' }}>
      {/* ── Header ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Stack direction="row" alignItems="center" spacing={1}>
            <SensorsIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h4" fontWeight={700}>IoT Sensor Telemetry & Smart Irrigation</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Real-time soil metrics, plant stress index, weather-aware irrigation advice, and carbon tracking.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Chip
            icon={connected ? <WifiIcon /> : <WifiOffIcon />}
            label={connected ? `Live (${lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })})` : 'Sensors Offline'}
            color={connected ? 'success' : 'default'}
            size="small"
            onClick={() => setConnected((v) => !v)}
            clickable
          />
          <Tooltip title={autoRefresh ? 'Auto-refresh active (Click to toggle)' : 'Auto-refresh paused'}>
            <IconButton onClick={() => setAutoRefresh((v) => !v)} color={autoRefresh ? 'primary' : 'default'} size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* ── Live Metric Cards ── */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {SENSORS.map((s) => {
          const val = readings[s.id] ?? s.base;
          const status = getStatus(val, s.min, s.max);
          const hist = history[s.id] || [];

          return (
            <Grid item xs={12} sm={6} md={3} key={s.id}>
              <Card sx={{ height: '100%', borderRadius: 2.5, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Avatar sx={{ bgcolor: s.bg, color: s.color, width: 44, height: 44 }}>
                      {s.icon}
                    </Avatar>
                    <Chip label={status.label} size="small" color={status.color} />
                  </Box>
                  <Typography variant="h4" fontWeight={700} sx={{ color: s.color }}>
                    {val} <Typography component="span" variant="body1" color="text.secondary">{s.unit}</Typography>
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color="text.primary" mt={0.5}>
                    {s.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Optimal: {s.min} – {s.max}{s.unit}
                  </Typography>
                  {/* Micro sparkline */}
                  <Box sx={{ height: 48, mt: 1.5 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={hist}>
                        <Line type="monotone" dataKey="v" stroke={s.color} strokeWidth={2} dot={false} isAnimationActive={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* ── Plant Stress Index Card ── */}
      <Card sx={{ mb: 3, borderRadius: 2.5, bgcolor: 'background.paper', p: 1, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <SpeedIcon color="warning" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>Computed Index</Typography>
                  <Typography variant="h5" fontWeight={700}>Plant Stress: {plantStress}</Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" color="success.main" fontWeight={600}>Optimal (0 - 25)</Typography>
                <Typography variant="caption" color="warning.main" fontWeight={600}>Moderate (25 - 50)</Typography>
                <Typography variant="caption" color="error.main" fontWeight={600}>Severe Stress (&gt; 75)</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, Number(plantStress))}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  bgcolor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: plantStress < 30 ? 'success.main' : plantStress < 60 ? 'warning.main' : 'error.main',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={3} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Chip
                label={plantStress < 30 ? 'Low Stress' : plantStress < 60 ? 'Moderate Stress' : 'Critical Moisture Stress'}
                color={plantStress < 30 ? 'success' : plantStress < 60 ? 'warning' : 'error'}
                sx={{ fontWeight: 600 }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ── Two Columns: Smart Irrigation Advice & Carbon Footprint ── */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Left: Smart AI Irrigation Advice */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', borderRadius: 2.5, boxShadow: '0 4px 18px rgba(0,0,0,0.06)' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <AutoAwesomeIcon color="primary" />
                <Typography variant="h6" fontWeight={700}>
                  Smart Irrigation Advisor
                </Typography>
              </Stack>

              {/* Controls */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Crop Type"
                    value={crop}
                    onChange={(e) => setCrop(e.target.value)}
                  >
                    {['Rice', 'Wheat', 'Maize', 'Cotton', 'Potato', 'Tomato'].map((c) => (
                      <MenuItem key={c} value={c}>{c}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Rain (3d mm)"
                    value={forecastRain}
                    onChange={(e) => setForecastRain(e.target.value)}
                  />
                </Grid>
                <Grid item xs={6} sm={4}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Area (ha)"
                    value={fieldArea}
                    onChange={(e) => setFieldArea(e.target.value)}
                  />
                </Grid>
              </Grid>

              <Button
                variant="outlined"
                color="primary"
                fullWidth
                size="small"
                onClick={handleFetchAdvice}
                disabled={loadingAdvice}
                sx={{ mb: 2 }}
              >
                {loadingAdvice ? 'Calculating Water Deficit...' : 'Recalculate Irrigation Need'}
              </Button>

              {/* Advice Results Box */}
              {adviceData && (
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: adviceData.irrigation_needed ? 'rgba(255, 152, 0, 0.08)' : 'rgba(76, 175, 80, 0.08)', border: '1px solid', borderColor: adviceData.irrigation_needed ? 'warning.light' : 'success.light' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight={700} color={adviceData.irrigation_needed ? 'warning.dark' : 'success.dark'}>
                      {adviceData.recommended_action}
                    </Typography>
                    <Chip
                      label={adviceData.irrigation_needed ? 'Turn Pump ON' : 'Pump OFF'}
                      color={adviceData.irrigation_needed ? 'warning' : 'success'}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </Stack>

                  <Typography variant="body2" color="text.primary" sx={{ mb: 1.5 }}>
                    {adviceData.reasoning}
                  </Typography>

                  <Divider sx={{ my: 1 }} />
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Recommended Runtime</Typography>
                      <Typography variant="body1" fontWeight={700}>{adviceData.recommended_duration_hours} hours</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Target Volume</Typography>
                      <Typography variant="body1" fontWeight={700}>{adviceData.water_volume_liters.toLocaleString()} Liters</Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right: Agricultural Carbon Footprint & Eco-Score */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', borderRadius: 2.5, boxShadow: '0 4px 18px rgba(0,0,0,0.06)' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <Co2Icon color="success" sx={{ fontSize: 30 }} />
                <Typography variant="h6" fontWeight={700}>
                  Farm Carbon Footprint & Eco-Score
                </Typography>
              </Stack>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Motor Power (kW)"
                    value={motorPower}
                    onChange={(e) => setMotorPower(e.target.value)}
                    helperText="1 HP ≈ 0.75kW"
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Hours / Day"
                    value={hoursPerDay}
                    onChange={(e) => setHoursPerDay(e.target.value)}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Power Source"
                    value={powerSource}
                    onChange={(e) => setPowerSource(e.target.value)}
                  >
                    <MenuItem value="Grid Electricity">Grid Electricity</MenuItem>
                    <MenuItem value="Diesel Generator">Diesel Pump</MenuItem>
                    <MenuItem value="Solar">Solar Pump</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              <Button
                variant="outlined"
                color="success"
                fullWidth
                size="small"
                onClick={handleCalculateCarbon}
                disabled={loadingCarbon}
                sx={{ mb: 2 }}
              >
                {loadingCarbon ? 'Calculating Emissions...' : 'Update Carbon Assessment'}
              </Button>

              {carbonResult && (
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Daily CO₂ Emission</Typography>
                      <Typography variant="h5" fontWeight={700} color={carbonResult.daily_co2_kg < 2 ? 'success.main' : 'warning.main'}>
                        {carbonResult.daily_co2_kg} kg <Typography component="span" variant="caption">/ day</Typography>
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Yearly: {carbonResult.yearly_co2_kg} kg CO₂
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sx={{ textAlign: 'right' }}>
                      <Typography variant="caption" color="text.secondary">Farm Eco-Score</Typography>
                      <Typography variant="h5" fontWeight={700} color="primary.main">
                        {carbonResult.eco_score} <Typography component="span" variant="caption">/ 100</Typography>
                      </Typography>
                      <Chip
                        label={`${carbonResult.emission_status} Emission`}
                        color={carbonResult.emission_status === 'Low' ? 'success' : carbonResult.emission_status === 'Moderate' ? 'warning' : 'error'}
                        size="small"
                      />
                    </Grid>
                  </Grid>

                  {carbonResult.solar_offset_potential_kg > 0 && (
                    <Box sx={{ mt: 1.5, p: 1, borderRadius: 1.5, bgcolor: 'rgba(255, 193, 7, 0.1)', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WbSunnyIcon color="warning" fontSize="small" />
                      <Typography variant="caption" fontWeight={600}>
                        Solar Switch Potential: Abate {carbonResult.solar_offset_potential_kg} kg CO₂/yr!
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
