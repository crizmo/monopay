import { Box, Typography, CircularProgress } from '@mui/material';
import { Apartment as BuildingIcon } from '@mui/icons-material';
import { useEffect, useState } from 'react';

interface WaitingAnimationProps {
  message?: string;
}

export function WaitingAnimation({ message = 'Waiting for players...' }: WaitingAnimationProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        gap: 3,
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CircularProgress
          size={56}
          sx={{
            color: '#2E7D32',
            animationDuration: '1.5s',
          }}
        />
        <BuildingIcon
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#2E7D32',
            fontSize: 24,
            animation: 'pulse 2s ease-in-out infinite',
          }}
        />
      </Box>
      <Typography variant="h6" sx={{ color: '#9E9E9E' }}>
        {message}{dots}
      </Typography>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
        }
      `}</style>
    </Box>
  );
}
