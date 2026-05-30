import { rngPick, rngShuffle, rngInt } from './rng';
import type { Player } from './player';
import type { Enemy } from './enemy';

export type DialogueEffectKind = 'bad' | 'neutral' | 'good';

export interface CombatDialogueChoice {
  text: string;
  effect: DialogueEffectKind;
}

export interface CombatDialogueDef {
  id: string;
  /** Пусто — подходит любому врагу */
  enemyIds?: string[];
  line: string;
  responses: [CombatDialogueChoice, CombatDialogueChoice, CombatDialogueChoice];
}

export interface ActiveCombatDialogue {
  dialogueId: string;
  enemyIndex: number;
  enemyName: string;
  line: string;
  /** Три перемешанных ответа + «промолчать» добавляется в UI */
  choices: CombatDialogueChoice[];
}

/** Шанс реплики в начале хода игрока */
export const COMBAT_DIALOGUE_CHANCE = 0.28;
/** Максимум диалогов за один бой (больше у элит и боссов — длиннее сражение) */
export const COMBAT_DIALOGUE_MAX_PER_FIGHT = 4;

const SILENCE_LINES = [
  'Вы промолчали. Враг пожал плечами и готовится к удару.',
  'Молчание — тоже ответ. Степь не судит.',
  'Вы не ответили. Бой продолжается.',
  'Слова не потрачены — только время.',
];

const NEUTRAL_LINES = [
  'Слова пролетели мимо — бой не остановился.',
  'Ничего не изменилось, кроме настроения в степи.',
  'Ответ был ровным. Враг кивает и готовится.',
  'Разговор сошёл на нет — осталась только схватка.',
];

