import { add } from "dotspace";
import { createEntity } from "./entities";
import { moveEntityToTile } from "./level";
import { EventHandler, findEntities, getEntities, getEntity, setEntities, setEntity } from "heks";
import type { Entity } from 'heks';
import type { Events, State } from "./main";
import type { Position } from "./types";

export type ActionTicker = number;

export interface Actor extends Entity {
	actionTicks: ActionTicker;
	actionCost: number;
	isSolid?: boolean;
	tilePosition: Position;
}

export interface TurnTakenEvent {
	ticks: number;
	entityId: Entity['id'];
}

export function createActor(components: Partial<Actor> = {}): Actor {
	return {
		actionTicks: 0,
		actionCost: 100,
		tilePosition: [0, 0],
		...createEntity(components),
	}
}

export function actInDirection(state: State, entity: Entity & {tilePosition: Position}, direction: [x: number, y: number]): State {
	const currentTile = state.tiles.find(tile => tile.position[0] === entity.tilePosition[0] && tile.position[1] === entity.tilePosition[1]);
	const positionOfAction = add(entity.tilePosition, direction);
	const tileInDirection = state.tiles.find(tile => tile.position[0] === positionOfAction[0] && tile.position[1] === positionOfAction[1]);

	// If the tile doesn't exist, you can't go to it.
	if (!tileInDirection) {
		return state;
	}

	// If the tile is a chasm, you can't walk on it.
	if (tileInDirection.type === 'chasm') {
		return state;
	}

	if (tileInDirection.entities.map(id => state.entities[id]).some(entity => entity.isSolid)) {
		return state;
	}

	entity.actionTicks += entity.actionCost;

	return moveEntityToTile(entity, tileInDirection, currentTile)(state);
}

export function updateActionTicks(state: State): State {
	const actorsWaitingToAct = findEntities<{
		actionTicks: number;
	}>(getEntities(state), { actionTicks: (value: number) => value === 0 });

	if (actorsWaitingToAct.length > 0) {
		return state;
	}

	const actors = findEntities<{
		actionTicks: number;
	}>(getEntities(state), { actionTicks: (value: number) => value > 0 });

	const ticksUntilNextTurn = actors.reduce((lowestTicksFound: number, entity) => {
		if (lowestTicksFound > entity.actionTicks) {
			return entity.actionTicks;
		}

		return lowestTicksFound;
	}, Infinity);

	return setEntities(...actors.map(entity => {
		return {
			...entity,
			actionTicks: entity.actionTicks - ticksUntilNextTurn
		}
	}))(state);
}

export const gainActionTicks: EventHandler<TurnTakenEvent, Events, State> = (state, { entityId, ticks }) => {
	const entity = getEntity(state, entityId);

	return setEntity({
		...entity,
		actionTicks: entity.actionTicks + ticks,
	})(state);
}
