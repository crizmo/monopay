import { ReactNode, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Stack,
  IconButton,
  Container,
} from '@mui/material';
import { AccountBalance as LogoIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ConnectionIndicator } from './ConnectionIndicator';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  actions?: ReactNode;
  darkMode?: boolean;
}

export function Layout({ children, title = 'MONOPAY', actions, darkMode = false }: LayoutProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (title === 'MONOPAY') {
      document.title = 'MonoPay - Serverless Monopoly City Electronic Trading Unit & Dice Banker';
    } else {
      document.title = `${title} | MonoPay`;
    }
  }, [title]);

  const themeBg = darkMode ? '#0F172A' : '#F5F0E8';
  const headerBg = darkMode ? 'rgba(15, 23, 42, 0.9)' : '#FFFFFF';
  const borderCol = darkMode ? 'rgba(255, 255, 255, 0.08)' : '#E0E0E0';
  const titleCol = darkMode ? '#00E676' : '#2E7D32';
  const logoCol = darkMode ? '#00E676' : '#2E7D32';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: themeBg, transition: 'background-color 0.2s ease', color: darkMode ? '#F8FAFC' : '#1A1A1A' }}>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: headerBg,
          borderBottom: `1px solid ${borderCol}`,
          backdropFilter: darkMode ? 'blur(8px)' : 'none',
          color: darkMode ? '#F8FAFC' : '#1A1A1A',
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => navigate('/')}
            sx={{ mr: 2, color: logoCol }}
          >
            <LogoIcon sx={{ fontSize: 32 }} />
          </IconButton>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontFamily: '"Bungee", cursive',
              color: titleCol,
              letterSpacing: '0.05em',
              flex: 1,
            }}
          >
            {title}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <ConnectionIndicator />
            {actions}
          </Stack>
        </Toolbar>
        <Box
          sx={{
            height: 4,
            background: 'linear-gradient(90deg, #1565C0, #2E7D32, #0288D1, #7B1FA2, #E65100, #C62828, #F9A825, #5D4037)',
          }}
        />
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
        {children}
      </Container>
    </Box>
  );
}
