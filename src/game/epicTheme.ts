export const TYPE_ICONS: Record<string, string> = {
  attack: '⚔',
  block: '🛡',
  buff: '🔥',
  debuff: '☠',
  draw: '📜',
  creature: '🐎',
};

export const CARD_ART: Record<string, string> = {
  strike: '🏏',
  defend: '🛡',
  bash: '💥',
  bludgeon: '🪵',
  fireball: '🐉',
  reaper: '☠',
  heavy_blade: '🐎',
  ghostly_armor: '🦢',
  offering: '🩸',
  healing_light: '✨',
  thunder_clap: '⛈',
  shockwave: '🦅',
  iron_wave: '🌊',
  pommel_strike: '🪵',
  hunters_mark: '🎯',
  regeneration: '💧',
  inflame: '🌳',
  yanshishma_drop: '💧',
  samrau_storm: '⛈',
  akbuzat_charge: '🐎',
  ulem_whisper: '👤',
  homay_feather: '🪶',
  planning: '📜',
  bandage: '🌿',
  true_grit: '🌿',
  battle_trance: '💨',
  cleave: '🌀',
  shield_bash: '🛡',
  thunder_cage: '⚡',
  execute: '⚰',
  vampiric_bite: '🩸',
  mirror_shield: '🪞',
  holy_ward: '🦅',
};

export function getCardArt(cardId: string, cardType: string): string {
  return CARD_ART[cardId] ?? TYPE_ICONS[cardType] ?? '✦';
}

export const RELIC_ICONS: Record<string, string> = {
  burning_blood: '💧',
  ring_of_snake: '🪶',
  vajra: '🐎',
  anchor: '⚓',
  bag_of_marbles: '🐍',
  blood_vial: '🫙',
  bronze_scales: '🐉',
  happy_flower: '🌳',
  war_paint: '🎨',
  merchants_rug: '🏕',
  omamori: '🧿',
  toxic_egg: '🥚',
  frozen_egg: '🥚',
  molten_egg: '🥚',
  philosophers_stone: '🪨',
};

export const ENEMY_SPRITES: Record<string, string> = {
  cultist: '🌑',
  jaw_worm: '🐍',
  louse: '🦟',
  slime: '💚',
  gremlin_nob: '👹',
  sentry: '⚔',
  ulem_shadow: '👤',
  azhdaha: '🐉',
  hexaghost: '🔥',
  slime_boss: '👑',
  guardian: '🪨',
  shulgen: '🌑',
};

export const EVENT_ICONS: Record<string, string> = {
  shrine: '💧',
  merchant: '🏕',
  path: '⛰',
  altar: '🪨',
  trap: '⚠',
  homay: '🦢',
  akbuzat: '🐎',
  shulgen_tempt: '🩸',
  forest_council: '🦁',
};
