import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Stack,
  Grid,
  Paper,
  Button,
  Snackbar,
  Alert,
  Drawer,
  IconButton,
  useMediaQuery,
  useTheme,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  SwapHoriz as TransferIcon,
  History as HistoryIcon,
  Logout as ExitIcon,
  PlayArrow as StartIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { PlayerCard } from '../components/PlayerCard';
import { QuickActions } from '../components/QuickActions';
import { TransferDialog } from '../components/TransferDialog';
import { TransactionRow } from '../components/TransactionRow';
import { AnimatedBalance } from '../components/AnimatedBalance';
import type { GameState, Player } from '../types';
import { formatMoney } from '../utils/format';

export function BankerDashboardPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [transferOpen, setTransferOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

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
    const interval = setInterval(loadState, 1000);
    return () => clearInterval(interval);
  }, [loadState]);

  const saveState = (state: GameState) => {
    setGameState(state);
    localStorage.setItem('monopay_game_state', JSON.stringify(state));
    // Broadcast to peers via localStorage event (for multi-tab)
    window.dispatchEvent(new StorageEvent('storage', { key: 'monopay_game_state' }));
  };

  const handleQuickAction = (playerId: string, amount: number, description: string, type: 'credit' | 'debit' | 'transfer') => {
    if (!gameState) return;
    const player = gameState.players.find((p) => p.id === playerId);
    if (!player) return;

    const newBalance = type === 'credit' ? player.balance + amount : player.balance - amount;
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
        {
          id: Date.now().toString(),
          timestamp: Date.now(),
          amount,
          description,
          type,
          senderId: type === 'debit' ? playerId : null,
          receiverId: type === 'credit' ? playerId : null,
          playerId,
        },
        ...gameState.transactions,
      ],
    };
    saveState(updated);
    setSnackbar({
      open: true,
      message: `${type === 'credit' ? 'Added' : 'Removed'} ${formatMoney(amount)} ${type === 'credit' ? 'to' : 'from'} ${player.name}`,
      severity: 'success',
    });
  };

  const handleTransfer = (senderId: string, receiverId: string, amount: number, description: string) => {
    if (!gameState) return;
    const sender = gameState.players.find((p) => p.id === senderId);
    if (!sender || sender.balance < amount) {
      setSnackbar({ open: true, message: 'Insufficient funds', severity: 'error' });
      return;
    }

    const updated: GameState = {
      ...gameState,
      players: gameState.players.map((p) => {
        if (p.id === senderId) return { ...p, balance: p.balance - amount };
        if (p.id === receiverId) return { ...p, balance: p.balance + amount };
        return p;
      }),
      transactions: [
        {
          id: Date.now().toString(),
          timestamp: Date.now(),
          amount,
          description,
          type: 'transfer' as const,
          senderId,
          receiverId,
          playerId: senderId,
        },
        ...gameState.transactions,
      ],
    };
    saveState(updated);
    const receiver = gameState.players.find((p) => p.id === receiverId);
    setSnackbar({
      open: true,
      message: `Transferred ${formatMoney(amount)} from ${sender.name} to ${receiver?.name}`,
      severity: 'success',
    });
  };

  const handleRemovePlayer = (playerId: string) => {
    if (!gameState) return;
    const updated: GameState = {
      ...gameState,
      players: gameState.players.filter((p) => p.id !== playerId),
    };
    saveState(updated);
  };

  const handleExit = () => {
    localStorage.removeItem('monopay_game_state');
    localStorage.removeItem('monopay_current_player');
    navigate('/');
  };

  const selectedPlayer = gameState?.players.find((p) => p.id === selectedPlayerId);

  if (!gameState) return null;

  const drawerContent = (
    <Box sx={{ width: 300, p: 2 }}>
      <Stack spacing={3}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Quick Actions
        </Typography>

        {selectedPlayer && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Selected Player
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {selectedPlayer.name}
            </Typography>
            <AnimatedBalance balance={selectedPlayer.balance} size="small" />
          </Paper>
        )}

        {!selectedPlayer && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              Tap a player card to select them
            </Typography>
          </Paper>
        )}

        <QuickActions
          players={gameState.players}
          selectedPlayerId={selectedPlayerId}
          onAction={handleQuickAction}
        />

        <Divider />

        <Button
          variant="outlined"
          startIcon={<TransferIcon />}
          fullWidth
          onClick={() => setTransferOpen(true)}
          disabled={gameState.players.length < 2}
          sx={{ borderColor: 'rgba(255, 215, 0, 0.3)', color: 'secondary.main' }}
        >
          Transfer Funds
        </Button>

        <Button
          variant="outlined"
          startIcon={<HistoryIcon />}
          fullWidth
          onClick={() => navigate('/transactions')}
          sx={{ borderColor: 'rgba(255, 215, 0, 0.3)', color: 'secondary.main' }}
        >
          Transaction History
        </Button>

        <Button
          variant="outlined"
          color="error"
          startIcon={<ExitIcon />}
          fullWidth
          onClick={handleExit}
        >
          End Game
        </Button>
      </Stack>
    </Box>
  );

  return (
    <Layout title={`Banker: ${gameState.roomName}`}>
      {isMobile && (
        <Button
          variant="contained"
          startIcon={<MenuIcon />}
          onClick={() => setDrawerOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000,
            borderRadius: 4,
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA000 100%)',
            color: '#0a0e1a',
          }}
        >
          Actions
        </Button>
      )}

      <Drawer
        anchor={isMobile ? 'bottom' : 'right'}
        open={isMobile ? drawerOpen : true}
        onClose={() => setDrawerOpen(false)}
        variant={isMobile ? 'temporary' : 'permanent'}
        sx={{
          '& .MuiDrawer-paper': {
            bgcolor: 'background.paper',
            borderLeft: isMobile ? 'none' : '1px solid rgba(255, 215, 0, 0.1)',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Box
        sx={{
          pr: isMobile ? 0 : 32,
          ml: isMobile ? 0 : -32,
        }}
      >
        <Stack spacing={3}>
          <Paper
            sx={{
              p: 2,
              textAlign: 'center',
              borderTop: '3px solid',
              borderImage: 'linear-gradient(90deg, #1A237E, #FFD700, #B71C1C) 1',
              bgcolor: '#0e1630',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Room: {gameState.roomId} | Players: {gameState.players.length}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA000 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: '"Bungee", cursive',
              }}
            >
              {gameState.roomName}
            </Typography>
          </Paper>

          <Grid container spacing={2}>
            {gameState.players.map((player) => (
              <Grid size={{ xs: 12, sm: 6 }} key={player.id}>
                <Box
                  onClick={() => setSelectedPlayerId(player.id)}
                  sx={{
                    cursor: 'pointer',
                    borderRadius: 3,
                    transition: 'all 0.2s',
                    border: selectedPlayerId === player.id ? '2px solid' : '2px solid transparent',
                    borderColor: selectedPlayerId === player.id ? 'secondary.main' : 'transparent',
                    '&:hover': { transform: 'translateY(-2px)' },
                  }}
                >
                  <PlayerCard
                    player={player}
                    isHost={true}
                    onRemove={handleRemovePlayer}
                    onTransfer={() => {
                      setSelectedPlayerId(player.id);
                      setTransferOpen(true);
                    }}
                    showActions={true}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>

          {gameState.players.length === 0 && (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No players connected yet
              </Typography>
            </Paper>
          )}
        </Stack>
      </Box>

      <TransferDialog
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
        onConfirm={handleTransfer}
        players={gameState.players}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
}
