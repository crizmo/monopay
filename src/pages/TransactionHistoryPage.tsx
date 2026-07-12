import { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Stack,
  Paper,
  Container,
  TextField,
  InputAdornment,
  Box,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { TransactionRow } from '../components/TransactionRow';
import type { GameState, Player } from '../types';

export function TransactionHistoryPage() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [filter, setFilter] = useState('');
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);

  const loadState = useCallback(() => {
    const stateRaw = localStorage.getItem('monopay_game_state');
    const playerRaw = localStorage.getItem('monopay_current_player');
    if (stateRaw) {
      try {
        const state = JSON.parse(stateRaw) as GameState;
        setGameState(state);
        if (playerRaw) {
          const player = JSON.parse(playerRaw) as Player;
          const updated = state.players.find((p) => p.id === player.id);
          if (updated) setCurrentPlayer(updated);
        }
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

  if (!gameState) return null;

  let transactions = gameState.transactions;
  if (currentPlayer) {
    transactions = transactions.filter((tx) =>
      tx.senderId === currentPlayer.id || tx.receiverId === currentPlayer.id || tx.playerId === currentPlayer.id
    );
  }

  if (filter) {
    const lower = filter.toLowerCase();
    transactions = transactions.filter(
      (tx) =>
        tx.description.toLowerCase().includes(lower) ||
        tx.type.toLowerCase().includes(lower)
    );
  }

  return (
    <Layout title="Transaction History">
      <Container maxWidth="md">
        <Stack spacing={3}>
          <TextField
            placeholder="Search transactions..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#2E7D32' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                bgcolor: '#FFFFFF',
                '& fieldset': { borderColor: '#E8E0D4' },
                '&:hover fieldset': { borderColor: '#2E7D32' },
                '&.Mui-focused fieldset': { borderColor: '#2E7D32', borderWidth: 2 },
              },
              '& .MuiInputLabel-root.Mui-focused': { color: '#2E7D32' },
            }}
          />

          <Typography variant="body2" color="text.secondary">
            {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
          </Typography>

          <Stack spacing={1}>
            {transactions.length === 0 ? (
              <Paper elevation={0} sx={{ p: 4, textAlign: 'center', bgcolor: '#FFFFFF', border: '1px solid #E8E0D4' }}>
                <Typography variant="body1" color="text.secondary">
                  No transactions found
                </Typography>
              </Paper>
            ) : (
              transactions.map((tx) => (
                <Paper key={tx.id} elevation={0} sx={{ overflow: 'hidden', bgcolor: '#FFFFFF', border: '1px solid #E8E0D4' }}>
                  <TransactionRow transaction={tx} />
                </Paper>
              ))
            )}
          </Stack>
        </Stack>
      </Container>
    </Layout>
  );
}