export const COMBAT_DIALOGUES: CombatDialogueDef[] = [
  {
    id: 'epic_about_you',
    line: 'Ты правда думаешь, что эпос напишут про тебя?',
    responses: [
      { text: 'Эпос напишут про мой меч в твоей спине!', effect: 'bad' },
      { text: 'Эпос пишут поступки, не слова.', effect: 'neutral' },
      { text: 'Сначала переживу этот бой — потом спросишь.', effect: 'good' },
    ],
  },
  {
    id: 'spring_legend',
    line: 'Слышал, ты ищешь Яншишму… Не найдёшь, батыр.',
    responses: [
      { text: 'А ты — последнее, что встанет на пути.', effect: 'good' },
      { text: 'Мои дела — мои. Твои — закончатся здесь.', effect: 'neutral' },
      { text: 'Родник подождёт. Ты — нет.', effect: 'bad' },
    ],
  },
  {
    id: 'tired_fight',
    line: 'Устал уже? Степь длинная, а ты ещё в начале.',
    responses: [
      { text: 'Устанут те, кто стоит у меня на дороге.', effect: 'good' },
      { text: 'Поговорим после боя.', effect: 'neutral' },
      { text: 'Может, ты прав… нет, шучу — умри!', effect: 'bad' },
    ],
  },
  {
    id: 'cards_magic',
    line: 'Карты — не магия эпоса. Это жульничество!',
    responses: [
      { text: 'Эпос тоже складывается из карт — судьбы.', effect: 'neutral' },
      { text: 'Жульничество — это когда ты живёшь после этого боя.', effect: 'good' },
      { text: 'А кровь на клинке — это честно, да?', effect: 'bad' },
    ],
  },
  {
    id: 'brother_shulgen',
    line: 'Шульген был прав: семья предаёт первой.',
    responses: [
      { text: 'Не смей произносить его имя!', effect: 'bad' },
      { text: '…Продолжай. Мне нужна твоя сила, не твои слова.', effect: 'neutral' },
      { text: 'Он ошибся. Я — нет.', effect: 'good' },
    ],
  },
  {
    id: 'block_show',
    line: 'Столько брони… Боишься одного удара?',
    responses: [
      { text: 'Боюсь только опоздать к роднику.', effect: 'neutral' },
      { text: 'Боюсь? Проверим, когда ты упадёшь.', effect: 'good' },
      { text: 'Броня — для слабых? Тогда ты без неё?', effect: 'bad' },
    ],
  },
  {
    id: 'steppe_wind',
    line: 'Ветер степи шепчет: «поверни назад».',
    responses: [
      { text: 'Ветер не знает, куда я иду.', effect: 'good' },
      { text: 'Шепчет — значит, боится за меня.', effect: 'neutral' },
      { text: 'А ты — эхо того ветра. Затихни.', effect: 'bad' },
    ],
  },
  {
    id: 'gold_lure',
    line: 'Золото после боя… если доживёшь.',
    responses: [
      { text: 'Золото меня не интересует. Ты — да.', effect: 'neutral' },
      { text: 'Забирай его себе — в могилу.', effect: 'good' },
      { text: 'Сначала покажи, где лежит… а, ты и есть клад.', effect: 'bad' },
    ],
  },
  {
    id: 'cultist_faith',
    enemyIds: ['cultist'],
    line: 'Кровь зовёт сильнее, чем клятва батыра!',
    responses: [
      { text: 'Моя клятва громче любого зова.', effect: 'good' },
      { text: 'Каждый слышит свой зов.', effect: 'neutral' },
      { text: 'Тогда пей свою кровь — мне не нужна.', effect: 'bad' },
    ],
  },
  {
    id: 'vampir_hunger',
    enemyIds: ['vampir'],
    line: 'Пульс у тебя ровный… пока что.',
    responses: [
      { text: 'Попробуй дотянуться — увидишь, как бьётся.', effect: 'good' },
      { text: 'Не твоё дело.', effect: 'neutral' },
      { text: 'Боишься? Я тоже чую твой страх.', effect: 'bad' },
    ],
  },
  {
    id: 'shurale_mock',
    enemyIds: ['shurale'],
    line: 'Хи-хи! Батыр играет в карты — смешно!',
    responses: [
      { text: 'Смеёшься последним — так в лесу принято.', effect: 'good' },
      { text: 'Смех Шурале — знак, что лес жив.', effect: 'neutral' },
      { text: 'Смейся. Это твой последний анекдот.', effect: 'bad' },
    ],
  },
  {
    id: 'yulmauz_strength',
    enemyIds: ['yulmauz'],
    line: 'Ялмауз не спрашивает — ялмауз ломает!',
    responses: [
      { text: 'А батыр не ломается — он сгибает судьбу.', effect: 'good' },
      { text: 'Сила без ума — просто шум.', effect: 'neutral' },
      { text: 'Ломай. Я соберу тебя по частям.', effect: 'bad' },
    ],
  },
  {
    id: 'shulgen_boss',
    enemyIds: ['shulgen'],
    line: 'Брат… ты всё ещё ищешь родник? Он внутри тебя — и он мёртв.',
    responses: [
      { text: 'Ты забыл, кто мы. Я — напомню.', effect: 'good' },
      { text: '…', effect: 'neutral' },
      { text: 'Тогда я вырежу эту ложь из тебя!', effect: 'bad' },
    ],
  },
  {
    id: 'slime_gurgle',
    enemyIds: ['slime'],
    line: 'Бульк… ещё один герой… бульк…',
    responses: [
      { text: 'Говори чётче — или растворишься быстрее.', effect: 'good' },
      { text: 'Булькай сколько хочешь.', effect: 'neutral' },
      { text: 'Заткнись, слизь. Меня тошнит от тебя.', effect: 'bad' },
    ],
  },
  {
    id: 'nob_arrogance',
    enemyIds: ['gremlin_nob'],
    line: 'Элита степи не торгуется с прохожими!',
    responses: [
      { text: 'Я не торгуюсь — я прохожу.', effect: 'good' },
      { text: 'Тогда не трать слова.', effect: 'neutral' },
      { text: 'Элита? Я видел настоящих царей. Ты — нет.', effect: 'bad' },
    ],
  },
  {
    id: 'bichura_trick',
    enemyIds: ['bichura', 'bire'],
    line: 'Хочешь сделку? Жизнь за секрет родника…',
    responses: [
      { text: 'Секреты не продаются — особенно тебе.', effect: 'good' },
      { text: 'Предложение запомню. Ответ — после боя.', effect: 'neutral' },
      { text: 'Договоримся: ты умрёшь, я не заплачу.', effect: 'bad' },
    ],
  },
  {
    id: 'jaw_worm_burrow',
    enemyIds: ['jaw_worm'],
    line: 'Ш-ш-ш… Я помню, как ты шёл по пещере. Помнишь?',
    responses: [
      { text: 'Помню — и помню, как резал змею.', effect: 'good' },
      { text: 'Не сейчас. Земля выслушает после боя.', effect: 'neutral' },
      { text: 'Ты — не моя память. Заткнись и ползи.', effect: 'bad' },
    ],
  },
  {
    id: 'louse_swarm',
    enemyIds: ['louse'],
    line: 'Мы мелкие — но нас много. Слышишь наш шёпот?',
    responses: [
      { text: 'Слышу — и не боюсь мошки.', effect: 'good' },
      { text: 'Шепчите. Степь громче.', effect: 'neutral' },
      { text: 'Замолчите! Вы меня бесите!', effect: 'bad' },
    ],
  },
  {
    id: 'sentry_katilu',
    enemyIds: ['sentry'],
    line: 'Стой! Катилу требует дань — кровь или золото.',
    responses: [
      { text: 'Катилу получит только пыль от моих сапог.', effect: 'good' },
      { text: 'Пропусти — или не пропусти. Решим мечом.', effect: 'neutral' },
      { text: 'Вот золото… а, нет, это твоя смерть.', effect: 'bad' },
    ],
  },
  {
    id: 'azhdaha_fire',
    enemyIds: ['azhdaha'],
    line: 'Небо помнит семерых драконов. Ты — только искра.',
    responses: [
      { text: 'Искра может поджечь небо.', effect: 'good' },
      { text: 'Помнят — значит, когда-то падали.', effect: 'neutral' },
      { text: 'Тогда сгори первым, ящерица!', effect: 'bad' },
    ],
  },
  {
    id: 'myaskay_hunger',
    enemyIds: ['myaskay'],
    line: 'Пахнешь… как мясо на костре. Голодно, батыр.',
    responses: [
      { text: 'Попробуй — зубы сломаешь о клинок.', effect: 'good' },
      { text: 'Голод — твоя проблема, не моя.', effect: 'neutral' },
      { text: 'Я тоже голоден — до твоей шкуры!', effect: 'bad' },
    ],
  },
  {
    id: 'bigalyash_fork',
    enemyIds: ['bigalyash'],
    line: 'Куда идёшь — налево, направо или в кусты?',
    responses: [
      { text: 'Туда, где ты упадёшь.', effect: 'good' },
      { text: 'Прямо — через тебя.', effect: 'neutral' },
      { text: 'В кусты… за тобой, обманщик!', effect: 'bad' },
    ],
  },
  {
    id: 'bapak_cradle',
    enemyIds: ['bapak'],
    line: 'Колыбель пуста… хочешь уснуть навсегда?',
    responses: [
      { text: 'Я не сплю — я иду к роднику.', effect: 'good' },
      { text: 'Колыбели — для детей. Мне — дорога.', effect: 'neutral' },
      { text: 'Усыпи меня — и сам не проснёшься!', effect: 'bad' },
    ],
  },
  {
    id: 'yuha_despair',
    enemyIds: ['yuha'],
    line: 'Зачем тебе родник? Всё равно умрёшь усталым…',
    responses: [
      { text: 'Устанут те, кто шепчет уныние.', effect: 'good' },
      { text: 'Молчи. Твой голос — не мой суд.', effect: 'neutral' },
      { text: 'Может, ты прав… нет. Умри, демон.', effect: 'bad' },
    ],
  },
  {
    id: 'ulem_debt',
    enemyIds: ['ulem_shadow'],
    line: 'Улем собирает долги. Твой — просрочен.',
    responses: [
      { text: 'Верну долг — твоей тенью.', effect: 'good' },
      { text: 'Смерть торгуется после боя.', effect: 'neutral' },
      { text: 'Я ничего не должен мёртвым!', effect: 'bad' },
    ],
  },
  {
    id: 'guardian_stone',
    enemyIds: ['guardian'],
    line: '…',
    responses: [
      { text: 'Камень молчит — и я не буду ждать вечно.', effect: 'good' },
      { text: '…', effect: 'neutral' },
      { text: 'Говори, скала, или рассыпься!', effect: 'bad' },
    ],
  },
  {
    id: 'katil_king',
    enemyIds: ['slime_boss'],
    line: 'Я — Катил! Жертва или смерть — третьего не дано.',
    responses: [
      { text: 'Третье дано: твой конец.', effect: 'good' },
      { text: 'Жертвы остались в прошлом. Как и ты.', effect: 'neutral' },
      { text: 'Возьми меня… шучу, умри, тиран!', effect: 'bad' },
    ],
  },
  {
    id: 'zarkum_gate',
    enemyIds: ['zarkum_guard'],
    line: 'Заркун закрыт. Ни живому, ни мёртвому — без ключа.',
    responses: [
      { text: 'Мой клинок — ключ от любых ворот.', effect: 'good' },
      { text: 'Откроешь — или сломаю.', effect: 'neutral' },
      { text: 'Тогда стой в стороне — я пройду!', effect: 'bad' },
    ],
  },
  {
    id: 'relic_mock',
    line: 'Сколько у тебя там «даров»? Без них ты никто.',
    responses: [
      { text: 'Дары — помощники. Сила — в руке.', effect: 'good' },
      { text: 'Посчитаем после боя.', effect: 'neutral' },
      { text: 'Хочешь — отдам все. В лицо.', effect: 'bad' },
    ],
  },
  {
    id: 'hand_full',
    line: 'Столько карт в руке — не боишься уронить?',
    responses: [
      { text: 'Каждая — удар. Боюсь только промахнуться.', effect: 'good' },
      { text: 'Рука привыкла.', effect: 'neutral' },
      { text: 'Уроню — тебе на голову.', effect: 'bad' },
    ],
  },
  {
    id: 'father_memory',
    line: 'Янбирде смотрит с неба. Разочарован?',
    responses: [
      { text: 'Отец смотрит — и видит, что я не сворачиваю.', effect: 'good' },
      { text: 'Его суд — не твоё дело.', effect: 'neutral' },
      { text: 'Не смей говорить об отце!', effect: 'bad' },
    ],
  },

  // —— Босс: Шульген ——
  {
    id: 'shulgen_blood_bowl',
    enemyIds: ['shulgen'],
    line: 'Помнишь раковину? Я пил первым. Ты — опоздал.',
    responses: [
      { text: 'Ты пил яд. Я пью честь.', effect: 'good' },
      { text: 'Прошлое не вернуть. Только пройти.', effect: 'neutral' },
      { text: 'Тогда допей до дна — в могилу!', effect: 'bad' },
    ],
  },
  {
    id: 'shulgen_family_name',
    enemyIds: ['shulgen'],
    line: 'Наше имя будет проклято. Или славно. Решишь ты — мечом.',
    responses: [
      { text: 'Имя останется чистым — без тебя.', effect: 'good' },
      { text: 'Эпос решит. Не мы.', effect: 'neutral' },
      { text: 'Прокляну я — но ты первый падёшь!', effect: 'bad' },
    ],
  },

  // —— Боссы (legacy / особые) ——
  {
    id: 'katil_throne',
    enemyIds: ['slime_boss'],
    line: 'На моём троне лежат кости тех, кто торговался.',
    responses: [
      { text: 'Трон сменится — на твоей могиле.', effect: 'good' },
      { text: 'Кости — урок. Я учусь.', effect: 'neutral' },
      { text: 'Тогда ложись рядом — место есть!', effect: 'bad' },
    ],
  },
  {
    id: 'katil_sacrifice',
    enemyIds: ['slime_boss'],
    line: 'Один умрёт — ты или я. Так было всегда у Катилу.',
    responses: [
      { text: 'Всегда — не значит навсегда.', effect: 'good' },
      { text: 'Суд — мечом, не словами.', effect: 'neutral' },
      { text: 'Тогда умри ты — я привык жить!', effect: 'bad' },
    ],
  },
  {
    id: 'guardian_ages',
    enemyIds: ['guardian'],
    line: 'Горы стояли до тебя. Простоят после.',
    responses: [
      { text: 'Горы не воюют. Я — воюю.', effect: 'good' },
      { text: '…', effect: 'neutral' },
      { text: 'Тогда рассыпься быстрее, скала!', effect: 'bad' },
    ],
  },
  {
    id: 'guardian_patience',
    enemyIds: ['guardian'],
    line: 'Ты устанешь раньше меня. Камень не знает усталости.',
    responses: [
      { text: 'Камень не знает и победы — узнаешь.', effect: 'good' },
      { text: 'Посмотрим, чья воля тверже.', effect: 'neutral' },
      { text: 'Устану — но снесу тебя!', effect: 'bad' },
    ],
  },
  {
    id: 'hexaghost_flood',
    enemyIds: ['hexaghost'],
    line: 'Я помню потоп. Ты — капля в нём.',
    responses: [
      { text: 'Капля точит камень — и небо.', effect: 'good' },
      { text: 'Потоп прошёл. Пройдёшь и ты.', effect: 'neutral' },
      { text: 'Затопи меня — утонешь вместе!', effect: 'bad' },
    ],
  },
  {
    id: 'hexaghost_first_heroes',
    enemyIds: ['hexaghost'],
    line: 'Первые батыры падали у моих лап. Ты — следующий?',
    responses: [
      { text: 'Я — не первый и не последний. Я — тот, кто пройдёт.', effect: 'good' },
      { text: 'Статистика — не судьба.', effect: 'neutral' },
      { text: 'Следующий — ты, дракон!', effect: 'bad' },
    ],
  },

  // —— Элиты ——
  {
    id: 'nob_smell',
    enemyIds: ['gremlin_nob'],
    line: 'Пахнешь страхом, батыр. Орда чует слабых.',
    responses: [
      { text: 'Пахну победой — скоро на твоей шкуре.', effect: 'good' },
      { text: 'Нюхай сколько хочешь. Бой — не базар.', effect: 'neutral' },
      { text: 'Я не слабый — просто ты противный!', effect: 'bad' },
    ],
  },
  {
    id: 'nob_crown',
    enemyIds: ['gremlin_nob'],
    line: 'Главарь не падает первым! Падают те, кто перед ним.',
    responses: [
      { text: 'Тогда встань вперёд — не прячься.', effect: 'good' },
      { text: 'Короны снимают — иногда с головой.', effect: 'neutral' },
      { text: 'Падать будешь ты — лицом в грязь!', effect: 'bad' },
    ],
  },
  {
    id: 'sentry_duty',
    enemyIds: ['sentry'],
    line: 'Приказ Катилу: ни одного батыра мимо ворот.',
    responses: [
      { text: 'Приказ — твоему хозяину. Я — мимо тебя.', effect: 'good' },
      { text: 'Служба — служба. Сразимся.', effect: 'neutral' },
      { text: 'Тогда умри за приказ — герой!', effect: 'bad' },
    ],
  },
  {
    id: 'sentry_weakness',
    enemyIds: ['sentry'],
    line: 'Вижу слабое место — в твоих глазах.',
    responses: [
      { text: 'Смотри внимательнее — это ярость, не страх.', effect: 'good' },
      { text: 'Глаза обманчивы.', effect: 'neutral' },
      { text: 'А я вижу — ты дрожишь!', effect: 'bad' },
    ],
  },
  {
    id: 'ulem_whisper',
    enemyIds: ['ulem_shadow'],
    line: 'Не оглядывайся. Я уже за спиной.',
    responses: [
      { text: 'За спиной — мой клинок. Для тебя.', effect: 'good' },
      { text: 'Тени — не враги. Ты — да.', effect: 'neutral' },
      { text: 'Не пугай — я и так настороже!', effect: 'bad' },
    ],
  },
  {
    id: 'ulem_no_face',
    enemyIds: ['ulem_shadow'],
    line: 'Лицо моё — твоё будущее. Пустое.',
    responses: [
      { text: 'Будущее пишу я — не ты.', effect: 'good' },
      { text: 'Без лица — без слов. К бою.', effect: 'neutral' },
      { text: 'Покажи лицо — разобью!', effect: 'bad' },
    ],
  },
  {
    id: 'shurale_elite_dance',
    enemyIds: ['shurale_elite'],
    line: 'Пляши со мной, батыр! Один шаг — и ты в чаще навсегда.',
    responses: [
      { text: 'Танцую я — танец меча.', effect: 'good' },
      { text: 'Не люблю хороводы. Особенно смертельные.', effect: 'neutral' },
      { text: 'Пляши сам — в огонь костра!', effect: 'bad' },
    ],
  },
  {
    id: 'shurale_elite_fingers',
    enemyIds: ['shurale_elite'],
    line: 'Длинные пальцы… слышишь, как ломают ветки? Скоро — кости.',
    responses: [
      { text: 'Сломай клинок — если сможешь.', effect: 'good' },
      { text: 'Лес шумит всегда. Я привык.', effect: 'neutral' },
      { text: 'Тронь — отрублю!', effect: 'bad' },
    ],
  },
  {
    id: 'shurale_elite_lost',
    enemyIds: ['shurale_elite'],
    line: 'Здесь Урал терял дорогу. Ты — тоже потеряешь.',
    responses: [
      { text: 'Урал нашёл — найду и я. Упрямством.', effect: 'good' },
      { text: 'Дорогу найду после тебя.', effect: 'neutral' },
      { text: 'Потеряешь ты — голову!', effect: 'bad' },
    ],
  },
  {
    id: 'azhdaha_clouds',
    enemyIds: ['azhdaha'],
    line: 'Облака — мой дом. Земля — твоя могила.',
    responses: [
      { text: 'С земли достану и небо.', effect: 'good' },
      { text: 'Каждый живёт где может.', effect: 'neutral' },
      { text: 'Сожги меня — упадёшь сам!', effect: 'bad' },
    ],
  },
  {
    id: 'azhdaha_young',
    enemyIds: ['azhdaha'],
    line: 'Младший из семерых — но для тебя я — последний.',
    responses: [
      { text: 'Последний враг на этом пути — может, да.', effect: 'good' },
      { text: 'Семеро — семеро. Я — один батыр.', effect: 'neutral' },
      { text: 'Для меня ты — первый и последний!', effect: 'bad' },
    ],
  },
  {
    id: 'yulmauz_elder_winter',
    enemyIds: ['yulmauz_elder'],
    line: 'Десятки зим я охотился. Ты — добыча сезона.',
    responses: [
      { text: 'Охотник стареет. Добыча — нет.', effect: 'good' },
      { text: 'Сезон сменится.', effect: 'neutral' },
      { text: 'Тогда охоться — пока можешь!', effect: 'bad' },
    ],
  },
  {
    id: 'yulmauz_elder_howl',
    enemyIds: ['yulmauz_elder'],
    line: 'Мой вой слышен за три аула. Твой крик — за три шага.',
    responses: [
      { text: 'Три шага — хватит, чтобы добраться до тебя.', effect: 'good' },
      { text: 'Кричать буду после победы.', effect: 'neutral' },
      { text: 'Завой — я первый залью!', effect: 'bad' },
    ],
  },
  {
    id: 'vampir_elder_kurgan',
    enemyIds: ['vampir_elder'],
    line: 'Кровь моих жертв кормила курганы веками. Твоя — добавка.',
    responses: [
      { text: 'Курган будет твоим — не моим.', effect: 'good' },
      { text: 'Мёртвые сыты. Живые — бьются.', effect: 'neutral' },
      { text: 'Попробуй — зубы сломаешь!', effect: 'bad' },
    ],
  },
  {
    id: 'vampir_elder_ulem',
    enemyIds: ['vampir_elder'],
    line: 'Улем дал мне вечность. Что дал тебе отец?',
    responses: [
      { text: 'Отец дал имя. Имя — не стыдно.', effect: 'good' },
      { text: 'Не твоё дело — чужие отцы.', effect: 'neutral' },
      { text: 'Не смей о Янбирде, труп!', effect: 'bad' },
    ],
  },
  {
    id: 'zarkum_seal',
    enemyIds: ['zarkum_guard'],
    line: 'Печать Заркума держит и дивов, и батыров. Ты — не исключение.',
    responses: [
      { text: 'Печати ломаются. Как и стражи.', effect: 'good' },
      { text: 'Проверим прочность — мечом.', effect: 'neutral' },
      { text: 'Я — исключение. Уступи!', effect: 'bad' },
    ],
  },
  {
    id: 'zarkum_beyond',
    enemyIds: ['zarkum_guard'],
    line: 'За воротами — то, что не для живых. Ты ещё жив — уходи.',
    responses: [
      { text: 'Живой — значит, пройду.', effect: 'good' },
      { text: 'Уйду — когда ты падёшь.', effect: 'neutral' },
      { text: 'Не для живых — значит, ты умрёшь первым!', effect: 'bad' },
    ],
  },
];

