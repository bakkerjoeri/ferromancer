import { createSpriteComponent, findEntity, getEntities } from "heks";
import { actInDirection, Actor, createActor } from "./actors";
import type { KeyEvent } from "heks";
import type { ActionTicker } from "./actors";
import type { State } from "./main";
import type { Position } from "./types";

interface Player extends Actor {
	isPlayerControlled: true,
}

export function createPlayer(components?: Partial<Player>): Player {
	return {
		isPlayerControlled: true,
		isSolid: true,
		sprite: createSpriteComponent('ferromancer'),
		...createActor(components),
	}
}

export function handlePlayerInput(state: State, { key }: KeyEvent): State {
	const playerThatCanAct = findEntity<{
		isPlayerControlled: true;
		tilePosition: Position;
		actionTicks: ActionTicker;
	}>(getEntities(state), {
		isPlayerControlled: true,
		tilePosition: true,
		actionTicks: (value: number) => value === 0,
	});

	if (!playerThatCanAct) {
		return state;
	}
	
	if (key === 'ArrowUp') {
		return actInDirection(state, playerThatCanAct, [0, -1]);
	}

	if (key === 'ArrowRight') {
		return actInDirection(state, playerThatCanAct, [1, 0]);
	}

	if (key === 'ArrowDown') {
		return actInDirection(state, playerThatCanAct, [0, 1]);
	}

	if (key === 'ArrowLeft') {
		return actInDirection(state, playerThatCanAct, [-1, 0]);
	}

	return state;
}
