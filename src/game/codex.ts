export type CodexCategory = 'epic' | 'hero' | 'creature' | 'place';

export interface CodexEntry {
  id: string;
  category: CodexCategory;
  title: string;
  body: string;
  icon: string;
}

/** Правила разблокировки записей кодекса */
export interface CodexUnlockRule {
  entryId: string;
  onStart?: boolean;
  onActComplete?: number;
  onEnemyKill?: string;
  /** Открывается после прохождения пролога (сохраняется между забегами) */
  onStoryTutorial?: boolean;
}

export const CODEX_CATEGORY_LABELS: Record<CodexCategory, string> = {
  epic: 'Эпос',
  hero: 'Герои',
  creature: 'Духи и твари',
  place: 'Места',
};

export const CODEX_ENTRIES: CodexEntry[] = [
  {
    id: 'epic_intro',
    category: 'epic',
    title: 'Что такое «Урал-батыр»?',
    icon: '📖',
    body:
      '«Урал-батыр» — древняя башкирская поэма, одна из крупнейших эпических сказаний тюркского мира. Сэсэны пели её у костра веками, пока не записали. История о батыре Урале, который ищет Живой родник Яншишму, чтобы победить Смерть — царя мёртвых Улема — и спасти степь от дивов.',
  },
  {
    id: 'epic_plot',
    category: 'epic',
    title: 'Сюжет в трёх частях',
    icon: '📜',
    body:
      'Часть I — детство у костра Янбирде, спор о крови, встреча с лебедушкой Хумай. Часть II — поход в царство дивов, битвы с Катилом, аждахами, тенью Улема. Часть III — брат против брата: Шульген, выпивший кровь из раковины, и финал у родника. Победа Урала — не только сила, но и милосердие.',
  },
  {
    id: 'act1_summary',
    category: 'epic',
    title: 'Часть I завершена',
    icon: '🌅',
    body:
      'Вы прошли детскую степь и первые испытания. Урал в эпосе тоже начинал охотником: учился у отца, спорил с братом, отпустил лебедушку. Тьма уже рядом — но вы ещё помните запах костра Янбирде.',
  },
  {
    id: 'act2_summary',
    category: 'epic',
    title: 'Часть II завершена',
    icon: '🌑',
    body:
      'Царство дивов позади — или только начинается по-настоящему. Горы из тел великанов, шёпот Улема, аждахи в небе. Урал здесь терял друзей и находил новых союзников среди зверей и птиц. Впереди — брат и родник.',
  },
  {
    id: 'hero_ural',
    category: 'hero',
    title: 'Урал Батыр',
    icon: '⚔',
    body:
      'Главный герой эпоса. Сын Янбирде и Янбики, старший брат Шульгена. Сильный, упрямый, милосердный. Отказался пить кровь из раковины, отпустил Хумай, прошёл через царство дивов к Живому роднику Яншишме. Его имя — символ выбора жизни вместо easy силы.',
  },
  {
    id: 'hero_shulgen',
    category: 'hero',
    title: 'Шульген',
    icon: '🩸',
    body:
      'Младший брат Урала. Выпил кровь из раковины и получил силу — но потерял путь к роднику. Ушёл к дивам и стал их champion. Финальный противник эпоса — не монстр, а родня. Урал побеждает, но боль брата остаётся в песне.',
  },
  {
    id: 'hero_humay',
    category: 'hero',
    title: 'Хумай — лебедушка',
    icon: '🦢',
    body:
      'Дочь Самрау, царя птиц, и Кояш, солнечного божества. Урал встретил её на озере в образе лебедя. Отпустив Хумай, батыр получил перо и указание на путь к роднику. Она — проводник между небом и землёй, свободой и долгом.',
  },
  {
    id: 'hero_yanbirde',
    category: 'hero',
    title: 'Янбирде',
    icon: '🏹',
    body:
      'Мудрый отец Урала и Шульгена, охотник и наставник. Учил сыновей стрелять, читать следы, не бояться степи. Его костёр — начало эпоса. Когда сыновья ушли к дивам, Янбирде остался памятью о доме, к которому батыр возвращается силой духа.',
  },
  {
    id: 'hero_yanbika',
    category: 'hero',
    title: 'Янбика',
    icon: '🍲',
    body:
      'Мать героев, знахарка и хранительница очага. Её травы и каша лечили раны. В эпосе она — голос дома и милосердия. Когда Урал изранен, он вспоминает не только меч, но и тёплые руки матери у костра.',
  },
  {
    id: 'hero_akbuzat',
    category: 'hero',
    title: 'Акбузат',
    icon: '🐎',
    body:
      'Волшебный конь Урала, рождённый из молнии и степного ветра. Несёт батыра сквозь бурю и дивов. В игре — класс «Акбузат» с мощными ударами. Верность коня — как верность собственному пути: не сворачивать к крови.',
  },
  {
    id: 'hero_samrau',
    category: 'hero',
    title: 'Самрау — царь птиц',
    icon: '🦅',
    body:
      'Дед Хумай, владелец грома и небес. Его перья — знаки на пути. Птицы в эпосе советуют, предупреждают, дарят силу. Самрау смотрит на батыра с высоты — и судит не по мечу, а по поступкам.',
  },
  {
    id: 'place_yanshishma',
    category: 'place',
    title: 'Яншишма — Живой родник',
    icon: '💧',
    body:
      'Цель всего похода. Живая вода в царстве дивов, способная обессмертить и отогнать Улема. Охраняется змеёй Заркум. Урал шёл к роднику через все испытания — не за бессмертием для себя, а чтобы вернуть мир живым.',
  },
  {
    id: 'place_div_realm',
    category: 'place',
    title: 'Царство дивов',
    icon: '👹',
    body:
      'Земля тьмы, где правят великаны. Катил — их злой царь. Из тел убитых дивов, по легенде, выросли Уральские горы. Здесь батыр теряет и находит дорогу, встречает оборотней, вампиров и шепот Улема.',
  },
  {
    id: 'creature_yulmauz',
    category: 'creature',
    title: 'Ялмауз',
    icon: '🐺',
    body:
      'Башкирский оборотень: человек, превращающийся в волка. Живёт среди людей незаметно, охотится ночью. Боятся огня и металла. В эпосе — лицо степной тьмы, напоминание: не каждый сосед остаётся человеком после заката.',
  },
  {
    id: 'creature_myaskay',
    category: 'creature',
    title: 'Мяскай',
    icon: '🌙',
    body:
      'Тюркский оборотень-людоед, близкий к волку. Оставляет знаки на курганах, воет в полнолуние. Трагичнее ялмауза — часто жертва проклятия. Урал встречает таких на пути к дивам — и учится отличать страх от злобы.',
  },
  {
    id: 'creature_vampir',
    category: 'creature',
    title: 'Вампир',
    icon: '🧛',
    body:
      'Неупокоенный мертвец тюркского фольклора. Встаёт из могилы, высасывает силы. Слуга Улема в народных сказах. Положить уголёк в рот — старый способ удержать. Урал отказывается от чужой крови — вампир пьёт тех, кто согласен.',
  },
  {
    id: 'creature_shurale',
    category: 'creature',
    title: 'Шурале',
    icon: '🌲',
    body:
      'Лесной дух с длинными пальцами и копытами. Смеётся, путает тропы, водит хороводы. Бигеляш, Бире и Бапак — его родственники. Не всегда убивает — часто просто сбивает с пути. Урал побеждает упрямством: называет цель — родник — и дорога выпрямляется.',
  },
  {
    id: 'creature_bigalyash',
    category: 'creature',
    title: 'Бигеляш',
    icon: '🌀',
    body:
      'Обманщик дорог, родственник Шурале. Спрашивает на развилках, меняет сапоги на карты, хихикает из кустов. Проверяет, знает ли батыр, куда идёт. Честный путь Янбирде всегда длиннее — но короче по совести.',
  },
  {
    id: 'creature_bire',
    category: 'creature',
    title: 'Бире',
    icon: '🦊',
    body:
      'Лесной вор, хитрый дух с лисьими ушами. Крадёт монеты и покой. Иногда оставляет дары — духи степи живут по своим законам. Мелкий враг, но учит бдительности: на пути к роднику теряют не только HP, но и золото.',
  },
  {
    id: 'creature_bapak',
    category: 'creature',
    title: 'Бапак',
    icon: '👶',
    body:
      'Дух, похищающий детей и оставляющий чурбан. Колыбельная — его оружие. Эпос начинается с детства Урала и Шульгена — Бапак напоминает, что защищать нужно самых слабых. Молитва у колыбели сильнее меча.',
  },
  {
    id: 'creature_bichura',
    category: 'creature',
    title: 'Бичура',
    icon: '🐛',
    body:
      'Рой мелких злых духов. Одна слаба — но их сотни. Дивы посылают бичур впереди армии. Как сомнения и мелкие пакости на большом пути. Имя Самрау или огонь разгоняет рой.',
  },
  {
    id: 'creature_yuha',
    category: 'creature',
    title: 'Юха',
    icon: '👿',
    body:
      'Демон уныния и соблазна. Шепчет: «Зачем родник? Брат прав». Улем пользуется такими голосами. Урал побеждает, вспоминая слова отца. Не слушать Юху — значит не стать Шульгеном в душе.',
  },
  {
    id: 'creature_azhdaha',
    category: 'creature',
    title: 'Аждаха',
    icon: '🐉',
    body:
      'Многоголовый огненный змей неба. Родственник Заркума, стража родника. В эпосе — один из главных врагов Урала. Огонь, ярость, небо и ад рядом. Победа над аждахой — знак, что батыр готов к финалу.',
  },
  {
    id: 'creature_ulem',
    category: 'creature',
    title: 'Улем — царь мёртвых',
    icon: '💀',
    body:
      'Смерть без лица, владелец подземного царства. Главный враг Урала во второй части эпоса. Шепчет из-под земли, предлагает сделки. Тень Улема в бою — предвестник финала. Живая вода Яншишмы — единственное, чего он боится.',
  },
  {
    id: 'creature_katil',
    category: 'creature',
    title: 'Катил',
    icon: '👑',
    body:
      'Злой царь дивов, принимавший человеческие жертвы. Воплощение жадности к чужой жизни. Его часовые и главари встречаются на пути. Урал отказывается торговаться с Катилом — как отказывается от крови в раковине.',
  },
  {
    id: 'creature_zarkum',
    category: 'creature',
    title: 'Заркум',
    icon: '🐍',
    body:
      'Змея у родника Яншишмы, последний страж перед живой водой. Младшая сестра аждах. Чешуя режет, вода не пускает без боя или уважения. Урал проходит через неё перед встречей с Шульгеном.',
  },
  {
    id: 'creature_div',
    category: 'creature',
    title: 'Дивы',
    icon: '⛰',
    body:
      'Великаны тьмы. Из тел убитых, по преданию, выросли Уральские горы. Сильные, голодные, иногда глупые, иногда трагичные. Урал и Шульген убивали их сотнями. Не все дивы одинаковы — но все они часть царства, которое нужно пройти.',
  },
];