function applyBadEffect(player: Player): string {
  const roll = rngInt(5);
  switch (roll) {
    case 0:
      player.applyVulnerable(1);
      return 'Пыл в словах — вы отвлеклись! Уязвимость на 1 ход.';
    case 1:
      player.applyWeak(1);
      return 'Спор настроил против вас — слабость на 1 ход.';
    case 2:
      player.applyFrail(1);
      return 'Гнев ослабил защиту — хрупкость на 1 ход.';
    case 3: {
      const dealt = player.takeDamage(2);
      return dealt > 0 ? 'Враг поймал вас на слове — 2 урона!' : 'Удар пришёлся в броню.';
    }
    default:
      if (player.energy > 0) {
        player.energy -= 1;
        return 'Силы ушли на спор — −1 энергия.';
      }
      return 'Спор утомил, но энергии вы не потратили.';
  }
}

function applyGoodEffect(player: Player): string {
  const roll = rngInt(4);
  switch (roll) {
    case 0:
      player.heal(4);
      return 'Слова нашли силу — +4 HP!';
    case 1:
      player.gainBlock(5);
      return 'Спокойствие укрепило дух — +5 брони!';
    case 2:
      player.gainEnergy(1);
      return 'Ясная речь вернула уверенность — +1 энергия!';
    default:
      player.strength += 1;
      return 'Задор в ответе — +1 сила до конца боя!';
  }
}

