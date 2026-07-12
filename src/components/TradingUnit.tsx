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
  PlayArrow as PlayIcon,
  Refresh as ResetIcon,
  Stop as StopIcon,
} from '@mui/icons-material';

// Handshake icon matching the physical device (red/blue hand shake with white outline)
const HandshakeIconSvg = () => (
  <svg width="50" height="34" viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* White outline/background */}
    <path d="M12 22C12 22 17 14 24 16C28 17.1 29 19 32 19C35 19 38 16 41 18C44 20 47 25 41 27C37 28.3 35 25.5 32 25.5C29 25.5 28 27.5 24 28C17 29 12 22 12 22Z" fill="white" stroke="white" strokeWidth="5" strokeLinejoin="round" />
    {/* Red hand */}
    <path d="M8 24C12 25 17 26 23 25C26 24.6 28 22.5 31 22.5C32.5 22.5 33.5 23 34.5 23.5L25 32C20 32 12 29 8 24Z" fill="#E53935" />
    <path d="M10 20C13 19.5 17 18.5 24 20C27 20.6 29 19 31 19C33 19 34.5 19.5 35 20L28.5 28C24 28 18 26.5 10 20Z" fill="#E53935" stroke="#B71C1C" strokeWidth="1" />
    {/* Blue hand */}
    <path d="M52 16C48 15 43 14 37 15C34 15.4 32 17.5 29 17.5C27.5 17.5 26.5 17 25.5 16.5L35 8C40 8 48 11 52 16Z" fill="#1E88E5" />
    <path d="M50 20C47 20.5 43 21.5 36 20C33 19.4 31 21 29 21C27 21 25.5 20.5 25 20L31.5 12C36 12 42 13.5 50 20Z" fill="#1E88E5" stroke="#0D47A1" strokeWidth="1" />
  </svg>
);

// Railroad track icon at 6 o'clock matching the physical device
const RailroadIconSvg = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M7 3V21M17 3V21M5 7H19M5 12H19M5 17H19"
      stroke={active ? '#00E676' : '#90A4AE'}
      strokeWidth="4"
      strokeLinecap="round"
      style={{ transition: 'stroke 0.2s', filter: active ? 'drop-shadow(0 0 5px #00E676)' : 'none' }}
    />
  </svg>
);

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

class SoundEffects {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  playTone(freq: number, type: OscillatorType, duration: number, volume: number = 0.3) {
    try {
      const audio = this.getContext();
      const osc = audio.createOscillator();
      const gain = audio.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, audio.currentTime);

      gain.gain.setValueAtTime(volume, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + duration);

      osc.connect(gain);
      gain.connect(audio.destination);

      osc.start();
      osc.stop(audio.currentTime + duration);
    } catch (e) {
      console.warn("Audio failed to play:", e);
    }
  }

  playTick() {
    this.playTone(600, 'triangle', 0.05, 0.45);
  }

  playLandChime(isSpecial: boolean) {
    if (isSpecial) {
      // Upward arpeggio
      this.playTone(523.25, 'sine', 0.2, 0.5); // C5
      setTimeout(() => this.playTone(659.25, 'sine', 0.2, 0.5), 100); // E5
      setTimeout(() => this.playTone(783.99, 'sine', 0.2, 0.5), 200); // G5
      setTimeout(() => this.playTone(1046.50, 'sine', 0.4, 0.7), 300); // C6
    } else {
      // Positive dual tone
      this.playTone(523.25, 'sine', 0.15, 0.5); // C5
      setTimeout(() => this.playTone(783.99, 'sine', 0.3, 0.5), 120); // G5
    }
  }

  playAuctionTick(secondsLeft: number) {
    if (secondsLeft <= 5) {
      this.playTone(880, 'sine', 0.08, 0.5);
    } else {
      this.playTone(440, 'triangle', 0.05, 0.35);
    }
  }

  playAlarm() {
    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        this.playTone(587.33, 'square', 0.15, 0.4); // D5
      }, i * 300);
      setTimeout(() => {
        this.playTone(440, 'square', 0.15, 0.4); // A4
      }, i * 300 + 150);
    }
  }
}

