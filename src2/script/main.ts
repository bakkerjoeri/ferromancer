import { clearCanvas, drawSprite, Loop, setupCanvas } from 'heks';
import { Component, Entity, Game, Scene, SpriteComponent, TilePositionComponent } from './library';
import { spriteSheet } from './../assets/sprites.js';
import { add, equals, multiplyByComponents } from 'dotspace';
import { Position } from './types';
import arrayWithout from '@bakkerjoeri/array-without';
import { createPlayerEntity } from './player';

const { context, canvas } = setupCanvas('.game', [320, 180], true);

const game = new Game(canvas, context);
const loop = new Loop((time: number) => game.tick(time));

export interface Tile {
	entities: Array<Entity['id']>;
	position: [x: number, y: number];
	type: 'chasm' | 'floor' | 'wall';
}

const TILE_SIZE = [16, 16];
const DRAW_ORIGIN = [0, 4];

export function setupLevel(level: string): Tile[] {
	const tiles: Tile[] = [];
	let position = [0, 0] as Position;

	level.split('').forEach(character => {
		if (character === '\n') {
			position = [0, position[1] + 1];
			return;
		}

		if (character === '#') {
			tiles.push({
				position,
				type: 'wall',
				entities: [],
			});
		} else if (character === ' ') {
			tiles.push({
				position,
				type: 'chasm',
				entities: [],
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

	return tiles;
}

export class TiledScene extends Scene {
	public tiles: Tile[] = [];

	constructor() {
		super();
	}

	public draw(time: number, game: Game) {
		clearCanvas(game.canvas, game.context);

		this.tiles.forEach(tile => {
			this.drawTile(tile, game);
			tile.entities.map((id) => { return this.getEntity(id) }).forEach(entity => {
				entity.trigger('draw', { time }, { scene: this, game });
			});
		});
	}

	public moveEntityToPosition(entity: Entity, position: Position) {
		const currentTile = this.tiles.find(tile => tile.entities.includes(entity.id));
		const newTile = this.getTileAtPosition(position);

		if (currentTile) {
			currentTile.entities = arrayWithout(currentTile.entities, entity.id);
		}

		newTile.entities.push(entity.id);
		entity.trigger('moveToTile', newTile.position, { scene: this, game });
	}

	public hasTileAtPosition(position: Position): boolean {
		return this.tiles.some(tile => equals(tile.position, position));
	}

	public getTileAtPosition(position: Position): Tile {
		const tile = this.tiles.find(tile => equals(tile.position, position));

		if (!tile) {
			throw new Error(`No tile found at position ${position[0]}, ${position[1]}`);
		}

		return tile;
	}

	private drawTile(tile: Tile, game: Game) {
		if (tile.type === 'chasm') {
			return;
		}

		const drawPosition = add(multiplyByComponents(tile.position, TILE_SIZE), DRAW_ORIGIN) as Position;

		if (tile.type === 'wall') {
			drawSprite(game.sprites.getSprite('wall'), context, drawPosition);
		}
	
		if (tile.type === 'floor') {
			drawSprite(game.sprites.getSprite('floor'), context, drawPosition);
		}
	}
}

const level = 
`##########
##.....###
#..c...@.#
#.#......#
#..t.   .#
#....   .#
#.##.....#
##########`;

const scene = new TiledScene();
scene.tiles = setupLevel(level);

const playerEntity = createPlayerEntity();
scene.addEntity(playerEntity);
scene.moveEntityToPosition(playerEntity, [3, 3]);

game.currentScene = scene;

game.sprites.addSprites(spriteSheet);
game.sprites.load().then(() => {
	loop.start();
});

