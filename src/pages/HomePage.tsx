import { Box, Typography, Button, Stack, Paper, Container } from '@mui/material';
import {
  Add as CreateIcon,
  Login as JoinIcon,
  AccountBalance as LogoIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { CitySkyline } from '../components/CitySkyline';

export function HomePage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#0B1026',
        background: 'radial-gradient(ellipse at center, #1a2332 0%, #0B1026 70%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          opacity: 0.15,
          pointerEvents: 'none',
        }}
      >
        <CitySkyline height={240} opacity={1} />
      </Box>

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Stack spacing={6} sx={{ alignItems: 'center' }}>
          <Stack spacing={2} sx={{ alignItems: 'center' }}>
            <Paper
              elevation={0}
              sx={{
                width: 80,
                height: 80,
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA000 100%)',
                boxShadow: '0 8px 32px rgba(255, 215, 0, 0.3)',
              }}
            >
              <LogoIcon sx={{ fontSize: 48, color: '#0B1026' }} />
            </Paper>

            <Typography
              variant="h2"
              sx={{
                fontFamily: '"Bungee", cursive',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA000 50%, #FFD700 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '0.05em',
              }}
            >
              MONOPAY
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
              Monopoly City Banking
            </Typography>
          </Stack>

          <Stack spacing={3} sx={{ width: '100%', maxWidth: 320 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<CreateIcon />}
              onClick={() => navigate('/create')}
              sx={{
                py: 2,
                fontSize: '1.1rem',
                background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
                boxShadow: '0 4px 20px rgba(76, 175, 80, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #66BB6A 0%, #43A047 100%)',
                  boxShadow: '0 6px 24px rgba(76, 175, 80, 0.5)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              Create Game
            </Button>

            <Button
              variant="outlined"
              size="large"
              startIcon={<JoinIcon />}
              onClick={() => navigate('/join')}
              sx={{
                py: 2,
                fontSize: '1.1rem',
                borderColor: 'rgba(255, 215, 0, 0.3)',
                color: 'secondary.main',
                '&:hover': {
                  borderColor: 'secondary.main',
                  bgcolor: 'rgba(255, 215, 0, 0.05)',
                  boxShadow: '0 0 20px rgba(255, 215, 0, 0.1)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              Join Game
            </Button>
          </Stack>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 4 }}>
            Peer-to-peer. No server required.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
