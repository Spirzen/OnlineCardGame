export type ClickerUpgradeTier = 'starter' | 'mid' | 'endgame';

export interface ClickerUpgradeEffect {
  click?: number;
  clickPct?: number;
  auto?: number;
  autoPct?: number;
  ampPct?: number;
  critPct?: number;
  critMult?: number;
  hp?: number;
  hpPct?: number;
  regen?: number;
  goldPct?: number;
  comboPct?: number;
}

export interface ClickerUpgradeDef {
  id: string;
  tier: ClickerUpgradeTier;
  name: string;
  description: string;
  icon: string;
  baseCost: number;
  costScale: number;
  maxLevel: number;
  effect: ClickerUpgradeEffect;
}

export interface ClickerBonuses {
  click: number;
  clickPct: number;
  auto: number;
  autoPct: number;
  ampPct: number;
  critPct: number;
  critMult: number;
  hp: number;
  hpPct: number;
  regen: number;
  goldPct: number;
  comboPct: number;
}

export function emptyBonuses(): ClickerBonuses {
  return {
    click: 0,
    clickPct: 0,
    auto: 0,
    autoPct: 0,
    ampPct: 0,
    critPct: 0,
    critMult: 2.5,
    hp: 0,
    hpPct: 0,
    regen: 0,
    goldPct: 0,
    comboPct: 0,
  };
}

function addEffect(b: ClickerBonuses, e: ClickerUpgradeEffect, mult = 1) {
  if (e.click) b.click += e.click * mult;
  if (e.clickPct) b.clickPct += e.clickPct * mult;
  if (e.auto) b.auto += e.auto * mult;
  if (e.autoPct) b.autoPct += e.autoPct * mult;
  if (e.ampPct) b.ampPct += e.ampPct * mult;
  if (e.critPct) b.critPct += e.critPct * mult;
  if (e.critMult) b.critMult += e.critMult * mult;
  if (e.hp) b.hp += e.hp * mult;
  if (e.hpPct) b.hpPct += e.hpPct * mult;
  if (e.regen) b.regen += e.regen * mult;
  if (e.goldPct) b.goldPct += e.goldPct * mult;
  if (e.comboPct) b.comboPct += e.comboPct * mult;
}

