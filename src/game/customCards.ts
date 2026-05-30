import type { CardData } from './types';

const CUSTOM_KEY = 'teni_shpilya_custom_cards';

export function loadCustomCards(): CardData[] {
  try {
    const raw = localStorage.getItem(CUSTOM_KEY);
    if (raw) return JSON.parse(raw) as CardData[];
  } catch {
    /* ignore */
  }
  return [];
}

export function saveCustomCards(cards: CardData[]) {
  try {
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(cards));
  } catch {
    /* ignore */
  }
}

export function addCustomCard(data: Partial<CardData>): CardData {
  const card: CardData = {
    id: data.id ?? `custom_${Date.now()}`,
    name: data.name ?? 'Новая карта',
    type: data.type ?? 'attack',
    cost: data.cost ?? 1,
    value: data.value ?? 6,
    description: data.description ?? 'Пользовательская карта.',
    rarity: 'custom',
    custom: true,
  };
  const cards = loadCustomCards();
  cards.push(card);
  saveCustomCards(cards);
  return card;
}

export function deleteCustomCard(id: string) {
  saveCustomCards(loadCustomCards().filter((c) => c.id !== id));
}
