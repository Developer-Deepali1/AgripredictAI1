import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Sidebar, { EXPANDED_WIDTH, COLLAPSED_WIDTH } from './components/Layout/Sidebar';
import Header from './components/Header/Header';
import Login from './pages/Login';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import MarketPredictions from './pages/MarketPredictions';
import Feasibility from './pages/Feasibility';
import ProfitAnalysis from './pages/ProfitAnalysis';
import RiskAssessment from './pages/RiskAssessment';
import SmartRecommendations from './pages/SmartRecommendations';
import Simulator from './pages/Simulator';
import Alerts from './pages/Alerts';
import DataSources from './pages/DataSources';
import CropRotation from './pages/CropRotation';
import IoTMonitoring from './pages/IoTMonitoring';
import CropPrediction from './pages/CropPrediction';
import ClimateCropPredictor from './pages/ClimateCropPredictor';
import DiseaseDetection from './pages/DiseaseDetection';
import ChatWindow from './components/ChatBot/ChatWindow';


const theme = createTheme({
  palette: {
    primary: { main: '#059669', dark: '#047857', light: '#10B981', contrastText: '#ffffff' },
    secondary: { main: '#D97706', dark: '#B45309', light: '#F59E0B' },
    warning: { main: '#F59E0B', dark: '#D97706', light: '#FCD34D' },
    error: { main: '#EF4444', dark: '#DC2626', light: '#F87171' },
    info: { main: '#0284C7', dark: '#0369A1', light: '#38BDF8' },
    success: { main: '#10B981', dark: '#059669', light: '#34D399' },
    text: { primary: '#0F172A', secondary: '#64748B' },
    background: { default: '#F8FAFC', paper: '#FFFFFF' },
    divider: '#E2E8F0',
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.03em' },
    h2: { fontWeight: 800, letterSpacing: '-0.025em' },
    h3: { fontWeight: 700, letterSpacing: '-0.02em' },
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, letterSpacing: '-0.015em' },
    h6: { fontWeight: 600, letterSpacing: '-0.01em' },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    body1: { fontSize: '0.9375rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: 1.55 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 10,
          fontWeight: 600,
          boxShadow: 'none',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(5, 150, 105, 0.2)',
            transform: 'translateY(-1px)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #047857 0%, #065F46 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            boxShadow: '0 12px 28px -4px rgba(15, 23, 42, 0.08)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AppLayout({ children, pageTitle }) {
  const { sidebarCollapsed } = useAuth();
  const drawerWidth = sidebarCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

  return (
    <Box
      className="app-background"
      sx={{ display: 'flex', minHeight: '100vh' }}
    >
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: 0 },
          minHeight: '100vh',
          transition: 'width 0.3s ease',
          // Small top offset on mobile to clear the hamburger button
          pt: { xs: 7, sm: 3 },
        }}
      >
        <Header title={pageTitle} />
        {children}
      </Box>
    </Box>
  );
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  return (
    <Routes>
      <Route path="/landing" element={<Landing />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/landing'} replace />} />
      <Route
        path="/dashboard"
        element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>}
      />
      <Route
        path="/profile"
        element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>}
      />
      <Route
        path="/predictions"
        element={<ProtectedRoute><AppLayout><MarketPredictions /></AppLayout></ProtectedRoute>}
      />
      <Route
        path="/feasibility"
        element={<ProtectedRoute><AppLayout><Feasibility /></AppLayout></ProtectedRoute>}
      />
      <Route
        path="/profit"
        element={<ProtectedRoute><AppLayout><ProfitAnalysis /></AppLayout></ProtectedRoute>}
      />
      <Route
        path="/risk"
        element={<ProtectedRoute><AppLayout><RiskAssessment /></AppLayout></ProtectedRoute>}
      />
      <Route
        path="/recommendations"
        element={<ProtectedRoute><AppLayout><SmartRecommendations /></AppLayout></ProtectedRoute>}
      />
      <Route
        path="/crop-prediction"
        element={<ProtectedRoute><AppLayout><CropPrediction /></AppLayout></ProtectedRoute>}
      />
      <Route
        path="/climate-predictor"
        element={<ProtectedRoute><AppLayout><ClimateCropPredictor /></AppLayout></ProtectedRoute>}
      />
      <Route
        path="/disease-detection"
        element={<ProtectedRoute><AppLayout><DiseaseDetection /></AppLayout></ProtectedRoute>}
      />
      <Route
        path="/crop-doctor"
        element={<ProtectedRoute><AppLayout><DiseaseDetection /></AppLayout></ProtectedRoute>}
      />
      <Route
        path="/rotation"
        element={<ProtectedRoute><AppLayout><CropRotation /></AppLayout></ProtectedRoute>}
      />

      <Route
        path="/iot"
        element={<ProtectedRoute><AppLayout><IoTMonitoring /></AppLayout></ProtectedRoute>}
      />
      <Route
        path="/simulator"
        element={<ProtectedRoute><AppLayout><Simulator /></AppLayout></ProtectedRoute>}
      />
      <Route
        path="/alerts"
        element={<ProtectedRoute><AppLayout><Alerts /></AppLayout></ProtectedRoute>}
      />
      <Route
        path="/data-sources"
        element={<ProtectedRoute><AppLayout><DataSources /></AppLayout></ProtectedRoute>}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
            {/* Global floating chatbot – available on all authenticated pages */}
            <ChatWindow />
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
