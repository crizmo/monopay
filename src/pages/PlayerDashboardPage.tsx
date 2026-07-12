import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Stack,
  Paper,
  Container,
  Card,
  CardContent,
  Button,
  Divider,
  Avatar,
} from '@mui/material';
import { History as HistoryIcon, AccountBalanceWallet as WalletIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { AnimatedBalance } from '../components/AnimatedBalance';
import { TransactionRow } from '../components/TransactionRow';
import type { GameState, Player } from '../types';

export function PlayerDashboardPage() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);

  const loadState = useCallback(() => {
    const stateRaw = localStorage.getItem('monopay_game_state');
    const playerRaw = localStorage.getItem('monopay_current_player');
    if (stateRaw && playerRaw) {
      try {
        const state = JSON.parse(stateRaw) as GameState;
        const player = JSON.parse(playerRaw) as Player;
        setGameState(state);
        const updated = state.players.find((p) => p.id === player.id);
        if (updated) setCurrentPlayer(updated);
      } catch {
        navigate('/join');
      }
    } else {
      navigate('/join');
    }
  }, [navigate]);

  useEffect(() => {
    loadState();
    const interval = setInterval(loadState, 500);
    return () => clearInterval(interval);
  }, [loadState]);

  if (!gameState || !currentPlayer) return null;

  const myTransactions = gameState.transactions.filter(
    (tx) => tx.playerId === currentPlayer.id
  ).slice(0, 20);

  return (
    <Layout title={`Player: ${currentPlayer.name}`}>
      <Container maxWidth="sm">
        <Stack spacing={4}>
          <Paper
            sx={{
              p: 4,
              textAlign: 'center',
              background: 'linear-gradient(145deg, #1a2332 0%, #141b2d 100%)',
              border: '1px solid rgba(255, 215, 0, 0.1)',
            }}
          >
            <Avatar
              sx={{
                width: 72,
                height: 72,
                mx: 'auto',
                mb: 2,
                bgcolor: currentPlayer.color,
                fontSize: '2rem',
                fontWeight: 700,
                boxShadow: `0 4px 20px ${currentPlayer.color}40`,
              }}
            >
              {currentPlayer.name.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
              {currentPlayer.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {gameState.roomName}
            </Typography>
            <AnimatedBalance balance={currentPlayer.balance} size="large" />
          </Paper>

          <Stack direction="row" spacing={2}>
            <Card sx={{ flex: 1, bgcolor: '#0e1630' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <WalletIcon sx={{ color: 'secondary.main', mb: 0.5 }} />
                <Typography variant="body2" color="text.secondary">
                  Transactions
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {myTransactions.length}
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ flex: 1, bgcolor: '#0e1630' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <HistoryIcon sx={{ color: 'primary.main', mb: 0.5 }} />
                <Typography variant="body2" color="text.secondary">
                  Players
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {gameState.players.length}
                </Typography>
              </CardContent>
            </Card>
          </Stack>

          <Box>
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Recent Transactions
              </Typography>
              <Button
                size="small"
                onClick={() => navigate('/transactions')}
                endIcon={<HistoryIcon />}
              >
                View All
              </Button>
            </Stack>

            <Stack spacing={1}>
              {myTransactions.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No transactions yet
                  </Typography>
                </Paper>
              ) : (
                myTransactions.map((tx) => (
                  <TransactionRow key={tx.id} transaction={tx} />
                ))
              )}
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Layout>
  );
}
