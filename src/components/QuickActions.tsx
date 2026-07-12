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
  HomeWork as ResidentialIcon,
  Factory as IndustrialIcon,
  Stadium as StadiumIcon,
  Diamond as LuxuryIcon,
  ReceiptLong as IncomeTaxIcon,
  Redeem as PassGoIcon,
  Apartment as RentIcon,
  Payments as PayRentIcon,
  CleaningServices as HazardIcon,
  Gavel as AuctionIcon,
  Add as CustomIcon,
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

const actionConfig: Record<string, { icon: typeof ResidentialIcon; color: string; bgColor: string }> = {
  'Pass GO': { icon: PassGoIcon, color: '#2E7D32', bgColor: '#E8F5E9' },
  'Collect Rent': { icon: RentIcon, color: '#0288D1', bgColor: '#E1F5FE' },
  'Pay Rent': { icon: PayRentIcon, color: '#E65100', bgColor: '#FFF3E0' },
  'Build Residential': { icon: ResidentialIcon, color: '#0288D1', bgColor: '#E1F5FE' },
  'Build Industrial': { icon: IndustrialIcon, color: '#1565C0', bgColor: '#E3F2FD' },
  'Stadium Bonus': { icon: StadiumIcon, color: '#F9A825', bgColor: '#FFFDE7' },
  'Luxury Tax': { icon: LuxuryIcon, color: '#E65100', bgColor: '#FFF3E0' },
  'Income Tax': { icon: IncomeTaxIcon, color: '#C62828', bgColor: '#FFEBEE' },
  'Remove Hazard': { icon: HazardIcon, color: '#7B1FA2', bgColor: '#F3E5F5' },
  'Auction': { icon: AuctionIcon, color: '#5D4037', bgColor: '#EFEBE9' },
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
          <Box sx={{ color: '#2E7D32' }}>
            <ResidentialIcon />
          </Box>
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
            const config = actionConfig[action.label] || { icon: ResidentialIcon, color: '#757575', bgColor: '#F5F5F5' };
            const Icon = config.icon;
            return (
              <Button
                key={action.label}
                variant="contained"
                fullWidth
                startIcon={<Icon fontSize="small" />}
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
                  bgcolor: config.bgColor,
                  color: config.color,
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: config.color,
                    color: '#FFFFFF',
                    boxShadow: `0 2px 8px ${config.color}40`,
                    transform: 'translateY(-1px)',
                  },
                  '&.Mui-disabled': {
                    bgcolor: '#F5F5F5',
                    color: '#BDBDBD',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <Box sx={{ flex: 1, textAlign: 'left' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, inherit: 'color' }}>
                    {action.label}
                  </Typography>
                </Box>
                {action.amount > 0 && (
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      fontFamily: '"Bungee", cursive',
                      fontSize: '0.8rem',
                      inherit: 'color',
                    }}
                  >
                    {action.type === 'credit' ? '+' : '-'}{formatMoney(action.amount)}
                  </Typography>
                )}
              </Button>
            );
          })}

          <Button
            variant="outlined"
            fullWidth
            startIcon={<CustomIcon fontSize="small" />}
            onClick={() => setCustomDialogOpen(true)}
            disabled={!selectedPlayerId}
            sx={{
              justifyContent: 'flex-start',
              py: 1.5,
              px: 2,
              borderColor: '#E0E0E0',
              color: '#757575',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                borderColor: '#2E7D32',
                color: '#2E7D32',
                bgcolor: '#E8F5E9',
              },
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, inherit: 'color' }}>
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
