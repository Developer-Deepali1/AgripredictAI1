import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Chip, List, ListItem,
  ListItemIcon, ListItemText, Button, Switch, FormControlLabel,
  CircularProgress, Tab, Tabs, Alert,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import SmsIcon from '@mui/icons-material/Sms';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

import { alertsService } from '../services/api';
import { useAuth } from '../context/AuthContext';

// All alerts tagged by state / district / local_area for location filtering.
// Use '' as a wildcard (matches any location at that level).
const ALL_ALERTS = [
  { id: 1, type: 'Price Drop', crop: 'Rice', message: 'Rice prices dropped 12% at local mandi this week', severity: 'HIGH', time: '1 hour ago', read: false, state: '', district: '', local_area: '' },
  { id: 2, type: 'Weather Warning', crop: 'All', message: 'Heavy rainfall expected in your district next 3 days', severity: 'HIGH', time: '3 hours ago', read: false, state: '', district: '', local_area: '' },
  { id: 3, type: 'Demand Spike', crop: 'Wheat', message: 'Wheat demand up 20% – good time to sell', severity: 'MEDIUM', time: '6 hours ago', read: false, state: '', district: '', local_area: '' },
  { id: 4, type: 'Price Drop', crop: 'Tomato', message: 'Tomato prices dropped 18% at Pune Mandi', severity: 'HIGH', time: '8 hours ago', read: true, state: 'Maharashtra', district: 'Pune', local_area: '' },
  { id: 5, type: 'Price Drop', crop: 'Onion', message: 'Onion prices falling due to surplus in Nashik region', severity: 'HIGH', time: '10 hours ago', read: true, state: 'Maharashtra', district: 'Nashik', local_area: '' },
  { id: 6, type: 'Weather Warning', crop: 'All', message: 'Drought conditions in Karnataka – irrigation advisory', severity: 'HIGH', time: '12 hours ago', read: true, state: 'Karnataka', district: '', local_area: '' },
  { id: 7, type: 'Price Rise', crop: 'Cotton', message: 'Cotton prices rising due to export demand', severity: 'LOW', time: '1 day ago', read: true, state: '', district: '', local_area: '' },
  { id: 8, type: 'Demand Spike', crop: 'Rice', message: 'Rice demand spike in Tamil Nadu markets', severity: 'MEDIUM', time: '1 day ago', read: true, state: 'Tamil Nadu', district: '', local_area: '' },
  { id: 9, type: 'Price Drop', crop: 'Wheat', message: 'Wheat prices at 2-year low in North India', severity: 'HIGH', time: '2 days ago', read: true, state: 'Punjab', district: '', local_area: '' },
  { id: 10, type: 'Weather Warning', crop: 'All', message: 'Cyclone warning for coastal Odisha districts', severity: 'HIGH', time: '2 days ago', read: true, state: 'Odisha', district: '', local_area: '' },
  { id: 11, type: 'Price Drop', crop: 'Rice', message: 'Paddy procurement prices revised in Bhubaneswar region', severity: 'MEDIUM', time: '3 days ago', read: true, state: 'Odisha', district: 'Khordha', local_area: '' },
  { id: 12, type: 'Demand Spike', crop: 'Maize', message: 'Maize demand spike for poultry feed in your area', severity: 'MEDIUM', time: '3 days ago', read: true, state: '', district: '', local_area: '' },
];

const ALL_HISTORY = [
  { id: 20, type: 'Price Drop', crop: 'Potato', message: 'Potato prices at 3-year low in local markets', severity: 'HIGH', time: '1 week ago', state: '', district: '', local_area: '' },
  { id: 21, type: 'Weather Warning', crop: 'All', message: 'Drought advisory issued for your district', severity: 'HIGH', time: '2 weeks ago', state: '', district: '', local_area: '' },
  { id: 22, type: 'Demand Spike', crop: 'Maize', message: 'Maize demand spike for poultry feed industry', severity: 'MEDIUM', time: '3 weeks ago', state: '', district: '', local_area: '' },
  { id: 23, type: 'Price Drop', crop: 'Onion', message: 'Onion prices down due to surplus in Maharashtra', severity: 'HIGH', time: '1 month ago', state: 'Maharashtra', district: '', local_area: '' },
];

