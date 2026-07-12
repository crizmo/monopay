import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Paper,
  Container,
  Slider,
  Snackbar,
  Alert,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Avatar,
  Divider,
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  PlayArrow as StartIcon,
  PersonRemove as RemoveIcon,
  Apartment as ApartmentIcon,
  Factory as FactoryIcon,
  Stadium as StadiumIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { WaitingAnimation } from '../components/WaitingAnimation';
import { generateQRCode, generateJoinLink } from '../services/QRService';
import { roomService, selfId } from '../services/RoomService';
import type { GameState } from '../types';
import { PLAYER_COLORS, DEFAULT_STARTING_BALANCE, DISTRICT_STRIPS } from '../types';
import { addPlayer, createGameState, startGame as startGameState } from '../services/GameService';
import { formatMoney } from '../utils/format';

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function CreateGamePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'form' | 'lobby'>('form');
  const [roomName, setRoomName] = useState('');
  const [startingBalance, setStartingBalance] = useState(DEFAULT_STARTING_BALANCE);
  const [maxPlayers, setMaxPlayers] = useState(8);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [joinLink, setJoinLink] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [gameState, setGameState] = useState<GameState | null>(null);
  const gameStateRef = useRef<GameState | null>(null);

  const broadcastState = useCallback((state: GameState) => {
    gameStateRef.current = state;
    setGameState(state);
    roomService.broadcastState(state);
  }, []);

  const handleCreateGame = async () => {
    if (!roomName.trim()) return;

    const code = generateRoomCode();
    roomService.initHost(code);

    const state = createGameState({ roomName, startingBalance, maxPlayers }, selfId);
    state.roomId = code;
    gameStateRef.current = state;
    setGameState(state);
    setRoomCode(code);

    const link = generateJoinLink(code);
    setJoinLink(link);
    const qr = await generateQRCode(link);
    setQrDataUrl(qr);
    setStep('lobby');

    const unsubJoin = roomService.onJoinRequest((data, peerId) => {
      const currentState = gameStateRef.current;
      if (!currentState) return;
      const result = addPlayer(currentState, data.playerName, peerId);
      if ('error' in result) {
        roomService.sendRejectJoin(result.error, peerId);
        return;
      }
      broadcastState(result.state);
    });

    const unsubLeave = roomService.onPeerLeave((peerId) => {
      const currentState = gameStateRef.current;
      if (!currentState) return;
      const updated: GameState = {
        ...currentState,
        players: currentState.players.map((p) =>
          p.peerId === peerId ? { ...p, isConnected: false } : p
        ),
      };
      broadcastState(updated);
    });

    unsubJoinRef.current = unsubJoin;
    unsubLeaveRef.current = unsubLeave;
  };

  const unsubJoinRef = useRef<(() => void) | null>(null);
  const unsubLeaveRef = useRef<(() => void) | null>(null);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinLink);
    setSnackbar({ open: true, message: 'Link copied!', severity: 'success' });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setSnackbar({ open: true, message: 'Code copied!', severity: 'success' });
  };

  const handleStartGame = () => {
    if (!gameState || gameState.players.length === 0) return;
    const started = startGameState(gameState);
    broadcastState(started);
    navigate('/banker');
  };

  const handleRemovePlayer = (playerId: string) => {
    if (!gameState) return;
    const updated: GameState = {
      ...gameState,
      players: gameState.players.filter((p) => p.id !== playerId),
    };
    broadcastState(updated);
  };

  useEffect(() => {
    return () => {
      unsubJoinRef.current?.();
      unsubLeaveRef.current?.();
    };
  }, []);

  if (step === 'form') {
    return (
      <Layout title="Create Game" darkMode={true}>
        <Container maxWidth="sm">
          <Stack spacing={4} sx={{ alignItems: 'center' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'center', mb: 1 }}>
                <ApartmentIcon sx={{ color: '#00E676', fontSize: 32 }} />
                <FactoryIcon sx={{ color: '#00B0FF', fontSize: 32 }} />
                <StadiumIcon sx={{ color: '#E040FB', fontSize: 32 }} />
              </Stack>
              <Typography
                variant="h4"
                sx={{ fontWeight: 800, fontFamily: 'Bungee, cursive', color: '#00E676', textAlign: 'center', letterSpacing: '0.05em' }}
              >
                Monopoly City
              </Typography>
              <Typography variant="body2" sx={{ color: '#94A3B8', textAlign: 'center' }}>
                Build your empire. Control the board.
              </Typography>
            </Box>

            <Paper
              elevation={0}
              sx={{
                p: 4,
                width: '100%',
                bgcolor: 'rgba(30, 41, 59, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderLeft: '4px solid #00E676',
                borderRadius: 4,
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                color: '#F8FAFC',
              }}
            >
              <Stack spacing={3.5}>
                <TextField
                  label="Room Name"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  fullWidth
                  placeholder="e.g., Friday Night Monopoly"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#F8FAFC',
                      backgroundColor: 'rgba(15, 23, 42, 0.4)',
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                      '&:hover fieldset': { borderColor: '#00B0FF' },
                      '&.Mui-focused fieldset': { borderColor: '#00E676' },
                    },
                    '& .MuiInputLabel-root': { color: '#94A3B8' },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#00E676' },
                  }}
                />

                <Box>
                  <Typography variant="body2" sx={{ color: '#00E676', fontWeight: 700, mb: 1 }}>
                    Starting Balance: {formatMoney(startingBalance)}
                  </Typography>
                  <Slider
                    value={startingBalance}
                    onChange={(_, v) => setStartingBalance(v as number)}
                    min={500_000}
                    max={100_000_000}
                    step={500_000}
                    marks={[
                      { value: 500_000, label: '$500K' },
                      { value: 36_700_000, label: '$36.7M' },
                      { value: 50_000_000, label: '$50M' },
                      { value: 100_000_000, label: '$100M' },
                    ]}
                    sx={{
                      color: '#00E676',
                      '& .MuiSlider-markLabel': { color: '#94A3B8', fontSize: '0.75rem' },
                      '& .MuiSlider-valueLabel': { bgcolor: '#1E293B', color: '#F8FAFC' },
                    }}
                  />
                </Box>

                <Box sx={{ pt: 1 }}>
                  <Typography variant="body2" sx={{ color: '#00B0FF', fontWeight: 700, mb: 1 }}>
                    Max Players: {maxPlayers}
                  </Typography>
                  <Slider
                    value={maxPlayers}
                    onChange={(_, v) => setMaxPlayers(v as number)}
                    min={2}
                    max={12}
                    step={1}
                    marks={[
                      { value: 2, label: '2' },
                      { value: 4, label: '4' },
                      { value: 6, label: '6' },
                      { value: 8, label: '8' },
                      { value: 10, label: '10' },
                      { value: 12, label: '12' },
                    ]}
                    sx={{
                      color: '#00B0FF',
                      '& .MuiSlider-markLabel': { color: '#94A3B8', fontSize: '0.75rem' },
                      '& .MuiSlider-valueLabel': { bgcolor: '#1E293B', color: '#F8FAFC' },
                    }}
                  />
                </Box>

                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={handleCreateGame}
                  disabled={!roomName.trim()}
                  sx={{
                    py: 2,
                    fontFamily: '"Bungee", cursive',
                    bgcolor: '#00E676',
                    color: '#0F172A',
                    fontWeight: 800,
                    fontSize: '1.05rem',
                    boxShadow: '0 8px 24px rgba(0, 230, 118, 0.25)',
                    '&:hover': {
                      bgcolor: '#00C853',
                      boxShadow: '0 12px 30px rgba(0, 230, 118, 0.4)',
                    },
                    '&.Mui-disabled': {
                      bgcolor: 'rgba(255,255,255,0.05)',
                      color: 'rgba(255,255,255,0.2)',
                    }
                  }}
                >
                  Create Room
                </Button>
              </Stack>
            </Paper>
          </Stack>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout title={`Room: ${roomName}`} darkMode={true}>
      <Container maxWidth="md">
        <Stack spacing={4}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ alignItems: 'stretch' }}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                flex: 1,
                bgcolor: 'rgba(30, 41, 59, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderLeft: '4px solid #00E676',
                borderRadius: 4,
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                color: '#F8FAFC',
              }}
            >
              <Stack spacing={2.5} sx={{ alignItems: 'center' }}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 800, fontFamily: 'Bungee, cursive', color: '#00E676', letterSpacing: '0.05em' }}
                >
                  Room Code
                </Typography>
                <Box
                  onClick={handleCopyCode}
                  sx={{
                    cursor: 'pointer',
                    p: 2.5,
                    borderRadius: 3,
                    bgcolor: 'rgba(15, 23, 42, 0.4)',
                    border: '2px dashed #00B0FF',
                    textAlign: 'center',
                    width: '100%',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: 'rgba(0, 176, 255, 0.08)',
                      transform: 'scale(1.02)',
                    },
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      color: '#00B0FF',
                      fontFamily: '"Bungee", cursive',
                      letterSpacing: '0.2em',
                      textShadow: '0 0 10px rgba(0, 176, 255, 0.3)',
                    }}
                  >
                    {roomCode}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
                    Click to copy code
                  </Typography>
                </Box>

                <Divider sx={{ width: '100%', borderColor: 'rgba(255, 255, 255, 0.08)', my: 1 }} />

                <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 500 }}>
                  Or share this link:
                </Typography>

                <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
                  <TextField
                    value={joinLink}
                    size="small"
                    fullWidth
                    slotProps={{ input: { readOnly: true } }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: '#F8FAFC',
                        backgroundColor: 'rgba(15, 23, 42, 0.4)',
                        '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                      },
                    }}
                  />
                  <Tooltip title="Copy link">
                    <IconButton onClick={handleCopyLink} sx={{ color: '#00E676', bgcolor: 'rgba(0, 230, 118, 0.1)', '&:hover': { bgcolor: 'rgba(0, 230, 118, 0.2)' } }}>
                      <CopyIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>

                {qrDataUrl && (
                  <Box
                    component="img"
                    src={qrDataUrl}
                    alt="QR Code"
                    sx={{
                      width: 170,
                      height: 170,
                      borderRadius: 3,
                      border: '3px solid rgba(255,255,255,0.08)',
                      mt: 1,
                    }}
                  />
                )}
              </Stack>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 4,
                flex: 1,
                bgcolor: 'rgba(30, 41, 59, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderLeft: '4px solid #E65100',
                borderRadius: 4,
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                color: '#F8FAFC',
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, fontFamily: 'Bungee, cursive', color: '#E65100', mb: 2.5, letterSpacing: '0.05em' }}
              >
                Lobby ({gameState?.players.length ?? 0}/{maxPlayers})
              </Typography>

              {(!gameState || gameState.players.length === 0) && (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    py: 5,
                    border: '2px dashed rgba(255,255,255,0.1)',
                    borderRadius: 3,
                    bgcolor: 'rgba(15, 23, 42, 0.3)',
                  }}
                >
                  <WaitingAnimation message="Waiting for players to join" />
                </Box>
              )}

              <Stack spacing={2}>
                {gameState?.players.map((player) => (
                  <Card
                    key={player.id}
                    elevation={0}
                    sx={{
                      bgcolor: 'rgba(15, 23, 42, 0.4)',
                      border: `1px solid ${player.color}30`,
                      borderLeft: `4px solid ${player.color}`,
                      borderRadius: 3,
                      '&:hover': {
                        border: `1px solid ${player.color}60`,
                        borderLeft: `4px solid ${player.color}`,
                      }
                    }}
                  >
                    <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: player.color, width: 36, height: 36, fontWeight: 700, color: '#fff' }}>
                          {player.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#F8FAFC' }}>
                            {player.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 600,
                              color: player.isConnected ? '#00E676' : '#FF1744',
                              textShadow: player.isConnected ? '0 0 8px rgba(0, 230, 118, 0.2)' : '0 0 8px rgba(255, 23, 68, 0.2)',
                            }}
                          >
                            {player.isConnected ? 'Connected' : 'Offline'}
                          </Typography>
                        </Box>
                        <Tooltip title="Remove player">
                          <IconButton
                            size="small"
                            onClick={() => handleRemovePlayer(player.id)}
                            sx={{ color: '#FF1744', '&:hover': { bgcolor: 'rgba(255, 23, 68, 0.1)' } }}
                          >
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Paper>
          </Stack>

          <Stack spacing={0.5} sx={{ alignItems: 'center', pt: 1 }}>
            <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'center', flexWrap: 'wrap', gap: 0.5, mb: 3.5 }}>
              {DISTRICT_STRIPS.map((color, i) => (
                <Box
                  key={i}
                  sx={{
                    width: 36,
                    height: 6,
                    borderRadius: 3,
                    bgcolor: color,
                    opacity: 0.8,
                    boxShadow: `0 0 6px ${color}`,
                  }}
                />
              ))}
            </Stack>
            <Button
              variant="contained"
              size="large"
              fullWidth
              startIcon={<StartIcon />}
              onClick={handleStartGame}
              disabled={!gameState || gameState.players.length === 0}
              sx={{
                py: 2.2,
                fontFamily: '"Bungee", cursive',
                bgcolor: '#00E676',
                color: '#0F172A',
                fontWeight: 800,
                fontSize: '1.1rem',
                boxShadow: '0 8px 24px rgba(0, 230, 118, 0.25)',
                '&:hover': {
                  bgcolor: '#00C853',
                  boxShadow: '0 12px 30px rgba(0, 230, 118, 0.4)',
                },
                '&.Mui-disabled': {
                  bgcolor: 'rgba(255,255,255,0.05)',
                  color: 'rgba(255,255,255,0.2)',
                }
              }}
            >
              Start Game ({gameState?.players.length ?? 0} players)
            </Button>
          </Stack>
        </Stack>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
}
