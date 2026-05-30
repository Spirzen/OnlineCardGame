export const LOCALE = {
  MENU_TITLE: 'Тени Шпиля',
  MENU_SUBTITLE: 'Восходи. Сражайся. Покори вершину.',
  MENU_TAGLINE: 'Эпический карточный рогалик',
  MENU_NEW_RUN: 'Новый забег',
  MENU_STATS: 'Статистика сессии',

  STAT_RUNS: 'Забегов',
  STAT_WINS: 'Побед',
  STAT_BEST_FLOOR: 'Лучший этаж',
  STAT_KILLS: 'Убийств',

  MAP_FLOOR: 'Этаж',

  NODE_LABELS: {
    combat: 'Бой',
    elite: 'Элита',
    boss: 'Босс',
    rest: 'Костёр',
    shop: 'Лавка',
    treasure: 'Сундук',
    event: 'Событие',
  } as Record<string, string>,

  COMBAT_END_TURN: 'Конец хода',
  COMBAT_TURN: 'Ход',
  COMBAT_DRAW: 'Колода',
  COMBAT_DISCARD: 'Сброс',
  COMBAT_VICTORY: 'ПОБЕДА!',
  COMBAT_DEFEAT: 'ПАДЕНИЕ...',
  COMBAT_STARTED: 'Бой начался!',
  COMBAT_YOUR_TURN: '— ваш ход.',
  COMBAT_END_YOUR_TURN: 'Конец вашего хода.',
  COMBAT_HAND_FULL: 'Рука полна — карта сгорела!',
  COMBAT_DEFEATED: 'Вы погибли...',
  COMBAT_SELECT_TARGET: 'Выберите цель',

  INTENT_LABELS: {
    attack: 'Атака',
    block: 'Защита',
    buff: 'Усиление',
    debuff: 'Ослабление',
    special: 'Особое',
    block_attack: 'Защ.+Атк',
    unknown: '???',
  } as Record<string, string>,

  REWARD_VICTORY: 'Победа!',
  REWARD_CHOOSE: 'Выберите карту для колоды:',
  REWARD_SKIP: 'Пропустить',

  SHOP_TITLE: 'Лавка торговца',
  SHOP_CARDS: 'Карты (50 з.)',
  SHOP_RELICS: 'Реликвии (150 з.)',
  SHOP_REMOVE: 'Удалить карту (75 з.)',
  SHOP_LEAVE: 'Уйти',

  REST_TITLE: 'Привал',
  REST_HEAL: 'Отдых (+25% HP)',
  REST_SMITH: 'Кузница (скоро)',

  EVENT_TITLE: 'Событие',
  EVENT_CONTINUE: 'Продолжить',

  EVENTS: [
    'Вы нашли светящийся источник. +15 здоровья.',
    'Странствующий торговец дарит 30 золота.',
    'Рискованная тропа: −8 здоровья, +50 золота.',
    'Древний алтарь укрепляет тело. +1 макс. HP.',
    'Ловушка! −12 здоровья.',
  ],

  TREASURE_TITLE: 'Сундук с сокровищами',
  TREASURE_CHOOSE: 'Выберите реликвию:',

  GAME_OVER: 'Поражение',
  VICTORY: 'Победа!',
  GAME_OVER_FLOOR: 'Достигнут этаж',
  GAME_OVER_KILLS: 'Убийств',
  BACK_TO_MENU: 'В меню',
};
