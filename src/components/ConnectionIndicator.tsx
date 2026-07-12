import { Chip, Tooltip } from '@mui/material';
import {
  Wifi as ConnectedIcon,
  WifiOff as DisconnectedIcon,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';

export function ConnectionIndicator() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const check = () => {
      const state = localStorage.getItem('monopay_game_state');
      setIsConnected(!!state);
    };
    check();
    window.addEventListener('storage', check);
    const interval = setInterval(check, 2000);
    return () => {
      window.removeEventListener('storage', check);
      clearInterval(interval);
    };
  }, []);

  return (
    <Tooltip title={isConnected ? 'Connected to game' : 'Not in game'}>
      <Chip
        icon={isConnected ? <ConnectedIcon /> : <DisconnectedIcon />}
        label={isConnected ? 'Online' : 'Offline'}
        color={isConnected ? 'success' : 'error'}
        variant="outlined"
        size="small"
        sx={{ fontWeight: 600 }}
      />
    </Tooltip>
  );
}
