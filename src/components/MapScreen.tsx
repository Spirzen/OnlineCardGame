import { useGame } from '../hooks/useGame';
import { LOCALE } from '../game/locale';
import { NODE_COLORS, NODE_ICONS } from '../game/settings';
import { PlayerHUD, RelicBar } from './PlayerHUD';
import type { MapNode } from '../game/map';

export function MapScreen() {
  const { run, dispatch } = useGame();
  const map = run.gameMap;
  if (!map) return null;

  const [floor, total] = map.getFloorProgress();
  const floorSpacing = 100;
  const rowSpacing = 80;
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
  const height = startY + 3 * rowSpacing + 60;

  return (
    <div className="screen">
      <div className="screen-header">
        <h2>{LOCALE.MAP_FLOOR} {floor} / {total}</h2>
        <div className="header-actions">
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
                return (
                  <line
                    key={`${node.floor}-${node.row}-${conn.floor}-${conn.row}`}
                    className="map-path"
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

              return (
                <g
                  key={`${node.floor}-${node.row}`}
                  className={[
                    'map-node',
                    available ? 'map-node--available' : '',
                    visited ? 'map-node--visited' : '',
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
                  <circle cx={pos.x} cy={pos.y} r={24} fill={color} opacity={visited ? 0.4 : 0.85} style={{ pointerEvents: 'none' }} />
                  <circle cx={pos.x} cy={pos.y} r={24} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={2} style={{ pointerEvents: 'none' }} />
                  <text
                    x={pos.x}
                    y={pos.y + 6}
                    textAnchor="middle"
                    fontSize={18}
                    fill="white"
                    style={{ pointerEvents: 'none' }}
                  >
                    {NODE_ICONS[node.type] ?? '?'}
                  </text>
                  <text
                    x={pos.x}
                    y={pos.y + 38}
                    textAnchor="middle"
                    fontSize={10}
                    fill="rgba(255,255,255,0.6)"
                    style={{ pointerEvents: 'none' }}
                  >
                    {LOCALE.NODE_LABELS[node.type]}
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