export function applyDialogueChoiceEffect(
  effect: DialogueEffectKind,
  player: Player,
): string {
  switch (effect) {
    case 'bad':
      return applyBadEffect(player);
    case 'good':
      return applyGoodEffect(player);
    case 'neutral':
      return rngPick(NEUTRAL_LINES);
  }
}

export function applyDialogueSilence(): string {
  return rngPick(SILENCE_LINES);
}

export function pickDialogueForEnemy(
  enemyId: string,
  excludeIds: string[] = [],
): CombatDialogueDef {
  const specific = COMBAT_DIALOGUES.filter(
    (d) => d.enemyIds?.includes(enemyId) && !excludeIds.includes(d.id),
  );
  const generic = COMBAT_DIALOGUES.filter(
    (d) => !d.enemyIds?.length && !excludeIds.includes(d.id),
  );
  const pool = specific.length ? specific : generic;
  if (!pool.length) {
    const fallback = COMBAT_DIALOGUES.filter((d) => !d.enemyIds?.length);
    return rngPick(fallback.length ? fallback : COMBAT_DIALOGUES);
  }
  return rngPick(pool);
}

export function buildActiveDialogue(
  def: CombatDialogueDef,
  enemy: Enemy,
  enemyIndex: number,
): ActiveCombatDialogue {
  return {
    dialogueId: def.id,
    enemyIndex,
    enemyName: enemy.name,
    line: def.line,
    choices: rngShuffle([...def.responses]),
  };
}
