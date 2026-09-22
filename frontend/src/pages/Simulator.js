import React, { useState, useMemo, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, MenuItem, TextField,
  Button, Slider, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, CircularProgress, Chip,
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { simulationService } from '../services/api';

const CROPS = ['Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 'Tomato', 'Onion', 'Potato'];
const DEFAULTS = {
  Rice: { yield: 4500, price: 21, cost: 45000 },
  Wheat: { yield: 4200, price: 22, cost: 38000 },
  Maize: { yield: 3900, price: 18, cost: 28000 },
  Cotton: { yield: 2500, price: 65, cost: 85000 },
  Sugarcane: { yield: 70000, price: 3.5, cost: 52000 },
  Tomato: { yield: 18000, price: 25, cost: 65000 },
  Onion: { yield: 15000, price: 18, cost: 48000 },
  Potato: { yield: 20000, price: 15, cost: 42000 },
};

function SimCard({ crop, params, label, color }) {
  const revenue = params.yield * params.price * params.area;
  const cost = params.cost * params.area;
  const profit = revenue - cost;
  const roi = cost > 0 ? ((profit / cost) * 100).toFixed(1) : 0;

  return (
    <Card sx={{ border: 2, borderColor: color }}>
      <CardContent>
        <Typography variant="h6" fontWeight={700} color={color} mb={2}>{label}: {crop}</Typography>
        <Grid container spacing={1}>
          {[
            { label: 'Yield', value: `${(params.yield * params.area).toLocaleString()} kg` },
            { label: 'Revenue', value: `₹${revenue.toLocaleString()}` },
            { label: 'Total Cost', value: `₹${cost.toLocaleString()}` },
            { label: 'Net Profit', value: `₹${profit.toLocaleString()}`, bold: true, positive: profit >= 0 },
            { label: 'ROI', value: `${roi}%`, bold: true },
          ].map((item) => (
            <Grid item xs={6} key={item.label}>
              <Typography variant="caption" color="text.secondary">{item.label}</Typography>
              <Typography variant="body1" fontWeight={item.bold ? 700 : 400} color={item.positive !== undefined ? (item.positive ? 'success.main' : 'error.main') : 'text.primary'}>
                {item.value}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}

export default function Simulator() {
  const [cropA, setCropA] = useState('Rice');
  const [cropB, setCropB] = useState('Cotton');
  const [area, setArea] = useState(5);
  const [paramsA, setParamsA] = useState(DEFAULTS['Rice']);
  const [paramsB, setParamsB] = useState(DEFAULTS['Cotton']);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverComparison, setServerComparison] = useState(null);
  const [savedScenarios, setSavedScenarios] = useState([]);
  const [notice, setNotice] = useState(null);

  const handleCropAChange = (c) => { setCropA(c); setParamsA(DEFAULTS[c] || DEFAULTS.Rice); };
  const handleCropBChange = (c) => { setCropB(c); setParamsB(DEFAULTS[c] || DEFAULTS.Wheat); };

  const loadSaved = () => {
    simulationService.getSaved()
      .then((res) => setSavedScenarios(res.data || []))
      .catch(() => {});
  };

  useEffect(() => {
    loadSaved();
  }, []);

  const runSimulation = () => {
    setLoading(true);
    setNotice(null);
    const payload = {
      scenario_a: {
        crop: cropA,
        area_ha: parseFloat(area),
        yield_kg_ha: parseFloat(paramsA.yield),
        price_per_kg: parseFloat(paramsA.price),
        cost_per_ha: parseFloat(paramsA.cost),
      },
      scenario_b: {
        crop: cropB,
        area_ha: parseFloat(area),
        yield_kg_ha: parseFloat(paramsB.yield),
        price_per_kg: parseFloat(paramsB.price),
        cost_per_ha: parseFloat(paramsB.cost),
      },
    };

    simulationService.compare(payload)
      .then((res) => {
        setServerComparison(res.data);
      })
      .catch((err) => {
        console.error('Simulation error:', err);
      })
      .finally(() => setLoading(false));
  };

  const saveCurrentScenario = () => {
    setSaving(true);
    const payload = {
      name: `${cropA} vs ${cropB} (${area} ha)`,
      cropA,
      cropB,
      area,
      winner: serverComparison?.better_scenario === 'A' ? cropA : cropB,
      profit_diff: serverComparison?.profit_difference || Math.abs((paramsA.yield * paramsA.price - paramsA.cost) * area - (paramsB.yield * paramsB.price - paramsB.cost) * area),
    };
    simulationService.save(payload)
      .then(() => {
        setNotice('Scenario saved successfully! Continuable across sessions.');
        loadSaved();
      })
      .catch((err) => console.error('Failed to save scenario:', err))
      .finally(() => setSaving(false));
  };

  const chartData = useMemo(() => {
    const calcProfit = (p) => Math.round(p.yield * p.price * area - p.cost * area);
    const calcRevenue = (p) => Math.round(p.yield * p.price * area);
    const calcCost = (p) => Math.round(p.cost * area);
    return [
      { metric: 'Revenue', [cropA]: calcRevenue(paramsA), [cropB]: calcRevenue(paramsB) },
      { metric: 'Cost', [cropA]: calcCost(paramsA), [cropB]: calcCost(paramsB) },
      { metric: 'Profit', [cropA]: calcProfit(paramsA), [cropB]: calcProfit(paramsB) },
    ];
  }, [cropA, cropB, paramsA, paramsB, area]);

  const SliderField = ({ label, value, onChange, min, max, step, format }) => (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2">{label}</Typography>
        <Typography variant="body2" fontWeight={600}>{format ? format(value) : value}</Typography>
      </Box>
      <Slider value={value} min={min} max={max} step={step} onChange={(_, v) => onChange(v)} color="primary" size="small" />
    </Box>
  );

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} color="primary.main" mb={1}>Crop Simulator</Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>Compare two crops side-by-side with live backend sensitivity simulations</Typography>

      {notice && (
        <Card sx={{ mb: 2, bgcolor: '#ECFDF5', border: '1px solid #A7F3D0' }}>
          <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
            <Typography variant="body2" color="success.dark" fontWeight={600}>✓ {notice}</Typography>
          </CardContent>
        </Card>
      )}

      {/* Area & Action Selector */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField fullWidth type="number" label="Land Area (Hectares)" value={area} onChange={(e) => setArea(Number(e.target.value))} inputProps={{ min: 0.5, step: 0.5 }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button fullWidth variant="contained" size="large" onClick={runSimulation} disabled={loading}>
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Run Simulation'}
              </Button>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button fullWidth variant="outlined" color="secondary" size="large" onClick={saveCurrentScenario} disabled={saving}>
                {saving ? 'Saving…' : 'Save Scenario'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Backend Simulation Analysis Banner */}
      {serverComparison && (
        <Card sx={{ mb: 3, bgcolor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
          <CardContent sx={{ py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
              <Box>
                <Typography variant="h6" fontWeight={700} color="success.dark">
                  Optimal Choice: Crop {serverComparison.better_scenario} ({serverComparison.better_scenario === 'A' ? cropA : cropB})
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Generates ₹{serverComparison.profit_difference?.toLocaleString()} higher net profit compared to the alternative.
                </Typography>
              </Box>
              <Chip label={`ROI: ${serverComparison[`scenario_${serverComparison.better_scenario.toLowerCase()}`]?.roi_percent}%`} color="success" sx={{ fontWeight: 700 }} />
            </Box>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={3}>
        {/* Crop A Controls */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <TextField fullWidth select label="Crop A" value={cropA} onChange={(e) => handleCropAChange(e.target.value)} sx={{ mb: 2 }}>
                {CROPS.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
              <SliderField label="Yield (kg/ha)" value={paramsA.yield} onChange={(v) => setParamsA({ ...paramsA, yield: v })} min={500} max={80000} step={100} format={(v) => `${v.toLocaleString()} kg`} />
              <SliderField label="Price (₹/kg)" value={paramsA.price} onChange={(v) => setParamsA({ ...paramsA, price: v })} min={5} max={100} step={0.5} format={(v) => `₹${v}`} />
              <SliderField label="Cost (₹/ha)" value={paramsA.cost} onChange={(v) => setParamsA({ ...paramsA, cost: v })} min={10000} max={150000} step={1000} format={(v) => `₹${v.toLocaleString()}`} />
            </CardContent>
          </Card>
        </Grid>

        {/* Crop B Controls */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <TextField fullWidth select label="Crop B" value={cropB} onChange={(e) => handleCropBChange(e.target.value)} sx={{ mb: 2 }}>
                {CROPS.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
              <SliderField label="Yield (kg/ha)" value={paramsB.yield} onChange={(v) => setParamsB({ ...paramsB, yield: v })} min={500} max={80000} step={100} format={(v) => `${v.toLocaleString()} kg`} />
              <SliderField label="Price (₹/kg)" value={paramsB.price} onChange={(v) => setParamsB({ ...paramsB, price: v })} min={5} max={100} step={0.5} format={(v) => `₹${v}`} />
              <SliderField label="Cost (₹/ha)" value={paramsB.cost} onChange={(v) => setParamsB({ ...paramsB, cost: v })} min={10000} max={150000} step={1000} format={(v) => `₹${v.toLocaleString()}`} />
            </CardContent>
          </Card>
        </Grid>

        {/* Results */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <SimCard crop={cropA} params={{ ...paramsA, area }} label="Crop A" color="#10B981" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <SimCard crop={cropB} params={{ ...paramsB, area }} label="Crop B" color="#3B82F6" />
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} mb={2}>Comparison Chart</Typography>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="metric" tick={{ fontSize: 12 }} />
                      <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey={cropA} fill="#10B981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey={cropB} fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Comparison Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Side-by-Side Comparison</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#F0FDF4' }}>
                      <TableCell sx={{ fontWeight: 700 }}>Metric</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: '#10B981' }}>{cropA}</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: '#3B82F6' }}>{cropB}</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>Winner</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[
                      { metric: 'Yield (kg)', a: paramsA.yield * area, b: paramsB.yield * area, format: (v) => v.toLocaleString(), higherBetter: true },
                      { metric: 'Revenue (₹)', a: Math.round(paramsA.yield * paramsA.price * area), b: Math.round(paramsB.yield * paramsB.price * area), format: (v) => `₹${v.toLocaleString()}`, higherBetter: true },
                      { metric: 'Total Cost (₹)', a: paramsA.cost * area, b: paramsB.cost * area, format: (v) => `₹${v.toLocaleString()}`, higherBetter: false },
                      { metric: 'Net Profit (₹)', a: Math.round(paramsA.yield * paramsA.price * area - paramsA.cost * area), b: Math.round(paramsB.yield * paramsB.price * area - paramsB.cost * area), format: (v) => `₹${v.toLocaleString()}`, higherBetter: true },
                    ].map((row) => {
                      const winner = row.higherBetter ? (row.a > row.b ? cropA : row.b > row.a ? cropB : 'Tie') : (row.a < row.b ? cropA : row.b < row.a ? cropB : 'Tie');
                      return (
                        <TableRow key={row.metric} hover>
                          <TableCell>{row.metric}</TableCell>
                          <TableCell align="center" sx={{ color: winner === cropA ? 'success.main' : 'text.primary', fontWeight: winner === cropA ? 700 : 400 }}>{row.format(row.a)}</TableCell>
                          <TableCell align="center" sx={{ color: winner === cropB ? 'success.main' : 'text.primary', fontWeight: winner === cropB ? 700 : 400 }}>{row.format(row.b)}</TableCell>
                          <TableCell align="center"><Chip label={winner} size="small" color={winner === 'Tie' ? 'default' : 'success'} /></TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Saved Scenarios History */}
        {savedScenarios.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={1.5}>Saved Scenarios (Continuous Planning)</Typography>
                <Grid container spacing={1.5}>
                  {savedScenarios.map((sc, idx) => (
                    <Grid item xs={12} sm={6} md={4} key={idx}>
                      <Box sx={{ p: 1.5, border: '1px solid #E5E7EB', borderRadius: 2, bgcolor: '#F9FAFB' }}>
                        <Typography variant="subtitle2" fontWeight={700}>{sc.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Saved: {sc.timestamp || 'Today'} • Area: {sc.area} ha
                        </Typography>
                        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Chip label={`Winner: ${sc.winner}`} size="small" color="primary" />
                          <Typography variant="caption" fontWeight={600} color="success.main">
                            +₹{Number(sc.profit_diff || 0).toLocaleString()} diff
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
