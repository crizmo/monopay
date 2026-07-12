import { v4 as uuidv4 } from 'uuid';
import type { GameState, Player, Transaction, TransactionType, CreateGameConfig } from '../types';
import { PLAYER_COLORS } from '../types';

export function createGameState(config: CreateGameConfig, hostPeerId: string): GameState {
  return {
    roomId: uuidv4().slice(0, 6).toUpperCase(),
    roomName: config.roomName,
    startingBalance: config.startingBalance,
    maxPlayers: config.maxPlayers,
    status: 'lobby',
    players: [],
    transactions: [],
    hostPeerId,
  };
}

export function addPlayer(
  state: GameState,
  name: string,
  peerId: string
): { state: GameState; player: Player } | { error: string } {
  const existingPlayer = state.players.find((p) => p.name === name);
  if (existingPlayer) {
    const updatedPlayers = state.players.map((p) =>
      p.name === name ? { ...p, peerId, isConnected: true } : p
    );
    return {
      state: {
        ...state,
        players: updatedPlayers,
      },
      player: { ...existingPlayer, peerId, isConnected: true },
    };
  }

  if (state.players.length >= state.maxPlayers) {
    return { error: 'Game is full' };
  }
  if (state.status !== 'lobby') {
    return { error: 'Game already started' };
  }

  const colorIndex = state.players.length % PLAYER_COLORS.length;
  const player: Player = {
    id: uuidv4(),
    name,
    balance: state.startingBalance,
    isConnected: true,
    color: PLAYER_COLORS[colorIndex],
    peerId,
  };

  return {
    state: {
      ...state,
      players: [...state.players, player],
    },
    player,
  };
}

export function removePlayer(state: GameState, playerId: string): GameState {
  return {
    ...state,
    players: state.players.filter((p) => p.id !== playerId),
  };
}

export function setPlayerConnection(
  state: GameState,
  peerId: string,
  isConnected: boolean
): GameState {
  return {
    ...state,
    players: state.players.map((p) =>
      p.peerId === peerId ? { ...p, isConnected } : p
    ),
  };
}

export function updateBalance(
  state: GameState,
  playerId: string,
  amount: number,
  description: string,
  type: TransactionType
): { state: GameState; transaction: Transaction } {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) throw new Error('Player not found');

  const newBalance = player.balance + amount;
  if (newBalance < 0) throw new Error('Insufficient funds');

  const transaction: Transaction = {
    id: uuidv4(),
    timestamp: Date.now(),
    amount: Math.abs(amount),
    description,
    type,
    senderId: type === 'debit' ? playerId : type === 'transfer' ? playerId : null,
    receiverId: type === 'credit' ? playerId : type === 'transfer' ? playerId : null,
    playerId,
  };

  return {
    state: {
      ...state,
      players: state.players.map((p) =>
        p.id === playerId ? { ...p, balance: newBalance } : p
      ),
      transactions: [transaction, ...state.transactions],
    },
    transaction,
  };
}

export function transferFunds(
  state: GameState,
  senderId: string,
  receiverId: string,
  amount: number,
  description: string
): { state: GameState; transactions: Transaction[] } {
  if (amount <= 0) throw new Error('Amount must be positive');

  const sender = state.players.find((p) => p.id === senderId);
  const receiver = state.players.find((p) => p.id === receiverId);
  if (!sender) throw new Error('Sender not found');
  if (!receiver) throw new Error('Receiver not found');
  if (sender.balance < amount) throw new Error('Insufficient funds');

  const senderTx: Transaction = {
    id: uuidv4(),
    timestamp: Date.now(),
    amount,
    description,
    type: 'transfer',
    senderId,
    receiverId,
    playerId: senderId,
  };

  const receiverTx: Transaction = {
    id: uuidv4(),
    timestamp: Date.now(),
    amount,
    description,
    type: 'transfer',
    senderId,
    receiverId,
    playerId: receiverId,
  };

  const newState: GameState = {
    ...state,
    players: state.players.map((p) => {
      if (p.id === senderId) return { ...p, balance: p.balance - amount };
      if (p.id === receiverId) return { ...p, balance: p.balance + amount };
      return p;
    }),
    transactions: [senderTx, receiverTx, ...state.transactions],
  };

  return { state: newState, transactions: [senderTx, receiverTx] };
}

export function quickBankAction(
  state: GameState,
  playerId: string,
  amount: number,
  description: string,
  type: TransactionType
): { state: GameState; transaction: Transaction } {
  return updateBalance(state, playerId, type === 'credit' ? amount : -amount, description, type);
}

export function startGame(state: GameState): GameState {
  return { ...state, status: 'playing' };
}
