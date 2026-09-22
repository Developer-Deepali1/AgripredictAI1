import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, MenuItem, TextField,
  Chip, LinearProgress, CircularProgress, Button, Divider,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import WarningIcon from '@mui/icons-material/Warning';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { feasibilityService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ALL_STATES, getDistricts } from '../data/locationData';

const SOIL_TYPES = ['Alluvial', 'Black/Regur', 'Red', 'Laterite', 'Desert/Arid', 'Mountain', 'Saline', 'Peaty'];
const SEASONS = ['Kharif', 'Rabi', 'Zaid'];

// Crop data keyed by state so results are location-specific
const CROPS_BY_STATE = {
  'Odisha': [
    { crop: 'Rice', score: 92, status: 'Suitable', water: 'High', duration: '120-150 days', reason: 'Odisha\'s fertile alluvial soil and ample rainfall make it ideal for paddy cultivation' },
    { crop: 'Maize', score: 80, status: 'Suitable', water: 'Medium', duration: '80-100 days', reason: 'Well-suited to Odisha\'s red laterite soil zones' },
    { crop: 'Groundnut', score: 74, status: 'Suitable', water: 'Medium', duration: '110-130 days', reason: 'Good for sandy loam soils in coastal Odisha districts' },
    { crop: 'Turmeric', score: 70, status: 'Suitable', water: 'Medium', duration: '9-10 months', reason: 'Thrives in the humid tropical climate of Odisha' },
    { crop: 'Potato', score: 58, status: 'Marginal', water: 'Medium', duration: '90-110 days', reason: 'Suitable in cooler highland regions of Odisha' },
    { crop: 'Wheat', score: 45, status: 'Marginal', water: 'Low', duration: '100-120 days', reason: 'Possible in Rabi season but less ideal than in northern states' },
    { crop: 'Cotton', score: 30, status: 'Not Suitable', water: 'Medium', duration: '150-180 days', reason: 'Odisha climate and soil are not optimal for cotton cultivation' },
  ],
  'Maharashtra': [
    { crop: 'Cotton', score: 90, status: 'Suitable', water: 'Medium', duration: '150-180 days', reason: 'Black/Regur soil is excellent for cotton cultivation in Maharashtra' },
    { crop: 'Sugarcane', score: 85, status: 'Suitable', water: 'Very High', duration: '12-18 months', reason: 'Maharashtra\'s climate and irrigation infrastructure support sugarcane well' },
    { crop: 'Tomato', score: 78, status: 'Suitable', water: 'Medium', duration: '90-120 days', reason: 'Nashik and Pune belts are prime tomato-growing regions' },
    { crop: 'Onion', score: 75, status: 'Suitable', water: 'Low', duration: '120-150 days', reason: 'Nashik is India\'s largest onion-producing district' },
    { crop: 'Wheat', score: 68, status: 'Suitable', water: 'Medium', duration: '100-130 days', reason: 'Suitable in Vidarbha for Rabi season' },
    { crop: 'Rice', score: 60, status: 'Marginal', water: 'High', duration: '120-150 days', reason: 'Requires supplemental irrigation in most parts of Maharashtra' },
    { crop: 'Maize', score: 72, status: 'Suitable', water: 'Medium', duration: '80-100 days', reason: 'Versatile crop suitable for kharif season in many districts' },
  ],
  'Punjab': [
    { crop: 'Wheat', score: 95, status: 'Suitable', water: 'Medium', duration: '100-130 days', reason: 'Punjab is India\'s wheat bowl – ideal soil and climate' },
    { crop: 'Rice', score: 88, status: 'Suitable', water: 'High', duration: '120-150 days', reason: 'Alluvial soil and canal irrigation make rice highly feasible' },
    { crop: 'Maize', score: 75, status: 'Suitable', water: 'Medium', duration: '80-100 days', reason: 'Good rotation crop after wheat in Punjab' },
    { crop: 'Cotton', score: 60, status: 'Marginal', water: 'Medium', duration: '150-180 days', reason: 'Possible in some southern Punjab districts with black soil' },
    { crop: 'Potato', score: 72, status: 'Suitable', water: 'Medium', duration: '90-110 days', reason: 'Grown widely in Punjab during Rabi season' },
    { crop: 'Sunflower', score: 65, status: 'Suitable', water: 'Low', duration: '90-100 days', reason: 'Drought-tolerant, suitable as alternative to water-intensive crops' },
    { crop: 'Sugarcane', score: 50, status: 'Marginal', water: 'Very High', duration: '12-18 months', reason: 'Possible in irrigation-rich areas but water-intensive' },
  ],
  'Tamil Nadu': [
    { crop: 'Rice', score: 90, status: 'Suitable', water: 'High', duration: '120-150 days', reason: 'Tamil Nadu\'s delta regions are among India\'s most productive rice belts' },
    { crop: 'Sugarcane', score: 82, status: 'Suitable', water: 'Very High', duration: '12-18 months', reason: 'Cauvery delta provides excellent conditions for sugarcane' },
    { crop: 'Banana', score: 78, status: 'Suitable', water: 'High', duration: '11-15 months', reason: 'Tropical climate supports banana cultivation across districts' },
    { crop: 'Cotton', score: 68, status: 'Suitable', water: 'Medium', duration: '150-180 days', reason: 'Black cotton soil zones in northern Tamil Nadu' },
    { crop: 'Groundnut', score: 72, status: 'Suitable', water: 'Low', duration: '110-130 days', reason: 'Suitable in red soil areas of interior Tamil Nadu' },
    { crop: 'Tomato', score: 60, status: 'Marginal', water: 'Medium', duration: '90-120 days', reason: 'Possible in cooler Nilgiris-adjacent areas' },
    { crop: 'Wheat', score: 25, status: 'Not Suitable', water: 'Medium', duration: '100-130 days', reason: 'Tamil Nadu\'s tropical climate is not suitable for wheat' },
  ],
  'default': [
    { crop: 'Rice', score: 88, status: 'Suitable', water: 'High', duration: '120-150 days', reason: 'Ideal for alluvial soil with adequate rainfall' },
    { crop: 'Wheat', score: 82, status: 'Suitable', water: 'Medium', duration: '100-130 days', reason: 'Good for Rabi season with well-drained soil' },
    { crop: 'Cotton', score: 75, status: 'Suitable', water: 'Medium', duration: '150-180 days', reason: 'Black soil is excellent for cotton cultivation' },
    { crop: 'Sugarcane', score: 62, status: 'Marginal', water: 'Very High', duration: '12-18 months', reason: 'Requires consistent irrigation support' },
    { crop: 'Maize', score: 71, status: 'Suitable', water: 'Medium', duration: '80-100 days', reason: 'Versatile crop suitable for multiple seasons' },
    { crop: 'Tomato', score: 45, status: 'Marginal', water: 'Medium', duration: '90-120 days', reason: 'Requires controlled temperature and irrigation' },
    { crop: 'Onion', score: 38, status: 'Not Suitable', water: 'Medium', duration: '120-150 days', reason: 'Needs specific sandy loam soil conditions' },
    { crop: 'Potato', score: 55, status: 'Marginal', water: 'Medium', duration: '90-120 days', reason: 'Suitable in cooler regions only' },
  ],
};

