import { add, equals } from "dotspace";
import { EventHandler, findEntities, getEntities, UpdateEvent } from "heks";
import { choose } from "roll-the-bones";
import { ActionTicker, Actor, createActor } from "./actors";
import { Tile, cardinalDirections, moveEntityToTile } from "./level";
import type { Events, State } from "./main";
import { Position } from "./types";

interface NPC extends Actor {}

export function createNpc(components?: Partial<NPC>): NPC {
	return {
		...createActor(components),
	}
}

export const decideAction: EventHandler<UpdateEvent, Events, State> = (state: State, {}, { emit }): State => {
	const actorsWaitingToAct = findEntities<{
		tilePosition: Position;
		actionTicks: ActionTicker;
	}>(getEntities(state), {
		isPlayerControlled: false,
		tilePosition: true,
		actionTicks: (value: number) => value === 0,
	});

	return actorsWaitingToAct.reduce((newState, actor) => {
		// Do something random
		const surroundingTiles = findSurroundingTiles(actor.tilePosition, newState.tiles);

		const freeTiles = surroundingTiles.filter(tile => {
			if (tile.type === 'chasm') {
				return false;
			}

			const entitiesOnTile = tile.entities.map(id => newState.entities[id]);
			return entitiesOnTile.every(entity => !entity.isSolid);
		});

		if (freeTiles.length > 0) {
			const currentTile = newState.tiles.find(tile => equals(tile.position, actor.tilePosition));
			const targetTile = choose(freeTiles);
			newState = moveEntityToTile(actor, targetTile, currentTile)(newState);
		}

		return emit('turnTaken', newState, { entityId: actor.id, ticks: actor.actionCost});
	}, state);
}

function findSurroundingTiles(position: Position, tiles: Tile[], directions = cardinalDirections): Tile[] {
	const positions = directions.map(direction => add(position, direction));

	return tiles.filter(tile => {
		return positions.some(position => {
			return position[0] === tile.position[0] &&
				position[1] === tile.position[1];
		});
	});
}
