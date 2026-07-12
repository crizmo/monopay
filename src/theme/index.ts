import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1B5E20',
      light: '#4CAF50',
      dark: '#0D3B12',
      contrastText: '#fff',
    },
    secondary: {
      main: '#FFD700',
      light: '#FFE54C',
      dark: '#FFA000',
      contrastText: '#000',
    },
    background: {
      default: '#0B1026',
      paper: '#111B33',
    },
    error: {
      main: '#E53935',
      light: '#EF5350',
      dark: '#C62828',
    },
    success: {
      main: '#4CAF50',
      light: '#81C784',
      dark: '#2E7D32',
    },
    warning: {
      main: '#FF6F00',
    },
    text: {
      primary: '#E8EAF6',
      secondary: '#9FA8DA',
    },
    divider: 'rgba(255, 215, 0, 0.12)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Bungee", "Inter", sans-serif',
      fontWeight: 400,
    },
    h2: {
      fontFamily: '"Bungee", "Inter", sans-serif',
      fontWeight: 400,
    },
    h3: {
      fontFamily: '"Bungee", "Inter", sans-serif',
      fontWeight: 400,
    },
    h4: {
      fontFamily: '"Bungee", "Inter", sans-serif',
      fontWeight: 400,
    },
    h5: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 700,
    },
    h6: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 700,
    },
    button: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 700,
      textTransform: 'none' as const,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '10px 24px',
          fontSize: '0.95rem',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
          },
        },
        contained: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          background: 'linear-gradient(160deg, #141E38 0%, #111B33 100%)',
          border: '1px solid rgba(255, 215, 0, 0.06)',
          transition: 'all 0.25s ease',
          '&:hover': {
            border: '1px solid rgba(255, 215, 0, 0.15)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
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
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          background: 'linear-gradient(160deg, #141E38 0%, #0B1026 100%)',
          border: '1px solid rgba(255, 215, 0, 0.08)',
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'scale(1.05)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#111B33',
          borderBottom: '1px solid rgba(255, 215, 0, 0.08)',
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          color: '#FFD700',
        },
      },
    },
  },
});

export default theme;
