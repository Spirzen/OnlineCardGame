import type { Card } from './card';
import type { FxPayload } from './types';

export type CardFxAccent = 'physical' | 'fire' | 'ice' | 'lightning' | 'holy' | 'dark' | 'nature' | 'blood';

export function resolveCardFxAccent(card: Card): CardFxAccent {
  const id = card.id;
  const effects = [
    card.effect,
    card.effect2,
    ...(card.bonuses?.map((b) => b.id) ?? []),
  ].join(' ');

  if (/fire|burn|ignite|azhdaha|dragon|meteor/.test(id + effects)) return 'fire';
  if (/frost|ice|freeze|slow/.test(id + effects)) return 'ice';
  if (/thunder|lightning|storm|samrau|echo|chain/.test(id + effects)) return 'lightning';
  if (/heal|holy|homay|bless|light|spring|yanbika|bandage/.test(id + effects)) return 'holy';
  if (/ulem|curse|shulgen|poison|blood|vampir|leech|offering|reaper/.test(id + effects)) return 'blood';
  if (/dark|shadow|hex|silence|disarm/.test(id + effects)) return 'dark';
  if (/nature|steppe|planning|yanbirde|forest|regen|metallicize/.test(id + effects)) return 'nature';
  return 'physical';
}

export function resolveCardFxKind(card: Card): FxPayload['kind'] {
  const accent = resolveCardFxAccent(card);
  if (card.type === 'attack' || card.type === 'creature') {
    if (accent === 'fire') return 'fire';
    if (accent === 'ice') return 'ice';
    if (accent === 'lightning') return 'lightning';
    if (accent === 'blood') return 'blood';
    return 'slash';
  }
  if (card.type === 'block') return 'shield';
  if (card.type === 'buff') return accent === 'holy' ? 'holy' : 'buff';
  if (card.type === 'debuff') return 'debuff';
  if (card.type === 'draw') return 'spark';
  return 'spark';
}

export function enemyFxPosition(index: number, total: number): { x: string; y: string } {
  if (total <= 1) return { x: '50%', y: '38%' };
  const spread = Math.min(40, total * 14);
  const start = 50 - spread / 2;
  const step = total > 1 ? spread / (total - 1) : 0;
  return { x: `${start + index * step}%`, y: '38%' };
}
