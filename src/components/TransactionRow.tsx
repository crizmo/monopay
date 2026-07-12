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
  const color = isCredit ? '#2E7D32' : '#C62828';
  const bgColor = isCredit ? '#E8F5E9' : '#FFEBEE';

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
        bgcolor: '#FFFFFF',
        border: '1px solid #E0E0E0',
        borderLeft: `3px solid ${color}`,
        transition: 'background 0.2s',
        '&:hover': {
          bgcolor: '#FAFAFA',
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
            bgcolor: bgColor,
            color: color,
          }}
        >
          {transaction.type === 'transfer' ? <TransferIcon /> : icon}
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {transaction.description}
          </Typography>
          <Typography variant="caption" sx={{ color: '#9E9E9E' }}>
            {affectedPlayer?.name} {counterparty}
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'right' }}>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 700,
              color: color,
              fontFamily: '"Inter", monospace',
            }}
          >
            {isCredit ? '+' : '-'}{formatMoney(transaction.amount)}
          </Typography>
          <Typography variant="caption" sx={{ color: '#BDBDBD' }}>
            {formatTimestamp(transaction.timestamp)}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
