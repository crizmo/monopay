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

export function Layout({ children, title = 'Monopay', actions }: LayoutProps) {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0B1026' }}>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: '#0e1630',
          borderBottom: '1px solid rgba(255, 215, 0, 0.08)',
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => navigate('/')}
            sx={{ mr: 2, color: 'secondary.main' }}
          >
            <LogoIcon sx={{ fontSize: 32 }} />
          </IconButton>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontFamily: '"Bungee", cursive',
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA000 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
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
            height: 3,
            background: 'linear-gradient(90deg, #1A237E, #1B5E20, #01579B, #4A148C, #BF360C, #B71C1C, #F57F17, #3E2723)',
          }}
        />
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
        {children}
      </Container>
    </Box>
  );
}
