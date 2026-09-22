import React, { useState, useEffect, useMemo } from 'react';
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

export default function ProfitAnalysis() {
  const [crop, setCrop] = useState('Rice');
  const [area, setArea] = useState(5);
  const [result, setResult] = useState(null);
  const [comparisons, setComparisons] = useState([]);
  const [loading, setLoading] = useState(false);

  const calculate = () => {
    setLoading(true);
    profitService.calculate({ crop, area_ha: area })
      .then((res) => {
        const d = res.data;
        setResult({
          crop: d.crop,
          area_ha: d.area_ha,
          yield_kg: Math.round(d.expected_yield_kg_ha * d.area_ha),
          revenue: d.total_revenue,
          cost: d.estimated_cost,
          profit: d.net_profit,
          roi: d.roi_percent,
          cost_breakdown: d.cost_breakdown,
        });
      })
      .catch((err) => {
        console.error('Profit calculation error:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    calculate();
    profitService.getComparison()
      .then((res) => {
        const list = (res.data || []).map((c) => ({
          crop: c.crop,
          revenue: Math.round(c.revenue_per_ha * area),
          cost: Math.round(c.cost_per_ha * area),
          profit: Math.round(c.profit_per_ha * area),
          revenue_per_ha: c.revenue_per_ha,
          cost_per_ha: c.cost_per_ha,
          profit_per_ha: c.profit_per_ha,
          roi: Math.round(c.roi_percent),
        }));
        setComparisons(list);
      })
      .catch((err) => console.error('Failed to load profit comparison:', err));
  }, [area]); // eslint-disable-line react-hooks/exhaustive-deps

  const costBreakdownData = useMemo(() => {
    if (!result?.cost_breakdown) {
      return [
        { name: 'Seeds', value: 15, color: '#10B981' },
        { name: 'Fertilizer', value: 30, color: '#3B82F6' },
        { name: 'Labour', value: 35, color: '#F59E0B' },
        { name: 'Irrigation', value: 12, color: '#8B5CF6' },
        { name: 'Other', value: 8, color: '#EF4444' },
      ];
    }
    const cb = result.cost_breakdown;
    const total = (cb.seeds || 0) + (cb.fertilizer || 0) + (cb.labor || 0) + (cb.irrigation || 0) + (cb.other || 0) || 1;
    return [
      { name: 'Seeds', value: Math.round(((cb.seeds || 0) / total) * 100), color: '#10B981' },
      { name: 'Fertilizer', value: Math.round(((cb.fertilizer || 0) / total) * 100), color: '#3B82F6' },
      { name: 'Labour', value: Math.round(((cb.labor || 0) / total) * 100), color: '#F59E0B' },
      { name: 'Irrigation', value: Math.round(((cb.irrigation || 0) / total) * 100), color: '#8B5CF6' },
      { name: 'Other', value: Math.round(((cb.other || 0) / total) * 100), color: '#EF4444' },
    ];
  }, [result]);

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
              <Typography variant="h6" fontWeight={600} mb={2}>Crop Profitability Comparison (for {area} ha)</Typography>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={comparisons}>
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
              <Typography variant="h6" fontWeight={600} mb={2}>Cost Breakdown ({crop})</Typography>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={costBreakdownData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}%`} labelLine={false}>
                    {costBreakdownData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v}%`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {costBreakdownData.map((item) => (
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
              <Typography variant="h6" fontWeight={600} mb={2}>Per-Hectare Profitability Analysis</Typography>
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
                    {comparisons.map((row) => (
                      <TableRow key={row.crop} hover>
                        <TableCell fontWeight={600}>{row.crop}</TableCell>
                        <TableCell align="right">₹{row.revenue_per_ha?.toLocaleString()}</TableCell>
                        <TableCell align="right">₹{row.cost_per_ha?.toLocaleString()}</TableCell>
                        <TableCell align="right" sx={{ color: row.profit_per_ha >= 0 ? 'success.main' : 'error.main', fontWeight: 600 }}>₹{row.profit_per_ha?.toLocaleString()}</TableCell>
                        <TableCell align="right" sx={{ color: 'primary.main', fontWeight: 600 }}>{row.roi}%</TableCell>
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
