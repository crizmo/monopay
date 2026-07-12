import { ReactNode } from 'react';
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
}

export function Layout({ children, title = 'MONOPAY', actions }: LayoutProps) {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F5F0E8' }}>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: '#FFFFFF',
          borderBottom: '1px solid #E0E0E0',
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => navigate('/')}
            sx={{ mr: 2, color: '#2E7D32' }}
          >
            <LogoIcon sx={{ fontSize: 32 }} />
          </IconButton>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontFamily: '"Bungee", cursive',
              color: '#2E7D32',
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
