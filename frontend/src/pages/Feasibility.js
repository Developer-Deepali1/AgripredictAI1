import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, MenuItem, TextField,
  Chip, LinearProgress, CircularProgress, Button, Divider,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import WarningIcon from '@mui/icons-material/Warning';
import { feasibilityService } from '../services/api';

const STATES = ['Maharashtra', 'Punjab', 'Haryana', 'Uttar Pradesh', 'Gujarat', 'Karnataka', 'Tamil Nadu'];
const SOIL_TYPES = ['Alluvial', 'Black/Regur', 'Red', 'Laterite', 'Desert/Arid'];
const SEASONS = ['Kharif', 'Rabi', 'Zaid'];

const MOCK_CROPS = [
  { crop: 'Rice', score: 88, status: 'Suitable', water: 'High', duration: '120-150 days', reason: 'Ideal for alluvial soil with adequate rainfall' },
  { crop: 'Wheat', score: 82, status: 'Suitable', water: 'Medium', duration: '100-130 days', reason: 'Good for Rabi season with well-drained soil' },
  { crop: 'Cotton', score: 75, status: 'Suitable', water: 'Medium', duration: '150-180 days', reason: 'Black soil is excellent for cotton cultivation' },
  { crop: 'Sugarcane', score: 62, status: 'Marginal', water: 'Very High', duration: '12-18 months', reason: 'Requires consistent irrigation support' },
  { crop: 'Maize', score: 71, status: 'Suitable', water: 'Medium', duration: '80-100 days', reason: 'Versatile crop suitable for multiple seasons' },
  { crop: 'Tomato', score: 45, status: 'Marginal', water: 'Medium', duration: '90-120 days', reason: 'Requires controlled temperature and irrigation' },
  { crop: 'Onion', score: 38, status: 'Not Suitable', water: 'Medium', duration: '120-150 days', reason: 'Needs specific sandy loam soil conditions' },
  { crop: 'Potato', score: 55, status: 'Marginal', water: 'Medium', duration: '90-120 days', reason: 'Suitable in cooler regions only' },
];

const STATUS_CONFIG = {
  Suitable: { color: 'success', icon: <CheckCircleIcon fontSize="small" /> },
  Marginal: { color: 'warning', icon: <WarningIcon fontSize="small" /> },
  'Not Suitable': { color: 'error', icon: <CancelIcon fontSize="small" /> },
};

export default function Feasibility() {
  const [location, setLocation] = useState('Maharashtra');
  const [soilType, setSoilType] = useState('Black/Regur');
  const [season, setSeason] = useState('Kharif');
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFeasibility = () => {
    setLoading(true);
    feasibilityService.getCrops({ location, soil_type: soilType, season })
      .then((res) => setCrops(res.data?.crops || MOCK_CROPS))
      .catch(() => setCrops(MOCK_CROPS))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchFeasibility(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} color="primary.main" mb={1}>Crop Feasibility</Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>Discover which crops are suitable for your land</Typography>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={2}>Filter by Conditions</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField fullWidth select label="Location" value={location} onChange={(e) => setLocation(e.target.value)}>
                {STATES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField fullWidth select label="Soil Type" value={soilType} onChange={(e) => setSoilType(e.target.value)}>
                {SOIL_TYPES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField fullWidth select label="Season" value={season} onChange={(e) => setSeason(e.target.value)}>
                {SEASONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button fullWidth variant="contained" size="large" onClick={fetchFeasibility} disabled={loading}>
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Check Feasibility'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Summary Chips */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        {['Suitable', 'Marginal', 'Not Suitable'].map((status) => {
          const count = crops.filter((c) => c.status === status).length;
          return <Chip key={status} icon={STATUS_CONFIG[status].icon} label={`${status}: ${count}`} color={STATUS_CONFIG[status].color} variant="outlined" />;
        })}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={2}>
          {crops.map((crop) => {
            const cfg = STATUS_CONFIG[crop.status];
            return (
              <Grid item xs={12} sm={6} md={4} key={crop.crop}>
                <Card sx={{ height: '100%', border: 1, borderColor: `${cfg.color}.light` }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" fontWeight={700}>{crop.crop}</Typography>
                      <Chip icon={cfg.icon} label={crop.status} color={cfg.color} size="small" />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">Feasibility Score</Typography>
                        <Typography variant="body2" fontWeight={700} color={`${cfg.color}.main`}>{crop.score}%</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={crop.score}
                        color={cfg.color}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>

                    <Divider sx={{ mb: 1.5 }} />

                    <Grid container spacing={1} sx={{ mb: 1.5 }}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Water Need</Typography>
                        <Typography variant="body2" fontWeight={600}>{crop.water}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Duration</Typography>
                        <Typography variant="body2" fontWeight={600}>{crop.duration}</Typography>
                      </Grid>
                    </Grid>

                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', fontSize: 12 }}>
                      {crop.reason}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}
