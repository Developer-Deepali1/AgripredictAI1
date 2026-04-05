import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Grid, Card, CardContent, Avatar, Chip,
  Container,
} from '@mui/material';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SensorsIcon from '@mui/icons-material/Sensors';
import LoopIcon from '@mui/icons-material/Loop';
import BarChartIcon from '@mui/icons-material/BarChart';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import NatureIcon from '@mui/icons-material/Nature';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const FEATURES = [
  {
    icon: <AutoAwesomeIcon sx={{ fontSize: 32 }} />,
    title: 'AI Crop Recommendations',
    description: 'Get personalised crop suggestions based on your soil, climate, and market data with 92%+ accuracy.',
    color: '#10B981',
    bg: '#F0FDF4',
  },
  {
    icon: <TrendingUpIcon sx={{ fontSize: 32 }} />,
    title: 'Market Price Predictions',
    description: 'Forecast mandi prices weeks in advance to sell at the right time and maximise profit.',
    color: '#3B82F6',
    bg: '#EFF6FF',
  },
  {
    icon: <SensorsIcon sx={{ fontSize: 32 }} />,
    title: 'IoT Farm Monitoring',
    description: 'Real-time sensor data for soil moisture, temperature, and humidity with automated alerts.',
    color: '#8B5CF6',
    bg: '#F5F3FF',
  },
  {
    icon: <LoopIcon sx={{ fontSize: 32 }} />,
    title: 'Crop Rotation Planner',
    description: 'AI-optimised rotation plans that boost soil health and increase yield season after season.',
    color: '#F59E0B',
    bg: '#FFFBEB',
  },
  {
    icon: <BarChartIcon sx={{ fontSize: 32 }} />,
    title: 'Profit & Risk Analysis',
    description: 'Detailed profitability projections and risk assessments before you invest in any crop.',
    color: '#EF4444',
    bg: '#FEF2F2',
  },
  {
    icon: <WarningAmberIcon sx={{ fontSize: 32 }} />,
    title: 'Smart Alerts',
    description: 'Stay ahead with timely notifications on weather, price drops, and pest outbreaks.',
    color: '#D97706',
    bg: '#FFFBEB',
  },
];

const STATS = [
  { value: '50,000+', label: 'Farmers Served' },
  { value: '92%', label: 'Prediction Accuracy' },
  { value: '18', label: 'Crops Supported' },
  { value: '₹2.4L', label: 'Avg. Annual Profit Gain' },
];

