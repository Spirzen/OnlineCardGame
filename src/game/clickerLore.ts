import enemiesData from '../data/enemies.json';
import { getActLabel, getActLore } from './acts';
import { rngPick } from './rng';
import { LOCALE } from './locale';

const enemyDb = enemiesData as Record<string, { name: string; description?: string }>;

/** Уровни бесконечного похода → части эпоса (цикл 15 этапов). */
export function getClickerActForLevel(level: number): {
  label: string;
  lore: string;
  cycle: number;
} {
  const cycle = Math.floor((level - 1) / 15);
  const floorInCycle = ((level - 1) % 15) + 1;
  const floorIdx = floorInCycle - 1;

  if (cycle === 0) {
    return {
      label: getActLabel(floorIdx),
      lore: getActLore(floorIdx),
      cycle: 0,
    };
  }

  const ext = EXTENDED_CYCLES[(cycle - 1) % EXTENDED_CYCLES.length];
  return {
    label: ext.label.replace('{n}', String(cycle + 1)),
    lore: ext.lore,
    cycle,
  };
}

const EXTENDED_CYCLES = [
  {
    label: 'Часть IV — За пределами песни · круг {n}',
    lore: 'Эпос закончился у родника — но степь не кончается. Батыр идёт дальше, туда, где сэсэны ещё не сложили строк. Каждый новый враг — черновик будущей сказки.',
  },
  {
    label: 'Часть V — Тени второго круга · {n}',
    lore: 'Шульген пал, а тьма помнит его лицо. Дивы снова шепчут у костров, и приспешники поднимаются, как трава после дождя. Урал-батыр не умирает — он становится легендой, которую проверяют на прочность.',
  },
  {
    label: 'Часть VI — Вечный поход · {n}',
    lore: 'Яншишма течёт, пока её охраняют. Пока батыр бьёт — родник жив. Старики говорят: бесконечный поход и есть настоящая клятва земли, а не один победный день у воды.',
  },
];

export function getEnemyLore(enemyId: string): string {
  return enemyDb[enemyId]?.description ?? LOCALE.CLICKER_LORE_UNKNOWN;
}

const BOSS_INTROS: Record<string, string[]> = {
  shulgen: [
    'Из раковины с кровью поднимается брат. «Ты всё ещё веришь в людей?» — спрашивает Шульген.',
    'Финал эпоса повторяется в бесконечном походе: кровь против крови, имя против имени.',
  ],
};

const ELITE_INTROS: Record<string, string[]> = {
  gremlin_nob: ['Главарь дивов выходит из тумана — за ним не орда, а эхо всех поражений степи.'],
  ulem_shadow: ['Тень Улема не имеет лица. Она пришла забрать долг, который вы ещё не знаете.'],
  azhdaha: ['Небо краснеет: аждаха складывает крылья, как облака перед грозой.'],
  shurale_elite: ['Смех из чащи оглушает. Шурале из чащи не шутит — он охотится.'],
  yulmauz_elder: ['Под луной поднимается вой — старший ялмауз помнит вашу кровь.'],
  vampir_elder: ['Древний вампир служил Улему, когда тот ещё не был царём мёртвых.'],
  zarkum_guard: ['У родника стоит змея. Вода за её спиной — цель всего похода.'],
};

const SPAWN_GENERIC: string[] = [
  'На тропе — {name}. Степь не спрашивает, готов ли батыр.',
  '{name} преграждает путь. В эпосе каждый враг — урок, не помеха.',
  'Ветер приносит запах битвы. {name} уже здесь.',
  'Сэсэн не поёт об этом бое — но вы его допишете.',
];

const KILL_QUOTES: string[] = [
  '{name} повержен. Степь на миг молчит — потом снова шепчет о роднике.',
  'Ещё один шаг к Яншишме. {name} останется в песне — как побеждённый.',
  'Кровь врага — не кровь из раковины. Батыр идёт дальше.',
  '{name} пал. Урал когда-то тоже падал — и поднимался.',
];

const BOSS_KILL: string[] = [
  '{name} повержен! Эпос содрогается — но бесконечный поход не кончается.',
  'Даже {name} не остановил батыра. Родник ждёт.',
];

const WHISPERS_ACT1: string[] = [
  '«Детство на затерянной земле…» — напевает ветер.',
  'Хумай-лебедушка где-то высоко. Не забывай небо.',
  'Янбирде смотрит на путь сынов. Сделай его достойным.',
  'Первая тьма — не последняя. Учись бить и слушать.',
];

const WHISPERS_ACT2: string[] = [
  'Царство дивов принимает гостей без радости.',
  'Горы выросли из тел поверженных — не бросай оружие у подножия.',
  'Улем не показывает лица. Его тень — уже достаточно.',
  'Аждаха жжёт облака. Огнём отвечай на огонь.',
];

const WHISPERS_ACT3: string[] = [
  'Брат ждёт у воды. Или то, что от него осталось.',
  'Яншишма близко — или кажется близкой. Не теряй путь.',
  'Змей у родника помнит каждого, кто пил до вас.',
  'Финал эпоса — не финал батыра, если степь зовёт снова.',
];

