import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
  Stack,
  Chip,
} from '@mui/material';
import type { Player } from '../types';
import { formatMoney } from '../utils/format';
import { useAnimatedBalance } from '../hooks/useAnimatedBalance';

interface PlayerCardProps {
  player: Player;
  isSelected?: boolean;
  isCurrentPlayer?: boolean;
  onTap?: (playerId: string) => void;
}

export function PlayerCard({ player, isSelected, isCurrentPlayer, onTap }: PlayerCardProps) {
  const { displayBalance } = useAnimatedBalance(player.balance);

  return (
    <Card
      onClick={() => onTap?.(player.id)}
      sx={{
        cursor: onTap ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'visible',
        opacity: player.isConnected ? 1 : 0.5,
        bgcolor: '#FFFFFF',
        border: `2px solid ${isSelected ? player.color : '#E8E0D4'}`,
        borderLeft: `5px solid ${player.color}`,
        borderRadius: 3,
        boxShadow: isSelected
          ? `0 4px 20px ${player.color}30`
          : '0 1px 4px rgba(0,0,0,0.04)',
        transition: 'all 0.2s ease',
        transform: isSelected ? 'scale(1.02)' : 'none',
        '&:active': onTap ? { transform: 'scale(0.98)' } : {},
      }}
    >
      {isCurrentPlayer && (
        <Chip
          label="YOU"
          size="small"
          sx={{
            position: 'absolute',
            top: -8,
            right: 8,
            height: 20,
            fontSize: '0.65rem',
            fontWeight: 800,
            bgcolor: player.color,
            color: '#fff',
            zIndex: 1,
          }}
        />
      )}
      <CardContent sx={{ p: '12px !important' }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Avatar
            sx={{
              width: 44,
              height: 44,
              bgcolor: player.color,
              fontSize: '1.1rem',
              fontWeight: 700,
              fontFamily: '"Bungee", cursive',
              boxShadow: `0 2px 8px ${player.color}30`,
            }}
          >
            {player.name.charAt(0).toUpperCase()}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 700, color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {player.name}
              </Typography>
              {!player.isConnected && (
                <Chip
                  label="Offline"
                  size="small"
                  sx={{ height: 18, fontSize: '0.6rem', bgcolor: '#FFEBEE', color: '#C62828', fontWeight: 600 }}
                />
              )}
            </Stack>
            <Typography
              sx={{
                fontWeight: 800,
                color: '#2E7D32',
                fontFamily: '"Bungee", cursive',
                fontSize: '1.15rem',
                lineHeight: 1.2,
              }}
            >
              {formatMoney(displayBalance)}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
