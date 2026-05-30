import type { Enemy } from '../game/enemy';
import {
  INTENT_ATTACK, INTENT_BLOCK, INTENT_BUFF, INTENT_DEBUFF,
  INTENT_SPECIAL, INTENT_BLOCK_ATTACK,
} from '../game/enemy';
import { ENEMY_SPRITES } from '../game/epicTheme';
import { Tooltip } from './Tooltip';

const INTENT_ICONS: Record<string, string> = {
  [INTENT_ATTACK]: '⚔', [INTENT_BLOCK]: '🛡', [INTENT_BUFF]: '💪',
  [INTENT_DEBUFF]: '💀', [INTENT_SPECIAL]: '✨', [INTENT_BLOCK_ATTACK]: '⚔🛡',
};

const INTENT_CLASS: Record<string, string> = {
  [INTENT_ATTACK]: 'intent--attack',
  [INTENT_BLOCK]: 'intent--block',
  [INTENT_BUFF]: 'intent--buff',
  [INTENT_DEBUFF]: 'intent--debuff',
  [INTENT_SPECIAL]: 'intent--special',
  [INTENT_BLOCK_ATTACK]: 'intent--mixed',
};

interface EnemyPanelProps {
  enemy: Enemy;
  index: number;
  selected?: boolean;
  targetable?: boolean;
  onClick?: () => void;
  hitFlash?: boolean;
}

export function EnemyPanel({ enemy, selected, targetable, onClick, hitFlash }: EnemyPanelProps) {
  const hpPct = (enemy.hp / enemy.maxHp) * 100;
  const sprite = ENEMY_SPRITES[enemy.id] ?? '👾';
  const intentCls = INTENT_CLASS[enemy.currentIntent] ?? '';
  const isBoss = enemy.id === 'shulgen';

  const panel = (
    <div
      className={[
        'enemy-panel panel',
        isBoss ? 'enemy-panel--boss' : '',
        selected ? 'enemy-panel--selected' : '',
        targetable ? 'enemy-panel--targetable' : '',
        hitFlash ? 'enemy-panel--hit' : '',
      ].filter(Boolean).join(' ')}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      <div className="enemy-panel__sprite">{sprite}</div>
      <div className="enemy-panel__name">{enemy.name}</div>
      <div className="enemy-panel__hp-bar">
        <div className="enemy-panel__hp-fill" style={{ width: `${hpPct}%` }} />
      </div>
      <div style={{ fontSize: '0.8rem' }}>{enemy.hp}/{enemy.maxHp} HP</div>
      {enemy.block > 0 && <div className="enemy-panel__block">🛡 {enemy.block}</div>}
      <div className={`enemy-panel__intent ${intentCls}`}>
        <span>{INTENT_ICONS[enemy.currentIntent] ?? '?'}</span>
        <span>{enemy.getIntentLabel()}</span>
        <span>{enemy.intentValue > 0 ? enemy.intentValue : ''}</span>
      </div>
      {enemy.vulnerable > 0 && <span className="status-tag status-tag--vuln">Уязв. {enemy.vulnerable}</span>}
      {enemy.weak > 0 && <span className="status-tag status-tag--weak">Слаб. {enemy.weak}</span>}
    </div>
  );

  if (!enemy.description) return panel;

  return (
    <Tooltip content={enemy.description} wide placement="top">
      {panel}
    </Tooltip>
  );
}
