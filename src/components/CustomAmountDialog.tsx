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
  defaultType?: TransactionType;
}

export function CustomAmountDialog({ open, onClose, onConfirm, playerName, defaultType = 'credit' }: CustomAmountDialogProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TransactionType>(defaultType);

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
      <DialogTitle sx={{ borderBottom: '1px solid #E0E0E0' }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <MoneyIcon sx={{ color: '#2E7D32' }} />
          <Typography variant="h6">Custom Transaction for {playerName}</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Stack spacing={3}>
          <ToggleButtonGroup
            value={type}
            exclusive
            onChange={(_, v) => v && setType(v)}
            fullWidth
          >
            <ToggleButton
              value="credit"
              sx={{
                fontWeight: 600,
                '&.Mui-selected': {
                  bgcolor: '#E8F5E9',
                  color: '#2E7D32',
                  '&:hover': { bgcolor: '#C8E6C9' },
                },
              }}
            >
              Credit (+)
            </ToggleButton>
            <ToggleButton
              value="debit"
              sx={{
                fontWeight: 600,
                '&.Mui-selected': {
                  bgcolor: '#FFEBEE',
                  color: '#C62828',
                  '&:hover': { bgcolor: '#FFCDD2' },
                },
              }}
            >
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
                startAdornment: <Typography sx={{ color: '#2E7D32', mr: 1, fontWeight: 700 }}>$</Typography>,
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
      <DialogActions sx={{ p: 2, borderTop: '1px solid #E0E0E0' }}>
        <Button onClick={onClose} sx={{ color: '#757575' }}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={!amount || parseFloat(amount) <= 0 || !description.trim()}
          sx={{
            bgcolor: '#2E7D32',
            '&:hover': { bgcolor: '#1B5E20' },
          }}
        >
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
}