const SEVERITY_COLOR = { HIGH: 'error', MEDIUM: 'warning', LOW: 'success' };

// Numeric rank so we can compare "meets threshold" (e.g. MEDIUM threshold → HIGH and MEDIUM fire)
const SEVERITY_RANK = { HIGH: 3, MEDIUM: 2, LOW: 1 };

/**
 * Returns true when the alert's severity is at or above the user's chosen threshold.
 * Defaults to 'HIGH' when threshold is unset.
 */
function meetsThreshold(severity, threshold) {
  return (SEVERITY_RANK[severity] || 0) >= (SEVERITY_RANK[threshold] || SEVERITY_RANK.HIGH);
}

const TYPE_ICON = {
  'Price Drop': <TrendingDownIcon color="error" />,
  'Price Rise': <TrendingUpIcon color="success" />,
  'Demand Spike': <TrendingUpIcon color="info" />,
  'Weather Warning': <WaterDropIcon color="primary" />,
};

/**
 * Returns true if the alert matches the user's location.
 * An empty string in the alert means "any" (wildcard).
 */
function matchesLocation(alert, userState, userDistrict, userLocalArea) {
  if (!userState) return true; // No location set → show all
  const stateMatch = !alert.state || alert.state === userState;
  const districtMatch = !alert.district || alert.district === userDistrict;
  const areaMatch = !alert.local_area || alert.local_area === userLocalArea;
  return stateMatch && districtMatch && areaMatch;
}

/**
 * Mask email to show only first 2 characters and domain (e.g., fa***@example.com)
 */
function maskEmail(email) {
  if (!email) return 'registered email';
  const at = email.indexOf('@');
  if (at < 0) return 'r***email';
  const local = email.slice(0, at);
  const domain = email.slice(at);
  return `${local.slice(0, 2)}***${domain}`;
}

/**
 * Mask phone to show only first 2 and last 3 digits (e.g., 98*****210)
 */
function maskPhone(phone) {
  if (!phone) return 'registered phone';
  if (phone.length < 5) return '***';
  return `${phone.slice(0, 2)}*****${phone.slice(-3)}`;
}

