import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Paper,
  IconButton,
} from '@mui/material';
import {
  Casino as DiceIcon,
  Train as TrainIcon,
  PlayArrow as PlayIcon,
  Refresh as ResetIcon,
  Stop as StopIcon,
} from '@mui/icons-material';
import { formatMoney } from '../utils/format';

function DiceFace({ value }: { value: number }) {
  const dotPositions: Record<number, number[]> = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8],
  };

  const dots = dotPositions[value] || [];

  return (
    <Box
      sx={{
        width: 44,
        height: 44,
        bgcolor: '#FFFFFF',
        borderRadius: 2,
        border: '2px solid #E0E0E0',
        boxShadow: '0 3px 6px rgba(0,0,0,0.15), inset 0 -3px 0 #E0E0E0',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
        p: 0.5,
        gap: 0.25,
      }}
    >
      {[...Array(9)].map((_, i) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {dots.includes(i) && (
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                bgcolor: '#212121',
              }}
            />
          )}
        </Box>
      ))}
    </Box>
  );
}

export function TradingUnit() {
  // Dice Roll States
  const [dice, setDice] = useState<[number, number]>([1, 1]);
  const [isRollingDice, setIsRollingDice] = useState(false);

  // Build Roll States
  const [buildResult, setBuildResult] = useState<'1' | '2' | '3' | 'Railroad' | null>(null);
  const [isRollingBuild, setIsRollingBuild] = useState(false);

  // Auction Timer States
  const [auctionSeconds, setAuctionSeconds] = useState(50);
  const [isAuctionRunning, setIsAuctionRunning] = useState(false);
  const [lcdText, setLcdText] = useState('READY');

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Roll standard 2x dice
  const handleRollDice = () => {
    if (isRollingDice) return;
    setIsRollingDice(true);
    setLcdText('ROLLING...');

    let count = 0;
    const interval = setInterval(() => {
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      setDice([d1, d2]);
      count++;

      if (count >= 10) {
        clearInterval(interval);
        const finalD1 = Math.floor(Math.random() * 6) + 1;
        const finalD2 = Math.floor(Math.random() * 6) + 1;
        setDice([finalD1, finalD2]);
        setIsRollingDice(false);
        setLcdText(`ROLLED: ${finalD1 + finalD2}`);
      }
    }, 80);
  };

  // Roll building capacity (1, 2, 3, or Train)
  const handleBuildPress = () => {
    if (isRollingBuild) return;
    setIsRollingBuild(true);
    setBuildResult(null);
    setLcdText('PLANNING...');

    const options: ('1' | '2' | '3' | 'Railroad')[] = ['1', '2', '3', 'Railroad'];
    let count = 0;

    const interval = setInterval(() => {
      const idx = Math.floor(Math.random() * options.length);
      setBuildResult(options[idx]);
      count++;

      if (count >= 12) {
        clearInterval(interval);
        // Weighted roll: 30% for 1, 30% for 2, 30% for 3, 10% for Train
        const rand = Math.random();
        let finalResult: '1' | '2' | '3' | 'Railroad';
        if (rand < 0.3) finalResult = '1';
        else if (rand < 0.6) finalResult = '2';
        else if (rand < 0.9) finalResult = '3';
        else finalResult = 'Railroad';

        setBuildResult(finalResult);
        setIsRollingBuild(false);
        setLcdText(finalResult === 'Railroad' ? 'FREE RAILROAD!' : `BUILD CAPACITY: ${finalResult}`);
      }
    }, 80);
  };

  // Auction Timer Control
  const startAuction = () => {
    if (isAuctionRunning) {
      // Pause/Stop
      setIsAuctionRunning(false);
      if (timerRef.current) clearInterval(timerRef.current);
      setLcdText('AUCTION PAUSED');
      return;
    }

    setIsAuctionRunning(true);
    setLcdText(`AUCTION: ${auctionSeconds}s`);

    timerRef.current = setInterval(() => {
      setAuctionSeconds((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setIsAuctionRunning(false);
          setLcdText("TIME'S UP!");
          return 0;
        }
        setLcdText(`AUCTION: ${prev - 1}s`);
        return prev - 1;
      });
    }, 1000);
  };

  const resetAuction = () => {
    setIsAuctionRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setAuctionSeconds(50);
    setLcdText('READY');
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Determine LED flash styling
  const getLedStyle = () => {
    if (lcdText === "TIME'S UP!") {
      return {
        bgcolor: '#FF1744',
        boxShadow: '0 0 20px #FF1744, inset 0 0 10px rgba(0,0,0,0.5)',
        animation: 'rapidFlash 0.3s infinite',
      };
    }
    if (isAuctionRunning) {
      return {
        bgcolor: '#FF1744',
        boxShadow: '0 0 15px #FF1744, inset 0 0 5px rgba(0,0,0,0.5)',
        animation: 'slowFlash 1s infinite',
      };
    }
    return {
      bgcolor: '#B71C1C',
      boxShadow: 'inset 0 0 8px rgba(0,0,0,0.6)',
    };
  };

  return (
    <Paper
      elevation={4}
      sx={{
        p: 2.5,
        bgcolor: '#263238', // Dark slate metallic machine casing
        color: '#ECEFF1',
        borderRadius: 4,
        border: '3px solid #37474F',
        boxShadow: '0 8px 30px rgba(0,0,0,0.4), inset 0 0 20px rgba(0,0,0,0.5)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes slowFlash {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; filter: drop-shadow(0 0 10px #FF1744); }
        }
        @keyframes rapidFlash {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; filter: drop-shadow(0 0 15px #FF1744); }
        }
      `}</style>

      {/* Retro Branding */}
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography
          variant="caption"
          sx={{
            fontFamily: '"Bungee", cursive',
            color: '#B0BEC5',
            fontSize: '0.65rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}
        >
          City Trading Unit
        </Typography>
        {/* Red blinking LED Dome */}
        <Box
          sx={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            transition: 'all 0.3s ease',
            border: '2px solid #212121',
            ...getLedStyle(),
          }}
        />
      </Stack>

      {/* LCD Digital Display Screen */}
      <Box
        sx={{
          bgcolor: '#12181B',
          borderRadius: 2,
          p: 1.5,
          mb: 2.5,
          border: '2px solid #37474F',
          boxShadow: 'inset 0 0 10px rgba(0,0,0,0.8)',
          textAlign: 'center',
          minHeight: 52,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          sx={{
            fontFamily: 'monospace',
            fontWeight: 800,
            fontSize: '1.1rem',
            color: isAuctionRunning || lcdText === "TIME'S UP!" ? '#FF3D00' : '#00E676',
            textShadow: isAuctionRunning || lcdText === "TIME'S UP!" ? '0 0 8px #FF3D00' : '0 0 8px #00E676',
            letterSpacing: '0.05em',
          }}
        >
          {lcdText}
        </Typography>
      </Box>

      {/* Grid of Roller Results */}
      <Stack direction="row" spacing={2} sx={{ justifyContent: 'center', mb: 2.5 }}>
        {/* Dice roll results */}
        <Stack spacing={0.5} sx={{ alignItems: 'center' }}>
          <Stack direction="row" spacing={1}>
            <DiceFace value={dice[0]} />
            <DiceFace value={dice[1]} />
          </Stack>
          <Typography variant="caption" sx={{ color: '#90A4AE', fontSize: '0.6rem', fontWeight: 600 }}>DICE ROLL</Typography>
        </Stack>

        {/* Divider */}
        <Box sx={{ width: '1px', bgcolor: '#37474F', alignSelf: 'stretch' }} />

        {/* Building roll result */}
        <Stack spacing={0.5} sx={{ alignItems: 'center', minWidth: 90 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              bgcolor: buildResult === 'Railroad' ? '#1565C0' : buildResult ? '#2E7D32' : '#37474F',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #455A64',
              boxShadow: buildResult ? '0 3px 6px rgba(0,0,0,0.2)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            {buildResult === 'Railroad' ? (
              <TrainIcon sx={{ color: '#fff', fontSize: 24 }} />
            ) : buildResult ? (
              <Typography sx={{ fontFamily: '"Bungee", cursive', color: '#fff', fontSize: '1.4rem' }}>
                {buildResult}
              </Typography>
            ) : (
              <Typography sx={{ color: '#90A4AE', fontSize: '1.2rem', fontWeight: 700 }}>-</Typography>
            )}
          </Box>
          <Typography variant="caption" sx={{ color: '#90A4AE', fontSize: '0.6rem', fontWeight: 600 }}>BUILD ROLL</Typography>
        </Stack>
      </Stack>

      {/* Action Buttons */}
      <Stack spacing={1}>
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            fullWidth
            onClick={handleRollDice}
            disabled={isRollingDice}
            startIcon={<DiceIcon />}
            sx={{
              bgcolor: '#546E7A',
              color: '#fff',
              py: 1,
              fontWeight: 700,
              fontSize: '0.75rem',
              '&:hover': { bgcolor: '#455A64' },
            }}
          >
            Roll Dice
          </Button>

          <Button
            variant="contained"
            fullWidth
            onClick={handleBuildPress}
            disabled={isRollingBuild}
            startIcon={<TrainIcon />}
            sx={{
              bgcolor: '#00897B',
              color: '#fff',
              py: 1,
              fontWeight: 700,
              fontSize: '0.75rem',
              '&:hover': { bgcolor: '#00695C' },
            }}
          >
            Build Roll
          </Button>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ alignItems: 'stretch' }}>
          <Button
            variant="contained"
            fullWidth
            onClick={startAuction}
            startIcon={isAuctionRunning ? <StopIcon /> : <PlayIcon />}
            sx={{
              bgcolor: '#D84315',
              color: '#fff',
              py: 1,
              fontWeight: 700,
              fontSize: '0.75rem',
              '&:hover': { bgcolor: '#BF360C' },
            }}
          >
            {isAuctionRunning ? 'Pause Auction' : 'Start Auction (50s)'}
          </Button>

          <IconButton
            onClick={resetAuction}
            sx={{
              bgcolor: '#37474F',
              color: '#B0BEC5',
              borderRadius: 2,
              p: 1,
              '&:hover': { bgcolor: '#455A64', color: '#fff' },
            }}
          >
            <ResetIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>
    </Paper>
  );
}
