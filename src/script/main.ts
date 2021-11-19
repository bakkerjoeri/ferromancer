import { EventEmitter, Loop, setupCanvas, loadAssets, SpriteState, EntityState, KeyEvents, setupKeyboardEvents, UpdateEvents, DrawEvents, setupUpdateAndDrawEvents, LifeCycleEvents, Entity } from 'heks';
import { draw } from './draw';
import { updateDebuggingInfo } from './debugging';
import { Tile, setupLevel } from './level';
import { spriteSheet } from '../assets/sprites.js';
import { updateActionTicks, TurnTakenEvent, gainActionTicks } from './actors';
import { handlePlayerInput } from './player';
import { decideAction } from './npc';

export interface State extends SpriteState, EntityState {
	tiles: Tile[];
}

export interface Events extends KeyEvents, UpdateEvents, DrawEvents, LifeCycleEvents {
	turnTaken: TurnTakenEvent;
}

const level = `
##########
##.....###
#..c...@.#
#.#......#
#..t.   .#
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

const { canvas, context } = setupCanvas('.game', [320, 180]);
const eventEmitter = new EventEmitter<Events, State>();

setupUpdateAndDrawEvents(eventEmitter, canvas, context);
setupKeyboardEvents(eventEmitter);

eventEmitter.on('update', updateActionTicks);
eventEmitter.on('update', decideAction);
eventEmitter.on('turnTaken', gainActionTicks);
eventEmitter.on('draw', draw);
eventEmitter.on('keyPressed', handlePlayerInput);

const loop = new Loop((time: number) => {
	state = eventEmitter.emit('tick', state, { time });
	window.addEventListener('keydown', event => event.preventDefault());
	updateDebuggingInfo(loop, state);
});

loadAssets([
	{type: 'image', url: '/assets/sprites/spritesheet.png'},
]).then(() => {
	loop.start();
});
