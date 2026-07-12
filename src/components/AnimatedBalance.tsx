import { Box, Typography } from '@mui/material';
import { useAnimatedBalance } from '../hooks/useAnimatedBalance';
import { formatMoney } from '../utils/format';

interface AnimatedBalanceProps {
  balance: number;
  size?: 'small' | 'medium' | 'large';
}

const sizeMap = {
  small: { fontSize: '1.5rem', subtitle: '0.875rem' },
  medium: { fontSize: '3rem', subtitle: '1rem' },
  large: { fontSize: '4.5rem', subtitle: '1.25rem' },
};

export function AnimatedBalance({ balance, size = 'medium' }: AnimatedBalanceProps) {
  const { displayBalance, flashClass } = useAnimatedBalance(balance);
  const s = sizeMap[size];

  return (
    <Box
      sx={{
        textAlign: 'center',
        transition: 'all 0.3s ease',
        borderRadius: 3,
        px: 3,
        py: 1,
      }}
    >
      <Typography
        variant="h2"
        sx={{
          fontSize: s.fontSize,
          fontWeight: 800,
          background: 'linear-gradient(135deg, #FFD700 0%, #FFA000 50%, #FFD700 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          transition: 'all 0.3s ease',
          fontFamily: '"Bungee", cursive',
          letterSpacing: '-0.02em',
          '&::before': {
            content: '"$"',
            WebkitTextFillColor: 'rgba(255, 215, 0, 0.35)',
            fontWeight: 400,
            mr: 0.5,
          },
          ...(flashClass === 'flash-green' && {
            textShadow: '0 0 30px rgba(76, 175, 80, 0.8)',
            WebkitTextFillColor: '#4CAF50',
            animation: 'pulseGreen 0.6s ease',
          }),
          ...(flashClass === 'flash-red' && {
            textShadow: '0 0 30px rgba(244, 67, 54, 0.8)',
            WebkitTextFillColor: '#F44336',
            animation: 'pulseRed 0.6s ease',
          }),
        }}
      >
        {formatMoney(displayBalance).replace('$', '')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ fontSize: s.subtitle, mt: 0.5 }}>
        Current Balance
      </Typography>
      <style>{`
        @keyframes pulseGreen {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes pulseRed {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </Box>
  );
}
