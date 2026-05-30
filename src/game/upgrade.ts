import type { Card } from './card';

export function upgradeCard(card: Card): Card {
  const c = card.copy();
  if (c.upgraded) return c;

  if (c.type === 'attack' || c.type === 'creature') {
    c.value += 3;
  } else if (c.type === 'block') {
    c.value += 4;
  } else if (c.block > 0) {
    c.block += 4;
  } else if (c.draw > 0) {
    c.draw += 1;
  } else if (c.cost > 0) {
    c.cost -= 1;
  } else {
    c.value += 1;
  }

  c.upgraded = true;
  if (!c.name.endsWith('+')) c.name += '+';
  c.description = `[Улучшено] ${c.description}`;
  return c;
}

export function getUpgradeableDeckCards(cards: Card[]): Card[] {
  const seen = new Set<string>();
  const result: Card[] = [];
  for (const c of cards) {
    const key = `${c.id}:${c.name}:${c.upgraded}`;
    if (seen.has(key) || c.upgraded) continue;
    seen.add(key);
    result.push(c);
  }
  return result;
}
