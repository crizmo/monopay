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
} from '@mui/material';
import { SwapHoriz as TransferIcon } from '@mui/icons-material';
import type { Player } from '../types';
import { formatMoney } from '../utils/format';

interface TransferDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (senderId: string, receiverId: string, amount: number, description: string) => void;
  players: Player[];
}

export function TransferDialog({ open, onClose, onConfirm, players }: TransferDialogProps) {
  const [senderId, setSenderId] = useState('');
  const [receiverId, setReceiverId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const sender = players.find((p) => p.id === senderId);
  const receiver = players.find((p) => p.id === receiverId);

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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ borderBottom: '1px solid #E0E0E0' }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <TransferIcon sx={{ color: '#2E7D32' }} />
          <Typography variant="h6">Transfer Funds</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Stack spacing={3}>
          <TextField
            select
            label="From (Sender)"
            value={senderId}
            onChange={(e) => setSenderId(e.target.value)}
            fullWidth
          >
            {players.map((p) => (
              <MenuItem key={p.id} value={p.id} disabled={p.id === receiverId}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                  <Typography>{p.name}</Typography>
                  <Typography variant="caption" sx={{ color: '#2E7D32', fontWeight: 600 }}>
                    {formatMoney(p.balance)}
                  </Typography>
                </Stack>
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="To (Receiver)"
            value={receiverId}
            onChange={(e) => setReceiverId(e.target.value)}
            fullWidth
          >
            {players.map((p) => (
              <MenuItem key={p.id} value={p.id} disabled={p.id === senderId}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                  <Typography>{p.name}</Typography>
                  <Typography variant="caption" sx={{ color: '#2E7D32', fontWeight: 600 }}>
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
                startAdornment: <Typography sx={{ color: '#2E7D32', mr: 1, fontWeight: 700 }}>$</Typography>,
              },
            }}
          />

          {sender && parseFloat(amount) > sender.balance && (
            <Typography variant="caption" sx={{ color: '#C62828' }}>
              Insufficient funds. Available: {formatMoney(sender.balance)}
            </Typography>
          )}

          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            placeholder="Transfer reason"
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: '1px solid #E0E0E0' }}>
        <Button onClick={onClose} sx={{ color: '#757575' }}>Cancel</Button>
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
            (sender ? parseFloat(amount) > sender.balance : false)
          }
          sx={{
            bgcolor: '#2E7D32',
            '&:hover': { bgcolor: '#1B5E20' },
          }}
        >
          Transfer
        </Button>
      </DialogActions>
    </Dialog>
  );
}