export const CODEX_BY_ID: Record<string, CodexEntry> = Object.fromEntries(
  CODEX_ENTRIES.map((e) => [e.id, e]),
);

export const CODEX_UNLOCK_RULES: CodexUnlockRule[] = [
  { entryId: 'epic_intro', onStart: true },
  { entryId: 'epic_plot', onStart: true },
  { entryId: 'hero_ural', onStart: true },
  { entryId: 'hero_yanbirde', onStoryTutorial: true },
  { entryId: 'hero_yanbika', onStoryTutorial: true },
  { entryId: 'hero_humay', onStoryTutorial: true },
  { entryId: 'hero_shulgen', onStoryTutorial: true },
  { entryId: 'place_div_realm', onStoryTutorial: true },
  { entryId: 'creature_katil', onStoryTutorial: true },
  { entryId: 'creature_ulem', onStoryTutorial: true },
  { entryId: 'place_yanshishma', onStoryTutorial: true },
  { entryId: 'hero_yanbirde', onActComplete: 1 },
  { entryId: 'hero_yanbika', onActComplete: 1 },
  { entryId: 'hero_humay', onActComplete: 1 },
  { entryId: 'act1_summary', onActComplete: 1 },
  { entryId: 'creature_shurale', onActComplete: 1 },
  { entryId: 'creature_bigalyash', onActComplete: 1 },
  { entryId: 'creature_bire', onActComplete: 1 },
  { entryId: 'creature_bapak', onActComplete: 1 },
  { entryId: 'place_div_realm', onActComplete: 2 },
  { entryId: 'hero_akbuzat', onActComplete: 2 },
  { entryId: 'hero_samrau', onActComplete: 2 },
  { entryId: 'act2_summary', onActComplete: 2 },
  { entryId: 'creature_yulmauz', onActComplete: 2 },
  { entryId: 'creature_myaskay', onActComplete: 2 },
  { entryId: 'creature_vampir', onActComplete: 2 },
  { entryId: 'creature_bichura', onActComplete: 2 },
  { entryId: 'creature_yuha', onActComplete: 2 },
  { entryId: 'creature_div', onActComplete: 2 },
  { entryId: 'hero_shulgen', onActComplete: 2 },
  { entryId: 'place_yanshishma', onActComplete: 2 },
  { entryId: 'creature_ulem', onActComplete: 2 },
  { entryId: 'creature_katil', onActComplete: 2 },
  { entryId: 'creature_azhdaha', onActComplete: 2 },
  { entryId: 'creature_zarkum', onActComplete: 2 },
  // Разблокировка за победу над конкретным врагом
  { entryId: 'creature_yulmauz', onEnemyKill: 'yulmauz' },
  { entryId: 'creature_yulmauz', onEnemyKill: 'yulmauz_elder' },
  { entryId: 'creature_myaskay', onEnemyKill: 'myaskay' },
  { entryId: 'creature_vampir', onEnemyKill: 'vampir' },
  { entryId: 'creature_vampir', onEnemyKill: 'vampir_elder' },
  { entryId: 'creature_shurale', onEnemyKill: 'shurale' },
  { entryId: 'creature_shurale', onEnemyKill: 'shurale_elite' },
  { entryId: 'creature_bigalyash', onEnemyKill: 'bigalyash' },
  { entryId: 'creature_bire', onEnemyKill: 'bire' },
  { entryId: 'creature_bapak', onEnemyKill: 'bapak' },
  { entryId: 'creature_bichura', onEnemyKill: 'bichura' },
  { entryId: 'creature_yuha', onEnemyKill: 'yuha' },
  { entryId: 'creature_azhdaha', onEnemyKill: 'azhdaha' },
  { entryId: 'creature_ulem', onEnemyKill: 'ulem_shadow' },
  { entryId: 'creature_katil', onEnemyKill: 'slime_boss' },
  { entryId: 'creature_zarkum', onEnemyKill: 'zarkum_guard' },
  { entryId: 'hero_shulgen', onEnemyKill: 'shulgen' },
];

export function getUnlocksForAct(act: number): string[] {
  return CODEX_UNLOCK_RULES.filter((r) => r.onActComplete === act).map((r) => r.entryId);
}

export function getUnlockForEnemyKill(enemyId: string): string[] {
  return CODEX_UNLOCK_RULES.filter((r) => r.onEnemyKill === enemyId).map((r) => r.entryId);
}

export function getStartUnlocks(): string[] {
  return CODEX_UNLOCK_RULES.filter((r) => r.onStart).map((r) => r.entryId);
}

export function getStoryTutorialUnlocks(): string[] {
  return [...new Set(CODEX_UNLOCK_RULES.filter((r) => r.onStoryTutorial).map((r) => r.entryId))];
}

export function getCodexEntriesByCategory(
  ids: string[],
): Record<CodexCategory, CodexEntry[]> {
  const result: Record<CodexCategory, CodexEntry[]> = {
    epic: [],
    hero: [],
    creature: [],
    place: [],
  };
  for (const id of ids) {
    const entry = CODEX_BY_ID[id];
    if (entry) result[entry.category].push(entry);
  }
  return result;
}
