export interface Player {
  id: string;
  name: string;
  balance: number;
  isConnected: boolean;
  color: string;
  peerId: string;
}

export interface Transaction {
  id: string;
  timestamp: number;
  amount: number;
  description: string;
  type: TransactionType;
  senderId: string | null;
  receiverId: string | null;
  playerId: string;
}

export type TransactionType = 'credit' | 'debit' | 'transfer';

export type GameStatus = 'lobby' | 'playing' | 'ended';

export interface GameState {
  roomId: string;
  roomName: string;
  startingBalance: number;
  maxPlayers: number;
  status: GameStatus;
  players: Player[];
  transactions: Transaction[];
  hostPeerId: string;
}

export interface CreateGameConfig {
  roomName: string;
  startingBalance: number;
  maxPlayers: number;
}

export interface JoinGameConfig {
  roomCode: string;
  playerName: string;
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface QuickActionPreset {
  label: string;
  iconName: string;
  amount: number;
  type: TransactionType;
  description: string;
}

export const PROPERTY_COLORS = {
  darkBlue: '#1A237E',
  green: '#1B5E20',
  lightBlue: '#01579B',
  purple: '#4A148C',
  orange: '#BF360C',
  red: '#B71C1C',
  yellow: '#F57F17',
  brown: '#3E2723',
} as const;

export const PLAYER_COLORS = [
  '#C62828', '#1565C0', '#2E7D32', '#E65100',
  '#6A1B9A', '#00838F', '#AD1457', '#4E342E',
];

export const DISTRICT_STRIPS = [
  PROPERTY_COLORS.darkBlue,
  PROPERTY_COLORS.green,
  PROPERTY_COLORS.lightBlue,
  PROPERTY_COLORS.purple,
  PROPERTY_COLORS.orange,
  PROPERTY_COLORS.red,
  PROPERTY_COLORS.yellow,
  PROPERTY_COLORS.brown,
];

export const DEFAULT_STARTING_BALANCE = 36_700_000;

export const DEFAULT_QUICK_ACTIONS: QuickActionPreset[] = [
  { label: 'Pass GO', iconName: 'redeem', amount: 2_000_000, type: 'credit', description: 'Pass GO - Collect $2M' },
  { label: 'Collect Rent', iconName: 'apartment', amount: 500_000, type: 'credit', description: 'Rent Collection' },
  { label: 'Pay Rent', iconName: 'payments', amount: 500_000, type: 'debit', description: 'Rent Payment' },
  { label: 'Build Residential', iconName: 'home_work', amount: 1_000_000, type: 'debit', description: 'Residential Building' },
  { label: 'Build Industrial', iconName: 'factory', amount: 2_000_000, type: 'debit', description: 'Industrial Building' },
  { label: 'Stadium Bonus', iconName: 'stadium', amount: 1_000_000, type: 'credit', description: 'Stadium Revenue' },
  { label: 'Luxury Tax', iconName: 'diamond', amount: 1_000_000, type: 'debit', description: 'Luxury Tax' },
  { label: 'Income Tax', iconName: 'receipt_long', amount: 2_000_000, type: 'debit', description: 'Income Tax' },
  { label: 'Remove Hazard', iconName: 'cleaning_services', amount: 1_500_000, type: 'debit', description: 'Hazard Removal' },
  { label: 'Auction', iconName: 'gavel', amount: 0, type: 'credit', description: 'Auction Proceeds' },
];
