export interface ClassDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  hp: number;
  energy: number;
  gold: number;
  deck: { id: string; count: number }[];
}

export const CLASSES: ClassDef[] = [
  {
    id: 'warrior',
    name: 'Воин',
    description: 'Сбалансированный боец. Удары, защита и контроль.',
    icon: '⚔',
    hp: 85,
    energy: 3,
    gold: 99,
    deck: [
      { id: 'strike', count: 4 },
      { id: 'defend', count: 4 },
      { id: 'bash', count: 1 },
      { id: 'iron_wave', count: 1 },
    ],
  },
  {
    id: 'rogue',
    name: 'Плут',
    description: 'Быстрый добор и комбо. Мало брони — много карт.',
    icon: '🗡',
    hp: 75,
    energy: 3,
    gold: 99,
    deck: [
      { id: 'strike', count: 5 },
      { id: 'defend', count: 3 },
      { id: 'shrug_it_off', count: 2 },
      { id: 'battle_trance', count: 1 },
    ],
  },
  {
    id: 'guardian',
    name: 'Страж',
    description: 'Толстая броня и сила. Медленно, но верно.',
    icon: '🛡',
    hp: 90,
    energy: 3,
    gold: 99,
    deck: [
      { id: 'strike', count: 3 },
      { id: 'defend', count: 5 },
      { id: 'true_grit', count: 1 },
      { id: 'inflame', count: 1 },
    ],
  },
];

export function getClass(id: string): ClassDef {
  return CLASSES.find((c) => c.id === id) ?? CLASSES[0];
}
