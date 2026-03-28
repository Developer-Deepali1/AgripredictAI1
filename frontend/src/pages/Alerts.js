import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Chip, List, ListItem,
  ListItemIcon, ListItemText, Button, Switch, FormControlLabel,
  CircularProgress, Tab, Tabs,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WaterDropIcon from '@mui/icons-material/WaterDrop';

import { alertsService } from '../services/api';

const MOCK_ALERTS = [
  { id: 1, type: 'Price Drop', crop: 'Tomato', message: 'Tomato prices dropped 18% at Pune Mandi', severity: 'HIGH', time: '2 hours ago', read: false },
  { id: 2, type: 'Demand Spike', crop: 'Wheat', message: 'Wheat demand up 25% in North India markets', severity: 'MEDIUM', time: '5 hours ago', read: false },
  { id: 3, type: 'Weather Warning', crop: 'All', message: 'Heavy rainfall expected in Maharashtra next week', severity: 'HIGH', time: '8 hours ago', read: true },
  { id: 4, type: 'Price Drop', crop: 'Onion', message: 'Onion prices falling due to surplus in Nashik', severity: 'HIGH', time: '1 day ago', read: true },
  { id: 5, type: 'Price Rise', crop: 'Cotton', message: 'Cotton prices rising due to export demand', severity: 'LOW', time: '1 day ago', read: true },
  { id: 6, type: 'Demand Spike', crop: 'Rice', message: 'Rice demand spike in Tamil Nadu markets', severity: 'MEDIUM', time: '2 days ago', read: true },
];

const MOCK_HISTORY = [
  { id: 10, type: 'Price Drop', crop: 'Potato', message: 'Potato prices at 3-year low in UP markets', severity: 'HIGH', time: '1 week ago' },
  { id: 11, type: 'Weather Warning', crop: 'All', message: 'Drought conditions in Karnataka — irrigation advisory', severity: 'HIGH', time: '2 weeks ago' },
  { id: 12, type: 'Demand Spike', crop: 'Maize', message: 'Maize demand spike for poultry feed industry', severity: 'MEDIUM', time: '3 weeks ago' },
];

const SEVERITY_COLOR = { HIGH: 'error', MEDIUM: 'warning', LOW: 'success' };

const TYPE_ICON = {
  'Price Drop': <TrendingDownIcon color="error" />,
  'Price Rise': <TrendingUpIcon color="success" />,
  'Demand Spike': <TrendingUpIcon color="info" />,
  'Weather Warning': <WaterDropIcon color="primary" />,
};

function AlertItem({ alert }) {
  return (
    <ListItem
      sx={{
        bgcolor: alert.read ? 'transparent' : '#F0FDF4',
        borderRadius: 2,
        mb: 1,
        border: 1,
        borderColor: alert.read ? 'divider' : 'primary.light',
      }}
    >
      <ListItemIcon sx={{ minWidth: 40 }}>{TYPE_ICON[alert.type] || <NotificationsIcon />}</ListItemIcon>
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="body2" fontWeight={600}>{alert.message}</Typography>
            {!alert.read && <Chip label="NEW" size="small" color="primary" sx={{ height: 18, fontSize: 10 }} />}
          </Box>
        }
        secondary={
          <Box sx={{ display: 'flex', gap: 1, mt: 0.5, alignItems: 'center', flexWrap: 'wrap' }}>
            <Chip label={alert.type} size="small" variant="outlined" />
            <Chip label={alert.crop} size="small" color="primary" variant="outlined" />
            <Typography variant="caption" color="text.secondary">{alert.time}</Typography>
          </Box>
        }
      />
      <Chip label={alert.severity} color={SEVERITY_COLOR[alert.severity]} size="small" sx={{ ml: 1 }} />
    </ListItem>
  );
}

export default function Alerts() {
  const [tab, setTab] = useState(0);
  const [alerts, setAlerts] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({ price_drop: true, demand_spike: true, weather: true, email: false });

  useEffect(() => {
    Promise.all([
      alertsService.get(),
      alertsService.getHistory(),
    ])
      .then(([alertsRes, historyRes]) => {
        setAlerts(alertsRes.data?.alerts || MOCK_ALERTS);
        setHistory(historyRes.data?.history || MOCK_HISTORY);
      })
      .catch(() => {
        setAlerts(MOCK_ALERTS);
        setHistory(MOCK_HISTORY);
      })
      .finally(() => setLoading(false));
  }, []);

  const unread = alerts.filter((a) => !a.read).length;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
        <Typography variant="h4" fontWeight={700} color="primary.main">Alerts</Typography>
        {unread > 0 && <Chip label={`${unread} New`} color="error" size="small" />}
      </Box>
      <Typography variant="body1" color="text.secondary" mb={3}>Stay updated on price drops, demand spikes, and weather warnings</Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label={`Active Alerts (${alerts.length})`} />
        <Tab label={`History (${history.length})`} />
        <Tab label="Settings" />
      </Tabs>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : (
        <>
          {tab === 0 && (
            <Card>
              <CardContent>
                {/* Summary */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  {['HIGH', 'MEDIUM', 'LOW'].map((sev) => {
                    const count = alerts.filter((a) => a.severity === sev).length;
                    return (
                      <Grid item xs={4} key={sev}>
                        <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: '#F8FAFC', borderRadius: 2 }}>
                          <Typography variant="h5" fontWeight={700} color={`${SEVERITY_COLOR[sev]}.main`}>{count}</Typography>
                          <Typography variant="caption" color="text.secondary">{sev}</Typography>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
                <List disablePadding>
                  {alerts.map((a) => <AlertItem key={a.id} alert={a} />)}
                </List>
              </CardContent>
            </Card>
          )}

          {tab === 1 && (
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={2}>Alert History</Typography>
                <List disablePadding>
                  {history.map((a) => <AlertItem key={a.id} alert={{ ...a, read: true }} />)}
                </List>
              </CardContent>
            </Card>
          )}

          {tab === 2 && (
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={2}>Alert Preferences</Typography>
                <Grid container spacing={2}>
                  {[
                    { key: 'price_drop', label: 'Price Drop Alerts', desc: 'Notify when crop prices fall significantly' },
                    { key: 'demand_spike', label: 'Demand Spike Alerts', desc: 'Notify when demand for crops spikes' },
                    { key: 'weather', label: 'Weather Warnings', desc: 'Notify about weather events affecting crops' },
                    { key: 'email', label: 'Email Notifications', desc: 'Send alerts to your registered email' },
                  ].map((item) => (
                    <Grid item xs={12} sm={6} key={item.key}>
                      <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={settings[item.key]}
                              onChange={(e) => setSettings({ ...settings, [item.key]: e.target.checked })}
                              color="primary"
                            />
                          }
                          label={<Typography fontWeight={600}>{item.label}</Typography>}
                        />
                        <Typography variant="body2" color="text.secondary" ml={4}>{item.desc}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                <Button variant="contained" sx={{ mt: 2 }} onClick={() => alertsService.updateSettings(settings).catch(() => {})}>
                  Save Settings
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </Box>
  );
}
