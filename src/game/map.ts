import {
  NODE_COMBAT,
  NODE_ELITE,
  NODE_BOSS,
  NODE_REST,
  NODE_SHOP,
  NODE_TREASURE,
  NODE_EVENT,
} from './settings';
import { rngInt, rngShuffle, rng } from './rng';

export class MapNode {
  type: string;
  floor: number;
  col: number;
  row: number;
  connections: MapNode[] = [];
  visited = false;
  available = false;
  completed = false;

  constructor(nodeType: string, floor: number, col: number, row: number) {
    this.type = nodeType;
    this.floor = floor;
    this.col = col;
    this.row = row;
  }
}

export class GameMap {
  static FLOORS = 15;
  static ROWS_PER_FLOOR = 3;

  act = 1;
  floors: MapNode[][] = [];
  currentNode: MapNode | null = null;
  bossNode: MapNode | null = null;

  constructor() {
    this.generate();
  }

  generate() {
    this.floors = [];
    for (let f = 0; f < GameMap.FLOORS; f++) {
      const floorNodes: MapNode[] = [];
      const numNodes =
        f > 0 && f < GameMap.FLOORS - 1 ? 2 + rngInt(3) : 1;
      const rows = rngShuffle([...Array(GameMap.ROWS_PER_FLOOR).keys()])
        .slice(0, Math.min(numNodes, GameMap.ROWS_PER_FLOOR))
        .sort((a, b) => a - b);

      rows.forEach((row, i) => {
        let ntype: string;
        if (f === 0) ntype = NODE_COMBAT;
        else if (f === GameMap.FLOORS - 1) ntype = NODE_BOSS;
        else if (f % 5 === 0 && i === 0) ntype = NODE_REST;
        else ntype = this.randomNodeType(f);
        floorNodes.push(new MapNode(ntype, f, i, row));
      });
      this.floors.push(floorNodes);
    }

    this.connectFloors();
    if (this.floors[0]) {
      for (const node of this.floors[0]) node.available = true;
    }
    if (this.floors.length > 0) {
      this.bossNode = this.floors[this.floors.length - 1][0];
    }
  }

  randomNodeType(floor: number): string {
    const weights: Record<string, number> = {
      [NODE_COMBAT]: 45,
      [NODE_ELITE]: floor < 3 ? 0 : 12,
      [NODE_REST]: 8,
      [NODE_SHOP]: 10,
      [NODE_TREASURE]: 8,
      [NODE_EVENT]: 17,
    };
    const types = Object.keys(weights);
    const total = types.reduce((s, t) => s + weights[t], 0);
    let r = rng() * total;
    for (const t of types) {
      r -= weights[t];
      if (r <= 0) return t;
    }
    return NODE_COMBAT;
  }

  connectFloors() {
    for (let f = 0; f < this.floors.length - 1; f++) {
      const current = this.floors[f];
      const nextFloor = this.floors[f + 1];
      for (const node of current) {
        const nearby = [...nextFloor].sort(
          (a, b) => Math.abs(a.row - node.row) - Math.abs(b.row - node.row)
        );
        const count = 1 + rngInt(Math.min(2, nearby.length));
        for (const target of nearby.slice(0, count)) {
          if (!node.connections.includes(target)) {
            node.connections.push(target);
          }
        }
      }
      for (const target of nextFloor) {
        if (!current.some((n) => n.connections.includes(target))) {
          const closest = [...current].sort(
            (a, b) => Math.abs(a.row - target.row) - Math.abs(b.row - target.row)
          )[0];
          closest.connections.push(target);
        }
      }
    }
  }

  selectNode(node: MapNode): boolean {
    if (!node.available || node.visited) return false;
    if (this.currentNode && !this.currentNode.connections.includes(node)) return false;
    this.currentNode = node;
    node.visited = true;
    node.completed = false;
    for (const n of this.getAllNodes()) n.available = false;
    for (const conn of node.connections) conn.available = true;
    return true;
  }

  completeCurrentNode() {
    if (this.currentNode) this.currentNode.completed = true;
  }

  getAllNodes(): MapNode[] {
    return this.floors.flat();
  }

  getAvailableNodes() {
    return this.getAllNodes().filter((n) => n.available && !n.visited);
  }

  isBossFloor() {
    return this.currentNode?.type === NODE_BOSS;
  }

  getFloorProgress(): [number, number] {
    if (!this.currentNode) return [0, GameMap.FLOORS];
    return [this.currentNode.floor + 1, GameMap.FLOORS];
  }
}
