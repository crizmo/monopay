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
import { joinRoom, selfId } from 'trystero';
import type { GameState, Player } from '../types';
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const roomRef = useRef<any>(null);
  const gameStateRef = useRef<GameState | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stateUpdateRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const joinRequestRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rejectJoinRef = useRef<any>(null);

  const broadcastState = useCallback((state: GameState) => {
    if (stateUpdateRef.current) {
      stateUpdateRef.current.send(state);
    }
  }, []);

  const handleCreateGame = async () => {
    if (!roomName.trim()) return;

    const code = generateRoomCode();
    const room = joinRoom({ appId: 'com.monopay' }, code);
    roomRef.current = room;

    const stateUpdate = room.makeAction('state-update');
    const joinRequest = room.makeAction('join-request');
    const rejectJoin = room.makeAction('reject-join');
    stateUpdateRef.current = stateUpdate;
    joinRequestRef.current = joinRequest;
    rejectJoinRef.current = rejectJoin;

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

    room.onPeerJoin = (peerId: string) => {
      const currentState = gameStateRef.current;
      if (!currentState) return;
      const peerIds = currentState.players.map((p) => p.peerId);
      if (!peerIds.includes(peerId)) {
        // New peer - wait for their join request
        return;
      }
    };

    room.onPeerLeave = (peerId: string) => {
      const currentState = gameStateRef.current;
      if (!currentState) return;
      const updated: GameState = {
        ...currentState,
        players: currentState.players.map((p) =>
          p.peerId === peerId ? { ...p, isConnected: false } : p
        ),
      };
      gameStateRef.current = updated;
      setGameState(updated);
      broadcastState(updated);
    };

    joinRequest.onMessage = (rawData, { peerId }) => {
      const data = rawData as { playerName: string };
      const currentState = gameStateRef.current;
      if (!currentState) return;
      const result = addPlayer(currentState, data.playerName, peerId);
      if ('error' in result) {
        rejectJoin.send({ reason: result.error });
        return;
      }
      gameStateRef.current = result.state;
      setGameState(result.state);
      broadcastState(result.state);
    };
  };

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
    gameStateRef.current = started;
    setGameState(started);
    broadcastState(started);
    window.location.href = '/banker';
  };

  const handleRemovePlayer = (playerId: string) => {
    if (!gameState) return;
    const updated: GameState = {
      ...gameState,
      players: gameState.players.filter((p) => p.id !== playerId),
    };
    gameStateRef.current = updated;
    setGameState(updated);
    broadcastState(updated);
  };

  useEffect(() => {
    return () => {
      roomRef.current?.leave();
    };
  }, []);

  if (step === 'form') {
    return (
      <Layout title="Create Game">
        <Container maxWidth="sm">
          <Stack spacing={4} sx={{ alignItems: 'center' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', mb: 1 }}>
                <ApartmentIcon sx={{ color: 'gold', fontSize: 28 }} />
                <FactoryIcon sx={{ color: 'gold', fontSize: 28 }} />
                <StadiumIcon sx={{ color: 'gold', fontSize: 28 }} />
              </Stack>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, fontFamily: 'Bungee, cursive', color: 'gold', textAlign: 'center' }}
              >
                Monopoly City
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                Build your empire. Control the board.
              </Typography>
            </Box>

            <Paper
              sx={{
                p: 3,
                width: '100%',
                background: 'linear-gradient(180deg, rgba(255,215,0,0.05) 0%, rgba(20,27,45,0.95) 100%)',
                border: '1px solid rgba(255,215,0,0.15)',
              }}
            >
              <Stack spacing={3}>
                <TextField
                  label="Room Name"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  fullWidth
                  placeholder="e.g., Friday Night Monopoly"
                  slotProps={{ input: { style: { color: '#fff' } } }}
                />

                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
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
                    sx={{ color: 'gold' }}
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
                    sx={{ color: 'gold' }}
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
                    background: 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)',
                    color: '#0a0e1a',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #FFE54C 0%, #DAA520 100%)',
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
              sx={{
                p: 3,
                flex: 1,
                background: 'linear-gradient(180deg, rgba(255,215,0,0.05) 0%, rgba(20,27,45,0.95) 100%)',
                border: '1px solid rgba(255,215,0,0.15)',
              }}
            >
              <Stack spacing={2} sx={{ alignItems: 'center' }}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, fontFamily: 'Bungee, cursive', color: 'gold' }}
                >
                  Room Code
                </Typography>
                <Box
                  onClick={handleCopyCode}
                  sx={{
                    cursor: 'pointer',
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'rgba(255, 215, 0, 0.08)',
                    border: '1px dashed rgba(255, 215, 0, 0.3)',
                    textAlign: 'center',
                    width: '100%',
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: 'rgba(255, 215, 0, 0.15)' },
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      color: 'gold',
                      fontFamily: 'monospace',
                      letterSpacing: '0.2em',
                    }}
                  >
                    {roomCode}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Click to copy
                  </Typography>
                </Box>

                <Divider sx={{ width: '100%', borderColor: 'rgba(255,215,0,0.15)' }} />

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
                    <IconButton onClick={handleCopyLink} sx={{ color: 'gold' }}>
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
              sx={{
                p: 3,
                flex: 1,
                background: 'linear-gradient(180deg, rgba(255,215,0,0.05) 0%, rgba(20,27,45,0.95) 100%)',
                border: '1px solid rgba(255,215,0,0.15)',
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, fontFamily: 'Bungee, cursive', color: 'gold', mb: 2 }}
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
                    border: '1px dashed rgba(255,215,0,0.2)',
                    borderRadius: 2,
                    background: 'rgba(255,215,0,0.03)',
                  }}
                >
                  <WaitingAnimation message="Waiting for players to join" />
                </Box>
              )}

              <Stack spacing={1.5}>
                {gameState?.players.map((player, idx) => (
                  <Card
                    key={player.id}
                    sx={{
                      background: 'rgba(20,27,45,0.9)',
                      border: `1px solid ${player.color}33`,
                      position: 'relative',
                      overflow: 'visible',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        borderRadius: '8px 8px 0 0',
                        background: `linear-gradient(90deg, ${player.color}, ${DISTRICT_STRIPS[idx % DISTRICT_STRIPS.length]})`,
                      }}
                    />
                    <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 }, pt: 2 }}>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: player.color, width: 36, height: 36 }}>
                          {player.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {player.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            color={player.isConnected ? 'success.main' : 'error.main'}
                          >
                            {player.isConnected ? 'Connected' : 'Offline'}
                          </Typography>
                        </Box>
                        <Tooltip title="Remove player">
                          <IconButton
                            size="small"
                            onClick={() => handleRemovePlayer(player.id)}
                            sx={{ color: 'error.main' }}
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
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA000 100%)',
              color: '#0a0e1a',
              fontWeight: 700,
              '&:hover': {
                background: 'linear-gradient(135deg, #FFE54C 0%, #FFB300 100%)',
              },
            }}
          >
            Start Game ({gameState?.players.length ?? 0} players)
          </Button>
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
