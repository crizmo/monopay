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
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { AttachMoney as MoneyIcon } from '@mui/icons-material';
import type { TransactionType } from '../types';

interface CustomAmountDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (amount: number, description: string, type: TransactionType) => void;
  playerName: string;
}

export function CustomAmountDialog({ open, onClose, onConfirm, playerName }: CustomAmountDialogProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TransactionType>('credit');

  const handleConfirm = () => {
    const parsed = parseFloat(amount);
    if (parsed > 0 && description.trim()) {
      onConfirm(parsed, description.trim(), type);
      setAmount('');
      setDescription('');
      setType('credit');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <MoneyIcon sx={{ color: 'secondary.main' }} />
          <Typography variant="h6">Custom Transaction for {playerName}</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <ToggleButtonGroup
            value={type}
            exclusive
            onChange={(_, v) => v && setType(v)}
            fullWidth
          >
            <ToggleButton value="credit" sx={{ fontWeight: 600 }}>
              Credit (+)
            </ToggleButton>
            <ToggleButton value="debit" sx={{ fontWeight: 600 }}>
              Debit (-)
            </ToggleButton>
          </ToggleButtonGroup>

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

          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            placeholder="Enter reason for transaction"
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={!amount || parseFloat(amount) <= 0 || !description.trim()}
        >
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
}
