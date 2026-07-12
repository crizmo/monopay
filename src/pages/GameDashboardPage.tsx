import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Stack,
  Paper,
  Button,
  Snackbar,
  Alert,
  IconButton,
  Chip,
} from '@mui/material';
import {
  SwapHoriz as TransferIcon,
  History as HistoryIcon,
  Logout as ExitIcon,
  Redeem as PassGoIcon,
  AccountBalance as BankIcon,
  Receipt as TaxIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Payments as PayIcon,
  HomeWork as BuildIcon,
  Factory as FactoryIcon,
  Stadium as StadiumIcon,
  Diamond as LuxuryIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { PlayerCard } from '../components/PlayerCard';
import { TransferDialog } from '../components/TransferDialog';
import { AnimatedBalance } from '../components/AnimatedBalance';
import { CustomAmountDialog } from '../components/CustomAmountDialog';
import { TradingUnit } from '../components/TradingUnit';
import { roomService } from '../services/RoomService';
import { addPlayer } from '../services/GameService';
import type { GameState, TransactionType } from '../types';
import { BANK_PLAYER_ID } from '../types';
import { formatMoney } from '../utils/format';

export function GameDashboardPage() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferDefaultFrom, setTransferDefaultFrom] = useState<string | undefined>();
  const [transferDefaultTo, setTransferDefaultTo] = useState<string | undefined>();
  const [customOpen, setCustomOpen] = useState(false);
  const [customType, setCustomType] = useState<TransactionType>('credit');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const isHost = roomService.isHost;

  const loadState = useCallback(() => {
    const raw = localStorage.getItem('monopay_game_state');
    if (raw) {
      try { setGameState(JSON.parse(raw) as GameState); } catch { navigate('/'); }
    } else { navigate('/'); }
  }, [navigate]);

  useEffect(() => {
    loadState();
    const interval = setInterval(loadState, 500);
    return () => clearInterval(interval);
  }, [loadState]);

  const gameStateRef = useRef<GameState | null>(null);
  gameStateRef.current = gameState;

  useEffect(() => {
    if (!isHost) return;
    const unsubLeave = roomService.onPeerLeave((peerId) => {
      const s = gameStateRef.current;
      if (!s) return;
      const updated = { ...s, players: s.players.map((p) => p.peerId === peerId ? { ...p, isConnected: false } : p) };
      setGameState(updated);
      roomService.broadcastState(updated);
    });
    const unsubJoin = roomService.onJoinRequest((data, peerId) => {
      const s = gameStateRef.current;
      if (!s) return;
      const result = addPlayer(s, data.playerName, peerId);
      if ('error' in result) { roomService.sendRejectJoin(result.error, peerId); return; }
      setGameState(result.state);
      roomService.broadcastState(result.state);
    });
    return () => { unsubLeave(); unsubJoin(); };
  }, [isHost]);

  useEffect(() => {
    if (isHost) return;
    const unsubJoin = roomService.onPeerJoin(() => {
      const s = gameStateRef.current;
      if (!s) return;

      const rawCurrentPlayer = localStorage.getItem('monopay_current_player');
      if (rawCurrentPlayer) {
        try {
          const myPlayer = JSON.parse(rawCurrentPlayer);
          if (myPlayer && myPlayer.name) {
            roomService.sendJoinRequest(myPlayer.name);
          }
        } catch {
          // ignore
        }
      }
    });
    return () => { unsubJoin(); };
  }, [isHost]);

  // Banker applies action to a player (Pass GO, Tax, Build, etc.)
  const applyBankerAction = (playerId: string, amount: number, description: string, type: TransactionType) => {
    if (!gameState) return;
    const player = gameState.players.find((p) => p.id === playerId);
    if (!player) return;
    const isCredit = type === 'credit';
    const newBalance = isCredit ? player.balance + amount : player.balance - amount;
    if (newBalance < 0) { setSnackbar({ open: true, message: 'Insufficient funds', severity: 'error' }); return; }
    const updated: GameState = {
      ...gameState,
      players: gameState.players.map((p) => p.id === playerId ? { ...p, balance: newBalance } : p),
      transactions: [
        { id: Date.now().toString(), timestamp: Date.now(), amount, description, type, senderId: isCredit ? null : playerId, receiverId: isCredit ? playerId : null, playerId },
        ...gameState.transactions,
      ],
    };
    setGameState(updated);
    roomService.broadcastState(updated);
    setSnackbar({ open: true, message: `${isCredit ? '+' : '-'}${formatMoney(amount)} ${isCredit ? 'to' : 'from'} ${player.name}`, severity: 'success' });
  };

  // Transfer: player→player, player→bank, bank→player
  const handleTransfer = (senderId: string, receiverId: string, amount: number, description: string) => {
    if (!gameState) return;

    // Bank → Player (banker gives money)
    if (senderId === BANK_PLAYER_ID) {
      const receiver = gameState.players.find((p) => p.id === receiverId);
      if (!receiver) return;
      const updated: GameState = {
        ...gameState,
        players: gameState.players.map((p) => p.id === receiverId ? { ...p, balance: p.balance + amount } : p),
        transactions: [
          { id: Date.now().toString(), timestamp: Date.now(), amount, description, type: 'credit', senderId: null, receiverId, playerId: receiverId },
          ...gameState.transactions,
        ],
      };
      setGameState(updated); roomService.broadcastState(updated);
      setSnackbar({ open: true, message: `Bank sent ${formatMoney(amount)} to ${receiver.name}`, severity: 'success' });
      return;
    }

    // Player → Bank (pay the bank)
    if (receiverId === BANK_PLAYER_ID) {
      const sender = gameState.players.find((p) => p.id === senderId);
      if (!sender || sender.balance < amount) { setSnackbar({ open: true, message: 'Insufficient funds', severity: 'error' }); return; }
      const updated: GameState = {
        ...gameState,
        players: gameState.players.map((p) => p.id === senderId ? { ...p, balance: p.balance - amount } : p),
        transactions: [
          { id: Date.now().toString(), timestamp: Date.now(), amount, description, type: 'debit', senderId, receiverId: null, playerId: senderId },
          ...gameState.transactions,
        ],
      };
      setGameState(updated); roomService.broadcastState(updated);
      setSnackbar({ open: true, message: `${sender.name} paid ${formatMoney(amount)} to Bank`, severity: 'success' });
      return;
    }

    // Player → Player
    const sender = gameState.players.find((p) => p.id === senderId);
    if (!sender || sender.balance < amount) { setSnackbar({ open: true, message: 'Insufficient funds', severity: 'error' }); return; }
    const receiver = gameState.players.find((p) => p.id === receiverId);
    const updated: GameState = {
      ...gameState,
      players: gameState.players.map((p) => {
        if (p.id === senderId) return { ...p, balance: p.balance - amount };
        if (p.id === receiverId) return { ...p, balance: p.balance + amount };
        return p;
      }),
      transactions: [
        { id: Date.now().toString(), timestamp: Date.now(), amount, description, type: 'transfer', senderId, receiverId, playerId: senderId },
        ...gameState.transactions,
      ],
    };
    setGameState(updated); roomService.broadcastState(updated);
    setSnackbar({ open: true, message: `Sent ${formatMoney(amount)} from ${sender.name} to ${receiver?.name}`, severity: 'success' });
  };

  const handleRemovePlayer = (playerId: string) => {
    if (!gameState) return;
    const updated = { ...gameState, players: gameState.players.filter((p) => p.id !== playerId) };
    setGameState(updated); roomService.broadcastState(updated);
    if (selectedPlayerId === playerId) setSelectedPlayerId(null);
  };

  const handleExit = () => {
    localStorage.removeItem('monopay_game_state');
    localStorage.removeItem('monopay_current_player');
    roomService.cleanup();
    navigate('/');
  };

  const currentPlayer = gameState?.players.find((p) => p.peerId === roomService.getSelfId());
  const selectedPlayer = gameState?.players.find((p) => p.id === selectedPlayerId);

  if (!gameState) return null;

  return (
    <Layout title={gameState.roomName}>
      <Stack spacing={3} sx={{ pb: 2 }}>

        {/* Game info bar */}
        <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#FFFFFF', border: '1px solid #E8E0D4', borderRadius: 3 }}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Chip label={isHost ? 'BANKER' : 'PLAYER'} size="small" sx={{ height: 24, fontWeight: 800, fontSize: '0.65rem', bgcolor: isHost ? '#1565C0' : '#2E7D32', color: '#fff' }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>{gameState.roomId}</Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">{gameState.players.length} player{gameState.players.length !== 1 ? 's' : ''}</Typography>
              <IconButton size="small" onClick={handleExit} sx={{ color: '#C62828' }}><ExitIcon fontSize="small" /></IconButton>
            </Stack>
          </Stack>
        </Paper>

        {/* My Balance */}
        {currentPlayer && (
          <Paper elevation={0} sx={{ p: 3, textAlign: 'center', bgcolor: '#FFFFFF', border: '2px solid #E8E0D4', borderTop: `4px solid ${currentPlayer.color}`, borderRadius: 3 }}>
            <Typography variant="body2" sx={{ color: '#9E9E9E', fontWeight: 600, mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.7rem' }}>Your Balance</Typography>
            <AnimatedBalance balance={currentPlayer.balance} size="large" />
          </Paper>
        )}

        {/* Players */}
        <Box>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5, px: 0.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#333', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}>Players</Typography>
            {selectedPlayer && (
              <Chip label={`Selected: ${selectedPlayer.name}`} size="small" onDelete={() => setSelectedPlayerId(null)}
                sx={{ height: 24, bgcolor: `${selectedPlayer.color}15`, color: selectedPlayer.color, fontWeight: 600, border: `1px solid ${selectedPlayer.color}30` }} />
            )}
          </Stack>
          <Stack spacing={1}>
            {gameState.players.map((player) => (
              <PlayerCard key={player.id} player={player} isSelected={selectedPlayerId === player.id}
                isCurrentPlayer={player.peerId === roomService.getSelfId()}
                onTap={(id) => setSelectedPlayerId(id === selectedPlayerId ? null : id)} />
            ))}
            {gameState.players.length === 0 && (
              <Paper elevation={0} sx={{ p: 3, textAlign: 'center', bgcolor: '#FFFFFF', border: '2px dashed #E8E0D4', borderRadius: 3 }}>
                <Typography variant="body2" color="text.secondary">Waiting for players to join...</Typography>
              </Paper>
            )}
          </Stack>
        </Box>

        {/* MY ACTIONS — available to all players */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1565C0', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem', mb: 1.5, px: 0.5 }}>
            Your Actions
          </Typography>
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<SendIcon />}
              onClick={() => { setTransferDefaultFrom(currentPlayer?.id); setTransferDefaultTo(undefined); setTransferOpen(true); }}
              sx={{
                py: 2, borderRadius: 3, bgcolor: '#1565C0', color: '#fff', fontWeight: 700,
                boxShadow: '0 4px 16px rgba(21,101,192,0.3)',
                '&:hover': { bgcolor: '#0D47A1', boxShadow: '0 6px 20px rgba(21,101,192,0.4)' },
              }}
            >
              <Stack sx={{ alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 800, lineHeight: 1.2 }}>Send Money</Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.6rem' }}>to player or bank</Typography>
              </Stack>
            </Button>
            <Button
              variant="contained"
              fullWidth
              startIcon={<BankIcon />}
              onClick={() => { setTransferDefaultFrom(currentPlayer?.id); setTransferDefaultTo(BANK_PLAYER_ID); setTransferOpen(true); }}
              sx={{
                py: 2, borderRadius: 3, bgcolor: '#E65100', color: '#fff', fontWeight: 700,
                boxShadow: '0 4px 16px rgba(230,81,0,0.3)',
                '&:hover': { bgcolor: '#BF360C', boxShadow: '0 6px 20px rgba(230,81,0,0.4)' },
              }}
            >
              <Stack sx={{ alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 800, lineHeight: 1.2 }}>Pay Bank</Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.6rem' }}>send to the bank</Typography>
              </Stack>
            </Button>
          </Stack>
        </Box>

        {/* BANKER CONTROLS — only visible to host */}
        {isHost && (
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5, px: 0.5 }}>
              <BankIcon sx={{ color: '#1565C0', fontSize: 18 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1565C0', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}>
                Banker Controls
              </Typography>
              {!selectedPlayer && (
                <Typography variant="caption" color="text.secondary" sx={{ ml: 1, fontSize: '0.65rem' }}>(select a player first)</Typography>
              )}
            </Stack>

            {/* Electronic Trading Unit Emulator */}
            <Box sx={{ mb: 3 }}>
              <TradingUnit />
            </Box>

            {/* Banker can give money (credits) */}
            <Typography variant="caption" sx={{ color: '#2E7D32', fontWeight: 600, px: 0.5, fontSize: '0.65rem' }}>Give Money</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mb: 1.5, mt: 0.5 }}>
              {[
                { label: 'Pass GO', icon: <PassGoIcon />, amount: 2_000_000, desc: 'Pass GO - Collect $2M', color: '#2E7D32', bg: '#E8F5E9' },
                { label: 'Rent', icon: <PayIcon />, amount: 500_000, desc: 'Rent Collection', color: '#0288D1', bg: '#E1F5FE' },
                { label: 'Stadium', icon: <StadiumIcon />, amount: 1_000_000, desc: 'Stadium Revenue', color: '#F9A825', bg: '#FFFDE7' },
              ].map((btn) => (
                <Button key={btn.label} variant="contained" fullWidth disabled={!selectedPlayer}
                  onClick={() => selectedPlayer && applyBankerAction(selectedPlayer.id, btn.amount, btn.desc, 'credit')}
                  sx={{ flexDirection: 'column', py: 1.5, px: 0.5, minHeight: 72, bgcolor: btn.bg, color: btn.color, borderRadius: 2, boxShadow: 'none', '&:hover': { bgcolor: btn.color, color: '#fff', transform: 'translateY(-1px)' }, '&.Mui-disabled': { bgcolor: '#F5F5F5', color: '#BDBDBD' }, transition: 'all 0.15s ease' }}
                >
                  <Box sx={{ color: 'inherit', mb: 0.5 }}>{btn.icon}</Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.65rem', lineHeight: 1.2, color: 'inherit' }}>{btn.label}</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.6rem', fontFamily: '"Bungee", cursive', color: 'inherit', lineHeight: 1 }}>+{formatMoney(btn.amount)}</Typography>
                </Button>
              ))}
            </Box>

            {/* Banker can charge money (debits) */}
            <Typography variant="caption" sx={{ color: '#C62828', fontWeight: 600, px: 0.5, fontSize: '0.65rem' }}>Charge Money</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mb: 1.5, mt: 0.5 }}>
              {[
                { label: 'Industry', icon: <FactoryIcon />, amount: 2_000_000, desc: 'Industrial Building', color: '#1565C0', bg: '#E3F2FD' },
                { label: 'Income Tax', icon: <TaxIcon />, amount: 2_000_000, desc: 'Income Tax', color: '#C62828', bg: '#FFEBEE' },
                { label: 'Custom', icon: <AddIcon />, action: 'custom-debit', color: '#757575', bg: '#F5F5F5' },
              ].map((btn) => (
                <Button key={btn.label} variant="contained" fullWidth disabled={!selectedPlayer}
                  onClick={() => {
                    if (!selectedPlayer) return;
                    if ('action' in btn && btn.action === 'custom-debit') { setCustomType('debit'); setCustomOpen(true); }
                    else if ('amount' in btn) applyBankerAction(selectedPlayer.id, (btn as { amount: number }).amount, (btn as { desc: string }).desc, 'debit');
                  }}
                  sx={{ flexDirection: 'column', py: 1.5, px: 0.5, minHeight: 72, bgcolor: btn.bg, color: btn.color, borderRadius: 2, boxShadow: 'none', '&:hover': { bgcolor: btn.color, color: '#fff', transform: 'translateY(-1px)' }, '&.Mui-disabled': { bgcolor: '#F5F5F5', color: '#BDBDBD' }, transition: 'all 0.15s ease' }}
                >
                  <Box sx={{ color: 'inherit', mb: 0.5 }}>{btn.icon}</Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.65rem', lineHeight: 1.2, color: 'inherit' }}>{btn.label}</Typography>
                  {'amount' in btn && (
                    <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.6rem', fontFamily: '"Bungee", cursive', color: 'inherit', lineHeight: 1 }}>-{formatMoney((btn as { amount: number }).amount)}</Typography>
                  )}
                </Button>
              ))}
            </Box>

            {/* Banker can send money via transfer dialog (Bank→Player) */}
            <Button variant="outlined" fullWidth disabled={!selectedPlayer}
              onClick={() => { setTransferDefaultFrom(BANK_PLAYER_ID); setTransferDefaultTo(selectedPlayer?.id); setTransferOpen(true); }}
              sx={{ py: 1.5, borderRadius: 2, borderColor: '#1565C0', color: '#1565C0', fontWeight: 600, '&:hover': { borderColor: '#0D47A1', bgcolor: '#E3F2FD' } }}
            >
              Send Custom Amount from Bank
            </Button>

            {/* Remove player */}
            {selectedPlayer && (
              <Button variant="outlined" color="error" startIcon={<RemoveIcon />} fullWidth
                onClick={() => handleRemovePlayer(selectedPlayer.id)}
                sx={{ mt: 1, borderColor: '#C62828', color: '#C62828', borderRadius: 2 }}>
                Remove {selectedPlayer.name}
              </Button>
            )}
          </Box>
        )}

        {/* Recent Transactions */}
        {gameState.transactions.length > 0 && (
          <Box>
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5, px: 0.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#333', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}>Recent Activity</Typography>
              <Button size="small" onClick={() => navigate('/transactions')} sx={{ color: '#2E7D32', fontWeight: 600, fontSize: '0.7rem' }}>View All</Button>
            </Stack>
            <Stack spacing={1}>
              {gameState.transactions.slice(0, 5).map((tx) => {
                const player = gameState.players.find((p) => p.id === tx.playerId);
                const sender = tx.senderId ? gameState.players.find((p) => p.id === tx.senderId) : null;
                const receiver = tx.receiverId ? gameState.players.find((p) => p.id === tx.receiverId) : null;
                const isCredit = tx.type === 'credit' || (tx.type === 'transfer' && tx.playerId === tx.receiverId);
                return (
                  <Paper key={tx.id} elevation={0} sx={{ p: 1.5, bgcolor: '#FFFFFF', border: '1px solid #E8E0D4', borderLeft: `3px solid ${isCredit ? '#2E7D32' : '#C62828'}`, borderRadius: 2 }}>
                    <Stack direction="row" sx={{ alignItems: 'center' }}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.description}</Typography>
                        <Typography variant="caption" sx={{ color: '#9E9E9E', fontSize: '0.65rem' }}>
                          {player?.name} {tx.type === 'transfer' ? (isCredit ? `from ${sender?.name}` : `to ${receiver?.name}`) : ''}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontWeight: 800, color: isCredit ? '#2E7D32' : '#C62828', fontFamily: '"Bungee", cursive', fontSize: '0.85rem' }}>
                        {isCredit ? '+' : '-'}{formatMoney(tx.amount)}
                      </Typography>
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
          </Box>
        )}
      </Stack>

      <TransferDialog open={transferOpen} onClose={() => setTransferOpen(false)} onConfirm={handleTransfer}
        players={gameState.players} defaultFrom={transferDefaultFrom} defaultTo={transferDefaultTo} isHost={isHost} />

      {selectedPlayer && (
        <CustomAmountDialog open={customOpen} onClose={() => setCustomOpen(false)}
          onConfirm={(amount, description, type) => applyBankerAction(selectedPlayer.id, amount, description, type)}
          playerName={selectedPlayer.name} defaultType={customType} />
      )}

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} sx={{ borderRadius: 2 }}>{snackbar.message}</Alert>
      </Snackbar>
    </Layout>
  );
}
