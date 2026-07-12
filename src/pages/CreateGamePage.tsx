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
      <Layout title="Create Game">
        <Container maxWidth="sm">
          <Stack spacing={4} sx={{ alignItems: 'center' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', mb: 1 }}>
                <ApartmentIcon sx={{ color: '#2E7D32', fontSize: 28 }} />
                <FactoryIcon sx={{ color: '#2E7D32', fontSize: 28 }} />
                <StadiumIcon sx={{ color: '#2E7D32', fontSize: 28 }} />
              </Stack>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, fontFamily: 'Bungee, cursive', color: '#2E7D32', textAlign: 'center' }}
              >
                Monopoly City
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                Build your empire. Control the board.
              </Typography>
            </Box>

            <Paper
              elevation={0}
              sx={{
                p: 3,
                width: '100%',
                bgcolor: '#FFFFFF',
                border: '2px solid #E8E0D4',
                borderLeft: '4px solid #2E7D32',
                borderRadius: 2,
              }}
            >
              <Stack spacing={3}>
                <TextField
                  label="Room Name"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  fullWidth
                  placeholder="e.g., Friday Night Monopoly"
                  slotProps={{ input: { style: { color: '#333' } } }}
                />

                <Box>
                  <Typography variant="body2" sx={{ color: '#2E7D32', fontWeight: 600 }} gutterBottom>
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
                    sx={{ color: '#2E7D32' }}
                  />
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
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
                    sx={{ color: '#2E7D32' }}
                  />
                </Box>

                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={handleCreateGame}
                  disabled={!roomName.trim()}
                  sx={{
                    py: 1.5,
                    fontFamily: 'Bungee, cursive',
                    bgcolor: '#2E7D32',
                    color: '#FFFFFF',
                    '&:hover': {
                      bgcolor: '#1B5E20',
                    },
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
    <Layout title={`Room: ${roomName}`}>
      <Container maxWidth="md">
        <Stack spacing={4}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ alignItems: 'stretch' }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                flex: 1,
                bgcolor: '#FFFFFF',
                border: '2px solid #E8E0D4',
                borderLeft: '4px solid #2E7D32',
                borderRadius: 2,
              }}
            >
              <Stack spacing={2} sx={{ alignItems: 'center' }}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, fontFamily: 'Bungee, cursive', color: '#2E7D32' }}
                >
                  Room Code
                </Typography>
                <Box
                  onClick={handleCopyCode}
                  sx={{
                    cursor: 'pointer',
                    p: 2,
                    borderRadius: 2,
                    bgcolor: '#F5F0E8',
                    border: '2px dashed #2E7D32',
                    textAlign: 'center',
                    width: '100%',
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: 'rgba(46, 125, 50, 0.08)' },
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      color: '#2E7D32',
                      fontFamily: '"Bungee", cursive',
                      letterSpacing: '0.2em',
                    }}
                  >
                    {roomCode}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Click to copy
                  </Typography>
                </Box>

                <Divider sx={{ width: '100%', borderColor: '#E8E0D4' }} />

                <Typography variant="body2" color="text.secondary">
                  Or share this link:
                </Typography>

                <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
                  <TextField
                    value={joinLink}
                    size="small"
                    fullWidth
                    slotProps={{ input: { readOnly: true } }}
                  />
                  <Tooltip title="Copy link">
                    <IconButton onClick={handleCopyLink} sx={{ color: '#2E7D32' }}>
                      <CopyIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>

                {qrDataUrl && (
                  <Box
                    component="img"
                    src={qrDataUrl}
                    alt="QR Code"
                    sx={{ width: 180, height: 180, borderRadius: 2 }}
                  />
                )}
              </Stack>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 3,
                flex: 1,
                bgcolor: '#FFFFFF',
                border: '2px solid #E8E0D4',
                borderLeft: '4px solid #E65100',
                borderRadius: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, fontFamily: 'Bungee, cursive', color: '#2E7D32', mb: 2 }}
              >
                Waiting Lobby ({gameState?.players.length ?? 0}/{maxPlayers})
              </Typography>

              {gameState?.players.length === 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    py: 4,
                    border: '2px dashed #E8E0D4',
                    borderRadius: 2,
                    bgcolor: '#FAFAF5',
                  }}
                >
                  <WaitingAnimation message="Waiting for players to join" />
                </Box>
              )}

              <Stack spacing={1.5}>
                {gameState?.players.map((player) => (
                  <Card
                    key={player.id}
                    elevation={0}
                    sx={{
                      bgcolor: '#FFFFFF',
                      border: `2px solid ${player.color}33`,
                      borderLeft: `4px solid ${player.color}`,
                      position: 'relative',
                      overflow: 'visible',
                    }}
                  >
                    <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 }, pt: 2 }}>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: player.color, width: 36, height: 36 }}>
                          {player.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>
                            {player.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: player.isConnected ? '#2E7D32' : '#C62828' }}
                          >
                            {player.isConnected ? 'Connected' : 'Offline'}
                          </Typography>
                        </Box>
                        <Tooltip title="Remove player">
                          <IconButton
                            size="small"
                            onClick={() => handleRemovePlayer(player.id)}
                            sx={{ color: '#C62828' }}
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

          <Stack spacing={0.5} sx={{ alignItems: 'center' }}>
            <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'center', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
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
            <Button
              variant="contained"
              size="large"
              fullWidth
              startIcon={<StartIcon />}
              onClick={handleStartGame}
              disabled={!gameState || gameState.players.length === 0}
              sx={{
                py: 2,
                fontFamily: 'Bungee, cursive',
                bgcolor: '#2E7D32',
                color: '#FFFFFF',
                fontWeight: 700,
                '&:hover': {
                  bgcolor: '#1B5E20',
                },
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
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
}
