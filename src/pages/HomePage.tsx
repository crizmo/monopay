import { Box, Typography, Button, Stack, Paper, Container } from '@mui/material';
import {
  Add as CreateIcon,
  Login as JoinIcon,
  Apartment as BuildingIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { CitySkyline } from '../components/CitySkyline';
import { DISTRICT_STRIPS } from '../types';

export function HomePage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#F5F0E8',
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
          opacity: 0.3,
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
                bgcolor: '#FFFFFF',
                border: '3px solid #2E7D32',
                boxShadow: '0 4px 20px rgba(46, 125, 50, 0.15)',
              }}
            >
              <BuildingIcon sx={{ fontSize: 48, color: '#2E7D32' }} />
            </Paper>

            <Typography
              variant="h2"
              sx={{
                fontFamily: '"Bungee", cursive',
                fontWeight: 800,
                color: '#2E7D32',
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
                bgcolor: '#2E7D32',
                color: '#FFFFFF',
                fontFamily: '"Bungee", cursive',
                boxShadow: '0 4px 16px rgba(46, 125, 50, 0.3)',
                '&:hover': {
                  bgcolor: '#1B5E20',
                  boxShadow: '0 6px 20px rgba(46, 125, 50, 0.4)',
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
                borderColor: '#2E7D32',
                color: '#2E7D32',
                fontFamily: '"Bungee", cursive',
                '&:hover': {
                  borderColor: '#1B5E20',
                  bgcolor: 'rgba(46, 125, 50, 0.06)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              Join Game
            </Button>
          </Stack>

          <Stack
            direction="row"
            spacing={0.5}
            sx={{ justifyContent: 'center', flexWrap: 'wrap', gap: 0.5 }}
          >
            {DISTRICT_STRIPS.map((color, i) => (
              <Box
                key={i}
                sx={{
                  width: 32,
                  height: 6,
                  borderRadius: 3,
                  bgcolor: color,
                  opacity: 0.7,
                }}
              />
            ))}
          </Stack>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
            Peer-to-peer. No server required.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
