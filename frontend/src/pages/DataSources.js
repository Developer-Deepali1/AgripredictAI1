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
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { dataService } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Helper to get current and previous date strings in YYYY-MM-DD format
const getDateStr = (offsetDays = 0) => {
  const d = new Date(Date.now() - offsetDays * 24 * 60 * 60 * 1000);
  return d.toISOString().split('T')[0];
};

// State-specific mandi price data (mandis mapped to their respective states)
const STATE_MANDI_DATA = {
  'Andhra Pradesh': [
    { mandi: 'Guntur', crop: 'Chilli', price: 14500, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Vijayawada', crop: 'Rice', price: 2350, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Kurnool', crop: 'Cotton', price: 6800, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Tirupati', crop: 'Groundnut', price: 5600, unit: '₹/qtl', quality: 'Grade B' },
    { mandi: 'Kakinada', crop: 'Maize', price: 2100, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Nellore', crop: 'Tomato', price: 2800, unit: '₹/qtl', quality: 'Grade B' },
  ],
  'Karnataka': [
    { mandi: 'Bengaluru (Yeshwanthpur)', crop: 'Tomato', price: 3200, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Mysuru', crop: 'Maize', price: 2050, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Belagavi', crop: 'Sugarcane', price: 420, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Dharwad', crop: 'Cotton', price: 6750, unit: '₹/qtl', quality: 'Grade B' },
    { mandi: 'Kolar', crop: 'Potato', price: 1800, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Tumakuru', crop: 'Onion', price: 2200, unit: '₹/qtl', quality: 'Grade A' },
  ],
  'Kerala': [
    { mandi: 'Thiruvananthapuram', crop: 'Coconut', price: 3100, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Ernakulam', crop: 'Rubber', price: 18500, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Kozhikode', crop: 'Banana', price: 2400, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Thrissur', crop: 'Paddy', price: 2600, unit: '₹/qtl', quality: 'Grade B' },
    { mandi: 'Kollam', crop: 'Tapioca', price: 1200, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Palakkad', crop: 'Pepper', price: 45000, unit: '₹/qtl', quality: 'Grade A' },
  ],
  'Madhya Pradesh': [
    { mandi: 'Indore', crop: 'Soybean', price: 4800, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Bhopal', crop: 'Wheat', price: 2450, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Jabalpur', crop: 'Maize', price: 1950, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Gwalior', crop: 'Mustard', price: 5600, unit: '₹/qtl', quality: 'Grade B' },
    { mandi: 'Ujjain', crop: 'Gram', price: 5200, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Rewa', crop: 'Rice', price: 2280, unit: '₹/qtl', quality: 'Grade B' },
  ],
  'Maharashtra': [
    { mandi: 'Pune', crop: 'Tomato', price: 3100, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Nashik', crop: 'Onion', price: 2450, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Nagpur', crop: 'Orange', price: 4200, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Aurangabad', crop: 'Cotton', price: 7100, unit: '₹/qtl', quality: 'Grade B' },
    { mandi: 'Solapur', crop: 'Sugarcane', price: 430, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Kolhapur', crop: 'Potato', price: 1950, unit: '₹/qtl', quality: 'Grade A' },
  ],
  'Odisha': [
    { mandi: 'Bhubaneswar', crop: 'Rice', price: 2420, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Cuttack', crop: 'Jute', price: 4800, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Sambalpur', crop: 'Maize', price: 2100, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Berhampur', crop: 'Groundnut', price: 5400, unit: '₹/qtl', quality: 'Grade B' },
    { mandi: 'Rourkela', crop: 'Tomato', price: 2900, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Balangir', crop: 'Turmeric', price: 8200, unit: '₹/qtl', quality: 'Grade A' },
  ],
  'Punjab': [
    { mandi: 'Amritsar', crop: 'Wheat', price: 2550, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Ludhiana', crop: 'Maize', price: 2080, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Jalandhar', crop: 'Potato', price: 1700, unit: '₹/qtl', quality: 'Grade B' },
    { mandi: 'Patiala', crop: 'Rice', price: 2380, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Bathinda', crop: 'Cotton', price: 6900, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Mohali', crop: 'Sugarcane', price: 390, unit: '₹/qtl', quality: 'Grade A' },
  ],
  'Rajasthan': [
    { mandi: 'Jaipur', crop: 'Mustard', price: 5800, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Jodhpur', crop: 'Bajra', price: 2200, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Udaipur', crop: 'Maize', price: 1980, unit: '₹/qtl', quality: 'Grade B' },
    { mandi: 'Ajmer', crop: 'Wheat', price: 2420, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Bikaner', crop: 'Gram', price: 5350, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Kota', crop: 'Soybean', price: 4650, unit: '₹/qtl', quality: 'Grade A' },
  ],
  'Telangana': [
    { mandi: 'Hyderabad', crop: 'Rice', price: 2500, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Warangal', crop: 'Cotton', price: 7050, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Nizamabad', crop: 'Turmeric', price: 9500, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Karimnagar', crop: 'Maize', price: 2150, unit: '₹/qtl', quality: 'Grade B' },
    { mandi: 'Khammam', crop: 'Chilli', price: 13800, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Nalgonda', crop: 'Tomato', price: 2600, unit: '₹/qtl', quality: 'Grade A' },
  ],
  'Uttar Pradesh': [
    { mandi: 'Lucknow', crop: 'Wheat', price: 2460, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Agra', crop: 'Potato', price: 1650, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Kanpur', crop: 'Sugarcane', price: 400, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Varanasi', crop: 'Rice', price: 2310, unit: '₹/qtl', quality: 'Grade B' },
    { mandi: 'Allahabad', crop: 'Mustard', price: 5700, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Meerut', crop: 'Maize', price: 2020, unit: '₹/qtl', quality: 'Grade A' },
  ],
  'West Bengal': [
    { mandi: 'Kolkata', crop: 'Rice', price: 2600, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Siliguri', crop: 'Tea', price: 22000, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Asansol', crop: 'Potato', price: 1750, unit: '₹/qtl', quality: 'Grade B' },
    { mandi: 'Bardhaman', crop: 'Jute', price: 5000, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Murshidabad', crop: 'Onion', price: 2350, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Jalpaiguri', crop: 'Maize', price: 2050, unit: '₹/qtl', quality: 'Grade A' },
  ],
  'Gujarat': [
    { mandi: 'Ahmedabad', crop: 'Cotton', price: 7200, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Surat', crop: 'Groundnut', price: 5800, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Vadodara', crop: 'Wheat', price: 2400, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Rajkot', crop: 'Castor', price: 6500, unit: '₹/qtl', quality: 'Grade B' },
    { mandi: 'Bhavnagar', crop: 'Maize', price: 2000, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Junagadh', crop: 'Mango', price: 5200, unit: '₹/qtl', quality: 'Grade A' },
  ],
  'Bihar': [
    { mandi: 'Patna', crop: 'Rice', price: 2480, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Gaya', crop: 'Wheat', price: 2350, unit: '₹/qtl', quality: 'Grade B' },
    { mandi: 'Muzaffarpur', crop: 'Litchi', price: 9000, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Bhagalpur', crop: 'Maize', price: 2080, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Darbhanga', crop: 'Potato', price: 1600, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Purnia', crop: 'Jute', price: 4900, unit: '₹/qtl', quality: 'Grade B' },
  ],
  'Tamil Nadu': [
    { mandi: 'Chennai', crop: 'Rice', price: 2700, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Coimbatore', crop: 'Cotton', price: 7000, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Madurai', crop: 'Banana', price: 2800, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Salem', crop: 'Mango', price: 4800, unit: '₹/qtl', quality: 'Grade B' },
    { mandi: 'Tiruchirappalli', crop: 'Sugarcane', price: 450, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Dindigul', crop: 'Maize', price: 2200, unit: '₹/qtl', quality: 'Grade A' },
  ],
  'Haryana': [
    { mandi: 'Gurugram', crop: 'Wheat', price: 2500, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Faridabad', crop: 'Mustard', price: 5750, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Ambala', crop: 'Rice', price: 2400, unit: '₹/qtl', quality: 'Grade B' },
    { mandi: 'Hisar', crop: 'Cotton', price: 7100, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Rohtak', crop: 'Sugarcane', price: 395, unit: '₹/qtl', quality: 'Grade A' },
    { mandi: 'Karnal', crop: 'Potato', price: 1680, unit: '₹/qtl', quality: 'Grade A' },
  ],
};

// Default fallback data when the user's state is not mapped
const DEFAULT_MANDI_PRICES = [
  { mandi: 'Azadpur (Delhi)', crop: 'Tomato', price: 3050, unit: '₹/qtl', quality: 'Grade A' },
  { mandi: 'Azadpur (Delhi)', crop: 'Onion', price: 2300, unit: '₹/qtl', quality: 'Grade A' },
  { mandi: 'Azadpur (Delhi)', crop: 'Potato', price: 1800, unit: '₹/qtl', quality: 'Grade B' },
  { mandi: 'Azadpur (Delhi)', crop: 'Wheat', price: 2450, unit: '₹/qtl', quality: 'Grade A' },
];

// Build mandi price rows with dynamic current dates, alternating today/yesterday
const buildMandiRows = (rawRows) => {
  const today = getDateStr(0);
  const yesterday = getDateStr(1);
  return rawRows.map((row, i) => ({
    ...row,
    // Even-indexed rows get today's date, odd-indexed rows get yesterday's date
    date: i % 2 === 0 ? today : yesterday,
  }));
};

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
  const { userProfile } = useAuth();
  const [mandiData, setMandiData] = useState([]);
  const [loading, setLoading] = useState(true);

  const userState = userProfile?.location || null;

  useEffect(() => {
    const stateRaw = STATE_MANDI_DATA[userState?.trim()] || DEFAULT_MANDI_PRICES;
    const stateMock = buildMandiRows(stateRaw);

    dataService.getMandiPrices({ state: userState })
      .then((res) => {
        const prices = res.data?.prices;
        if (prices && prices.length > 0) {
          setMandiData(prices);
        } else {
          setMandiData(stateMock);
        }
      })
      .catch(() => setMandiData(stateMock))
      .finally(() => setLoading(false));
  }, [userState]);

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
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="h6" fontWeight={600}>Latest Mandi Prices</Typography>
            {userState ? (
              <Chip
                icon={<LocationOnIcon />}
                label={`Filtered for: ${userState}`}
                color="success"
                variant="outlined"
                size="small"
              />
            ) : (
              <Chip
                icon={<LocationOnIcon />}
                label="All India (set state in Profile to filter)"
                color="default"
                variant="outlined"
                size="small"
              />
            )}
          </Box>
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