/** 3 стартовых + 10 средних + 25 эндгейм — всего 38 даров. */
export const CLICKER_UPGRADES: ClickerUpgradeDef[] = [
  {
    id: 'starter_blade',
    tier: 'starter',
    name: 'Каменный нож',
    description: 'Первый клинок на тропе — как у юного Урала',
    icon: 'Н',
    baseCost: 12,
    costScale: 1,
    maxLevel: 1,
    effect: { click: 2 },
  },
  {
    id: 'starter_spirit',
    tier: 'starter',
    name: 'Шёпот степи',
    description: 'Духи бьют слабо, но без устали',
    icon: 'Ш',
    baseCost: 18,
    costScale: 1,
    maxLevel: 1,
    effect: { auto: 0.6 },
  },
  {
    id: 'starter_oath',
    tier: 'starter',
    name: 'Клятва аула',
    description: 'Обещание вернуться живым',
    icon: 'К',
    baseCost: 25,
    costScale: 1,
    maxLevel: 1,
    effect: { hp: 30 },
  },
  {
    id: 'mid_iron_sword',
    tier: 'mid',
    name: 'Железный клинок',
    description: 'Кузнец у привала закалил сталь',
    icon: 'Ж',
    baseCost: 100,
    costScale: 1,
    maxLevel: 1,
    effect: { click: 4 },
  },
  {
    id: 'mid_wolf_pack',
    tier: 'mid',
    name: 'Стая ялмаузов',
    description: 'Они кружат врага — не вы, но помогают',
    icon: 'Я',
    baseCost: 130,
    costScale: 1,
    maxLevel: 1,
    effect: { auto: 1.8 },
  },
  {
    id: 'mid_herbs',
    tier: 'mid',
    name: 'Мешок трав',
    description: 'Янбика собирала такие у порога юрты',
    icon: 'Т',
    baseCost: 150,
    costScale: 1,
    maxLevel: 1,
    effect: { regen: 0.9 },
  },
  {
    id: 'mid_blood',
    tier: 'mid',
    name: 'Кровь рода',
    description: 'Не из чаши Шульгена — из земли предков',
    icon: 'Р',
    baseCost: 180,
    costScale: 1,
    maxLevel: 1,
    effect: { hp: 55 },
  },
  {
    id: 'mid_thunder',
    tier: 'mid',
    name: 'Гром степи',
    description: 'Удар, что сэсэн запишет одной строкой',
    icon: 'Г',
    baseCost: 220,
    costScale: 1,
    maxLevel: 1,
    effect: { critPct: 0.05 },
  },
  {
    id: 'mid_spring',
    tier: 'mid',
    name: 'Капля родника',
    description: 'Вода Яншишмы, разбавленная ручьём',
    icon: 'В',
    baseCost: 260,
    costScale: 1,
    maxLevel: 1,
    effect: { ampPct: 0.1 },
  },
  {
    id: 'mid_luck',
    tier: 'mid',
    name: 'Монета кочевника',
    description: 'Щедрость степи к упрямым',
    icon: 'М',
    baseCost: 300,
    costScale: 1,
    maxLevel: 1,
    effect: { goldPct: 0.2 },
  },
  {
    id: 'mid_rage',
    tier: 'mid',
    name: 'Ярость батыра',
    description: 'Когда брат звал на тёмную сторону',
    icon: 'Б',
    baseCost: 340,
    costScale: 1,
    maxLevel: 1,
    effect: { click: 9 },
  },
  {
    id: 'mid_echo',
    tier: 'mid',
    name: 'Эхо гор',
    description: 'Уральские скалы отвечают ударом на удар',
    icon: 'Э',
    baseCost: 380,
    costScale: 1,
    maxLevel: 1,
    effect: { auto: 3.5 },
  },
  {
    id: 'mid_wind',
    tier: 'mid',
    name: 'Ветер степи',
    description: 'Комбо крепнет, как песня у костра',
    icon: 'П',
    baseCost: 450,
    costScale: 1,
    maxLevel: 1,
    effect: { comboPct: 0.1 },
  },
  {
    id: 'mid_oath_brothers',
    tier: 'mid',
    name: 'Клятва братьев',
    description: 'Идти вместе — даже в бесконечном походе',
    icon: 'О',
    baseCost: 500,
    costScale: 1,
    maxLevel: 1,
    effect: { ampPct: 0.15, click: 6 },
  },
  {
    id: 'end_iron_oath',
    tier: 'endgame',
    name: 'Железная клятва',
    description: 'Как у ворот царства дивов',
    icon: '1',
    baseCost: 500,
    costScale: 1,
    maxLevel: 1,
    effect: { click: 12 },
  },
  {
    id: 'end_lebed',
    tier: 'endgame',
    name: 'Перо лебедя',
    description: 'Хумай касается плеча в бою',
    icon: '2',
    baseCost: 650,
    costScale: 1,
    maxLevel: 1,
    effect: { auto: 6 },
  },
  {
    id: 'end_ulgen',
    tier: 'endgame',
    name: 'Милость Улгена',
    description: 'Смерть отступает на шаг',
    icon: '3',
    baseCost: 800,
    costScale: 1,
    maxLevel: 1,
    effect: { hp: 120 },
  },
  {
    id: 'end_herbalist',
    tier: 'endgame',
    name: 'Настой шамана',
    description: 'Горький, но возвращает силы',
    icon: '4',
    baseCost: 1000,
    costScale: 1,
    maxLevel: 1,
    effect: { regen: 2.2 },
  },
  {
    id: 'end_shulgen_echo',
    tier: 'endgame',
    name: 'Эхо Шульгена',
    description: 'Победить тень — значит стать сильнее',
    icon: '5',
    baseCost: 1200,
    costScale: 1,
    maxLevel: 1,
    effect: { critPct: 0.08, critMult: 0.3 },
  },
  {
    id: 'end_azhdaha',
    tier: 'endgame',
    name: 'Чешуя аждахи',
    description: 'Огонь неба в ваших руках',
    icon: '6',
    baseCost: 1500,
    costScale: 1,
    maxLevel: 1,
    effect: { ampPct: 0.22 },
  },
  {
    id: 'end_yanbishma',
    tier: 'endgame',
    name: 'Слеза Яншишмы',
    description: 'Живая вода усиливает удар',
    icon: '7',
    baseCost: 1800,
    costScale: 1,
    maxLevel: 1,
    effect: { clickPct: 0.15, goldPct: 0.15 },
  },
  {
    id: 'end_humay',
    tier: 'endgame',
    name: 'Песня Хумай',
    description: 'Лебедь поёт — батыр не падает',
    icon: '8',
    baseCost: 2200,
    costScale: 1,
    maxLevel: 1,
    effect: { hpPct: 0.15, regen: 1 },
  },
  {
    id: 'end_katil',
    tier: 'endgame',
    name: 'Корона Катилу',
    description: 'Власть поверженных царей',
    icon: '9',
    baseCost: 2800,
    costScale: 1,
    maxLevel: 1,
    effect: { click: 28 },
  },
  {
    id: 'end_bure',
    tier: 'endgame',
    name: 'Сердце бури',
    description: 'Ураган ударов без паузы',
    icon: '10',
    baseCost: 3500,
    costScale: 1,
    maxLevel: 1,
    effect: { auto: 12, autoPct: 0.1 },
  },
  {
    id: 'end_mountain',
    tier: 'endgame',
    name: 'Душа гор',
    description: 'Уральские вершины в вашей груди',
    icon: '11',
    baseCost: 4200,
    costScale: 1,
    maxLevel: 1,
    effect: { hp: 220 },
  },
  {
    id: 'end_eternal_fire',
    tier: 'endgame',
    name: 'Вечный огонь',
    description: 'Костёр, который не гаснет в походе',
    icon: '12',
    baseCost: 5000,
    costScale: 1,
    maxLevel: 1,
    effect: { ampPct: 0.35 },
  },
  {
    id: 'end_sesyn',
    tier: 'endgame',
    name: 'Голос сэсэна',
    description: 'О вас уже поют у других костров',
    icon: '13',
    baseCost: 6200,
    costScale: 1,
    maxLevel: 1,
    effect: { critPct: 0.1, comboPct: 0.08 },
  },
  {
    id: 'end_khan',
    tier: 'endgame',
    name: 'Удача степного хана',
    description: 'Золото течёт, как река в половодье',
    icon: '14',
    baseCost: 7800,
    costScale: 1,
    maxLevel: 1,
    effect: { goldPct: 0.35 },
  },
  {
    id: 'end_shurale_pact',
    tier: 'endgame',
    name: 'Договор с Шурале',
    description: 'Лесной дух путает врагов — вы бьёте',
    icon: '15',
    baseCost: 9500,
    costScale: 1,
    maxLevel: 1,
    effect: { auto: 18, click: 15 },
  },
  {
    id: 'end_vampire',
    tier: 'endgame',
    name: 'Кровь без чаши',
    description: 'Сила без проклятья Шульгена',
    icon: '16',
    baseCost: 11500,
    costScale: 1,
    maxLevel: 1,
    effect: { click: 45, ampPct: 0.12 },
  },
  {
    id: 'end_dragon_fang',
    tier: 'endgame',
    name: 'Клык дракона',
    description: 'Семь аждах неба — один клык у вас',
    icon: '17',
    baseCost: 14000,
    costScale: 1,
    maxLevel: 1,
    effect: { click: 55, critPct: 0.05 },
  },
  {
    id: 'end_ancestors',
    tier: 'endgame',
    name: 'Цепь предков',
    description: 'Десять поколений бьют вместе с вами',
    icon: '18',
    baseCost: 17000,
    costScale: 1,
    maxLevel: 1,
    effect: { auto: 28, autoPct: 0.15 },
  },
  {
    id: 'end_immortal',
    tier: 'endgame',
    name: 'Клятва бессмертия',
    description: 'Не вечная жизнь — вечный поход',
    icon: '19',
    baseCost: 21000,
    costScale: 1,
    maxLevel: 1,
    effect: { hp: 450, hpPct: 0.2 },
  },
  {
    id: 'end_yanbirde',
    tier: 'endgame',
    name: 'Наследие Янбирде',
    description: 'Отец смотрит с неба и кивает',
    icon: '20',
    baseCost: 26000,
    costScale: 1,
    maxLevel: 1,
    effect: { ampPct: 0.55 },
  },
  {
    id: 'end_second_sun',
    tier: 'endgame',
    name: 'Второе солнце',
    description: 'Критический удар — как полдень в степи',
    icon: '21',
    baseCost: 31000,
    costScale: 1,
    maxLevel: 1,
    effect: { critPct: 0.12, critMult: 0.5 },
  },
  {
    id: 'end_river',
    tier: 'endgame',
    name: 'Исток реки',
    description: 'Родник питает каждый вдох',
    icon: '22',
    baseCost: 37000,
    costScale: 1,
    maxLevel: 1,
    effect: { regen: 6, hpPct: 0.1 },
  },
  {
    id: 'end_epic_repeat',
    tier: 'endgame',
    name: 'Повтор эпоса',
    description: 'Вторая песня — громче первой',
    icon: '23',
    baseCost: 43000,
    costScale: 1,
    maxLevel: 1,
    effect: { goldPct: 0.5, clickPct: 0.2 },
  },
  {
    id: 'end_world_soul',
    tier: 'endgame',
    name: 'Душа мира',
    description: 'Земля, вода, небо — в одном ударе',
    icon: '24',
    baseCost: 47000,
    costScale: 1,
    maxLevel: 1,
    effect: { ampPct: 0.8, autoPct: 0.25, clickPct: 0.25 },
  },
  {
    id: 'end_eternal_batyr',
    tier: 'endgame',
    name: 'Вечный батыр',
    description: 'Имя, которое степь будет петь вечно',
    icon: '25',
    baseCost: 50000,
    costScale: 1,
    maxLevel: 1,
    effect: { click: 120, auto: 55, ampPct: 1, critPct: 0.08 },
  },
];

