import { add } from "dotspace";
import { choose } from "roll-the-bones";
import { Component } from "./library";
import { canMoveToPosition } from "./actors";
import type { Tile, TiledScene } from "./main";
import type { Position } from "./types";

class Behaviour extends Component {
	constructor() {
		super('behaviour');

		this.on('takeTurn', () => {
			this.decideAction();
		});
	}

	decideAction() {
		if (!this.parent) {
			return;
		}

		const scene = this.parent.scene as TiledScene;
		const entity = this.parent;
		const surroundingTiles = findSurroundingTiles(
			this.parent.components['tilePosition'].value as Position,
			scene.tiles
		);

		surroundingTiles.filter(tile => canMoveToPosition(scene, entity, tile.position));
		
		if (surroundingTiles.length > 0) {
			scene.moveEntityToPosition(entity, choose(surroundingTiles).position);
		}
	}
}

export const DIRECTION_NORTH     = [0, -1];
export const DIRECTION_NORTHEAST = [1, -1];
export const DIRECTION_EAST      = [1, 0];
export const DIRECTION_SOUTHEAST = [1, 1];
export const DIRECTION_SOUTH     = [0, 1];
export const DIRECTION_SOUTHWEST = [-1, 1];
export const DIRECTION_WEST      = [-1, 0];
export const DIRECTION_NORTHWEST = [-1, -1];

export const cardinalDirections = [DIRECTION_NORTH, DIRECTION_EAST, DIRECTION_SOUTH, DIRECTION_WEST];

function findSurroundingTiles(position: Position, tiles: Tile[], directions = cardinalDirections): Tile[] {
	const positions = directions.map(direction => add(position, direction));

	return tiles.filter(tile => {
		return positions.some(position => {
			return position[0] === tile.position[0] &&
				position[1] === tile.position[1];
		});
	});
}
