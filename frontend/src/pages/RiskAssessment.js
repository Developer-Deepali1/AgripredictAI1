import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, MenuItem, TextField,
  Button, CircularProgress, Chip, List, ListItem, ListItemIcon, ListItemText,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from 'recharts';
import { riskService } from '../services/api';

const CROPS = ['Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 'Tomato', 'Onion', 'Potato'];

const getMockRisk = (crop) => ({
  crop,
  overall_risk: ['LOW', 'MEDIUM', 'HIGH'][Math.floor(Math.random() * 3)],
  overall_score: Math.round(25 + Math.random() * 60),
  factors: [
    { name: 'Price Drop Risk', score: Math.round(20 + Math.random() * 70), level: 'MEDIUM' },
    { name: 'Oversupply Risk', score: Math.round(15 + Math.random() * 65), level: 'LOW' },
    { name: 'Weather Risk', score: Math.round(10 + Math.random() * 80), level: 'HIGH' },
    { name: 'Market Volatility', score: Math.round(20 + Math.random() * 60), level: 'MEDIUM' },
    { name: 'Storage/Post-Harvest', score: Math.round(15 + Math.random() * 55), level: 'LOW' },
    { name: 'Pest/Disease', score: Math.round(10 + Math.random() * 70), level: 'MEDIUM' },
  ],
  mitigation: [
    'Diversify to 2-3 crops this season to reduce concentration risk',
    'Secure advance purchase agreements with aggregators or processors',
    'Set up crop insurance coverage before the season begins',
    'Monitor mandi prices daily via AgripredictAI alerts',
    'Stagger sowing dates to reduce simultaneous harvest pressure',
  ],
});

const RISK_COLOR = { LOW: 'success', MEDIUM: 'warning', HIGH: 'error' };
const RISK_HEX = { LOW: '#10B981', MEDIUM: '#F59E0B', HIGH: '#EF4444' };

function RiskGauge({ score, size = 120 }) {
  const color = score < 35 ? '#10B981' : score < 65 ? '#F59E0B' : '#EF4444';
  const label = score < 35 ? 'LOW' : score < 65 ? 'MEDIUM' : 'HIGH';
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box sx={{ position: 'relative', width: size, height: size }}>
        <CircularProgress
          variant="determinate"
          value={100}
          size={size}
          sx={{ color: '#F3F4F6', position: 'absolute' }}
          thickness={6}
        />
        <CircularProgress
          variant="determinate"
          value={score}
          size={size}
          sx={{ color, position: 'absolute' }}
          thickness={6}
        />
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="h5" fontWeight={700} sx={{ color }}>{score}</Typography>
          <Typography variant="caption" sx={{ color }}>{label}</Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default function RiskAssessment() {
  const [crop, setCrop] = useState('Rice');
  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(false);

  const assess = () => {
    setLoading(true);
    riskService.assess({ crop })
      .then((res) => setRisk(res.data))
      .catch(() => setRisk(getMockRisk(crop)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { assess(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const radarData = risk?.factors.map((f) => ({ subject: f.name.split(' ')[0], score: f.score })) || [];

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} color="primary.main" mb={1}>Risk Assessment</Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>Evaluate market, weather, and supply risks for your crops</Typography>

      {/* Input */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <TextField fullWidth select label="Select Crop" value={crop} onChange={(e) => setCrop(e.target.value)}>
                {CROPS.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button fullWidth variant="contained" size="large" onClick={assess} disabled={loading}>
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Assess Risk'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {risk && (
        <Grid container spacing={3}>
          {/* Overall Risk Gauge */}
          <Grid item xs={12} md={4}>
            <Card sx={{ textAlign: 'center', py: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={2}>Overall Risk Level</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <RiskGauge score={risk.overall_score} size={140} />
                </Box>
                <Chip label={risk.overall_risk} color={RISK_COLOR[risk.overall_risk]} size="medium" sx={{ fontWeight: 700, px: 2, fontSize: 16 }} />
                <Typography variant="body2" color="text.secondary" mt={2}>{risk.crop} risk assessment</Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Radar Chart */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={2}>Risk Profile</Typography>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                    <Radar dataKey="score" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Risk Factors Bar Chart */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={2}>Risk Scores</Typography>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={risk.factors} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={110} />
                    <Tooltip />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                      {risk.factors.map((f) => (
                        <Cell key={f.name} fill={f.score < 35 ? RISK_HEX.LOW : f.score < 65 ? RISK_HEX.MEDIUM : RISK_HEX.HIGH} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Detailed Factor Cards */}
          <Grid item xs={12} md={7}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={2}>Risk Factor Details</Typography>
                <Grid container spacing={1.5}>
                  {risk.factors.map((f) => {
                    const level = f.score < 35 ? 'LOW' : f.score < 65 ? 'MEDIUM' : 'HIGH';
                    return (
                      <Grid item xs={12} sm={6} key={f.name}>
                        <Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: 2, border: 1, borderColor: `${RISK_COLOR[level]}.light` }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                            <Typography variant="body2" fontWeight={600}>{f.name}</Typography>
                            <Chip label={level} color={RISK_COLOR[level]} size="small" />
                          </Box>
                          <Box sx={{ height: 6, bgcolor: '#E5E7EB', borderRadius: 3 }}>
                            <Box sx={{ height: '100%', width: `${f.score}%`, bgcolor: RISK_HEX[level], borderRadius: 3 }} />
                          </Box>
                          <Typography variant="caption" color="text.secondary">{f.score}/100</Typography>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Mitigation Strategies */}
          <Grid item xs={12} md={5}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={2}>Mitigation Strategies</Typography>
                <List disablePadding>
                  {risk.mitigation.map((m, i) => (
                    <ListItem key={i} disablePadding sx={{ py: 0.75, alignItems: 'flex-start' }}>
                      <ListItemIcon sx={{ minWidth: 32, mt: 0.3 }}>
                        <CheckCircleIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={m} primaryTypographyProps={{ fontSize: 13 }} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
