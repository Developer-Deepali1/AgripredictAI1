import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Chip, Avatar, Divider,
  LinearProgress, List, ListItem, ListItemIcon, ListItemText, IconButton,
  Tooltip,
} from '@mui/material';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import OpacityIcon from '@mui/icons-material/Opacity';
import BoltIcon from '@mui/icons-material/Bolt';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import SensorsIcon from '@mui/icons-material/Sensors';
import {
  LineChart, Line, ResponsiveContainer, ReferenceLine,
} from 'recharts';

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
    bg: '#F0FDF4',
    min: 40,
    max: 85,
    base: 65,
    variance: 10,
    description: 'Relative humidity above canopy',
  },
  {
    id: 'ec',
    label: 'Electrical Conductivity',
    unit: 'dS/m',
    icon: <BoltIcon />,
    color: '#8B5CF6',
    bg: '#F5F3FF',
    min: 0.2,
    max: 2.0,
    base: 0.9,
    variance: 0.3,
    description: 'Soil salinity indicator',
  },
];

function getStatus(value, min, max) {
  const lo = value < min;
  const hi = value > max;
  if (!lo && !hi) return { label: 'Normal', color: 'success' };
  return { label: lo ? 'Too Low' : 'Too High', color: 'error' };
}

// ── SensorCard ──────────────────────────────────────────────────────────────────

function SensorCard({ sensor, value, history, online }) {
  const status = getStatus(value, sensor.min, sensor.max);
  const pct = Math.min(100, Math.max(0, ((value - sensor.min) / (sensor.max - sensor.min)) * 100));

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ bgcolor: sensor.bg, color: sensor.color, width: 40, height: 40 }}>
              {sensor.icon}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={600}>{sensor.label}</Typography>
              <Typography variant="caption" color="text.secondary">{sensor.description}</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Chip label={status.label} size="small" color={status.color} />
          </Box>
        </Box>

        <Typography variant="h3" fontWeight={700} sx={{ color: sensor.color, mb: 0.5 }}>
          {value}
          <Typography component="span" variant="h6" color="text.secondary" sx={{ ml: 0.5 }}>
            {sensor.unit}
          </Typography>
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Typography variant="caption" color="text.secondary">Range: {sensor.min}–{sensor.max}{sensor.unit}</Typography>
          <LinearProgress
            variant="determinate"
            value={pct}
            sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
            color={status.color}
          />
        </Box>

        <ResponsiveContainer width="100%" height={80}>
          <LineChart data={history}>
            <Line type="monotone" dataKey="v" stroke={sensor.color} strokeWidth={1.5} dot={false} />
            <ReferenceLine y={sensor.min} stroke="#EF4444" strokeDasharray="3 3" strokeWidth={1} />
            <ReferenceLine y={sensor.max} stroke="#EF4444" strokeDasharray="3 3" strokeWidth={1} />
          </LineChart>
        </ResponsiveContainer>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {online ? (
              <><WifiIcon sx={{ fontSize: 14, color: 'success.main' }} /><Typography variant="caption" color="success.main">Live</Typography></>
            ) : (
              <><WifiOffIcon sx={{ fontSize: 14, color: 'error.main' }} /><Typography variant="caption" color="error.main">Offline</Typography></>
            )}
          </Box>
          <Typography variant="caption" color="text.secondary">Updated just now</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

// ── AlertPanel ─────────────────────────────────────────────────────────────────

