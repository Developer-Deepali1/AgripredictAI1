import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, MenuItem, TextField, Grid,
  CircularProgress, Chip,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import { predictionService } from '../services/api';

const CROPS = ['Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 'Tomato', 'Onion', 'Potato'];

export default function MarketPredictions() {
  const [selectedCrop, setSelectedCrop] = useState('Rice');
  const [priceData, setPriceData] = useState([]);
  const [seasonData, setSeasonData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [trend, setTrend] = useState({ direction: 'up', percent: '5.4' });
  const [currentPrice, setCurrentPrice] = useState(2100);
  const [predictedPrice, setPredictedPrice] = useState(2250);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      predictionService.getPrices(selectedCrop),
      predictionService.getSeasonality(selectedCrop),
    ])
      .then(([pricesRes, seasonRes]) => {
        const hist = pricesRes.data?.historical_prices || [];
        const pred = pricesRes.data?.predicted_prices || [];

        const combined = [];
        hist.slice(-5).forEach((p) => {
          const d = new Date(p.date);
          const m = d.toLocaleString('en-US', { month: 'short' });
          combined.push({
            month: m,
            historical: Math.round(p.price * 100),
            predicted: null,
          });
        });

        pred.slice(0, 5).forEach((p) => {
          const d = new Date(p.date);
          const m = d.toLocaleString('en-US', { month: 'short' });
          combined.push({
            month: m,
            historical: null,
            predicted: Math.round(p.price * 100),
          });
        });

        setPriceData(combined);

        const cur = Math.round((pricesRes.data?.current_price || 21) * 100);
        setCurrentPrice(cur);

        const nextPred = pred[0] ? Math.round(pred[0].price * 100) : cur;
        setPredictedPrice(nextPred);

        const pct = cur > 0 ? (((nextPred - cur) / cur) * 100).toFixed(1) : '0.0';
        const dir = (pricesRes.data?.trend_direction || 'UP').toUpperCase() === 'DOWN' ? 'down' : 'up';
        setTrend({ direction: dir, percent: Math.abs(pct) });

        const patterns = (seasonRes.data?.patterns || []).map((pat) => ({
          season: pat.month,
          demand: Math.round(pat.index * 60),
          price_index: Math.round(pat.index * 100),
        }));
        setSeasonData(patterns);
      })
      .catch((err) => {
        console.error('Failed to load market predictions from backend:', err);
      })
      .finally(() => setLoading(false));
  }, [selectedCrop]);

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} color="primary.main" mb={1}>Market Predictions</Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>AI-powered price forecasts for major crops</Typography>

      {/* Crop Selector */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth select label="Select Crop" value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
              >
                {CROPS.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6} sm={2}>
              <Box sx={{ p: 1.5, bgcolor: '#F0FDF4', borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary">Current Price</Typography>
                <Typography variant="h6" fontWeight={700} color="primary.main">₹{currentPrice}</Typography>
                <Typography variant="caption">per quintal</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={2}>
              <Box sx={{ p: 1.5, bgcolor: '#EFF6FF', borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary">Predicted Price</Typography>
                <Typography variant="h6" fontWeight={700} color="info.main">₹{predictedPrice}</Typography>
                <Typography variant="caption">next month</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={2}>
              <Chip
                icon={trend.direction === 'up' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                label={`${trend.direction === 'up' ? '+' : '-'}${trend.percent}%`}
                color={trend.direction === 'up' ? 'success' : 'error'}
                size="medium"
                sx={{ fontWeight: 700, px: 1 }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={3}>
          {/* Price Prediction Chart */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={2}>{selectedCrop} — Price Trend & Forecast (₹/quintal)</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={priceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v}`} />
                    <Tooltip formatter={(v, n) => [`₹${v}/qtl`, n]} />
                    <Legend />
                    <Line type="monotone" dataKey="historical" stroke="#10B981" strokeWidth={2.5} name="Historical" connectNulls={false} />
                    <Line type="monotone" dataKey="predicted" stroke="#3B82F6" strokeWidth={2.5} strokeDasharray="6 3" name="Predicted" connectNulls={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Volatility Card */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={2}>Price Volatility</Typography>
                {[
                  { label: 'Price Stability', value: 72, color: '#10B981' },
                  { label: 'Demand Stability', value: 65, color: '#3B82F6' },
                  { label: 'Supply Stability', value: 58, color: '#F59E0B' },
                  { label: 'Market Confidence', value: 80, color: '#8B5CF6' },
                ].map((item) => (
                  <Box key={item.label} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">{item.label}</Typography>
                      <Typography variant="body2" fontWeight={600}>{item.value}%</Typography>
                    </Box>
                    <Box sx={{ height: 8, bgcolor: '#F3F4F6', borderRadius: 4, overflow: 'hidden' }}>
                      <Box sx={{ height: '100%', width: `${item.value}%`, bgcolor: item.color, borderRadius: 4 }} />
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Seasonality Chart */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={2}>{selectedCrop} — Seasonal Demand & Price Index</Typography>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={seasonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="season" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="demand" name="Demand Index" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="price_index" name="Price Index" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