const TESTIMONIALS = [
  {
    name: 'Ramesh Yadav',
    location: 'Punjab',
    text: 'AgriPredict AI helped me switch to cotton at the right time. I made 30% more profit this season!',
    crop: 'Cotton Farmer',
  },
  {
    name: 'Sunita Patel',
    location: 'Gujarat',
    text: 'The soil health monitoring alerts saved my wheat crop from a nutrient deficiency before it was too late.',
    crop: 'Wheat Farmer',
  },
  {
    name: 'Arjun Singh',
    location: 'Odisha',
    text: 'Price prediction gave me the confidence to hold my rice stock for two more weeks – great decision!',
    crop: 'Rice Farmer',
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'white' }}>
      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <Box
        sx={{
          position: 'sticky', top: 0, zIndex: 100,
          bgcolor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)',
          borderBottom: '1px solid #E5E7EB',
          px: { xs: 2, md: 6 }, py: 1.5,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AgricultureIcon sx={{ color: '#10B981', fontSize: 32 }} />
          <Typography variant="h6" fontWeight={700} color="primary.main">AgriPredict AI</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" color="primary" onClick={() => navigate('/login')} sx={{ borderRadius: 2, fontWeight: 600 }}>
            Log In
          </Button>
          <Button variant="contained" color="primary" onClick={() => navigate('/login')} sx={{ borderRadius: 2, fontWeight: 600 }}>
            Get Started
          </Button>
        </Box>
      </Box>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #064E3B 0%, #065F46 40%, #047857 70%, #059669 100%)',
          color: 'white',
          py: { xs: 8, md: 14 },
          px: { xs: 2, md: 6 },
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at 20% 50%, rgba(16,185,129,0.3) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(52,211,153,0.2) 0%, transparent 50%)',
          },
        }}
      >
        <Container maxWidth="md" sx={{ position: 'relative' }}>
          <Chip
            label="🚀 Powered by Machine Learning"
            sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', mb: 3, fontWeight: 600 }}
          />
          <Typography
            variant="h2"
            fontWeight={800}
            sx={{ mb: 2, fontSize: { xs: '2rem', md: '3.5rem' }, lineHeight: 1.2 }}
          >
            Predict the Future of
            <Box component="span" sx={{ color: '#6EE7B7', display: 'block' }}>
              Farming with AI
            </Box>
          </Typography>
          <Typography
            variant="h6"
            sx={{ mb: 4, opacity: 0.9, fontWeight: 400, maxWidth: 600, mx: 'auto', fontSize: { xs: '1rem', md: '1.2rem' } }}
          >
            AgriPredict AI gives Indian farmers intelligent insights — from crop selection and price forecasting to real-time soil monitoring — all in one platform.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/login')}
              sx={{
                bgcolor: 'white', color: 'primary.dark', fontWeight: 700,
                px: 4, py: 1.5, borderRadius: 3, fontSize: 16,
                '&:hover': { bgcolor: '#F0FDF4' },
              }}
            >
              Get Started Free
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/login')}
              sx={{
                borderColor: 'rgba(255,255,255,0.6)', color: 'white', fontWeight: 600,
                px: 4, py: 1.5, borderRadius: 3, fontSize: 16,
                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
              }}
            >
              View Dashboard
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ── Stats ──────────────────────────────────────────────────────────── */}
      <Box sx={{ bgcolor: '#F0FDF4', py: 5, px: { xs: 2, md: 6 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={2} justifyContent="center">
            {STATS.map((s) => (
              <Grid item xs={6} sm={3} key={s.label}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h3" fontWeight={800} color="primary.main">{s.value}</Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>{s.label}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <Box sx={{ py: 10, px: { xs: 2, md: 6 }, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Chip label="Features" color="primary" variant="outlined" sx={{ mb: 1.5, fontWeight: 600 }} />
            <Typography variant="h3" fontWeight={700} sx={{ mb: 1.5 }}>
              Everything a Modern Farmer Needs
            </Typography>
            <Typography variant="h6" color="text.secondary" fontWeight={400} sx={{ maxWidth: 600, mx: 'auto' }}>
              A complete intelligence platform built for Indian agriculture — powered by AI, designed for farmers.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {FEATURES.map((f) => (
              <Grid item xs={12} sm={6} md={4} key={f.title}>
                <Card sx={{ height: '100%', border: '1px solid #E5E7EB' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Avatar sx={{ bgcolor: f.bg, color: f.color, width: 56, height: 56, mb: 2 }}>
                      {f.icon}
                    </Avatar>
                    <Typography variant="h6" fontWeight={700} mb={1}>{f.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{f.description}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── How it works ───────────────────────────────────────────────────── */}
      <Box sx={{ py: 10, px: { xs: 2, md: 6 }, bgcolor: '#F9FAFB' }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Chip label="How It Works" color="primary" variant="outlined" sx={{ mb: 1.5, fontWeight: 600 }} />
            <Typography variant="h3" fontWeight={700}>Simple. Smart. Effective.</Typography>
          </Box>
          <Grid container spacing={4}>
            {[
              { step: '01', title: 'Create Your Profile', desc: 'Register and enter your farm details — location, soil type, and crops you grow.' },
              { step: '02', title: 'Get AI Insights', desc: 'Our models analyse market trends, weather data, and soil conditions to give tailored recommendations.' },
              { step: '03', title: 'Grow & Profit', desc: 'Follow the AI-powered plan to optimise yield, reduce risk, and sell at the best time.' },
            ].map((step) => (
              <Grid item xs={12} md={4} key={step.step}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 64, height: 64, borderRadius: '50%',
                      bgcolor: 'primary.main', color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 22, fontWeight: 800, mx: 'auto', mb: 2,
                    }}
                  >
                    {step.step}
                  </Box>
                  <Typography variant="h6" fontWeight={700} mb={1}>{step.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{step.desc}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── Testimonials ───────────────────────────────────────────────────── */}
      <Box sx={{ py: 10, px: { xs: 2, md: 6 }, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Chip label="Testimonials" color="primary" variant="outlined" sx={{ mb: 1.5, fontWeight: 600 }} />
            <Typography variant="h3" fontWeight={700}>Trusted by Farmers Across India</Typography>
          </Box>
          <Grid container spacing={3}>
            {TESTIMONIALS.map((t) => (
              <Grid item xs={12} md={4} key={t.name}>
                <Card sx={{ height: '100%', border: '1px solid #E5E7EB' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
                      "{t.text}"
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', color: 'white' }}>
                        <NatureIcon />
                      </Avatar>
                      <Box>
                        <Typography fontWeight={600}>{t.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{t.crop} · {t.location}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #064E3B, #059669)',
          py: 10, px: { xs: 2, md: 6 }, textAlign: 'center', color: 'white',
        }}
      >
        <Container maxWidth="sm">
          <AgricultureIcon sx={{ fontSize: 56, mb: 2, color: '#6EE7B7' }} />
          <Typography variant="h3" fontWeight={800} mb={2}>Ready to Grow Smarter?</Typography>
          <Typography variant="h6" fontWeight={400} mb={4} sx={{ opacity: 0.9 }}>
            Join thousands of farmers already using AgriPredict AI to make better decisions every season.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/login')}
              sx={{ bgcolor: 'white', color: 'primary.dark', fontWeight: 700, px: 4, py: 1.5, borderRadius: 3 }}
            >
              Get Started Free
            </Button>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3, flexWrap: 'wrap' }}>
            {['No credit card needed', 'Free for small farmers', 'Available in Hindi & Odia'].map((t) => (
              <Box key={t} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CheckCircleIcon sx={{ fontSize: 16, color: '#6EE7B7' }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>{t}</Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <Box sx={{ bgcolor: '#064E3B', py: 4, px: { xs: 2, md: 6 }, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
          <AgricultureIcon sx={{ color: '#6EE7B7', fontSize: 24 }} />
          <Typography fontWeight={700} color="white">AgriPredict AI</Typography>
        </Box>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
          © 2025 AgriPredict AI · Empowering Indian Agriculture with Intelligence
        </Typography>
      </Box>
    </Box>
  );
}
