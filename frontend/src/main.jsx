import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import App from './App';
import { AuthProvider } from './auth/AuthContext';
import './styles.css';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#e91e63' },
    secondary: { main: '#7b809a' },
    info: { main: '#1A73E8' },
    success: { main: '#4CAF50' },
    warning: { main: '#fb8c00' },
    error: { main: '#F44335' },
    background: { default: '#f0f2f5', paper: '#ffffff' },
    text: { primary: '#344767', secondary: '#7b809a' }
  },
  typography: {
    fontFamily: '"Roboto", "DM Sans", "Segoe UI", sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    subtitle1: { fontWeight: 600 },
    body2: { color: '#7b809a' }
  },
  shape: { borderRadius: 10 },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          border: 'none',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }
      }
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 700
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: '#ffffff'
        }
      }
    }
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
