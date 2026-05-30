import type { Player } from './player';
import { rngChance } from './rng';

export interface EventChoice {
  text: string;
  apply: (player: Player) => string;
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  choices: EventChoice[];
}

export const GAME_EVENTS: GameEvent[] = [
  {
    id: 'shrine',
    title: 'Светящийся источник',
    description: 'Перед вами пульсирующий кристалл. Что делать?',
    choices: [
      {
        text: 'Прикоснуться (+15 HP)',
        apply: (p) => {
          p.heal(15);
          return 'Энергия источника исцеляет раны (+15 HP).';
        },
      },
      {
        text: 'Разбить (30 золота, −5 HP)',
        apply: (p) => {
          p.takeDamage(5);
          p.gold += 30;
          return 'Внутри осколки золота. Вы порезались (−5 HP, +30 з.).';
        },
      },
      {
        text: 'Уйти',
        apply: () => 'Вы решаете не рисковать.',
      },
    ],
  },
  {
    id: 'merchant',
    title: 'Странствующий торговец',
    description: 'Старый знакомый машет вам рукой.',
    choices: [
      {
        text: 'Принять дар (+30 золота)',
        apply: (p) => {
          p.gold += 30;
          return 'Торговец щедро одаривает вас (+30 з.).';
        },
      },
      {
        text: 'Купить зелье (+8 HP, −20 з.)',
        apply: (p) => {
          if (p.gold < 20) return 'Недостаточно золота.';
          p.gold -= 20;
          p.heal(8);
          return 'Зелье освежает (+8 HP, −20 з.).';
        },
      },
    ],
  },
  {
    id: 'path',
    title: 'Развилка',
    description: 'Узкая тропа через пропасть. Слышен вой ветра.',
    choices: [
      {
        text: 'Рискнуть (+50 з., −8 HP)',
        apply: (p) => {
          p.takeDamage(8);
          p.gold += 50;
          return 'Сокровища в нише! (−8 HP, +50 з.)';
        },
      },
      {
        text: 'Обойти',
        apply: () => 'Долгий, но безопасный путь.',
      },
    ],
  },
  {
    id: 'altar',
    title: 'Древний алтарь',
    description: 'Руны на камне едва светятся.',
    choices: [
      {
        text: 'Жертва крови (+1 макс. HP)',
        apply: (p) => {
          p.maxHp += 1;
          p.hp += 1;
          return 'Тело укреплено (+1 макс. HP).';
        },
      },
      {
        text: 'Молитва (+1 энергия навсегда)',
        apply: (p) => {
          p.maxEnergy += 1;
          return 'Боги благоволят (+1 макс. энергия).';
        },
      },
    ],
  },
  {
    id: 'trap',
    title: 'Подозрительный пол',
    description: 'Плитки выглядят… не так.',
    choices: [
      {
        text: 'Настороженно пройти (−6 HP)',
        apply: (p) => {
          p.takeDamage(6);
          return 'Стрелы! (−6 HP)';
        },
      },
      {
        text: 'Перепрыгнуть (50% −12 HP)',
        apply: (p) => {
          if (rngChance(0.5)) {
            p.takeDamage(12);
            return 'Провал! Шипы (−12 HP).';
          }
          return 'Чисто! Вы мастерски перепрыгнули.';
        },
      },
    ],
  },
];
