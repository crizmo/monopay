import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
  IconButton,
  Stack,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Apartment as BuildingIcon,
  Remove as RemoveIcon,
  SwapHoriz as TransferIcon,
} from '@mui/icons-material';
import type { Player } from '../types';
import { formatMoney } from '../utils/format';
import { useAnimatedBalance } from '../hooks/useAnimatedBalance';

interface PlayerCardProps {
  player: Player;
  isHost: boolean;
  onRemove?: (playerId: string) => void;
  onTransfer?: (playerId: string) => void;
  showActions?: boolean;
}

export function PlayerCard({ player, isHost, onRemove, onTransfer, showActions = false }: PlayerCardProps) {
  const { displayBalance } = useAnimatedBalance(player.balance);

  return (
    <Card
      sx={{
        width: '100%',
        position: 'relative',
        overflow: 'visible',
        opacity: player.isConnected ? 1 : 0.6,
        borderLeft: `4px solid ${player.color}`,
        bgcolor: '#0e1630',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 8,
          right: 8,
          opacity: 0.04,
          fontSize: 48,
          color: player.color,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: player.color,
              fontSize: '1.5rem',
              fontWeight: 700,
              boxShadow: `0 0 20px ${player.color}60, 0 4px 14px ${player.color}40`,
            }}
          >
            {player.name.charAt(0).toUpperCase()}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }} noWrap>
                {player.name}
              </Typography>
              {!player.isConnected && (
                <Chip
                  label="Offline"
                  size="small"
                  color="error"
                  variant="outlined"
                  sx={{ height: 22, fontSize: '0.7rem' }}
                />
              )}
            </Stack>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA000 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: '"Bungee", cursive',
              }}
            >
              {formatMoney(displayBalance)}
            </Typography>
          </Box>

          {showActions && isHost && (
            <Stack direction="row" spacing={0.5}>
              <Tooltip title="Transfer">
                <IconButton
                  size="small"
                  onClick={() => onTransfer?.(player.id)}
                  sx={{ color: 'primary.main' }}
                >
                  <TransferIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Remove">
                <IconButton
                  size="small"
                  onClick={() => onRemove?.(player.id)}
                  sx={{ color: 'error.main' }}
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
