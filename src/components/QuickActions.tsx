import { useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  AccountBalance as BankIcon,
  Apartment as ApartmentIcon,
  Factory as FactoryIcon,
  Stadium as StadiumIcon,
} from '@mui/icons-material';
import type { Player } from '../types';
import { DEFAULT_QUICK_ACTIONS } from '../types';
import { CustomAmountDialog } from './CustomAmountDialog';
import type { TransactionType } from '../types';
import { formatMoney } from '../utils/format';

interface QuickActionsProps {
  players: Player[];
  selectedPlayerId: string | null;
  onAction: (playerId: string, amount: number, description: string, type: TransactionType) => void;
}

const actionIcons: Record<string, typeof BankIcon> = {
  credit: ApartmentIcon,
  debit: FactoryIcon,
  transfer: StadiumIcon,
};

export function QuickActions({ players, selectedPlayerId, onAction }: QuickActionsProps) {
  const [expanded, setExpanded] = useState(true);
  const [customDialogOpen, setCustomDialogOpen] = useState(false);

  const selectedPlayer = players.find((p) => p.id === selectedPlayerId);

  return (
    <Box sx={{ width: '100%' }}>
      <Stack
        direction="row"
        onClick={() => setExpanded(!expanded)}
        sx={{ cursor: 'pointer', py: 1, alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <BankIcon sx={{ color: 'secondary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Quick Actions
          </Typography>
        </Stack>
        <IconButton size="small">
          {expanded ? <CollapseIcon /> : <ExpandIcon />}
        </IconButton>
      </Stack>

      <Collapse in={expanded}>
        <Stack spacing={1.5} sx={{ mt: 1 }}>
          {DEFAULT_QUICK_ACTIONS.map((action) => {
            const Icon = actionIcons[action.type] || BankIcon;
            return (
              <Button
                key={action.label}
                variant="outlined"
                fullWidth
                startIcon={<Icon fontSize="small" sx={{ color: action.type === 'credit' ? 'success.main' : 'error.main' }} />}
                disabled={!selectedPlayerId}
                onClick={() => {
                  if (selectedPlayerId) {
                    onAction(selectedPlayerId, action.amount, action.description, action.type);
                  }
                }}
                sx={{
                  justifyContent: 'flex-start',
                  py: 1.5,
                  px: 2,
                  borderColor: 'rgba(255, 215, 0, 0.15)',
                  '&:hover': {
                    borderColor: 'secondary.main',
                    background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, rgba(255, 160, 0, 0.04) 100%)',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <Box sx={{ flex: 1, textAlign: 'left' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {action.label}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    color: action.type === 'credit' ? 'success.main' : 'error.main',
                    fontFamily: '"Bungee", cursive',
                    fontSize: '0.8rem',
                  }}
                >
                  {action.type === 'credit' ? '+' : '-'}{formatMoney(action.amount)}
                </Typography>
              </Button>
            );
          })}

          <Button
            variant="outlined"
            fullWidth
            onClick={() => setCustomDialogOpen(true)}
            disabled={!selectedPlayerId}
            sx={{
              justifyContent: 'flex-start',
              py: 1.5,
              px: 2,
              borderColor: 'rgba(255, 215, 0, 0.3)',
              '&:hover': {
                borderColor: 'secondary.main',
                background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, rgba(255, 160, 0, 0.04) 100%)',
              },
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Custom Transaction
            </Typography>
          </Button>
        </Stack>
      </Collapse>

      {selectedPlayer && (
        <CustomAmountDialog
          open={customDialogOpen}
          onClose={() => setCustomDialogOpen(false)}
          onConfirm={(amount, description, type) => {
            onAction(selectedPlayer.id, amount, description, type);
          }}
          playerName={selectedPlayer.name}
        />
      )}
    </Box>
  );
}