function AlertPanel({ readings }) {
  const alerts = SENSORS.flatMap((s) => {
    const v = readings[s.id];
    if (v === undefined) return [];
    if (v < s.min) return [{ sensor: s.label, message: `${s.label} is too low (${v}${s.unit}). Optimal: ≥${s.min}${s.unit}`, severity: 'HIGH' }];
    if (v > s.max) return [{ sensor: s.label, message: `${s.label} is too high (${v}${s.unit}). Optimal: ≤${s.max}${s.unit}`, severity: 'HIGH' }];
    return [];
  });

  if (alerts.length === 0) {
    return (
      <Card sx={{ bgcolor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 36 }} />
          <Box>
            <Typography fontWeight={600} color="success.dark">All sensors normal</Typography>
            <Typography variant="body2" color="text.secondary">No alerts at this time. Your field conditions are within optimal ranges.</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ bgcolor: '#FEF2F2', border: '1px solid #FECACA' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <NotificationsActiveIcon color="error" />
          <Typography fontWeight={600} color="error.dark">{alerts.length} Active Alert{alerts.length > 1 ? 's' : ''}</Typography>
        </Box>
        <List dense disablePadding>
          {alerts.map((a, i) => (
            <ListItem key={i} disablePadding sx={{ mb: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 28 }}>
                <NotificationsActiveIcon color="error" fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={a.message}
                secondary={a.sensor}
                primaryTypographyProps={{ fontSize: 13 }}
              />
              <Chip label={a.severity} size="small" color="error" />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function IoTMonitoring() {
  const [readings, setReadings] = useState({});
  const [histories, setHistories] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const refresh = useCallback(() => {
    setRefreshing(true);
    const newReadings = {};
    const newHistories = {};
    SENSORS.forEach((s) => {
      newReadings[s.id] = rand(s.base - s.variance * 1.5, s.base + s.variance * 1.5);
      newHistories[s.id] = generateHistory(s.base, s.variance);
    });
    setTimeout(() => {
      setReadings(newReadings);
      setHistories(newHistories);
      setLastUpdate(new Date());
      setRefreshing(false);
    }, 600);
  }, []);

  // Initial load
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const id = setInterval(refresh, 30000);
    return () => clearInterval(id);
  }, [refresh]);

  const allOnline = true; // mock

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <SensorsIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h4" fontWeight={700} color="primary.main">
              IoT Farm Monitoring
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Real-time sensor data from your field devices. Auto-refreshes every 30 seconds.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            icon={allOnline ? <WifiIcon /> : <WifiOffIcon />}
            label={allOnline ? '4 Sensors Online' : 'Some Offline'}
            color={allOnline ? 'success' : 'error'}
            variant="outlined"
          />
          <Tooltip title="Refresh now">
            <span>
              <IconButton onClick={refresh} disabled={refreshing} color="primary">
                <RefreshIcon sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none', '@keyframes spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } } }} />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>

      {refreshing && <LinearProgress sx={{ mb: 2 }} />}

      {/* Alert panel */}
      <Box mb={3}>
        <AlertPanel readings={readings} />
      </Box>

      {/* Sensor cards */}
      <Grid container spacing={3} mb={3}>
        {SENSORS.map((sensor) => (
          <Grid item xs={12} sm={6} md={3} key={sensor.id}>
            <SensorCard
              sensor={sensor}
              value={readings[sensor.id] ?? sensor.base}
              history={histories[sensor.id] ?? generateHistory(sensor.base, sensor.variance)}
              online={allOnline}
            />
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ mb: 3 }} />

      {/* Summary table */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={2}>Sensor Summary</Typography>
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#F0FDF4' }}>
                  {['Sensor', 'Current Value', 'Min Threshold', 'Max Threshold', 'Status', 'Last Updated'].map((h) => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: '#065F46' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SENSORS.map((s) => {
                  const v = readings[s.id] ?? s.base;
                  const status = getStatus(v, s.min, s.max);
                  return (
                    <tr key={s.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                      <td style={{ padding: '10px 16px', fontWeight: 600 }}>{s.label}</td>
                      <td style={{ padding: '10px 16px', color: s.color, fontWeight: 700 }}>{v}{s.unit}</td>
                      <td style={{ padding: '10px 16px' }}>{s.min}{s.unit}</td>
                      <td style={{ padding: '10px 16px' }}>{s.max}{s.unit}</td>
                      <td style={{ padding: '10px 16px' }}>
                        <Chip label={status.label} size="small" color={status.color} />
                      </td>
                      <td style={{ padding: '10px 16px', color: '#6B7280' }}>{lastUpdate.toLocaleTimeString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
