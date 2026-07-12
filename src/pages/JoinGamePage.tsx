import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Container,
  Snackbar,
  Alert,
  Paper,
  Avatar,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import { Login as JoinIcon, Apartment } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { WaitingAnimation } from '../components/WaitingAnimation';
import { joinRoom, selfId } from 'trystero';
import type { GameState } from '../types';
import { DISTRICT_STRIPS } from '../types';
import { savePreferences, loadPreferences } from '../services/StorageService';
import { formatMoney } from '../utils/format';

type Room = ReturnType<typeof joinRoom>;

export function JoinGamePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefilledCode = searchParams.get('room') || '';

  const [roomCode, setRoomCode] = useState(prefilledCode);
  const [playerName, setPlayerName] = useState(loadPreferences().playerName);
  const [joining, setJoining] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error' as 'error' | 'success',
  });

  const roomRef = useRef<Room | null>(null);
  const gameStateRef = useRef<GameState | null>(null);

  const handleJoin = () => {
    if (!roomCode.trim() || !playerName.trim()) return;

    setJoining(true);
    savePreferences({ playerName: playerName.trim() });

    const room = joinRoom({ appId: 'com.monopay' }, roomCode.trim());
    roomRef.current = room;

    const stateUpdate = room.makeAction('state-update');
    const joinRequest = room.makeAction('join-request');
    const rejectJoin = room.makeAction('reject-join');

    stateUpdate.onMessage = (rawData) => {
      const data = rawData as unknown as GameState;
      gameStateRef.current = data;
      setGameState(data);
      setJoining(false);
      setWaiting(true);

      const myPlayer = data.players.find((p) => p.peerId === selfId);
      if (myPlayer) {
        localStorage.setItem('monopay_current_player', JSON.stringify(myPlayer));
        localStorage.setItem('monopay_game_state', JSON.stringify(data));
      }
    };

    rejectJoin.onMessage = (rawData) => {
      const data = rawData as unknown as { reason: string };
      setJoining(false);
      setSnackbar({ open: true, message: data.reason, severity: 'error' });
      room.leave();
      roomRef.current = null;
    };

    room.onPeerLeave = (peerId) => {
      if (gameStateRef.current) {
        setGameState((prev) => {
          if (!prev) return prev;
          const updated = {
            ...prev,
            players: prev.players.map((p) =>
              p.peerId === peerId ? { ...p, isConnected: false } : p
            ),
          };
          gameStateRef.current = updated;
          return updated;
        });
      }
    };

    joinRequest.send({ playerName: playerName.trim() });
  };

  useEffect(() => {
    return () => {
      roomRef.current?.leave();
      roomRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (gameState?.status === 'playing') {
      navigate('/player');
    }
  }, [gameState, navigate]);

  const accentColor = gameState
    ? DISTRICT_STRIPS[gameState.players.length % DISTRICT_STRIPS.length]
    : DISTRICT_STRIPS[0];

  if (waiting && gameState) {
    return (
      <Layout title={`Room: ${gameState.roomName}`}>
        <Container maxWidth="sm">
          <Stack spacing={4} sx={{ alignItems: 'center' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="h5"
                sx={{ fontFamily: '"Bungee", cursive', color: '#0D1B3E', mb: 0.5 }}
              >
                You're in the lobby!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Waiting for the host to start the city builder
              </Typography>
            </Box>

            <Paper
              sx={{
                p: 3,
                width: '100%',
                borderLeft: `4px solid ${accentColor}`,
                background: 'linear-gradient(135deg, #F8F9FF 0%, #FFFFFF 100%)',
              }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
                <Apartment sx={{ color: accentColor }} />
                <Typography variant="body2" color="text.secondary">
                  {gameState.roomName} — <Box component="span" sx={{ fontFamily: 'monospace', letterSpacing: '0.15em', fontWeight: 700 }}>{gameState.roomId}</Box>
                </Typography>
                <Chip
                  label={formatMoney(gameState.startingBalance)}
                  size="small"
                  sx={{ ml: 'auto', fontWeight: 700, bgcolor: '#C5CAE9', color: '#0D1B3E' }}
                />
              </Stack>
              <WaitingAnimation message="Waiting for host to start the game" />
            </Paper>

            <Stack spacing={1.5} sx={{ width: '100%' }}>
              <Typography variant="subtitle2" color="text.secondary">
                Players in lobby ({gameState.players.length}):
              </Typography>
              {gameState.players.map((player, idx) => (
                <Card
                  key={player.id}
                  sx={{
                    borderLeft: `4px solid ${player.color}`,
                    transition: 'transform 0.15s',
                    '&:hover': { transform: 'translateX(4px)' },
                  }}
                >
                  <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                      <Avatar
                        sx={{
                          bgcolor: player.color,
                          width: 36,
                          height: 36,
                          fontSize: '0.875rem',
                          fontFamily: '"Bungee", cursive',
                        }}
                      >
                        {player.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {player.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatMoney(player.balance)}
                        </Typography>
                      </Box>
                      <Chip
                        label={`#${idx + 1}`}
                        size="small"
                        sx={{
                          bgcolor: player.color,
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '0.7rem',
                        }}
                      />
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Stack>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout title="Join Game">
      <Container maxWidth="sm">
        <Box
          sx={{
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -40,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 200,
              height: 80,
              background: 'linear-gradient(180deg, transparent 0%, rgba(13,27,62,0.04) 100%)',
              borderRadius: '0 0 40px 40px',
              pointerEvents: 'none',
            },
          }}
        >
          <Stack spacing={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="h5"
                sx={{
                  fontFamily: '"Bungee", cursive',
                  color: '#0D1B3E',
                  mb: 0.5,
                }}
              >
                Join a City
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Enter the room code to join an existing game
              </Typography>
            </Box>

            <Stack spacing={3}>
              <TextField
                label="Room Code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                fullWidth
                placeholder="Enter 6-character room code"
                slotProps={{
                  htmlInput: {
                    maxLength: 6,
                    style: {
                      textTransform: 'uppercase',
                      fontFamily: 'monospace',
                      fontSize: '1.4rem',
                      letterSpacing: '0.25em',
                      textAlign: 'center',
                    },
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#C5CAE9' },
                    '&:hover fieldset': { borderColor: '#3F51B5' },
                    '&.Mui-focused fieldset': { borderColor: '#1A237E', borderWidth: 2 },
                  },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#1A237E' },
                }}
              />

              <TextField
                label="Your Name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                fullWidth
                placeholder="Enter your player name"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#C5CAE9' },
                    '&:hover fieldset': { borderColor: '#3F51B5' },
                    '&.Mui-focused fieldset': { borderColor: '#1A237E', borderWidth: 2 },
                  },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#1A237E' },
                }}
              />

              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={<JoinIcon />}
                onClick={handleJoin}
                disabled={!roomCode.trim() || !playerName.trim() || joining}
                sx={{
                  py: 1.5,
                  fontFamily: '"Bungee", cursive',
                  fontSize: '1rem',
                  background: 'linear-gradient(135deg, #1A237E 0%, #0D1B3E 100%)',
                  boxShadow: '0 4px 20px rgba(26,35,126,0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #283593 0%, #1A237E 100%)',
                    boxShadow: '0 6px 24px rgba(26,35,126,0.4)',
                  },
                  '&:disabled': {
                    background: '#E8EAF6',
                    boxShadow: 'none',
                  },
                }}
              >
                {joining ? (
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: '#FFD54F',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                        '@keyframes spin': {
                          to: { transform: 'rotate(360deg)' },
                        },
                      }}
                    />
                    <span>Connecting to City...</span>
                  </Stack>
                ) : (
                  'Join Game'
                )}
              </Button>
            </Stack>

            <Box sx={{ textAlign: 'center', pt: 1 }}>
              <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                {DISTRICT_STRIPS.map((color, i) => (
                  <Box
                    key={i}
                    sx={{
                      width: 32,
                      height: 6,
                      borderRadius: 3,
                      bgcolor: color,
                      opacity: 0.7,
                      transition: 'opacity 0.2s',
                      '&:hover': { opacity: 1 },
                    }}
                  />
                ))}
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
}
