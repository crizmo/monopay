import { useState, useEffect } from 'react';
import { Box, Typography, Stack } from '@mui/material';
import {
  ArrowUpward as CreditIcon,
  ArrowDownward as DebitIcon,
  SwapHoriz as TransferIcon,
} from '@mui/icons-material';
import type { Transaction, GameState, Player } from '../types';
import { formatMoney, formatTimestamp } from '../utils/format';

interface TransactionRowProps {
  transaction: Transaction;
  gameState?: GameState | null;
}

export function TransactionRow({ transaction, gameState }: TransactionRowProps) {
  const [state, setState] = useState<GameState | null>(gameState ?? null);

  useEffect(() => {
    if (gameState) {
      setState(gameState);
      return;
    }
    const load = () => {
      const raw = localStorage.getItem('monopay_game_state');
      if (raw) {
        try { setState(JSON.parse(raw) as GameState); } catch { /* ignore */ }
      }
    };
    load();
    const interval = setInterval(load, 1000);
    return () => clearInterval(interval);
  }, [gameState]);

  const players: Player[] = state?.players ?? [];
  const sender = players.find((p) => p.id === transaction.senderId);
  const receiver = players.find((p) => p.id === transaction.receiverId);
  const affectedPlayer = players.find((p) => p.id === transaction.playerId);

  const isCredit =
    transaction.type === 'credit' ||
    (transaction.type === 'transfer' && transaction.playerId === transaction.receiverId);

  const icon = isCredit ? <CreditIcon /> : <DebitIcon />;
  const color = isCredit ? 'success' : 'error';

  const counterparty =
    transaction.type === 'transfer'
      ? isCredit
        ? `from ${sender?.name ?? 'Unknown'}`
        : `to ${receiver?.name ?? 'Unknown'}`
      : '';

  return (
    <Box
      sx={{
        py: 2,
        px: 2,
        borderRadius: 2,
        borderLeft: `3px solid ${isCredit ? 'rgba(76, 175, 80, 0.5)' : 'rgba(244, 67, 54, 0.5)'}`,
        transition: 'background 0.2s',
        '&:hover': {
          background: 'rgba(255, 215, 0, 0.03)',
        },
      }}
    >
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: `${color}.main`,
            color: `${color}.contrastText`,
          }}
        >
          {transaction.type === 'transfer' ? <TransferIcon /> : icon}
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {transaction.description}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {affectedPlayer?.name} {counterparty}
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'right' }}>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 700,
              color: `${color}.main`,
              fontFamily: '"Inter", monospace',
            }}
          >
            {isCredit ? '+' : '-'}{formatMoney(transaction.amount)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatTimestamp(transaction.timestamp)}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
