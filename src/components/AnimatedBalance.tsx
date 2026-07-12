import { Box, Typography } from '@mui/material';
import { useAnimatedBalance } from '../hooks/useAnimatedBalance';
import { formatMoney } from '../utils/format';

interface AnimatedBalanceProps {
  balance: number;
  size?: 'small' | 'medium' | 'large';
}

const sizeMap = {
  small: { fontSize: 'clamp(1.1rem, 4vw, 1.5rem)', subtitle: '0.875rem' },
  medium: { fontSize: 'clamp(1.6rem, 7vw, 2.8rem)', subtitle: '1rem' },
  large: { fontSize: 'clamp(2.1rem, 10vw, 4rem)', subtitle: '1.25rem' },
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
        py: 2,
        bgcolor: '#FFFFFF',
        border: '1px solid #E0E0E0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      <Typography
        variant="h2"
        sx={{
          fontSize: s.fontSize,
          fontWeight: 800,
          color: '#2E7D32',
          transition: 'all 0.3s ease',
          fontFamily: '"Bungee", cursive',
          letterSpacing: '-0.02em',
          ...(flashClass === 'flash-green' && {
            color: '#1B5E20',
            textShadow: '0 0 20px rgba(46, 125, 50, 0.3)',
            animation: 'pulseGreen 0.6s ease',
          }),
          ...(flashClass === 'flash-red' && {
            color: '#C62828',
            textShadow: '0 0 20px rgba(198, 40, 40, 0.3)',
            animation: 'pulseRed 0.6s ease',
          }),
        }}
      >
        {formatMoney(displayBalance)}
      </Typography>
      <Typography variant="body2" sx={{ fontSize: s.subtitle, mt: 0.5, color: '#9E9E9E' }}>
        Current Balance
      </Typography>
      <style>{`
        @keyframes pulseGreen {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        @keyframes pulseRed {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
      `}</style>
    </Box>
  );
}
