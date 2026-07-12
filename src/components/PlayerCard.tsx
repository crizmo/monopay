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
        bgcolor: '#FFFFFF',
        border: '1px solid #E0E0E0',
        borderLeft: `5px solid ${player.color}`,
        borderRadius: 2,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
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
              boxShadow: `0 2px 8px ${player.color}40`,
            }}
          >
            {player.name.charAt(0).toUpperCase()}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }} noWrap>
                {player.name}
              </Typography>
              {player.isConnected ? (
                <Chip
                  label="Online"
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: '0.7rem',
                    bgcolor: '#E8F5E9',
                    color: '#2E7D32',
                    fontWeight: 600,
                  }}
                />
              ) : (
                <Chip
                  label="Offline"
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: '0.7rem',
                    bgcolor: '#FFEBEE',
                    color: '#C62828',
                    fontWeight: 600,
                  }}
                />
              )}
            </Stack>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: '#2E7D32',
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
                  sx={{ color: '#2E7D32' }}
                >
                  <TransferIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Remove">
                <IconButton
                  size="small"
                  onClick={() => onRemove?.(player.id)}
                  sx={{ color: '#C62828' }}
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
