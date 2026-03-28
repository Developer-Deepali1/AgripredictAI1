import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, CircularProgress,
  LinearProgress, Divider,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import SyncIcon from '@mui/icons-material/Sync';
import StorageIcon from '@mui/icons-material/Storage';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import NatureIcon from '@mui/icons-material/Nature';
import { dataService } from '../services/api';

const MOCK_MANDI_PRICES = [
  { mandi: 'Pune', crop: 'Tomato', price: 2150, unit: '₹/qtl', date: '2024-01-15', quality: 'Grade A' },
  { mandi: 'Nashik', crop: 'Onion', price: 1850, unit: '₹/qtl', date: '2024-01-15', quality: 'Grade A' },
  { mandi: 'Amritsar', crop: 'Wheat', price: 2280, unit: '₹/qtl', date: '2024-01-15', quality: 'Grade A' },
  { mandi: 'Patna', crop: 'Rice', price: 2180, unit: '₹/qtl', date: '2024-01-15', quality: 'Grade B' },
  { mandi: 'Ahmedabad', crop: 'Cotton', price: 6450, unit: '₹/qtl', date: '2024-01-15', quality: 'Grade A' },
  { mandi: 'Indore', crop: 'Maize', price: 1820, unit: '₹/qtl', date: '2024-01-14', quality: 'Grade A' },
  { mandi: 'Agra', crop: 'Potato', price: 1550, unit: '₹/qtl', date: '2024-01-14', quality: 'Grade B' },
  { mandi: 'Lucknow', crop: 'Sugarcane', price: 370, unit: '₹/qtl', date: '2024-01-14', quality: 'Grade A' },
];

const DATA_SOURCES = [
  {
    name: 'Mandi Prices',
    icon: <StorageIcon fontSize="large" />,
    status: 'Operational',
    quality: 96,
    lastSync: '15 minutes ago',
    records: '2,450 price records',
    description: 'Real-time commodity prices from 200+ mandis across India',
    color: '#10B981',
  },
  {
    name: 'Weather Data',
    icon: <WaterDropIcon fontSize="large" />,
    status: 'Operational',
    quality: 89,
    lastSync: '1 hour ago',
    records: '450 weather stations',
    description: 'IMD weather data including rainfall, temperature, and forecasts',
    color: '#3B82F6',
  },
  {
    name: 'Crop Patterns',
    icon: <NatureIcon fontSize="large" />,
    status: 'Updating',
    quality: 78,
    lastSync: '3 hours ago',
    records: '12,000 crop records',
    description: 'Historical crop production and sowing patterns by district',
    color: '#F59E0B',
  },
];

const STATUS_COLOR = { Operational: 'success', Updating: 'warning', Error: 'error' };

export default function DataSources() {
  const [mandiData, setMandiData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dataService.getMandiPrices()
      .then((res) => setMandiData(res.data?.prices || MOCK_MANDI_PRICES))
      .catch(() => setMandiData(MOCK_MANDI_PRICES))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} color="primary.main" mb={1}>Data Sources</Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>Status and quality of agricultural data powering predictions</Typography>

      {/* Source Status Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {DATA_SOURCES.map((src) => (
          <Grid item xs={12} sm={6} md={4} key={src.name}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ color: src.color }}>{src.icon}</Box>
                  <Chip
                    icon={src.status === 'Operational' ? <CheckCircleIcon /> : src.status === 'Updating' ? <SyncIcon /> : <ErrorIcon />}
                    label={src.status}
                    color={STATUS_COLOR[src.status]}
                    size="small"
                  />
                </Box>
                <Typography variant="h6" fontWeight={700} mb={0.5}>{src.name}</Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>{src.description}</Typography>

                <Divider sx={{ mb: 1.5 }} />

                <Box sx={{ mb: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption">Data Quality</Typography>
                    <Typography variant="caption" fontWeight={700}>{src.quality}%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={src.quality} color={STATUS_COLOR[src.status]} sx={{ height: 6, borderRadius: 3 }} />
                </Box>

                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Last Sync</Typography>
                    <Typography variant="body2" fontWeight={600}>{src.lastSync}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Coverage</Typography>
                    <Typography variant="body2" fontWeight={600}>{src.records}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Mandi Price Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={2}>Latest Mandi Prices</Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#F0FDF4' }}>
                    <TableCell sx={{ fontWeight: 700 }}>Mandi</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Crop</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Price</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Quality</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mandiData.map((row, i) => (
                    <TableRow key={i} hover>
                      <TableCell>{row.mandi}</TableCell>
                      <TableCell><Chip label={row.crop} size="small" color="primary" variant="outlined" /></TableCell>
                      <TableCell align="right">
                        <Typography fontWeight={700} color="primary.main">{row.price} <Typography component="span" variant="caption">{row.unit}</Typography></Typography>
                      </TableCell>
                      <TableCell><Chip label={row.quality} size="small" color={row.quality === 'Grade A' ? 'success' : 'default'} /></TableCell>
                      <TableCell><Typography variant="body2" color="text.secondary">{row.date}</Typography></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
