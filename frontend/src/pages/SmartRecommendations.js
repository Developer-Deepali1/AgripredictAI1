import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Chip, Button, CircularProgress,
  MenuItem, TextField, LinearProgress, Divider, List, ListItem, ListItemIcon, ListItemText,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import EmojiNatureIcon from '@mui/icons-material/EmojiNature';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { recommendationService } from '../services/api';

const RISK_COLOR = { LOW: 'success', MEDIUM: 'warning', HIGH: 'error' };

const MOCK_RECOMMENDATIONS = [
  {
    rank: 1,
    crop: 'Cotton',
    expected_profit: '₹77,500',
    risk_level: 'MEDIUM',
    feasibility_score: 91,
    market_demand: 'High',
    best_season: 'Kharif',
    reasons: [
      'Highest profit margin among viable crops this season',
      'Strong demand from textile mills in Gujarat and Maharashtra',
      'Your black soil is ideal for cotton cultivation',
      'Government MSP support provides price floor protection',
    ],
  },
  {
    rank: 2,
    crop: 'Rice',
    expected_profit: '₹49,500',
    risk_level: 'LOW',
    feasibility_score: 88,
    market_demand: 'Very High',
    best_season: 'Kharif',
    reasons: [
      'Stable price with consistent demand throughout the year',
      'Well-established market infrastructure for procurement',
      'Low price volatility reduces financial risk',
      'Suitable irrigation availability in your region',
    ],
  },
  {
    rank: 3,
    crop: 'Wheat',
    expected_profit: '₹41,200',
    risk_level: 'LOW',
    feasibility_score: 82,
    market_demand: 'High',
    best_season: 'Rabi',
    reasons: [
      'Strong government procurement through MSP ensures minimum income',
      'Established cold storage network for post-harvest management',
      'Low pest pressure in current season forecasts',
      'Rabi crop aligns well with expected rainfall patterns',
    ],
  },
];

const SEASONS = ['All Seasons', 'Kharif', 'Rabi', 'Zaid'];
const RISK_FILTERS = ['All Risk Levels', 'LOW', 'MEDIUM', 'HIGH'];

export default function SmartRecommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seasonFilter, setSeasonFilter] = useState('All Seasons');
  const [riskFilter, setRiskFilter] = useState('All Risk Levels');

  const fetchRecommendations = () => {
    setLoading(true);
    const params = {};
    if (seasonFilter !== 'All Seasons') params.season = seasonFilter;
    if (riskFilter !== 'All Risk Levels') params.risk_level = riskFilter;

    recommendationService.getSmart(params)
      .then((res) => setRecommendations(res.data?.recommendations || MOCK_RECOMMENDATIONS))
      .catch(() => setRecommendations(MOCK_RECOMMENDATIONS))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRecommendations(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = recommendations.filter((r) => {
    if (seasonFilter !== 'All Seasons' && r.best_season !== seasonFilter) return false;
    if (riskFilter !== 'All Risk Levels' && r.risk_level !== riskFilter) return false;
    return true;
  });

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} color="primary.main" mb={1}>Smart Recommendations</Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>AI-powered crop recommendations based on your profile and market data</Typography>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField fullWidth select label="Season" value={seasonFilter} onChange={(e) => setSeasonFilter(e.target.value)}>
                {SEASONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField fullWidth select label="Risk Tolerance" value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)}>
                {RISK_FILTERS.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button fullWidth variant="contained" size="large" onClick={fetchRecommendations} disabled={loading}>
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Refresh'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={3}>
          {filtered.map((rec) => (
            <Grid item xs={12} md={6} lg={4} key={rec.crop}>
              <Card sx={{ height: '100%', border: rec.rank === 1 ? 2 : 1, borderColor: rec.rank === 1 ? 'primary.main' : 'divider', position: 'relative' }}>
                {rec.rank === 1 && (
                  <Box sx={{ position: 'absolute', top: 12, right: 12, bgcolor: 'primary.main', color: 'white', borderRadius: 2, px: 1, py: 0.3, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <StarIcon sx={{ fontSize: 14 }} />
                    <Typography variant="caption" fontWeight={700}>TOP PICK</Typography>
                  </Box>
                )}
                <CardContent>
                  {/* Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Box sx={{ bgcolor: 'primary.light', borderRadius: '50%', p: 1, display: 'flex' }}>
                      <EmojiNatureIcon sx={{ color: 'primary.main', fontSize: 24 }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>#{rec.rank} {rec.crop}</Typography>
                      <Typography variant="caption" color="text.secondary">{rec.best_season} Season</Typography>
                    </Box>
                  </Box>

                  {/* Key Metrics */}
                  <Grid container spacing={1} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Box sx={{ bgcolor: '#F0FDF4', p: 1, borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary">Expected Profit</Typography>
                        <Typography variant="body1" fontWeight={700} color="primary.main">{rec.expected_profit}</Typography>
                        <Typography variant="caption">per 5 hectares</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ bgcolor: '#F8FAFC', p: 1, borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary">Demand</Typography>
                        <Typography variant="body1" fontWeight={700} color="info.main">{rec.market_demand}</Typography>
                        <Typography variant="caption">market demand</Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Badges */}
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip label={`Risk: ${rec.risk_level}`} color={RISK_COLOR[rec.risk_level]} size="small" />
                    <Chip label={`Score: ${rec.feasibility_score}%`} color="primary" size="small" variant="outlined" />
                  </Box>

                  {/* Feasibility Bar */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption">Feasibility Score</Typography>
                      <Typography variant="caption" fontWeight={700}>{rec.feasibility_score}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={rec.feasibility_score} sx={{ height: 6, borderRadius: 3 }} />
                  </Box>

                  <Divider sx={{ mb: 1.5 }} />

                  {/* Reasons */}
                  <Typography variant="body2" fontWeight={600} mb={1} color="primary.main">Why Recommended?</Typography>
                  <List disablePadding>
                    {rec.reasons.slice(0, 3).map((r, i) => (
                      <ListItem key={i} disablePadding sx={{ py: 0.3 }}>
                        <ListItemIcon sx={{ minWidth: 24 }}>
                          <CheckCircleIcon color="success" sx={{ fontSize: 14 }} />
                        </ListItemIcon>
                        <ListItemText primary={r} primaryTypographyProps={{ fontSize: 12, color: 'text.secondary' }} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
