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

const getDeterministicRisk = (crop) => {
  const baseScores = {
    Rice: { price: 35, oversupply: 40, weather: 55, volatility: 30, score: 40, risk: 'LOW' },
    Wheat: { price: 25, oversupply: 30, weather: 35, volatility: 25, score: 29, risk: 'LOW' },
    Maize: { price: 40, oversupply: 45, weather: 40, volatility: 35, score: 40, risk: 'MEDIUM' },
    Cotton: { price: 50, oversupply: 40, weather: 60, volatility: 55, score: 51, risk: 'MEDIUM' },
    Sugarcane: { price: 20, oversupply: 35, weather: 30, volatility: 20, score: 26, risk: 'LOW' },
    Potato: { price: 60, oversupply: 70, weather: 45, volatility: 65, score: 60, risk: 'MEDIUM' },
    Onion: { price: 75, oversupply: 80, weather: 50, volatility: 80, score: 71, risk: 'HIGH' },
    Tomato: { price: 70, oversupply: 75, weather: 55, volatility: 75, score: 69, risk: 'HIGH' },
  };
  const b = baseScores[crop] || { price: 40, oversupply: 40, weather: 40, volatility: 40, score: 40, risk: 'MEDIUM' };
  return {
    crop,
    overall_risk: b.risk,
    overall_score: b.score,
    factors: [
      { name: 'Price Drop Risk', score: b.price, level: b.price >= 65 ? 'HIGH' : b.price >= 35 ? 'MEDIUM' : 'LOW' },
      { name: 'Oversupply Risk', score: b.oversupply, level: b.oversupply >= 65 ? 'HIGH' : b.oversupply >= 35 ? 'MEDIUM' : 'LOW' },
      { name: 'Weather Risk', score: b.weather, level: b.weather >= 65 ? 'HIGH' : b.weather >= 35 ? 'MEDIUM' : 'LOW' },
      { name: 'Market Volatility', score: b.volatility, level: b.volatility >= 65 ? 'HIGH' : b.volatility >= 35 ? 'MEDIUM' : 'LOW' },
      { name: 'Storage/Post-Harvest', score: Math.round((b.price + b.oversupply) / 2), level: 'MEDIUM' },
      { name: 'Pest/Disease', score: Math.round((b.weather + b.volatility) / 2), level: 'MEDIUM' },
    ],
    mitigation: [
      'Maintain crop insurance under PMFBY to guard against weather and post-harvest risk.',
      'Check local APMC arrival trends to avoid selling during supply gluts.',
      'Stagger harvests across 2-3 picking cycles.',
    ],
  };
};

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

const normalizeRiskData = (data, cropName) => {
  if (!data) return getDeterministicRisk(cropName);

  // If data came from backend (/api/risk/assess)
  if (data.risk_factors && !data.factors) {
    const rf = data.risk_factors;
    // Backend returns 0-10 scale; convert to 0-100 percentage for UI charts
    const scale = (val) => Math.min(100, Math.max(0, Math.round(Number(val || 0) * 10)));
    const getLevel = (s) => (s >= 65 ? 'HIGH' : s >= 35 ? 'MEDIUM' : 'LOW');

    const priceDropScore = scale(rf.price_drop_risk);
    const oversupplyScore = scale(rf.oversupply_risk);
    const weatherScore = scale(rf.weather_risk);
    const volatilityScore = scale(rf.market_volatility);

    const factors = [
      { name: 'Price Drop Risk', score: priceDropScore, level: getLevel(priceDropScore) },
      { name: 'Oversupply Risk', score: oversupplyScore, level: getLevel(oversupplyScore) },
      { name: 'Weather Risk', score: weatherScore, level: getLevel(weatherScore) },
      { name: 'Market Volatility', score: volatilityScore, level: getLevel(volatilityScore) },
      { name: 'Storage / Post-Harvest', score: Math.round((priceDropScore + oversupplyScore) / 2), level: getLevel(Math.round((priceDropScore + oversupplyScore) / 2)) },
      { name: 'Pest & Disease', score: Math.round((weatherScore + volatilityScore) / 2), level: getLevel(Math.round((weatherScore + volatilityScore) / 2)) },
    ];

    const overallScore = Math.min(100, Math.max(0, Math.round(Number(data.overall_risk_score || 4.5) * 10)));
    const overallRisk = data.risk_level || (overallScore >= 65 ? 'HIGH' : overallScore >= 35 ? 'MEDIUM' : 'LOW');
    const mitigation = Array.isArray(data.mitigation_strategies)
      ? data.mitigation_strategies
      : (Array.isArray(data.mitigation) ? data.mitigation : []);

    return {
      crop: data.crop || cropName,
      overall_risk: overallRisk,
      overall_score: overallScore,
      factors,
      mitigation,
    };
  }

  // If already normalized or array factors
  const factors = Array.isArray(data.factors) ? data.factors : [];
  const mitigation = Array.isArray(data.mitigation)
    ? data.mitigation
    : (Array.isArray(data.mitigation_strategies) ? data.mitigation_strategies : []);

  return {
    crop: data.crop || cropName,
    overall_risk: data.overall_risk || data.risk_level || 'MEDIUM',
    overall_score: data.overall_score !== undefined
      ? data.overall_score
      : Math.min(100, Math.max(0, Math.round(Number(data.overall_risk_score || 5) * 10))),
    factors,
    mitigation,
  };
};

export default function RiskAssessment() {
  const [crop, setCrop] = useState('Rice');
  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(false);

  const assess = (targetCrop = crop) => {
    setLoading(true);
    riskService.assess({ crop: targetCrop })
      .then((res) => setRisk(normalizeRiskData(res.data, targetCrop)))
      .catch(() => setRisk(normalizeRiskData(getDeterministicRisk(targetCrop), targetCrop)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { assess(crop); }, [crop]); // eslint-disable-line react-hooks/exhaustive-deps

  const factors = risk?.factors || [];
  const mitigation = risk?.mitigation || [];
  const radarData = factors.map((f) => ({
    subject: (f.name || '').split(' ')[0],
    score: f.score || 0,
  }));

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
                  <RiskGauge score={risk.overall_score || 0} size={140} />
                </Box>
                <Chip
                  label={risk.overall_risk || 'MEDIUM'}
                  color={RISK_COLOR[risk.overall_risk] || 'warning'}
                  size="medium"
                  sx={{ fontWeight: 700, px: 2, fontSize: 16 }}
                />
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
                  <BarChart data={factors} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={110} />
                    <Tooltip />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                      {factors.map((f) => (
                        <Cell
                          key={f.name}
                          fill={f.score < 35 ? RISK_HEX.LOW : f.score < 65 ? RISK_HEX.MEDIUM : RISK_HEX.HIGH}
                        />
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
                  {factors.map((f) => {
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
                  {mitigation.map((m, i) => (
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
