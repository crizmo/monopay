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
  Autocomplete,
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
      <DialogTitle>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <TransferIcon sx={{ color: 'secondary.main' }} />
          <Typography variant="h6">Transfer Funds</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            select
            label="From (Sender)"
            value={senderId}
            onChange={(e) => setSenderId(e.target.value)}
            fullWidth
          >
            {players.map((p) => (
              <MenuItem key={p.id} value={p.id} disabled={p.id === receiverId}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Typography>{p.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    ({formatMoney(p.balance)})
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
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Typography>{p.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    ({formatMoney(p.balance)})
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
                startAdornment: <Typography sx={{ color: 'text.secondary', mr: 1 }}>$</Typography>,
              },
            }}
          />

          {sender && parseFloat(amount) > sender.balance && (
            <Typography variant="caption" color="error">
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
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
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
        >
          Transfer
        </Button>
      </DialogActions>
    </Dialog>
  );
}
