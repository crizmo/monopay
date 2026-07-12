import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2E7D32',
      light: '#60AD5E',
      dark: '#005005',
      contrastText: '#fff',
    },
    secondary: {
      main: '#F9A825',
      light: '#FFD54F',
      dark: '#C17900',
      contrastText: '#000',
    },
    background: {
      default: '#F5F0E8',
      paper: '#FFFFFF',
    },
    error: {
      main: '#C62828',
      light: '#EF5350',
      dark: '#8E0000',
    },
    success: {
      main: '#2E7D32',
      light: '#60AD5E',
      dark: '#005005',
    },
    warning: {
      main: '#E65100',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#616161',
    },
    divider: 'rgba(0, 0, 0, 0.08)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Bungee", "Inter", sans-serif',
      fontWeight: 400,
      color: '#1A1A1A',
    },
    h2: {
      fontFamily: '"Bungee", "Inter", sans-serif',
      fontWeight: 400,
      color: '#1A1A1A',
    },
    h3: {
      fontFamily: '"Bungee", "Inter", sans-serif',
      fontWeight: 400,
      color: '#1A1A1A',
    },
    h4: {
      fontFamily: '"Bungee", "Inter", sans-serif',
      fontWeight: 400,
      color: '#1A1A1A',
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
    borderRadius: 14,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '12px 28px',
          fontSize: '0.95rem',
          fontWeight: 700,
          boxShadow: 'none',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
          },
        },
        contained: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          background: '#FFFFFF',
          border: '2px solid #E0E0E0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
          transition: 'all 0.2s ease',
          '&:hover': {
            border: '2px solid #BDBDBD',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          background: '#FFFFFF',
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
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
          backgroundColor: '#FFFFFF',
          color: '#1A1A1A',
          boxShadow: '0 1px 0 rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          color: '#2E7D32',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: '#FAFAFA',
            '&:hover fieldset': {
              borderColor: '#2E7D32',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#2E7D32',
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#FFFFFF',
        },
      },
    },
  },
});

export default theme;
