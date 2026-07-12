import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Typography,
  MenuItem,
  Avatar,
  Box,
  Chip,
} from '@mui/material';
import { AccountBalance as BankIcon, SwapHoriz as TransferIcon } from '@mui/icons-material';
import type { Player } from '../types';
import { BANK_PLAYER_ID } from '../types';
import { formatMoney } from '../utils/format';

const QUICK_AMOUNTS = [
  { label: '$5M', value: 5_000_000 },
  { label: '$1M', value: 1_000_000 },
  { label: '$500K', value: 500_000 },
  { label: '$200K', value: 200_000 },
  { label: '$100K', value: 100_000 },
  { label: '$50K', value: 50_000 },
  { label: '$10K', value: 10_000 },
];

interface TransferDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (senderId: string, receiverId: string, amount: number, description: string) => void;
  players: Player[];
  defaultFrom?: string;
  defaultTo?: string;
  isHost?: boolean;
}

export function TransferDialog({ open, onClose, onConfirm, players, defaultFrom, defaultTo, isHost = false }: TransferDialogProps) {
  const [senderId, setSenderId] = useState(defaultFrom || '');
  const [receiverId, setReceiverId] = useState(defaultTo || '');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (open) {
      setSenderId(defaultFrom || '');
      setReceiverId(defaultTo || '');
      setAmount('');
      setDescription('');
    }
  }, [open, defaultFrom, defaultTo]);

  const currentAmount = parseFloat(amount) || 0;
  const sender = players.find((p) => p.id === senderId);
  const isBankSender = senderId === BANK_PLAYER_ID;
  const isBankReceiver = receiverId === BANK_PLAYER_ID;

  const addAmount = (value: number) => {
    const next = currentAmount + value;
    setAmount(String(next));
  };

  const handleConfirm = () => {
    const parsed = parseFloat(amount);
    if (senderId && receiverId && senderId !== receiverId && parsed > 0 && description.trim()) {
      onConfirm(senderId, receiverId, parsed, description.trim());
      onClose();
    }
  };

  const handleClose = () => {
    setSenderId('');
    setReceiverId('');
    setAmount('');
    setDescription('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ borderBottom: '1px solid #E8E0D4', pb: 2 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TransferIcon sx={{ color: '#2E7D32' }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Send Money</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Stack spacing={2}>
          {/* From — fixed for players, selectable for banker */}
          {isHost ? (
            <TextField select label="From" value={senderId} onChange={(e) => setSenderId(e.target.value)} fullWidth size="medium">
              <MenuItem value={BANK_PLAYER_ID}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', width: '100%' }}>
                  <Avatar sx={{ width: 28, height: 28, bgcolor: '#1565C0', fontSize: '0.75rem' }}><BankIcon sx={{ fontSize: 16 }} /></Avatar>
                  <Typography sx={{ fontWeight: 600 }}>Bank</Typography>
                  <Typography variant="caption" sx={{ ml: 'auto', color: '#1565C0', fontWeight: 600 }}>Infinite</Typography>
                </Stack>
              </MenuItem>
              {players.map((p) => (
                <MenuItem key={p.id} value={p.id} disabled={p.id === receiverId}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', width: '100%' }}>
                    <Avatar sx={{ width: 28, height: 28, bgcolor: p.color, fontSize: '0.75rem', fontWeight: 700 }}>{p.name.charAt(0).toUpperCase()}</Avatar>
                    <Typography sx={{ fontWeight: 600 }}>{p.name}</Typography>
                    <Typography variant="caption" sx={{ ml: 'auto', color: '#2E7D32', fontWeight: 600 }}>{formatMoney(p.balance)}</Typography>
                  </Stack>
                </MenuItem>
              ))}
            </TextField>
          ) : (
            <Box sx={{ p: 1.5, bgcolor: '#F5F5F5', borderRadius: 2, border: '1px solid #E0E0E0' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>From</Typography>
              {sender && (
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 0.5 }}>
                  <Avatar sx={{ width: 28, height: 28, bgcolor: sender.color, fontSize: '0.75rem', fontWeight: 700 }}>{sender.name.charAt(0).toUpperCase()}</Avatar>
                  <Typography sx={{ fontWeight: 700 }}>{sender.name}</Typography>
                </Stack>
              )}
            </Box>
          )}

          {/* To — always selectable */}
          <TextField select label="To" value={receiverId} onChange={(e) => setReceiverId(e.target.value)} fullWidth size="medium">
            <MenuItem value={BANK_PLAYER_ID} disabled={isBankSender}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', width: '100%' }}>
                <Avatar sx={{ width: 28, height: 28, bgcolor: '#1565C0', fontSize: '0.75rem' }}><BankIcon sx={{ fontSize: 16 }} /></Avatar>
                <Typography sx={{ fontWeight: 600 }}>Bank</Typography>
              </Stack>
            </MenuItem>
            {players.map((p) => (
              <MenuItem key={p.id} value={p.id} disabled={p.id === senderId}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', width: '100%' }}>
                  <Avatar sx={{ width: 28, height: 28, bgcolor: p.color, fontSize: '0.75rem', fontWeight: 700 }}>{p.name.charAt(0).toUpperCase()}</Avatar>
                  <Typography sx={{ fontWeight: 600 }}>{p.name}</Typography>
                  <Typography variant="caption" sx={{ ml: 'auto', color: '#2E7D32', fontWeight: 600 }}>{formatMoney(p.balance)}</Typography>
                </Stack>
              </MenuItem>
            ))}
          </TextField>

          {/* Amount with quick buttons */}
          <Box>
            <TextField
              label="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              fullWidth
              size="medium"
              slotProps={{
                htmlInput: { min: 1 },
                input: {
                  startAdornment: <Typography sx={{ color: '#2E7D32', mr: 1, fontWeight: 800, fontFamily: '"Bungee", cursive', fontSize: '1.1rem' }}>$</Typography>,
                },
              }}
            />
            <Stack direction="row" spacing={0.75} sx={{ mt: 1.25, flexWrap: 'wrap', gap: 0.75 }}>
              {QUICK_AMOUNTS.map((qa) => (
                <Chip
                  key={qa.value}
                  label={qa.label}
                  size="small"
                  onClick={() => addAmount(qa.value)}
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    height: 30,
                    bgcolor: '#E8F5E9',
                    color: '#2E7D32',
                    border: '1px solid #C8E6C9',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#2E7D32', color: '#fff', border: '1px solid #2E7D32' },
                    transition: 'all 0.15s ease',
                  }}
                />
              ))}
            </Stack>
            {currentAmount > 0 && (
              <Typography variant="body2" sx={{ mt: 1, fontWeight: 700, color: '#2E7D32', fontFamily: '"Bungee", cursive' }}>
                Total: {formatMoney(currentAmount)}
              </Typography>
            )}
          </Box>

          {sender && !isBankSender && currentAmount > sender.balance && (
            <Typography variant="caption" sx={{ color: '#C62828', fontWeight: 600 }}>
              Insufficient funds. Available: {formatMoney(sender.balance)}
            </Typography>
          )}

          <TextField label="Note" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth placeholder="What's this for?" />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: '1px solid #E8E0D4' }}>
        <Button onClick={handleClose} sx={{ color: '#757575' }}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={!senderId || !receiverId || senderId === receiverId || currentAmount <= 0 || !description.trim() || (!isBankSender && sender ? currentAmount > sender.balance : false)}
          sx={{ bgcolor: '#2E7D32', px: 3, '&:hover': { bgcolor: '#1B5E20' } }}
        >
          Send {currentAmount > 0 ? formatMoney(currentAmount) : ''}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
