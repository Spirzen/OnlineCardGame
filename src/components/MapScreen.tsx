import { useGame } from '../hooks/useGame';
import { LOCALE } from '../game/locale';
import { NODE_COLORS, NODE_ICONS } from '../game/settings';
import { getActLabel, getActLore } from '../game/acts';
import { PlayerHUD, RelicBar } from './PlayerHUD';
import { GameMap, type MapNode } from '../game/map';

function isPathActive(from: MapNode, to: MapNode, hasCurrent: boolean): boolean {
  if (from.visited && (to.visited || to.available)) return true;
  if (!hasCurrent && from.floor === 0 && from.available) return true;
  return false;
}

function isNodeOnRoute(node: MapNode): boolean {
  return node.visited || node.available;
}

export function MapScreen() {
  const { run, dispatch } = useGame();
  const map = run.gameMap;
  if (!map) return null;

  const [floor, total] = map.getFloorProgress();
  const rows = GameMap.ROWS_PER_FLOOR;
  const floorSpacing = 100;
  const rowSpacing = 64;
  const startX = 80;
  const startY = 60;

  const nodePositions = new Map<MapNode, { x: number; y: number }>();
  map.floors.forEach((floorNodes, fi) => {
    floorNodes.forEach((node) => {
      nodePositions.set(node, {
        x: startX + fi * floorSpacing,
        y: startY + node.row * rowSpacing,
      });
    });
  });

  const width = startX + map.floors.length * floorSpacing + 80;
  const height = startY + rows * rowSpacing + 60;

  return (
    <div className="screen">
      <div className="screen-header">
        <div>
          <p className="map-act-label">{getActLabel(floor)}</p>
          <p className="map-act-lore">{getActLore(floor)}</p>
          <h2>{LOCALE.MAP_FLOOR} {floor} / {total}</h2>
        </div>
        <div className="header-actions">
          <button
            className="btn btn--ghost btn--sm"
            onClick={() => dispatch({ type: 'OPEN_CODEX' })}
            title={LOCALE.CODEX_TITLE}
          >
            📖 {LOCALE.CODEX_BTN}
            {run.unlockedCodexIds.length > 0 && (
              <span className="codex-badge">{run.unlockedCodexIds.length}</span>
            )}
          </button>
          <button className="btn btn--ghost btn--sm" onClick={() => dispatch({ type: 'TOGGLE_DECK', open: true })}>
            🃏 {LOCALE.DECK_VIEW}
          </button>
          <PlayerHUD player={run.player} />
        </div>
      </div>
      <RelicBar relics={run.player.relics} />

      <div className="map-container">
        <svg className="map-svg" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          {map.floors.flatMap((floorNodes) =>
            floorNodes.flatMap((node) =>
              node.connections.map((conn) => {
                const from = nodePositions.get(node)!;
                const to = nodePositions.get(conn)!;
                const active = isPathActive(node, conn, !!map.currentNode);
                return (
                  <line
                    key={`${node.floor}-${node.row}-${conn.floor}-${conn.row}`}
                    className={active ? 'map-path map-path--active' : 'map-path map-path--dim'}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                  />
                );
              })
            )
          )}

          {map.floors.flatMap((floorNodes) =>
            floorNodes.map((node) => {
              const pos = nodePositions.get(node)!;
              const color = NODE_COLORS[node.type] ?? '#666';
              const available = node.available && !node.visited;
              const visited = node.visited;
              const onRoute = isNodeOnRoute(node);
              const isStart = node.floor === 0;

              return (
                <g
                  key={`${node.floor}-${node.row}`}
                  className={[
                    'map-node',
                    available ? 'map-node--available' : '',
                    visited ? 'map-node--visited' : '',
                    !onRoute ? 'map-node--dim' : '',
                    isStart ? 'map-node--start' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => available && dispatch({ type: 'SELECT_NODE', node })}
                  style={{ cursor: available ? 'pointer' : 'default' }}
                >
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={32}
                    fill="transparent"
                    style={{ pointerEvents: available ? 'all' : 'none' }}
                  />
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isStart ? 26 : 24}
                    fill={color}
                    opacity={visited ? 0.5 : onRoute ? 0.9 : 0.25}
                    style={{ pointerEvents: 'none' }}
                  />
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isStart ? 26 : 24}
                    fill="none"
                    stroke={isStart ? 'rgba(255, 215, 90, 0.7)' : 'rgba(255,255,255,0.2)'}
                    strokeWidth={isStart ? 3 : 2}
                    style={{ pointerEvents: 'none' }}
                  />
                  <text
                    x={pos.x}
                    y={pos.y + 6}
                    textAnchor="middle"
                    fontSize={18}
                    fill="white"
                    opacity={onRoute ? 1 : 0.35}
                    style={{ pointerEvents: 'none' }}
                  >
                    {NODE_ICONS[node.type] ?? '?'}
                  </text>
                  <text
                    x={pos.x}
                    y={pos.y + 38}
                    textAnchor="middle"
                    fontSize={10}
                    fill={isStart ? 'rgba(255, 215, 90, 0.9)' : 'rgba(255,255,255,0.6)'}
                    opacity={onRoute ? 1 : 0.3}
                    style={{ pointerEvents: 'none' }}
                  >
                    {isStart ? '▶ ' : ''}{LOCALE.NODE_LABELS[node.type]}
                  </text>
                </g>
              );
            })
          )}
        </svg>
      </div>
    </div>
  );
}