const WHISPERS_EXTENDED: string[] = [
  'Сэсэны ещё не сложили эту часть — вы пишете её ударами.',
  'Бесконечный поход — клятва сильнее одной победы.',
  'Каждый круг степи — новая глава, которую поймут у костра.',
  'Урал смотрит с неба: «Ещё не всё, батыр».',
];

const MILESTONES: Record<number, string> = {
  1: 'Бесконечный поход начинается у порога аула. Нет карты — только клятва идти, пока стоите.',
  7: 'Седьмой уровень — как седьмой день в дороге: тело помнит усталость, дух — зачем идёте.',
  10: 'Десять побед подряд — дивы начинают шептать ваше имя. Не слушайте лесть.',
  15: 'Пятнадцать уровней — один полный круг эпоса. Степь открывает второй.',
  25: 'Двадцать пять — Шульген пал, но тьма не спит. Поход продолжается.',
  50: 'Пятьдесят уровней. Старики скажут: такого батыра не было со времён первой песни.',
  100: 'Сто побед. Яншишма слышит ваши шаги — родник отвечает светом.',
};

const GAME_OVER_QUOTES: string[] = [
  'Эпос оборвался на этом уровне… но сэсэны знают: батыр может подняться снова.',
  'Смерть коварна, путь долог. Колода не нужна — нужна лишь воля вернуться.',
  'Урал тоже падал у чужих ворот. Разница — в том, кто встаёт.',
  'Степь не осуждает. Она ждёт следующего похода.',
];

export function getSpawnLore(
  level: number,
  isElite: boolean,
  isBoss: boolean,
  enemyId: string,
  enemyName: string,
): string {
  const milestone = MILESTONES[level];
  if (milestone) return milestone;

  if (isBoss && BOSS_INTROS[enemyId]) {
    return rngPick(BOSS_INTROS[enemyId]);
  }
  if (isBoss) {
    return LOCALE.CLICKER_BOSS_LORE.replace('{name}', enemyName);
  }
  if (isElite && ELITE_INTROS[enemyId]) {
    return rngPick(ELITE_INTROS[enemyId]);
  }
  if (isElite) {
    return LOCALE.CLICKER_ELITE_LORE.replace('{name}', enemyName);
  }
  return rngPick(SPAWN_GENERIC).replace('{name}', enemyName);
}

export function getKillLore(enemyName: string, isElite: boolean, isBoss: boolean): string {
  if (isBoss) return rngPick(BOSS_KILL).replace('{name}', enemyName);
  if (isElite) {
    return LOCALE.CLICKER_ELITE_KILL.replace('{name}', enemyName);
  }
  return rngPick(KILL_QUOTES).replace('{name}', enemyName);
}

export function getWhisperForLevel(level: number): string {
  const floorInCycle = ((level - 1) % 15) + 1;
  const cycle = Math.floor((level - 1) / 15);

  if (cycle > 0) return rngPick(WHISPERS_EXTENDED);
  if (floorInCycle <= 5) return rngPick(WHISPERS_ACT1);
  if (floorInCycle <= 10) return rngPick(WHISPERS_ACT2);
  return rngPick(WHISPERS_ACT3);
}

export function getGameOverLore(): string {
  return rngPick(GAME_OVER_QUOTES);
}

export function getUpgradeFlavor(id: string, level: number): string | null {
  const lines = UPGRADE_FLAVOR[id];
  if (!lines || level <= 0) return null;
  return lines[Math.min(level - 1, lines.length - 1)];
}

const UPGRADE_FLAVOR: Record<string, string[]> = {
  click_power: [
    'Первый удар — как первое слово в эпосе.',
    'Клинок помнит руку Урала.',
    'Степь учит: сила без цели — пустой звук.',
    'Каждый удар — строка в песне, которую поймут у костра.',
  ],
  auto_clicker: [
    'Духи-помощники шепчут: «Бей, пока он спит».',
    'Тени предков бьют вместе с вами — не видно, но слышно.',
    'Как орда лебедей: одна ведёт, остальные следуют.',
  ],
  amplifier: [
    'Капля родника на языке — и мир звучит иначе.',
    'Яншишма усиливает того, кто защищает, а не губит.',
    'Сила воды течёт в удар — тихо, но глубоко.',
  ],
  crit: [
    'Удара, что запомнят сэсэны.',
    'Молния степи — редкая, но решающая.',
    'Как удар Урала по раковине: один раз — и навсегда.',
  ],
  vitality: [
    'Кровь батыра — не из чаши брата.',
    'Сердце степи бьётся в груди.',
    'Выдержать — значит дойти до родника.',
  ],
  regen: [
    'Травы привала тянут раны, как мать — ребёнка.',
    'Медленно, как рассвет над Янбирде.',
    'Вода помнит каждого, кто пил чисто.',
  ],
  gold_finder: [
    'Дары кочевников на тропе — не жадность, а запас.',
    'Золото похода — на хлеб и на новый путь.',
    'Удача батыра — уважение степи.',
  ],
};
