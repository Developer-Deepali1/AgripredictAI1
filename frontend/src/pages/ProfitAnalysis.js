import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, MenuItem, TextField,
  Button, CircularProgress, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow,
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { profitService } from '../services/api';

const CROPS = ['Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 'Tomato', 'Onion', 'Potato'];

const MOCK_COMPARISON = [
  { crop: 'Rice', revenue: 94500, cost: 45000, profit: 49500 },
  { crop: 'Wheat', revenue: 79200, cost: 38000, profit: 41200 },
  { crop: 'Maize', revenue: 58500, cost: 28000, profit: 30500 },
  { crop: 'Cotton', revenue: 162500, cost: 85000, profit: 77500 },
  { crop: 'Sugarcane', revenue: 87500, cost: 52000, profit: 35500 },
];

const COST_BREAKDOWN = [
  { name: 'Seeds', value: 12, color: '#10B981' },
  { name: 'Fertilizer', value: 28, color: '#3B82F6' },
  { name: 'Labour', value: 35, color: '#F59E0B' },
  { name: 'Irrigation', value: 15, color: '#8B5CF6' },
  { name: 'Misc', value: 10, color: '#EF4444' },
];

export default function ProfitAnalysis() {
  const [crop, setCrop] = useState('Rice');
  const [area, setArea] = useState(5);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculate = () => {
    setLoading(true);
    profitService.calculate({ crop, area_ha: area })
      .then((res) => setResult(res.data))
      .catch(() => {
        const baseYield = { Rice: 4500, Wheat: 4200, Maize: 3900, Cotton: 2500, Sugarcane: 70000, Tomato: 18000, Onion: 15000, Potato: 20000 }[crop] || 4000;
        const basePrice = { Rice: 2100, Wheat: 2200, Maize: 1800, Cotton: 6500, Sugarcane: 350, Tomato: 2500, Onion: 1800, Potato: 1500 }[crop] || 2000;
        const baseCost = { Rice: 45000, Wheat: 38000, Maize: 28000, Cotton: 85000, Sugarcane: 52000, Tomato: 65000, Onion: 48000, Potato: 42000 }[crop] || 40000;
        const totalYield = baseYield * area;
        const totalRevenue = Math.round(totalYield * (basePrice / 100));
        const totalCost = Math.round(baseCost * area);
        setResult({ crop, area_ha: area, yield_kg: totalYield, price_per_kg: basePrice / 100, revenue: totalRevenue, cost: totalCost, profit: totalRevenue - totalCost, roi: Math.round(((totalRevenue - totalCost) / totalCost) * 100) });
      })
      .finally(() => setLoading(false));
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} color="primary.main" mb={1}>Profit Analysis</Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>Calculate expected profit for your crop and land area</Typography>

      {/* Input */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField fullWidth select label="Select Crop" value={crop} onChange={(e) => setCrop(e.target.value)}>
                {CROPS.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth type="number" label="Land Area (Hectares)" value={area}
                onChange={(e) => setArea(Number(e.target.value))}
                inputProps={{ min: 0.1, step: 0.5 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button fullWidth variant="contained" size="large" onClick={calculate} disabled={loading}>
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Calculate Profit'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Result */}
      {result && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: 'Expected Yield', value: `${result.yield_kg?.toLocaleString()} kg`, color: '#10B981' },
            { label: 'Total Revenue', value: `₹${result.revenue?.toLocaleString()}`, color: '#3B82F6' },
            { label: 'Total Cost', value: `₹${result.cost?.toLocaleString()}`, color: '#F59E0B' },
            { label: 'Net Profit', value: `₹${result.profit?.toLocaleString()}`, color: result.profit >= 0 ? '#10B981' : '#EF4444' },
            { label: 'ROI', value: `${result.roi}%`, color: result.roi >= 0 ? '#10B981' : '#EF4444' },
            { label: 'Profit/Hectare', value: `₹${Math.round(result.profit / result.area_ha)?.toLocaleString()}`, color: '#8B5CF6' },
          ].map((item) => (
            <Grid item xs={6} sm={4} md={2} key={item.label}>
              <Card sx={{ bgcolor: '#F8FAFC' }}>
                <CardContent sx={{ textAlign: 'center', py: 2, '&:last-child': { pb: 2 } }}>
                  <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                  <Typography variant="h6" fontWeight={700} color={item.color}>{item.value}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Grid container spacing={3}>
        {/* Comparison Chart */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Crop Profitability Comparison (per 5 ha)</Typography>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={MOCK_COMPARISON}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="crop" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, '']} />
                  <Legend />
                  <Bar dataKey="revenue" name="Revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cost" name="Cost" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" name="Profit" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Cost Breakdown Pie */}
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Cost Breakdown</Typography>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={COST_BREAKDOWN} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}%`} labelLine={false}>
                    {COST_BREAKDOWN.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v}%`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {COST_BREAKDOWN.map((item) => (
                  <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 10, height: 10, bgcolor: item.color, borderRadius: 1 }} />
                    <Typography variant="caption">{item.name}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Per-Hectare Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Per-Hectare Profitability</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#F0FDF4' }}>
                      <TableCell sx={{ fontWeight: 700 }}>Crop</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Revenue/ha</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Cost/ha</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Profit/ha</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>ROI %</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {MOCK_COMPARISON.map((row) => (
                      <TableRow key={row.crop} hover>
                        <TableCell fontWeight={600}>{row.crop}</TableCell>
                        <TableCell align="right">₹{(row.revenue / 5).toLocaleString()}</TableCell>
                        <TableCell align="right">₹{(row.cost / 5).toLocaleString()}</TableCell>
                        <TableCell align="right" sx={{ color: 'success.main', fontWeight: 600 }}>₹{(row.profit / 5).toLocaleString()}</TableCell>
                        <TableCell align="right" sx={{ color: 'primary.main', fontWeight: 600 }}>{Math.round((row.profit / row.cost) * 100)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