export const CLICKER_UPGRADES_BY_TIER = {
  starter: CLICKER_UPGRADES.filter((u) => u.tier === 'starter'),
  mid: CLICKER_UPGRADES.filter((u) => u.tier === 'mid'),
  endgame: CLICKER_UPGRADES.filter((u) => u.tier === 'endgame'),
};

const UPGRADE_BY_ID = new Map(CLICKER_UPGRADES.map((u) => [u.id, u]));

export function getClickerUpgrade(id: string): ClickerUpgradeDef | undefined {
  return UPGRADE_BY_ID.get(id);
}

const LEGACY_EFFECTS: Record<string, ClickerUpgradeEffect> = {
  click_power: { click: 1 },
  auto_clicker: { auto: 0.8 },
  amplifier: { ampPct: 0.05 },
  crit: { critPct: 0.02 },
  vitality: { hp: 12 },
  regen: { regen: 0.6 },
  gold_finder: { goldPct: 0.12 },
};

export function computeClickerBonuses(levels: Record<string, number>): ClickerBonuses {
  const b = emptyBonuses();

  for (const upg of CLICKER_UPGRADES) {
    const lvl = levels[upg.id] ?? 0;
    if (lvl <= 0) continue;
    addEffect(b, upg.effect, lvl);
  }

  for (const [legacyId, effect] of Object.entries(LEGACY_EFFECTS)) {
    const lvl = levels[legacyId] ?? 0;
    if (lvl > 0) addEffect(b, effect, lvl);
  }

  return b;
}

export function getUpgradeCostFor(def: ClickerUpgradeDef, level: number): number {
  if (level >= def.maxLevel) return Infinity;
  return Math.floor(def.baseCost * Math.pow(def.costScale, level));
}
