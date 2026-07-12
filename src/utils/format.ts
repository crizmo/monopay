import type { Transaction } from '../types';

export function formatMoney(amount: number): string {
  if (amount >= 1_000_000) {
    const m = amount / 1_000_000;
    return m % 1 === 0 ? `$${m}M` : `$${m.toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    const k = amount / 1_000;
    return k % 1 === 0 ? `$${k}K` : `$${k.toFixed(1)}K`;
  }
  return `$${amount.toLocaleString()}`;
}

export function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) {
    const m = amount / 1_000_000;
    return `$${m % 1 === 0 ? m.toLocaleString() : m.toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    const k = amount / 1_000;
    return `$${k % 1 === 0 ? k.toLocaleString() : k.toFixed(1)}K`;
  }
  return `$${amount.toLocaleString()}`;
}

export function formatFullCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getTransactionColor(tx: Transaction): 'success' | 'error' | 'info' {
  if (tx.type === 'credit') return 'success';
  if (tx.type === 'debit') return 'error';
  if (tx.type === 'transfer') {
    return tx.playerId === tx.senderId ? 'error' : 'success';
  }
  return 'info';
}
