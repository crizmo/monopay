import { useState } from 'react';
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
} from '@mui/material';
import { AccountBalance as BankIcon, SwapHoriz as TransferIcon } from '@mui/icons-material';
import type { Player } from '../types';
import { BANK_PLAYER_ID, BANK_PLAYER_NAME } from '../types';
import { formatMoney } from '../utils/format';

interface TransferDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (senderId: string, receiverId: string, amount: number, description: string) => void;
  players: Player[];
  defaultFrom?: string;
  defaultTo?: string;
}

export function TransferDialog({ open, onClose, onConfirm, players, defaultFrom, defaultTo }: TransferDialogProps) {
  const [senderId, setSenderId] = useState(defaultFrom || '');
  const [receiverId, setReceiverId] = useState(defaultTo || '');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const sender = players.find((p) => p.id === senderId);
  const isBankSender = senderId === BANK_PLAYER_ID;
  const isBankReceiver = receiverId === BANK_PLAYER_ID;

  const handleConfirm = () => {
    const parsed = parseFloat(amount);
    if (senderId && receiverId && senderId !== receiverId && parsed > 0 && description.trim()) {
      onConfirm(senderId, receiverId, parsed, description.trim());
      setSenderId('');
      setReceiverId('');
      setAmount('');
      setDescription('');
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
        <Stack spacing={2.5}>
          <TextField
            select
            label="From"
            value={senderId}
            onChange={(e) => setSenderId(e.target.value)}
            fullWidth
            size="medium"
          >
            <MenuItem value={BANK_PLAYER_ID}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', width: '100%' }}>
                <Avatar sx={{ width: 28, height: 28, bgcolor: '#1565C0', fontSize: '0.75rem' }}>
                  <BankIcon sx={{ fontSize: 16 }} />
                </Avatar>
                <Typography sx={{ fontWeight: 600 }}>Bank</Typography>
                <Typography variant="caption" sx={{ ml: 'auto', color: '#1565C0', fontWeight: 600 }}>Infinite</Typography>
              </Stack>
            </MenuItem>
            {players.map((p) => (
              <MenuItem key={p.id} value={p.id} disabled={p.id === receiverId}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', width: '100%' }}>
                  <Avatar sx={{ width: 28, height: 28, bgcolor: p.color, fontSize: '0.75rem', fontWeight: 700 }}>
                    {p.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography sx={{ fontWeight: 600 }}>{p.name}</Typography>
                  <Typography variant="caption" sx={{ ml: 'auto', color: '#2E7D32', fontWeight: 600 }}>
                    {formatMoney(p.balance)}
                  </Typography>
                </Stack>
              </MenuItem>
            ))}
          </TextField>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              {isBankSender ? 'Bank pays to' : isBankReceiver ? 'Pay to Bank' : 'Transfer to'}
            </Typography>
          </Box>

          <TextField
            select
            label="To"
            value={receiverId}
            onChange={(e) => setReceiverId(e.target.value)}
            fullWidth
            size="medium"
          >
            <MenuItem value={BANK_PLAYER_ID} disabled={senderId === BANK_PLAYER_ID}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', width: '100%' }}>
                <Avatar sx={{ width: 28, height: 28, bgcolor: '#1565C0', fontSize: '0.75rem' }}>
                  <BankIcon sx={{ fontSize: 16 }} />
                </Avatar>
                <Typography sx={{ fontWeight: 600 }}>Bank</Typography>
              </Stack>
            </MenuItem>
            {players.map((p) => (
              <MenuItem key={p.id} value={p.id} disabled={p.id === senderId}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', width: '100%' }}>
                  <Avatar sx={{ width: 28, height: 28, bgcolor: p.color, fontSize: '0.75rem', fontWeight: 700 }}>
                    {p.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography sx={{ fontWeight: 600 }}>{p.name}</Typography>
                  <Typography variant="caption" sx={{ ml: 'auto', color: '#2E7D32', fontWeight: 600 }}>
                    {formatMoney(p.balance)}
                  </Typography>
                </Stack>
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            fullWidth
            slotProps={{
              htmlInput: { min: 1 },
              input: {
                startAdornment: <Typography sx={{ color: '#2E7D32', mr: 1, fontWeight: 800, fontFamily: '"Bungee", cursive' }}>$</Typography>,
              },
            }}
          />

          {sender && !isBankSender && parseFloat(amount) > sender.balance && (
            <Typography variant="caption" sx={{ color: '#C62828', fontWeight: 600 }}>
              Insufficient funds. Available: {formatMoney(sender.balance)}
            </Typography>
          )}

          <TextField
            label="Note"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            placeholder="What's this for?"
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: '1px solid #E8E0D4' }}>
        <Button onClick={handleClose} sx={{ color: '#757575' }}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={
            !senderId ||
            !receiverId ||
            senderId === receiverId ||
            !amount ||
            parseFloat(amount) <= 0 ||
            !description.trim() ||
            (!isBankSender && sender ? parseFloat(amount) > sender.balance : false)
          }
          sx={{
            bgcolor: '#2E7D32',
            px: 3,
            '&:hover': { bgcolor: '#1B5E20' },
          }}
        >
          Send
        </Button>
      </DialogActions>
    </Dialog>
  );
}
