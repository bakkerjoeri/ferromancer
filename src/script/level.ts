import arrayWithout from "@bakkerjoeri/array-without";
import { add } from "dotspace";
import { createSpriteComponent, setEntity } from "heks";
import { createEntity, createWall } from "./entities";
import { createActor } from "./actors";
import type { State } from "./main";
import type { Entity } from "heks";
import type { Position } from "./types";
import { createNpc } from "./npc";
import { createPlayer } from "./player";

export interface Tile {
	position: Position;
	type: 'floor' | 'chasm';
	entities: Entity['id'][];
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
			const wallEntity = createWall({
				tilePosition: position,
			});

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
			const playerEntity = createPlayer({
				tilePosition: position,
			});

			entities[playerEntity.id] = playerEntity;

			tiles.push({
				position,
				type: 'floor',
				entities: [playerEntity.id],
			});
		} else if (character === 't') {
			const transporterBot = createNpc({
				isSolid: true,
				tilePosition: position,
				sprite: createSpriteComponent('transporter-bot'),
			});

			entities[transporterBot.id] = transporterBot;

			tiles.push({
				position,
				type: 'floor',
				entities: [transporterBot.id],
			});
		} else if (character === 'c') {
			const transporterBot = createEntity({
				isSolid: false,
				tilePosition: position,
				sprite: createSpriteComponent('core'),
			});

			entities[transporterBot.id] = transporterBot;

			tiles.push({
				position,
				type: 'floor',
				entities: [transporterBot.id],
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

export const moveEntityToTile = (entity: Entity & {tilePosition: Position}, toTile: Tile, previousTile?: Tile) => (state: State) => {
	state = {
		...state,
		tiles: state.tiles.map(tile => {
			if (tile === previousTile) {
				return {
					...tile,
					entities: arrayWithout(tile.entities, entity.id),
				}
			}

			if (tile === toTile) {
				return {
					...tile,
					entities: [
						...tile.entities,
						entity.id,
					]
				}
			}

			return tile;
		})
	}

	state = setEntity({
		...entity,
		tilePosition: [...toTile.position],
	})(state);

	return state;
}