function AlertItem({ alert, notifyEmail, notifySms, userEmail, userPhone, alertThreshold }) {
  const threshold = alertThreshold || 'HIGH';
  const isNotified = meetsThreshold(alert.severity, threshold) && (notifyEmail || notifySms);
  return (
    <ListItem
      sx={{
        bgcolor: alert.read ? 'transparent' : '#F0FDF4',
        borderRadius: 2,
        mb: 1,
        border: 1,
        borderColor: alert.read ? 'divider' : 'primary.light',
        flexWrap: 'wrap',
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
            {isNotified && notifyEmail && (
              <Chip icon={<EmailIcon />} label={`Email: ${maskEmail(userEmail)}`} size="small" color="info" variant="outlined" sx={{ fontSize: 10 }} />
            )}
            {isNotified && notifySms && (
              <Chip icon={<SmsIcon />} label={`SMS: ${maskPhone(userPhone)}`} size="small" color="success" variant="outlined" sx={{ fontSize: 10 }} />
            )}
            {isNotified && (
              <Chip icon={<CheckCircleOutlineIcon />} label="Sent" size="small" color="success" sx={{ fontSize: 10 }} />
            )}
          </Box>
        }
      />
      <Chip label={alert.severity} color={SEVERITY_COLOR[alert.severity]} size="small" sx={{ ml: 1 }} />
    </ListItem>
  );
}

export default function Alerts() {
  const { userProfile } = useAuth();
  const [tab, setTab] = useState(0);
  const [alerts, setAlerts] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({ price_drop: true, demand_spike: true, weather: true, email: false });

  const userState = userProfile?.location || '';
  const userDistrict = userProfile?.district || '';
  const userLocalArea = userProfile?.local_area || '';
  const notifyEmail = userProfile?.notify_email || false;
  const notifySms = userProfile?.notify_sms || false;
  const userEmail = userProfile?.email || '';
  const userPhone = userProfile?.phone || '';
  const alertThreshold = userProfile?.alert_threshold || 'HIGH';
  const hasLocation = Boolean(userState && userDistrict);

  useEffect(() => {
    Promise.all([
      alertsService.get({ state: userState, district: userDistrict, local_area: userLocalArea }),
      alertsService.getHistory({ state: userState, district: userDistrict }),
    ])
      .then(([alertsRes, historyRes]) => {
        const apiAlerts = alertsRes.data?.alerts;
        const apiHistory = historyRes.data?.history;
        // Use API data if available, else filter mock data by location
        if (apiAlerts) {
          setAlerts(apiAlerts);
        } else {
          setAlerts(ALL_ALERTS.filter((a) => matchesLocation(a, userState, userDistrict, userLocalArea)));
        }
        if (apiHistory) {
          setHistory(apiHistory);
        } else {
          setHistory(ALL_HISTORY.filter((a) => matchesLocation(a, userState, userDistrict, userLocalArea)));
        }
      })
      .catch(() => {
        setAlerts(ALL_ALERTS.filter((a) => matchesLocation(a, userState, userDistrict, userLocalArea)));
        setHistory(ALL_HISTORY.filter((a) => matchesLocation(a, userState, userDistrict, userLocalArea)));
      })
      .finally(() => setLoading(false));
  }, [userState, userDistrict, userLocalArea]); // eslint-disable-line react-hooks/exhaustive-deps

  const unread = alerts.filter((a) => !a.read).length;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, flexWrap: 'wrap' }}>
        <Typography variant="h4" fontWeight={700} color="primary.main">Alerts</Typography>
        {unread > 0 && <Chip label={`${unread} New`} color="error" size="small" />}
        {hasLocation ? (
          <Chip
            icon={<LocationOnIcon />}
            label={userLocalArea
              ? `Active Area: ${userLocalArea}, ${userDistrict}, ${userState}`
              : `Active Area: ${userDistrict}, ${userState}`}
            color="success"
            size="small"
            variant="outlined"
          />
        ) : (
          <Chip
            icon={<LocationOnIcon />}
            label="Set location in Profile to filter alerts"
            color="warning"
            size="small"
            variant="outlined"
          />
        )}
      </Box>
      <Typography variant="body1" color="text.secondary" mb={2}>
        Stay updated on price drops, demand spikes, and weather warnings
      </Typography>

      {!hasLocation && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Your profile has no district/local area set. Showing all alerts.
          <strong> Go to Profile</strong> to set your location for personalised alerts.
        </Alert>
      )}

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
                {alerts.length === 0 ? (
                  <Typography color="text.secondary" textAlign="center" py={4}>
                    No alerts for your location. You're all clear! ✅
                  </Typography>
                ) : (
                  <List disablePadding>
                    {alerts.map((a) => (
                      <AlertItem
                        key={a.id} alert={a}
                        notifyEmail={notifyEmail} notifySms={notifySms}
                        userEmail={userEmail} userPhone={userPhone}
                        alertThreshold={alertThreshold}
                      />
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          )}

          {tab === 1 && (
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={2}>Alert History</Typography>
                {history.length === 0 ? (
                  <Typography color="text.secondary" textAlign="center" py={4}>No alert history for your location.</Typography>
                ) : (
                  <List disablePadding>
                    {history.map((a) => (
                      <AlertItem
                        key={a.id} alert={{ ...a, read: true }}
                        notifyEmail={notifyEmail} notifySms={notifySms}
                        userEmail={userEmail} userPhone={userPhone}
                        alertThreshold={alertThreshold}
                      />
                    ))}
                  </List>
                )}
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
