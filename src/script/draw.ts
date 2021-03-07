import { add, multiplyByComponents } from "dotspace";
import { clearCanvas, drawSprite, EventHandler, getEntity, getSprite } from "heks";
import type { Tile } from "./level";
import type { Events, State } from "./main";
import type { GameObject, Position } from "./types";

export interface DrawEvent { time: number; canvas: HTMLCanvasElement; context: CanvasRenderingContext2D }
export type DrawEventHandler = EventHandler<DrawEvent, Events, State>;

export const TILE_SIZE = [16, 16];
export const DRAW_ORIGIN = [16, 4];

export const draw: DrawEventHandler = (state, { time, canvas, context }) => {
	clearCanvas(canvas, context, '#000000');
	drawLevel(state, context);
	return state;
};

function drawLevel(state: State, context: CanvasRenderingContext2D) {
	state.tiles.forEach(tile => {
		drawTileFloor(state, tile, context);
		drawEntities(state, tile.entities.map(id => getEntity(state, id)) as GameObject[], context);
	});
}

function drawTileFloor(state: State, tile: Tile, context: CanvasRenderingContext2D) {
	if (tile.type === 'chasm') {
		return;
	}

	const drawPosition = add(multiplyByComponents(tile.position, TILE_SIZE), DRAW_ORIGIN) as Position;

	if (tile.type === 'floor') {
		drawSprite(getSprite(state, 'floor'), context, drawPosition);
	}

	if (tile.type === 'wall') {
		drawSprite(getSprite(state, 'wall'), context, drawPosition);
	}
}

function drawEntities(state: State, entities: GameObject[], context: CanvasRenderingContext2D) {
	entities.forEach(entity => {
		const drawPosition = add(multiplyByComponents(entity.tilePosition, TILE_SIZE), DRAW_ORIGIN) as Position;
		drawSprite(getSprite(state, entity.sprite.name), context, drawPosition);
	})
}
