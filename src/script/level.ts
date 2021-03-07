import uuid from "@bakkerjoeri/uuid";
import { add } from "dotspace";
import { createSpriteComponent } from "heks";
import { State } from "./main";
import type { Entity, GameObject, Position } from "./types";

export interface Tile {
	position: Position;
	type: 'floor' | 'wall' | 'chasm';
	entities: GameObject['id'][];
}

export function setupLevel(state: State, level: string): State {
	const tiles: Tile[] = [];
	const entities: {[id: string]: Entity} = {};
	let position = [0, 0] as Position;

	level.split('').forEach(character => {
		if (character === '\n') {
			position = [0, position[1] + 1];
			return;
		}

		if (character === '#') {
			const wallEntity = {
				id: uuid(),
				isSolid: true,
				tilePosition: position,
				sprite: createSpriteComponent('wall'),
			}

			entities[wallEntity.id] = wallEntity;

			tiles.push({
				position,
				type: 'floor',
				entities: [wallEntity.id],
			});
		} else if (character === ' ') {
			tiles.push({
				position,
				type: 'chasm',
				entities: [],
			});
		} else if (character === '@') {
			const playerEntity = {
				id: uuid(),
				isSolid: true,
				isPlayerControlled: true,
				tilePosition: position,
				sprite: createSpriteComponent('ferromancer'),
			}

			entities[playerEntity.id] = playerEntity;

			tiles.push({
				position,
				type: 'floor',
				entities: [playerEntity.id],
			});
		} else {
			tiles.push({
				position,
				type: 'floor',
				entities: [],
			});
		}

		position = add(position, [1, 0]) as Position;
	});

	return {
		...state,
		tiles: [
			...state.tiles,
			...tiles,
		],
		entities: {
			...state.entities,
			...entities,
		},
	};
}
