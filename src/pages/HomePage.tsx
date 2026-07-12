import { Box, Typography, Button, Stack, Paper, Container, Grid, Divider } from '@mui/material';
import {
  Add as CreateIcon,
  Login as JoinIcon,
  Apartment as BuildingIcon,
  Casino as DiceIcon,
  Gavel as GavelIcon,
  CellTower as ConnectionIcon,
  VolumeUp as VolumeIcon,
  History as HistoryIcon,
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
        bgcolor: '#0F172A', // Premium slate dark mode
        color: '#F8FAFC',
        position: 'relative',
        overflowX: 'hidden',
        pb: 8,
      }}
    >
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      {/* Hero Header Skyline Background */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 480,
          opacity: 0.15,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <CitySkyline height={360} opacity={1} />
      </Box>

      {/* Hero Section */}
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, pt: 8, pb: 6 }}>
        <Stack spacing={4} sx={{ alignItems: 'center', textAlign: 'center' }}>
          
          {/* Logo Housing */}
          <Paper
            elevation={0}
            sx={{
              width: 90,
              height: 90,
              borderRadius: 5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(255, 255, 255, 0.03)',
              border: '2px solid rgba(0, 230, 118, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 230, 118, 0.15)',
              animation: 'float 4s ease-in-out infinite',
            }}
          >
            <BuildingIcon sx={{ fontSize: 50, color: '#00E676' }} />
          </Paper>

          {/* Heading */}
          <Stack spacing={1}>
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontFamily: '"Bungee", cursive',
                fontWeight: 800,
                fontSize: { xs: '3rem', sm: '4.5rem' },
                letterSpacing: '0.08em',
                background: 'linear-gradient(45deg, #00E676 30%, #00B0FF 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 4px 12px rgba(0,0,0,0.5)',
              }}
            >
              MONOPAY
            </Typography>
            
            <Typography
              variant="h5"
              component="h2"
              sx={{
                fontWeight: 600,
                color: '#94A3B8',
                letterSpacing: '0.05em',
                maxWidth: 600,
                fontSize: { xs: '1rem', sm: '1.25rem' },
              }}
            >
              Serverless P2P Monopoly City Electronic Trading Unit & Banking Companion
            </Typography>
          </Stack>

          {/* Color Strip Bar */}
          <Stack
            direction="row"
            spacing={0.5}
            sx={{ justifyContent: 'center', flexWrap: 'wrap', gap: 0.5, py: 1 }}
          >
            {DISTRICT_STRIPS.map((color, i) => (
              <Box
                key={i}
                sx={{
                  width: 36,
                  height: 6,
                  borderRadius: 3,
                  bgcolor: color,
                  opacity: 0.8,
                  boxShadow: `0 0 8px ${color}`,
                }}
              />
            ))}
          </Stack>

          {/* Action CTAs */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ width: '100%', maxWidth: 440, pt: 2 }}>
            <Button
              variant="contained"
              size="large"
              fullWidth
              startIcon={<CreateIcon />}
              onClick={() => navigate('/create')}
              sx={{
                py: 2.2,
                fontSize: '1.1rem',
                bgcolor: '#00E676',
                color: '#0F172A',
                fontWeight: 800,
                fontFamily: '"Bungee", cursive',
                boxShadow: '0 8px 24px rgba(0, 230, 118, 0.3)',
                '&:hover': {
                  bgcolor: '#00C853',
                  boxShadow: '0 12px 30px rgba(0, 230, 118, 0.4)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              Create Lobby
            </Button>

            <Button
              variant="outlined"
              size="large"
              fullWidth
              startIcon={<JoinIcon />}
              onClick={() => navigate('/join')}
              sx={{
                py: 2.2,
                fontSize: '1.1rem',
                borderColor: '#00B0FF',
                color: '#00B0FF',
                fontWeight: 800,
                fontFamily: '"Bungee", cursive',
                borderWidth: '2px',
                boxShadow: '0 8px 24px rgba(0, 176, 255, 0.1)',
                '&:hover': {
                  borderColor: '#0091EA',
                  borderWidth: '2px',
                  bgcolor: 'rgba(0, 176, 255, 0.05)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              Join Lobby
            </Button>
          </Stack>

          <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500 }}>
            📡 Fully serverless peer-to-peer network. Local play or remote. No registration required.
          </Typography>

        </Stack>
      </Container>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.05)', my: 4 }} />

      {/* Product Feature Highlights for SEO optimization */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Stack spacing={6}>
          <Typography
            variant="h4"
            align="center"
            sx={{
              fontFamily: '"Bungee", cursive',
              fontSize: { xs: '1.8rem', sm: '2.5rem' },
              color: '#F8FAFC',
            }}
          >
            Why Use MonoPay?
          </Typography>

          <Grid container spacing={4}>
            
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper
                sx={{
                  p: 4,
                  height: '100%',
                  bgcolor: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: 4,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-5px)' },
                }}
              >
                <Stack spacing={2}>
                  <BuildingIcon sx={{ fontSize: 40, color: '#00E676' }} />
                  <Typography variant="h6" sx={{ fontFamily: '"Bungee", cursive', color: '#F8FAFC' }}>
                    Monopoly City Machine
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94A3B8', lineHeight: 1.6 }}>
                    Includes an emulated physical <strong>Monopoly City Electronic Trading Unit</strong>. Spin the build capacity (1, 2, or 3 blocks) or land a free Railroad track. Keep games fast-paced with the timed auction countdown.
                  </Typography>
                </Stack>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Paper
                sx={{
                  p: 4,
                  height: '100%',
                  bgcolor: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: 4,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-5px)' },
                }}
              >
                <Stack spacing={2}>
                  <DiceIcon sx={{ fontSize: 40, color: '#00B0FF' }} />
                  <Typography variant="h6" sx={{ fontFamily: '"Bungee", cursive', color: '#F8FAFC' }}>
                    Integrated Dice Roller
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94A3B8', lineHeight: 1.6 }}>
                    No physical dice? No problem! The built-in <strong>Monopoly Dice Roller</strong> gives you instant double rolls directly inside the Banker controls dashboard. Features rolling animations and outcomes calculations.
                  </Typography>
                </Stack>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Paper
                sx={{
                  p: 4,
                  height: '100%',
                  bgcolor: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: 4,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-5px)' },
                }}
              >
                <Stack spacing={2}>
                  <VolumeIcon sx={{ fontSize: 40, color: '#FFD700' }} />
                  <Typography variant="h6" sx={{ fontFamily: '"Bungee", cursive', color: '#F8FAFC' }}>
                    Authentic 8-Bit Audio
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94A3B8', lineHeight: 1.6 }}>
                    Synth sounds directly outputted to your browser speaker using the Web Audio API. Ticking sounds play as you roll, and a warning siren alerts you when the timed auction period has expired.
                  </Typography>
                </Stack>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Paper
                sx={{
                  p: 4,
                  height: '100%',
                  bgcolor: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: 4,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-5px)' },
                }}
              >
                <Stack spacing={2}>
                  <ConnectionIcon sx={{ fontSize: 40, color: '#E040FB' }} />
                  <Typography variant="h6" sx={{ fontFamily: '"Bungee", cursive', color: '#F8FAFC' }}>
                    Serverless P2P WebRTC
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94A3B8', lineHeight: 1.6 }}>
                    Establish room connections with peer clients instantly. Fully serverless networking handles real-time updates without database storage or third-party credential dependencies.
                  </Typography>
                </Stack>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Paper
                sx={{
                  p: 4,
                  height: '100%',
                  bgcolor: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: 4,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-5px)' },
                }}
              >
                <Stack spacing={2}>
                  <HistoryIcon sx={{ fontSize: 40, color: '#FF3D00' }} />
                  <Typography variant="h6" sx={{ fontFamily: '"Bungee", cursive', color: '#F8FAFC' }}>
                    Transaction Ledger
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94A3B8', lineHeight: 1.6 }}>
                    Ditch paper money for clean digital balances. View a full history of recent activities, credits, debits, and transfers with an animated balance counter that matches bank movements.
                  </Typography>
                </Stack>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Paper
                sx={{
                  p: 4,
                  height: '100%',
                  bgcolor: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: 4,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-5px)' },
                }}
              >
                <Stack spacing={2}>
                  <GavelIcon sx={{ fontSize: 40, color: '#00E676' }} />
                  <Typography variant="h6" sx={{ fontFamily: '"Bungee", cursive', color: '#F8FAFC' }}>
                    Monopoly City Game Rules
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94A3B8', lineHeight: 1.6 }}>
                    Designed to fully support <em>Monopoly City</em> rules including industrial zones, stadium builds, income tax calculations, rent collection triggers, and custom banker balances.
                  </Typography>
                </Stack>
              </Paper>
            </Grid>

          </Grid>
        </Stack>
      </Container>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.05)', my: 4 }} />

      {/* SEO Q&A FAQ Section */}
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Stack spacing={4}>
          <Typography
            variant="h5"
            align="center"
            sx={{
              fontFamily: '"Bungee", cursive',
              color: '#F8FAFC',
            }}
          >
            Monopoly Game FAQ
          </Typography>

          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#00E676', mb: 1 }}>
                How do you use the Monopoly City building roll machine?
              </Typography>
              <Typography variant="body2" sx={{ color: '#94A3B8', lineHeight: 1.6 }}>
                In <em>Monopoly City</em>, the build capacity machine (Trading Unit) dictates how many residential blocks you are permitted to build on your districts during a turn. Simply press the rolling trigger button. The lights will cycle and select 1, 2, or 3 building blocks, or the Railroad track symbol for a free railroad.
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#00E676', mb: 1 }}>
                How does MonoPay's online Monopoly banker calculator work?
              </Typography>
              <Typography variant="body2" sx={{ color: '#94A3B8', lineHeight: 1.6 }}>
                MonoPay works by setting up a decentralized WebRTC signaling lobby. The Banker (game creator) creates a room code, and players use the code to join. Transactions are initiated on-screen, sending real-time money transfers between player balances or the bank ledger serverlessly.
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#00E676', mb: 1 }}>
                Does MonoPay work offline?
              </Typography>
              <Typography variant="body2" sx={{ color: '#94A3B8', lineHeight: 1.6 }}>
                Yes! MonoPay runs peer-to-peer within your browser. If you play on a local WiFi network, browser tab WebRTC connection processes will establish local links. The built-in Monopoly dice machine and audio synthesizers run entirely client-side without any cloud dependency.
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
