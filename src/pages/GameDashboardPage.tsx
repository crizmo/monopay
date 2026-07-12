import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Stack,
  Paper,
  Button,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
  Divider,
  Chip,
} from '@mui/material';
import {
  SwapHoriz as TransferIcon,
  History as HistoryIcon,
  Logout as ExitIcon,
  Redeem as PassGoIcon,
  AccountBalance as BankIcon,
  Receipt as TaxIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Payments as PayIcon,
  HomeWork as BuildIcon,
  Factory as FactoryIcon,
  Stadium as StadiumIcon,
  Diamond as LuxuryIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { PlayerCard } from '../components/PlayerCard';
import { TransferDialog } from '../components/TransferDialog';
import { AnimatedBalance } from '../components/AnimatedBalance';
import { CustomAmountDialog } from '../components/CustomAmountDialog';
import { roomService } from '../services/RoomService';
import { addPlayer } from '../services/GameService';
import type { GameState, TransactionType } from '../types';
import { BANK_PLAYER_ID, DISTRICT_STRIPS } from '../types';
import { formatMoney } from '../utils/format';

export function GameDashboardPage() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [transferOpen, setTransferOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [customType, setCustomType] = useState<TransactionType>('credit');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const isHost = roomService.isHost;

  const loadState = useCallback(() => {
    const raw = localStorage.getItem('monopay_game_state');
    if (raw) {
      try {
        const state = JSON.parse(raw) as GameState;
        setGameState(state);
      } catch {
        navigate('/');
      }
    } else {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    loadState();
    const interval = setInterval(loadState, 500);
    return () => clearInterval(interval);
  }, [loadState]);

  const gameStateRef = useRef<GameState | null>(null);
  gameStateRef.current = gameState;

  useEffect(() => {
    if (!isHost) return;

    const unsubLeave = roomService.onPeerLeave((peerId) => {
      const state = gameStateRef.current;
      if (!state) return;
      const updated: GameState = {
        ...state,
        players: state.players.map((p) =>
          p.peerId === peerId ? { ...p, isConnected: false } : p
        ),
      };
      setGameState(updated);
      roomService.broadcastState(updated);
    });

    const unsubJoin = roomService.onJoinRequest((data, peerId) => {
      const state = gameStateRef.current;
      if (!state) return;
      const result = addPlayer(state, data.playerName, peerId);
      if ('error' in result) {
        roomService.sendRejectJoin(result.error, peerId);
        return;
      }
      setGameState(result.state);
      roomService.broadcastState(result.state);
    });

    return () => { unsubLeave(); unsubJoin(); };
  }, [isHost]);

  const applyAction = (playerId: string, amount: number, description: string, type: TransactionType) => {
    if (!gameState) return;
    const player = gameState.players.find((p) => p.id === playerId);
    if (!player) return;

    const isCredit = type === 'credit';
    const newBalance = isCredit ? player.balance + amount : player.balance - amount;
    if (newBalance < 0) {
      setSnackbar({ open: true, message: 'Insufficient funds', severity: 'error' });
      return;
    }

    const updated: GameState = {
      ...gameState,
      players: gameState.players.map((p) =>
        p.id === playerId ? { ...p, balance: newBalance } : p
      ),
      transactions: [
        { id: Date.now().toString(), timestamp: Date.now(), amount, description, type, senderId: isCredit ? null : playerId, receiverId: isCredit ? playerId : null, playerId },
        ...gameState.transactions,
      ],
    };
    setGameState(updated);
    roomService.broadcastState(updated);
    setSnackbar({ open: true, message: `${isCredit ? '+' : '-'}${formatMoney(amount)} ${isCredit ? 'to' : 'from'} ${player.name}`, severity: 'success' });
  };

  const handleTransfer = (senderId: string, receiverId: string, amount: number, description: string) => {
    if (!gameState) return;

    if (senderId === BANK_PLAYER_ID) {
      const receiver = gameState.players.find((p) => p.id === receiverId);
      if (!receiver) return;
      const updated: GameState = {
        ...gameState,
        players: gameState.players.map((p) => p.id === receiverId ? { ...p, balance: p.balance + amount } : p),
        transactions: [
          { id: Date.now().toString(), timestamp: Date.now(), amount, description, type: 'credit', senderId: null, receiverId, playerId: receiverId },
          ...gameState.transactions,
        ],
      };
      setGameState(updated);
      roomService.broadcastState(updated);
      setSnackbar({ open: true, message: `Bank sent ${formatMoney(amount)} to ${receiver.name}`, severity: 'success' });
      return;
    }

    if (receiverId === BANK_PLAYER_ID) {
      const sender = gameState.players.find((p) => p.id === senderId);
      if (!sender || sender.balance < amount) {
        setSnackbar({ open: true, message: 'Insufficient funds', severity: 'error' });
        return;
      }
      const updated: GameState = {
        ...gameState,
        players: gameState.players.map((p) => p.id === senderId ? { ...p, balance: p.balance - amount } : p),
        transactions: [
          { id: Date.now().toString(), timestamp: Date.now(), amount, description, type: 'debit', senderId, receiverId: null, playerId: senderId },
          ...gameState.transactions,
        ],
      };
      setGameState(updated);
      roomService.broadcastState(updated);
      setSnackbar({ open: true, message: `${sender.name} paid ${formatMoney(amount)} to Bank`, severity: 'success' });
      return;
    }

    const sender = gameState.players.find((p) => p.id === senderId);
    if (!sender || sender.balance < amount) {
      setSnackbar({ open: true, message: 'Insufficient funds', severity: 'error' });
      return;
    }
    const receiver = gameState.players.find((p) => p.id === receiverId);
    const updated: GameState = {
      ...gameState,
      players: gameState.players.map((p) => {
        if (p.id === senderId) return { ...p, balance: p.balance - amount };
        if (p.id === receiverId) return { ...p, balance: p.balance + amount };
        return p;
      }),
      transactions: [
        { id: Date.now().toString(), timestamp: Date.now(), amount, description, type: 'transfer', senderId, receiverId, playerId: senderId },
        ...gameState.transactions,
      ],
    };
    setGameState(updated);
    roomService.broadcastState(updated);
    setSnackbar({ open: true, message: `Sent ${formatMoney(amount)} from ${sender.name} to ${receiver?.name}`, severity: 'success' });
  };

  const handleRemovePlayer = (playerId: string) => {
    if (!gameState) return;
    const updated: GameState = { ...gameState, players: gameState.players.filter((p) => p.id !== playerId) };
    setGameState(updated);
    roomService.broadcastState(updated);
    if (selectedPlayerId === playerId) setSelectedPlayerId(null);
  };

  const handleExit = () => {
    localStorage.removeItem('monopay_game_state');
    localStorage.removeItem('monopay_current_player');
    roomService.cleanup();
    navigate('/');
  };

  const currentPlayer = gameState?.players.find((p) => p.peerId === roomService.getSelfId());
  const selectedPlayer = gameState?.players.find((p) => p.id === selectedPlayerId);
  const targetPlayer = selectedPlayer || currentPlayer;

  if (!gameState) return null;

  const accentColors = DISTRICT_STRIPS;

  return (
    <Layout title={gameState.roomName}>
      <Stack spacing={3} sx={{ pb: 2 }}>

        {/* Game info bar */}
        <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#FFFFFF', border: '1px solid #E8E0D4', borderRadius: 3 }}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Chip
                label={isHost ? 'BANKER' : 'PLAYER'}
                size="small"
                sx={{
                  height: 24,
                  fontWeight: 800,
                  fontSize: '0.65rem',
                  bgcolor: isHost ? '#1565C0' : '#2E7D32',
                  color: '#fff',
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                {gameState.roomId}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {gameState.players.length} player{gameState.players.length !== 1 ? 's' : ''}
              </Typography>
              <IconButton size="small" onClick={handleExit} sx={{ color: '#C62828' }}>
                <ExitIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Stack>
        </Paper>

        {/* My Balance */}
        {currentPlayer && (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              textAlign: 'center',
              bgcolor: '#FFFFFF',
              border: '2px solid #E8E0D4',
              borderTop: `4px solid ${currentPlayer.color}`,
              borderRadius: 3,
            }}
          >
            <Typography variant="body2" sx={{ color: '#9E9E9E', fontWeight: 600, mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.7rem' }}>
              Your Balance
            </Typography>
            <AnimatedBalance balance={currentPlayer.balance} size="large" />
          </Paper>
        )}

        {/* Players */}
        <Box>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5, px: 0.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#333', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}>
              Players
            </Typography>
            {selectedPlayer && (
              <Chip
                label={`Selected: ${selectedPlayer.name}`}
                size="small"
                onDelete={() => setSelectedPlayerId(null)}
                sx={{ height: 24, bgcolor: `${selectedPlayer.color}15`, color: selectedPlayer.color, fontWeight: 600, border: `1px solid ${selectedPlayer.color}30` }}
              />
            )}
          </Stack>
          <Stack spacing={1}>
            {gameState.players.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                isSelected={selectedPlayerId === player.id}
                isCurrentPlayer={player.peerId === roomService.getSelfId()}
                onTap={(id) => setSelectedPlayerId(id === selectedPlayerId ? null : id)}
              />
            ))}
            {gameState.players.length === 0 && (
              <Paper elevation={0} sx={{ p: 3, textAlign: 'center', bgcolor: '#FFFFFF', border: '2px dashed #E8E0D4', borderRadius: 3 }}>
                <Typography variant="body2" color="text.secondary">Waiting for players to join...</Typography>
              </Paper>
            )}
          </Stack>
        </Box>

        {/* Quick Actions Grid */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#333', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem', mb: 1.5, px: 0.5 }}>
            Quick Actions {targetPlayer ? `for ${targetPlayer.name}` : '(tap a player first)'}
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
            {[
              { label: 'Pass GO', icon: <PassGoIcon />, amount: 2_000_000, type: 'credit' as const, desc: 'Pass GO - Collect $2M', color: '#2E7D32', bg: '#E8F5E9' },
              { label: 'Send $', icon: <TransferIcon />, action: 'transfer', color: '#1565C0', bg: '#E3F2FD' },
              { label: 'Rent', icon: <PayIcon />, amount: 500_000, type: 'credit' as const, desc: 'Rent Collection', color: '#0288D1', bg: '#E1F5FE' },
              { label: 'Pay Rent', icon: <PayIcon />, amount: 500_000, type: 'debit' as const, desc: 'Rent Payment', color: '#E65100', bg: '#FFF3E0' },
              { label: 'Build', icon: <BuildIcon />, amount: 1_000_000, type: 'debit' as const, desc: 'Residential Building', color: '#0288D1', bg: '#E1F5FE' },
              { label: 'Industry', icon: <FactoryIcon />, amount: 2_000_000, type: 'debit' as const, desc: 'Industrial Building', color: '#1565C0', bg: '#E3F2FD' },
              { label: 'Stadium', icon: <StadiumIcon />, amount: 1_000_000, type: 'credit' as const, desc: 'Stadium Revenue', color: '#F9A825', bg: '#FFFDE7' },
              { label: 'Luxury Tax', icon: <LuxuryIcon />, amount: 1_000_000, type: 'debit' as const, desc: 'Luxury Tax', color: '#E65100', bg: '#FFF3E0' },
              { label: 'Income Tax', icon: <TaxIcon />, amount: 2_000_000, type: 'debit' as const, desc: 'Income Tax', color: '#C62828', bg: '#FFEBEE' },
              { label: 'Add $', icon: <AddIcon />, action: 'custom-credit', color: '#2E7D32', bg: '#E8F5E9' },
              { label: 'Remove $', icon: <RemoveIcon />, action: 'custom-debit', color: '#C62828', bg: '#FFEBEE' },
              { label: 'History', icon: <HistoryIcon />, action: 'history', color: '#E65100', bg: '#FFF3E0' },
            ].map((btn) => (
              <Button
                key={btn.label}
                variant="contained"
                fullWidth
                disabled={!targetPlayer && btn.action !== 'history'}
                onClick={() => {
                  if (btn.action === 'transfer') {
                    setTransferOpen(true);
                  } else if (btn.action === 'history') {
                    navigate('/transactions');
                  } else if (btn.action === 'custom-credit') {
                    setCustomType('credit');
                    setCustomOpen(true);
                  } else if (btn.action === 'custom-debit') {
                    setCustomType('debit');
                    setCustomOpen(true);
                  } else if ('amount' in btn && targetPlayer) {
                    applyAction(targetPlayer.id, btn.amount as number, btn.desc as string, btn.type as TransactionType);
                  }
                }}
                sx={{
                  flexDirection: 'column',
                  py: 1.5,
                  px: 0.5,
                  minHeight: 72,
                  bgcolor: btn.bg,
                  color: btn.color,
                  borderRadius: 2,
                  boxShadow: 'none',
                  '&:hover': { bgcolor: btn.color, color: '#fff', transform: 'translateY(-1px)' },
                  '&.Mui-disabled': { bgcolor: '#F5F5F5', color: '#BDBDBD' },
                  transition: 'all 0.15s ease',
                }}
              >
                <Box sx={{ color: 'inherit', mb: 0.5 }}>{btn.icon}</Box>
                <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.65rem', lineHeight: 1.2, color: 'inherit' }}>
                  {btn.label}
                </Typography>
                {btn.amount !== undefined && btn.amount > 0 && (
                  <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.6rem', fontFamily: '"Bungee", cursive', color: 'inherit', lineHeight: 1 }}>
                    {btn.type === 'credit' ? '+' : '-'}{formatMoney(btn.amount)}
                  </Typography>
                )}
              </Button>
            ))}
          </Box>
        </Box>

        {/* Recent Transactions */}
        {gameState.transactions.length > 0 && (
          <Box>
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5, px: 0.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#333', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}>
                Recent Activity
              </Typography>
              <Button size="small" onClick={() => navigate('/transactions')} sx={{ color: '#2E7D32', fontWeight: 600, fontSize: '0.7rem' }}>
                View All
              </Button>
            </Stack>
            <Stack spacing={1}>
              {gameState.transactions.slice(0, 5).map((tx) => {
                const player = gameState.players.find((p) => p.id === tx.playerId);
                const sender = tx.senderId ? gameState.players.find((p) => p.id === tx.senderId) : null;
                const receiver = tx.receiverId ? gameState.players.find((p) => p.id === tx.receiverId) : null;
                const isCredit = tx.type === 'credit' || (tx.type === 'transfer' && tx.playerId === tx.receiverId);
                return (
                  <Paper key={tx.id} elevation={0} sx={{ p: 1.5, bgcolor: '#FFFFFF', border: '1px solid #E8E0D4', borderLeft: `3px solid ${isCredit ? '#2E7D32' : '#C62828'}`, borderRadius: 2 }}>
                    <Stack direction="row" sx={{ alignItems: 'center' }}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {tx.description}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#9E9E9E', fontSize: '0.65rem' }}>
                          {player?.name} {tx.type === 'transfer' ? (isCredit ? `from ${sender?.name}` : `to ${receiver?.name}`) : ''}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontWeight: 800, color: isCredit ? '#2E7D32' : '#C62828', fontFamily: '"Bungee", cursive', fontSize: '0.85rem' }}>
                        {isCredit ? '+' : '-'}{formatMoney(tx.amount)}
                      </Typography>
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
          </Box>
        )}

        {/* Host-only: remove player */}
        {isHost && selectedPlayer && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<RemoveIcon />}
            fullWidth
            onClick={() => handleRemovePlayer(selectedPlayer.id)}
            sx={{ borderColor: '#C62828', color: '#C62828', borderRadius: 2 }}
          >
            Remove {selectedPlayer.name}
          </Button>
        )}
      </Stack>

      <TransferDialog
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
        onConfirm={handleTransfer}
        players={gameState.players}
        defaultFrom={targetPlayer?.id}
      />

      {targetPlayer && (
        <CustomAmountDialog
          open={customOpen}
          onClose={() => setCustomOpen(false)}
          onConfirm={(amount, description, type) => applyAction(targetPlayer.id, amount, description, type)}
          playerName={targetPlayer.name}
          defaultType={customType}
        />
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
}
