import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Layout/Sidebar';
import Login from './pages/Login';
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

const theme = createTheme({
  palette: {
    primary: { main: '#10B981' },
    secondary: { main: '#92400e' },
    warning: { main: '#F59E0B' },
    error: { main: '#EF4444' },
    info: { main: '#3B82F6' },
    background: { default: '#F0FDF4' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', borderRadius: 8 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
      },
    },
  },
});

const DRAWER_WIDTH = 240;

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AppLayout({ children }) {
  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar drawerWidth={DRAWER_WIDTH} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
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
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
