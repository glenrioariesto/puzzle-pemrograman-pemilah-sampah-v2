/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TrashType = 'ORGANIC' | 'RECYCLABLE' | 'RESIDUE' | 'B3';

export interface TrashItem {
  id: string;
  name: string;
  type: TrashType;
  emoji: string;
  color: string; // Tailwind class background or text
}

export interface GridPos {
  x: number; // Column index (0 to width-1)
  y: number; // Row index (0 to height-1)
}

export interface TrashOnGrid {
  id: string;
  pos: GridPos;
  item: TrashItem;
  collected?: boolean;
}

export interface TrashCanOnGrid {
  pos: GridPos;
  type: TrashType;
  label: string;
  color: string; // Tailwind bg
  emoji: string;
}

export interface ObstacleOnGrid {
  pos: GridPos;
  type: 'bush' | 'rock' | 'wall' | 'water';
  emoji: string;
}

export type RobotId = 'ORGANIC' | 'RECYCLABLE' | 'B3';

export interface RobotCharacter {
  id: RobotId;
  name: string;
  color: string; // Tailwind bg color for robot body
  borderColor: string; // Tailwind border color
  startPos: GridPos;
}

export type CommandAction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'PICK' | 'DROP';

export interface Instruction {
  id: string;
  type: CommandAction;
}

export type CTIndicator = 'DECOMPOSITION' | 'PATTERN' | 'ABSTRACTION' | 'ALGORITHM';

export interface CTExplanation {
  title: string;
  description: string;
  relevance: string;
}

export interface GameLevel {
  id: number;
  name: string;
  description: string;
  gridSize: { width: number; height: number };
  robots: RobotCharacter[];
  startPos: GridPos;
  trashItems: TrashOnGrid[];
  trashCans: TrashCanOnGrid[];
  obstacles: ObstacleOnGrid[];
  maxCapacity: number;
  maxInstructions: number; // limit for instruction tree size
  starsThreshold: {
    three: number; // max commands/execution steps for 3 stars
    two: number;  // max commands/execution steps for 2 stars
  };
  hints: string[];
  blockLimits?: {
    [key in CommandAction]?: number; // Optional limit for block counts
  };
  ctInsights: {
    decomposition: string;
    pattern: string;
    abstraction: string;
    algorithm: string;
  };
}

export interface LevelHighScore {
  levelId: number;
  stars: number;
  minSteps: number;
  completed: boolean;
}
