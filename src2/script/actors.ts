import { add } from "dotspace";
import type { TiledScene } from "./main";
import { Component, Entity } from "./library";
import type { Position } from "./types";

interface ActionTickerValue {
	ticks: number;
}

export class ActionTicker extends Component {
	value: ActionTickerValue;
	constructor(value) {
		super('actionTicker')
	}
}

export function actInDirection(scene: TiledScene, entity: Entity, direction: [x: number, y: number]): void {
	const currentTile = scene.tiles.find(tile => tile.entities.includes(entity.id));

	// If you came from nowhere, you're going nowhere.
	if (!currentTile) {
		return;
	}

	const positionOfAction = add(currentTile.position, direction) as Position;

	if (!canMoveToPosition(scene, entity, positionOfAction)) {
		return;
	}

	scene.moveEntityToPosition(entity, positionOfAction);
}

/**
 * Check if something can move to a tile, taking into account tile type and entity solidity.
 * Be careful to not use this to check if something can be pushed into a chasm.
 * It'll tell you no if whatever got pushed can't fly.
 */
export function canMoveToPosition(scene: TiledScene, entity:Entity, position: Position): boolean {
	// Don't act if the position doesn't exist.
	if (!scene.hasTileAtPosition(position)) {
		return false;
	}

	const tileAtPosition = scene.getTileAtPosition(position);

	// Can't walk into a wall
	if (tileAtPosition.type === 'wall') {
		return false;
	}

	// Can only fly over a chasm
	// This could potentially be a problem if this method is used to check 
	if (tileAtPosition.type === 'chasm' && !entity.components['isFlying']) {
		return false;
	}

	const entitiesOnTile = tileAtPosition.entities.map(id => scene.getEntity(id));
	const doesTileContainSolids = entitiesOnTile.some(entity => entity.components['isSolid']);

	// Don't act if there are solid entities on the tile.
	if (entity.components['isSolid'] && doesTileContainSolids) {
		return false;
	}

	return true;
}