function getCropsForState(state) {
  return CROPS_BY_STATE[state] || CROPS_BY_STATE['default'];
}

const STATUS_CONFIG = {
  Suitable: { color: 'success', icon: <CheckCircleIcon fontSize="small" /> },
  Marginal: { color: 'warning', icon: <WarningIcon fontSize="small" /> },
  'Not Suitable': { color: 'error', icon: <CancelIcon fontSize="small" /> },
};

export default function Feasibility() {
  const { userProfile } = useAuth();

  const [location, setLocation] = useState('');
  const [district, setDistrict] = useState('');
  const [soilType, setSoilType] = useState('Alluvial');
  const [season, setSeason] = useState('Kharif');
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(false);

  const districts = getDistricts(location);

  // Auto-fill from user profile on mount
  useEffect(() => {
    if (userProfile) {
      if (userProfile.location) setLocation(userProfile.location);
      if (userProfile.district) setDistrict(userProfile.district);
      if (userProfile.soil_type) setSoilType(userProfile.soil_type);
    }
  }, [userProfile]);

  const handleStateChange = (e) => {
    setLocation(e.target.value);
    setDistrict('');
  };

  const fetchFeasibility = () => {
    setLoading(true);
    feasibilityService.check({ location: location || 'Maharashtra', soil_type: soilType, season })
      .then((res) => {
        const cropsList = (res.data?.crops || []).map((c) => ({
          crop: c.crop,
          score: Math.round((c.feasibility_score || 0.8) * 100),
          status: c.status,
          water: c.factors?.[0] || 'Medium',
          duration: '90-120 days',
          reason: Array.isArray(c.factors) && c.factors.length > 0
            ? c.factors.join(' • ')
            : `${c.crop} is ${c.status.toLowerCase()} for ${soilType} soil during ${season} season.`,
        }));
        setCrops(cropsList);
      })
      .catch((err) => {
        console.error('Feasibility calculation error:', err);
        setCrops(getCropsForState(location));
      })
      .finally(() => setLoading(false));
  };

  // Fetch when location is auto-filled from profile
  useEffect(() => {
    if (location) fetchFeasibility();
  }, [location, soilType, season]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} color="primary.main" mb={1}>Crop Feasibility</Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>Discover which crops are suitable for your land</Typography>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <LocationOnIcon color="primary" fontSize="small" />
            <Typography variant="h6" fontWeight={600}>Filter by Location &amp; Conditions</Typography>
            {userProfile?.location && (
              <Chip label="Auto-filled from Profile" size="small" color="success" variant="outlined" />
            )}
          </Box>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth select label="State" value={location}
                onChange={handleStateChange}
                SelectProps={{ MenuProps: { PaperProps: { sx: { maxHeight: 300 } } } }}
              >
                {ALL_STATES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth select label="District" value={district}
                onChange={(e) => setDistrict(e.target.value)}
                disabled={!location}
                SelectProps={{ MenuProps: { PaperProps: { sx: { maxHeight: 300 } } } }}
              >
                <MenuItem value=""><em>All Districts</em></MenuItem>
                {districts.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField fullWidth select label="Soil Type" value={soilType} onChange={(e) => setSoilType(e.target.value)}>
                {SOIL_TYPES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField fullWidth select label="Season" value={season} onChange={(e) => setSeason(e.target.value)}>
                {SEASONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button fullWidth variant="contained" size="large" onClick={fetchFeasibility} disabled={loading || !location}>
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Check'}
              </Button>
            </Grid>
          </Grid>
          {location && (
            <Box sx={{ mt: 1.5, p: 1.5, bgcolor: '#F0FDF4', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOnIcon color="success" fontSize="small" />
              <Typography variant="body2" color="success.main" fontWeight={600}>
                Showing crops for: {district ? `${district}, ` : ''}{location}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Summary Chips */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        {['Suitable', 'Marginal', 'Not Suitable'].map((status) => {
          const count = crops.filter((c) => c.status === status).length;
          return <Chip key={status} icon={STATUS_CONFIG[status].icon} label={`${status}: ${count}`} color={STATUS_CONFIG[status].color} variant="outlined" />;
        })}
      </Box>

      {!location ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <LocationOnIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography color="text.secondary">Select a state to view crop feasibility data</Typography>
          </CardContent>
        </Card>
      ) : loading ? (
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
