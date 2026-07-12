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
import { roomService } from '../services/RoomService';
import type { GameState } from '../types';
import { DISTRICT_STRIPS } from '../types';
import { savePreferences, loadPreferences } from '../services/StorageService';
import { formatMoney } from '../utils/format';

export function JoinGamePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefilledCode = searchParams.get('room') || '';

  const [roomCode, setRoomCode] = useState(prefilledCode);
  const [playerName, setPlayerName] = useState(loadPreferences().playerName);
  const [joining, setJoining] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const gameStateRef = useRef<GameState | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error' as 'error' | 'success',
  });

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cleanupRefs = useRef<(() => void)[]>([]);

  const handleJoin = () => {
    if (!roomCode.trim() || !playerName.trim()) return;
    setJoining(true);
    savePreferences({ playerName: playerName.trim() });

    roomService.initClient(roomCode.trim());

    cleanupRefs.current.push(
      roomService.onStateUpdate((state) => {
        gameStateRef.current = state;
        setGameState(state);
        setJoining(false);
        setWaiting(true);
        if (state.status === 'playing') {
          navigate('/player');
        }
      }),
      roomService.onReject((data) => {
        setJoining(false);
        setSnackbar({ open: true, message: data.reason, severity: 'error' });
        gameStateRef.current = null;
        roomService.cleanup();
      }),
      roomService.onPeerJoin(() => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        const currentGameState = gameStateRef.current;
        if (!currentGameState) {
          roomService.sendJoinRequest(playerName.trim());
        } else {
          const myPlayer = currentGameState.players.find((p) => p.name === playerName.trim());
          if (!myPlayer || !myPlayer.isConnected) {
            roomService.sendJoinRequest(playerName.trim());
          }
        }
      })
    );

    timeoutRef.current = setTimeout(() => {
      setJoining(false);
      setSnackbar({
        open: true,
        message: 'Could not find the host. Check the room code and try again.',
        severity: 'error',
      });
      gameStateRef.current = null;
      roomService.cleanup();
    }, 15_000);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      cleanupRefs.current.forEach((fn) => fn());
      cleanupRefs.current = [];
    };
  }, []);

  const accentColor = gameState
    ? DISTRICT_STRIPS[gameState.players.length % DISTRICT_STRIPS.length]
    : DISTRICT_STRIPS[0];

  if (waiting && gameState) {
    return (
      <Layout title={`Room: ${gameState.roomName}`} darkMode={true}>
        <Container maxWidth="sm">
          <Stack spacing={4} sx={{ alignItems: 'center' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" sx={{ fontFamily: '"Bungee", cursive', color: '#00E676', mb: 0.5, letterSpacing: '0.05em' }}>
                You're in the lobby!
              </Typography>
              <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                Waiting for the host to start the game
              </Typography>
            </Box>
            
            <Paper
              elevation={0}
              sx={{
                p: 4,
                width: '100%',
                bgcolor: 'rgba(30, 41, 59, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderLeft: `4px solid ${accentColor}`,
                borderRadius: 4,
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                color: '#F8FAFC',
              }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2.5 }}>
                <Apartment sx={{ color: accentColor }} />
                <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600 }}>
                  {gameState.roomName} — <Box component="span" sx={{ fontFamily: 'monospace', letterSpacing: '0.15em', fontWeight: 700, color: '#00B0FF' }}>{gameState.roomId}</Box>
                </Typography>
                <Chip label={formatMoney(gameState.startingBalance)} size="small" sx={{ ml: 'auto', fontWeight: 700, bgcolor: 'rgba(0, 230, 118, 0.1)', color: '#00E676', border: '1px solid rgba(0, 230, 118, 0.2)' }} />
              </Stack>
              <WaitingAnimation message="Waiting for host to start the game" />
            </Paper>

            <Stack spacing={1.5} sx={{ width: '100%' }}>
              <Typography variant="subtitle2" sx={{ color: '#94A3B8', fontWeight: 700, px: 0.5 }}>
                Players in lobby ({gameState.players.length}):
              </Typography>
              {gameState.players.map((player, idx) => (
                <Card
                  key={player.id}
                  elevation={0}
                  sx={{
                    bgcolor: 'rgba(15, 23, 42, 0.4)',
                    border: `1px solid ${player.color}30`,
                    borderLeft: `4px solid ${player.color}`,
                    borderRadius: 3,
                    transition: 'transform 0.15s',
                    '&:hover': { transform: 'translateX(4px)' }
                  }}
                >
                  <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: player.color, width: 36, height: 36, fontSize: '0.875rem', fontFamily: '"Bungee", cursive', color: '#fff' }}>
                        {player.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#F8FAFC' }}>{player.name}</Typography>
                        <Typography variant="caption" sx={{ color: '#00E676', fontWeight: 600 }}>{formatMoney(player.balance)}</Typography>
                      </Box>
                      <Chip label={`#${idx + 1}`} size="small" sx={{ bgcolor: player.color, color: '#fff', fontWeight: 700, fontSize: '0.7rem' }} />
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
    <Layout title="Join Game" darkMode={true}>
      <Container maxWidth="sm">
        <Stack spacing={4}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" sx={{ fontFamily: '"Bungee", cursive', color: '#00E676', mb: 0.5, letterSpacing: '0.05em' }}>
              Join a City
            </Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8' }}>
              Enter the room code to join an existing game
            </Typography>
          </Box>
          
          <Paper
            elevation={0}
            sx={{
              p: 4,
              width: '100%',
              bgcolor: 'rgba(30, 41, 59, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderLeft: '4px solid #00B0FF',
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              color: '#F8FAFC',
            }}
          >
            <Stack spacing={3.5}>
              <TextField
                label="Room Code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                fullWidth
                placeholder="Enter 6-character room code"
                slotProps={{ htmlInput: { maxLength: 6, style: { textTransform: 'uppercase', fontFamily: 'monospace', fontSize: '1.4rem', letterSpacing: '0.25em', textAlign: 'center', color: '#F8FAFC' } } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(15, 23, 42, 0.4)',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                    '&:hover fieldset': { borderColor: '#00B0FF' },
                    '&.Mui-focused fieldset': { borderColor: '#00B0FF', borderWidth: 2 },
                  },
                  '& .MuiInputLabel-root': { color: '#94A3B8' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#00B0FF' },
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
                    color: '#F8FAFC',
                    backgroundColor: 'rgba(15, 23, 42, 0.4)',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                    '&:hover fieldset': { borderColor: '#00E676' },
                    '&.Mui-focused fieldset': { borderColor: '#00E676', borderWidth: 2 },
                  },
                  '& .MuiInputLabel-root': { color: '#94A3B8' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#00E676' },
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
                  py: 2,
                  fontFamily: '"Bungee", cursive',
                  fontSize: '1.05rem',
                  bgcolor: '#00B0FF',
                  color: '#0F172A',
                  fontWeight: 800,
                  boxShadow: '0 8px 24px rgba(0, 176, 255, 0.25)',
                  '&:hover': {
                    bgcolor: '#0091EA',
                    boxShadow: '0 12px 30px rgba(0, 176, 255, 0.4)',
                  },
                  '&.Mui-disabled': {
                    bgcolor: 'rgba(255,255,255,0.05)',
                    color: 'rgba(255,255,255,0.2)',
                  }
                }}
              >
                {joining ? 'Connecting to City...' : 'Join Game'}
              </Button>
            </Stack>
          </Paper>
          
          <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'center', flexWrap: 'wrap', gap: 0.5 }}>
            {DISTRICT_STRIPS.map((color, i) => (
              <Box key={i} sx={{ width: 36, height: 6, borderRadius: 3, bgcolor: color, opacity: 0.8, boxShadow: `0 0 6px ${color}` }} />
            ))}
          </Stack>
        </Stack>
      </Container>
      
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
}
