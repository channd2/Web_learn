import { PMSchedule, PMFrequencyType } from '@/types';
import { differenceInDays, format, parseISO } from 'date-fns';

export function formatDate(date: string | Date | undefined): string {
  if (!date) return '—';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'dd MMM yyyy');
  } catch {
    return '—';
  }
}

export function formatDateTime(date: string | Date | undefined): string {
  if (!date) return '—';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'dd MMM yyyy HH:mm');
  } catch {
    return '—';
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(amount);
}

export function formatKm(km: number | undefined): string {
  if (km === undefined || km === null) return '—';
  return `${km.toLocaleString()} km`;
}

export function calcEquipmentAge(dateOfBirth: string | undefined): string {
  if (!dateOfBirth) return '—';
  const birth = parseISO(dateOfBirth);
  const now = new Date();
  const years = Math.floor(differenceInDays(now, birth) / 365);
  const months = Math.floor((differenceInDays(now, birth) % 365) / 30);
  if (years > 0) return `${years}y ${months}m`;
  return `${months} months`;
}

export type PMStatusLabel = 'OVERDUE' | 'DUE_SOON' | 'UPCOMING' | 'OK';

export interface PMProgress {
  daysUntilDue?: number;
  kmUntilDue?: number;
  percentRemaining: number;
  statusLabel: PMStatusLabel;
}

export function calcPMProgress(pm: PMSchedule, currentKm?: number): PMProgress {
  let percentByTime: number | null = null;
  let percentByKm: number | null = null;
  let daysUntilDue: number | undefined;
  let kmUntilDue: number | undefined;

  const today = new Date();

  // Time-based calculation
  if ((pm.frequency_type === 'TIME' || pm.frequency_type === 'BOTH') && pm.next_due_date) {
    const nextDue = parseISO(pm.next_due_date);
    daysUntilDue = differenceInDays(nextDue, today);
    const freqDays = pm.frequency_days || 30;
    percentByTime = (daysUntilDue / freqDays) * 100;
  }

  // Meter-based calculation
  if ((pm.frequency_type === 'METER' || pm.frequency_type === 'BOTH') && pm.next_due_km !== undefined && pm.next_due_km !== null) {
    const curr = currentKm ?? (pm.asset?.meter_reading || 0);
    kmUntilDue = pm.next_due_km - curr;
    const freqKm = pm.frequency_km || 5000;
    percentByKm = (kmUntilDue / freqKm) * 100;
  }

  // Take the minimum (worst case)
  let percentRemaining: number;
  if (percentByTime !== null && percentByKm !== null) {
    percentRemaining = Math.min(percentByTime, percentByKm);
  } else if (percentByTime !== null) {
    percentRemaining = percentByTime;
  } else if (percentByKm !== null) {
    percentRemaining = percentByKm;
  } else {
    percentRemaining = 100;
  }

  percentRemaining = Math.max(-999, Math.min(100, percentRemaining));

  let statusLabel: PMStatusLabel;
  if (percentRemaining <= 0) statusLabel = 'OVERDUE';
  else if (percentRemaining <= 20) statusLabel = 'DUE_SOON';
  else if (percentRemaining <= 50) statusLabel = 'UPCOMING';
  else statusLabel = 'OK';

  return { daysUntilDue, kmUntilDue, percentRemaining, statusLabel };
}

export function generateWONumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `WO-${year}-${random}`;
}

export function generateAssetNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `AST-${year}-${random}`;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
