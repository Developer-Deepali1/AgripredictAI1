import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Sidebar, { EXPANDED_WIDTH, COLLAPSED_WIDTH } from './components/Layout/Sidebar';
import Header from './components/Header/Header';
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
import ChatWindow from './components/ChatBot/ChatWindow';

const theme = createTheme({
  palette: {
    primary: { main: '#10B981', dark: '#047857', light: '#6EE7B7' },
    secondary: { main: '#92400e' },
    warning: { main: '#F59E0B' },
    error: { main: '#EF4444' },
    info: { main: '#3B82F6' },
    background: { default: 'transparent' },
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
        root: {
          borderRadius: 16,
          background: 'rgba(255, 255, 255, 0.93)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          boxShadow: '0 8px 32px rgba(6, 78, 59, 0.12)',
          transition: 'all 0.3s ease',
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.98)',
            boxShadow: '0 16px 48px rgba(6, 78, 59, 0.18)',
            transform: 'translateY(-4px)',
          },
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
