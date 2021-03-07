import { EventEmitter, Loop, setupCanvas, loadAssets, SpriteState, EntityState, KeyEvents, KeyEvent, findEntity, getEntities, setupKeyboardEvents, UpdateEvents, DrawEvents, setupUpdateAndDrawEvents, LifeCycleEvents, setEntity } from 'heks';
import { update } from './update';
import { draw } from './draw';

import type { UpdateEvent } from './update';
import type { DrawEvent } from './draw';
import { updateDebuggingInfo } from './debugging';
import { Tile, setupLevel } from './level';
import { spriteSheet } from '../assets/sprites.js';
import { GameObject, Position } from './types';
import { add } from 'dotspace';
import arrayWithout from '@bakkerjoeri/array-without';

/**
 * State shape idea
 * - scene:
 * 		- id
 * 		- entities
 * 		- size
 * 		- whatever else is in the scene
 * - currentSceneId
 * - viewport: // this decides what part of the current scene the canvas is drawing
 * 		- size
 * 		- position
 * - 
 */

export interface State extends SpriteState, EntityState {
	tiles: Tile[];
}

export interface Events extends KeyEvents, UpdateEvents, DrawEvents, LifeCycleEvents {
	start: {},
	update: UpdateEvent
	draw: DrawEvent
}

const level = `
##########
##.....###
#......@.#
#.#......#
#....   .#
#....   .#
#.##.....#
##########`;

let state: State = {
	tiles: [],
	sprites: spriteSheet.reduce((spriteMap, sprite) => {
		return {
			...spriteMap,
			[sprite.name]: sprite,
		}
	}, {}),
	entities: {},
};

state = setupLevel(state, level);
window.addEventListener('keydown', event => event.preventDefault());
const { canvas, context } = setupCanvas('.game', [320, 180]);
const eventEmitter = new EventEmitter<Events, State>();

setupUpdateAndDrawEvents(eventEmitter, canvas, context);
setupKeyboardEvents(eventEmitter);

eventEmitter.on('update', update);
eventEmitter.on('draw', draw);
eventEmitter.on('keyPressed', handleKeyPressed)

const loop = new Loop((time: number) => {
	state = eventEmitter.emit('tick', state, { time });
	updateDebuggingInfo(loop, state);
});

function startGame() {
	state = eventEmitter.emit('start', state, {});
	loop.start();
}

loadAssets([
	{type: 'image', url: '/assets/sprites/spritesheet.png'},
]).then(() => {
	startGame();
});

function handleKeyPressed(state: State, { key }: KeyEvent): State {
	const playerEntity = findEntity(getEntities(state), { isPlayerControlled: true }) as GameObject;
	
	if (key === 'ArrowUp') {
		return actInDirection(state, playerEntity, [0, -1]);
	}

	if (key === 'ArrowRight') {
		return actInDirection(state, playerEntity, [1, 0]);
	}

	if (key === 'ArrowDown') {
		return actInDirection(state, playerEntity, [0, 1]);
	}

	if (key === 'ArrowLeft') {
		return actInDirection(state, playerEntity, [-1, 0]);
	}

	return state;
}

function actInDirection(state: State, entity: GameObject, offset: [x: number, y: number]): State {
	const currentTile = state.tiles.find(tile => tile.position[0] === entity.tilePosition[0] && tile.position[1] === entity.tilePosition[1]);
	const positionOfAction = add(entity.tilePosition, offset);
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

	return moveEntityToTile(entity, tileInDirection, currentTile)(state);
}

const moveEntityToTile = (entity: GameObject, toTile: Tile, previousTile?: Tile) => (state: State) => {
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