const sounds = new SoundEffects();

export function TradingUnit() {
  // Dice Roll States
  const [dice, setDice] = useState<[number, number]>([1, 1]);
  const [isRollingDice, setIsRollingDice] = useState(false);

  // Build Roll States
  const [buildResult, setBuildResult] = useState<'1' | '2' | '3' | 'Railroad' | null>(null);
  const [isRollingBuild, setIsRollingBuild] = useState(false);
  const [cycleSector, setCycleSector] = useState<'1' | '2' | '3' | 'Railroad' | null>(null);

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
    sounds.playTick();

    let count = 0;
    const interval = setInterval(() => {
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      setDice([d1, d2]);
      sounds.playTick();
      count++;

      if (count >= 10) {
        clearInterval(interval);
        const finalD1 = Math.floor(Math.random() * 6) + 1;
        const finalD2 = Math.floor(Math.random() * 6) + 1;
        setDice([finalD1, finalD2]);
        setIsRollingDice(false);
        setLcdText(`ROLLED: ${finalD1 + finalD2}`);
        sounds.playTone(880, 'sine', 0.25, 0.6);
      }
    }, 80);
  };

  // Roll building capacity (1, 2, 3, or Railroad)
  const handleBuildPress = () => {
    if (isRollingBuild) return;
    setIsRollingBuild(true);
    setBuildResult(null);
    setLcdText('PLANNING...');
    sounds.playTick();

    const sectors: ('1' | '2' | '3' | 'Railroad')[] = ['1', '2', '3', 'Railroad'];
    let count = 0;

    const interval = setInterval(() => {
      const current = sectors[count % sectors.length];
      setCycleSector(current);
      sounds.playTick();
      count++;

      if (count >= 16) {
        clearInterval(interval);
        const rand = Math.random();
        let finalResult: '1' | '2' | '3' | 'Railroad';
        if (rand < 0.3) finalResult = '1';
        else if (rand < 0.6) finalResult = '2';
        else if (rand < 0.9) finalResult = '3';
        else finalResult = 'Railroad';

        setBuildResult(finalResult);
        setCycleSector(finalResult);
        setIsRollingBuild(false);
        setLcdText(finalResult === 'Railroad' ? 'FREE RAILROAD!' : `BUILD CAPACITY: ${finalResult}`);
        sounds.playLandChime(finalResult === 'Railroad');
      }
    }, 90);
  };

  // Auction Timer Control (The handshake button click)
  const startAuction = () => {
    if (isAuctionRunning) {
      setIsAuctionRunning(false);
      if (timerRef.current) clearInterval(timerRef.current);
      setLcdText('AUCTION PAUSED');
      sounds.playTone(300, 'triangle', 0.1, 0.4);
      return;
    }

    setIsAuctionRunning(true);
    setLcdText(`AUCTION: ${auctionSeconds}s`);
    sounds.playAuctionTick(auctionSeconds);

    timerRef.current = setInterval(() => {
      setAuctionSeconds((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setIsAuctionRunning(false);
          setLcdText("TIME'S UP!");
          sounds.playAlarm();
          return 0;
        }
        setLcdText(`AUCTION: ${prev - 1}s`);
        sounds.playAuctionTick(prev - 1);
        return prev - 1;
      });
    }, 1000);
  };

  const resetAuction = () => {
    setIsAuctionRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setAuctionSeconds(50);
    setLcdText('READY');
    sounds.playTone(300, 'triangle', 0.1, 0.4);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const isSectorActive = (sector: '1' | '2' | '3' | 'Railroad') => {
    if (isRollingBuild) return cycleSector === sector;
    return buildResult === sector;
  };

  return (
    <Paper
      elevation={4}
      sx={{
        p: 3,
        bgcolor: '#1E272C', // Dark Slate Metallic
        color: '#ECEFF1',
        borderRadius: 4,
        border: '3px solid #37474F',
        boxShadow: '0 8px 30px rgba(0,0,0,0.5), inset 0 0 20px rgba(0,0,0,0.4)',
        position: 'relative',
        overflow: 'visible',
      }}
    >
      {/* Keyframe animations for LED & Ring flashing */}
      <style>{`
        @keyframes ringSlowFlash {
          0%, 100% { border-color: rgba(69,90,100,0.5); box-shadow: inset 0 0 10px rgba(0,0,0,0.5); }
          50% { border-color: #FF1744; box-shadow: 0 0 15px #FF1744, inset 0 0 10px #FF1744; }
        }
        @keyframes ringRapidFlash {
          0%, 100% { border-color: rgba(69,90,100,0.5); box-shadow: inset 0 0 10px rgba(0,0,0,0.5); }
          50% { border-color: #FF1744; box-shadow: 0 0 25px #FF1744, inset 0 0 15px #FF1744; }
        }
      `}</style>

      {/* Main Grid: Machine and Controls side by side on desktop */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ alignItems: 'center' }}>
        
        {/* LEFT COMPARTMENT: The 3D Circular Electronic Trading Unit Device */}
        <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', width: 240, height: 240 }}>
          
          {/* Main Circular Casing Pod */}
          <Box
            sx={{
              width: 240,
              height: 240,
              borderRadius: '50%',
              bgcolor: '#3A4D57', // Slate grey body matching image
              backgroundImage: 'radial-gradient(circle at 35% 35%, #566E7A 0%, #3A4D57 60%, #212C32 100%)',
              border: '4px solid #2B3941',
              boxShadow: 'inset 0 6px 10px rgba(255,255,255,0.2), inset 0 -6px 12px rgba(0,0,0,0.6), 0 8px 24px rgba(0,0,0,0.4)',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.15s ease',
            }}
          >
            {/* Translucent Ring around central button */}
            <Box
              sx={{
                width: 170,
                height: 170,
                borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.03)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                ...(isAuctionRunning && {
                  animation: 'ringSlowFlash 1s infinite',
                }),
                ...(lcdText === "TIME'S UP!" && {
                  animation: 'ringRapidFlash 0.3s infinite',
                }),
                ...(!isAuctionRunning && lcdText !== "TIME'S UP!" && {
                  border: '3px solid #2B3941',
                  boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
                }),
              }}
            >
              {/* Sector 1: Left (9 o'clock) */}
              <Box
                sx={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontFamily: '"Bungee", cursive',
                  fontSize: '1.6rem',
                  fontWeight: 800,
                  color: isSectorActive('1') ? '#00E676' : '#90A4AE',
                  textShadow: isSectorActive('1') ? '0 0 10px #00E676' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                1
              </Box>

              {/* Sector 2: Top (12 o'clock) */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontFamily: '"Bungee", cursive',
                  fontSize: '1.6rem',
                  fontWeight: 800,
                  color: isSectorActive('2') ? '#00E676' : '#90A4AE',
                  textShadow: isSectorActive('2') ? '0 0 10px #00E676' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                2
              </Box>

              {/* Sector 3: Right (3 o'clock) */}
              <Box
                sx={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontFamily: '"Bungee", cursive',
                  fontSize: '1.6rem',
                  fontWeight: 800,
                  color: isSectorActive('3') ? '#00E676' : '#90A4AE',
                  textShadow: isSectorActive('3') ? '0 0 10px #00E676' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                3
              </Box>

              {/* Sector Railroad: Bottom (6 o'clock) */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                }}
              >
                <RailroadIconSvg active={isSectorActive('Railroad')} />
              </Box>

              {/* CENTRAL DEAL/AUCTION BUTTON (Large black button with handshake logo) */}
              <Box
                onClick={startAuction}
                sx={{
                  width: 90,
                  height: 90,
                  borderRadius: '50%',
                  bgcolor: '#121212',
                  backgroundImage: 'radial-gradient(circle at 35% 35%, #2C2C2C 0%, #121212 70%, #000000 100%)',
                  border: '3px solid #2B3941',
                  boxShadow: 'inset 0 3px 6px rgba(255,255,255,0.1), inset 0 -3px 6px rgba(0,0,0,0.8), 0 4px 10px rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 2,
                  transition: 'all 0.1s ease',
                  '&:active': {
                    transform: 'scale(0.96)',
                    boxShadow: 'inset 0 5px 8px rgba(0,0,0,0.9), 0 2px 5px rgba(0,0,0,0.3)',
                  },
                }}
              >
                <HandshakeIconSvg />
              </Box>
            </Box>
          </Box>

          {/* Silver Corrugated Side Rolling Trigger Button (Rolls the building capacity) */}
          <Box
            onClick={handleBuildPress}
            sx={{
              position: 'absolute',
              right: -8,
              bottom: 60,
              width: 24,
              height: 48,
              bgcolor: '#B0BEC5',
              border: '3px solid #212C32',
              borderRadius: '8px 0 0 8px',
              boxShadow: 'inset -4px 0 8px rgba(0,0,0,0.5), inset 4px 0 8px rgba(255,255,255,0.4), 0 4px 6px rgba(0,0,0,0.3)',
              cursor: 'pointer',
              transition: 'transform 0.1s',
              backgroundImage: 'repeating-linear-gradient(0deg, #CFD8DC, #CFD8DC 4px, #546E7A 4px, #546E7A 8px)',
              '&:active': {
                transform: 'translateX(-4px)',
              },
              zIndex: 3,
            }}
          />
        </Box>

        {/* RIGHT COMPARTMENT: The Digital Readouts & Roller Interfaces */}
        <Stack spacing={2} sx={{ flex: 1, width: '100%' }}>
          
          {/* LCD Digital Display Screen */}
          <Box
            sx={{
              bgcolor: '#0B0F11',
              borderRadius: 2,
              p: 1.5,
              border: '2px solid #37474F',
              boxShadow: 'inset 0 0 10px rgba(0,0,0,0.9)',
              textAlign: 'center',
              minHeight: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography
              sx={{
                fontFamily: 'monospace',
                fontWeight: 800,
                fontSize: '1.05rem',
                color: isAuctionRunning || lcdText === "TIME'S UP!" ? '#FF3D00' : '#00E676',
                textShadow: isAuctionRunning || lcdText === "TIME'S UP!" ? '0 0 8px #FF3D00' : '0 0 8px #00E676',
                letterSpacing: '0.05em',
              }}
            >
              {lcdText}
            </Typography>
          </Box>

          {/* Compartment for Roller Results (Dice & Target Display) */}
          <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            
            {/* Standard Dice Faces */}
            <Stack spacing={0.5} sx={{ alignItems: 'center' }}>
              <Stack direction="row" spacing={1}>
                <DiceFace value={dice[0]} />
                <DiceFace value={dice[1]} />
              </Stack>
              <Typography variant="caption" sx={{ color: '#90A4AE', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.05em' }}>DICE ROLL</Typography>
            </Stack>

            {/* Quick Action Controller buttons */}
            <Stack spacing={1} sx={{ flex: 1, maxWidth: 120 }}>
              <Button
                variant="contained"
                onClick={handleRollDice}
                disabled={isRollingDice}
                size="small"
                startIcon={<DiceIcon />}
                sx={{
                  bgcolor: '#455A64',
                  color: '#fff',
                  py: 1,
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  '&:hover': { bgcolor: '#37474F' },
                }}
              >
                Roll Dice
              </Button>

              <Stack direction="row" spacing={0.5}>
                <Button
                  variant="contained"
                  onClick={startAuction}
                  fullWidth
                  size="small"
                  sx={{
                    bgcolor: '#D84315',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    minWidth: 0,
                    p: 0.75,
                    '&:hover': { bgcolor: '#BF360C' },
                  }}
                >
                  {isAuctionRunning ? <StopIcon fontSize="small" /> : <PlayIcon fontSize="small" />}
                </Button>
                <IconButton
                  onClick={resetAuction}
                  size="small"
                  sx={{
                    bgcolor: '#263238',
                    color: '#B0BEC5',
                    borderRadius: 1,
                    '&:hover': { bgcolor: '#37474F', color: '#fff' },
                  }}
                >
                  <ResetIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Stack>

          </Stack>
        </Stack>

      </Stack>
    </Paper>
  );
}
