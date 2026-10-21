'use client';

import { PlacedSticker } from './types';

export type BoothSession = {
  templateId: string;
  photos: string[];
  filterId?: string;
  customCaption?: string;
  showDate?: boolean;
  stickers?: PlacedSticker[];
  mirrored?: boolean;
};

const SESSION_STORAGE_KEY = 'wstrip_booth_session';

export function saveBoothSession(session: BoothSession): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch (err) {
    console.warn('Failed to save booth session:', err);
  }
}

export function getBoothSession(): BoothSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as BoothSession;
  } catch (err) {
    console.warn('Failed to read booth session:', err);
    return null;
  }
}

export function clearBoothSession(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear booth session:', err);
  }
}

