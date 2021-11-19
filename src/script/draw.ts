import { add, multiplyByComponents } from "dotspace";
import { clearCanvas, DrawEvent, drawSprite, Entity, EventHandler, findEntities, getEntity, getSprite, SpriteComponent } from "heks";
import type { Tile } from "./level";
import type { Events, State } from "./main";
import type { Position } from "./types";

export type DrawEventHandler = EventHandler<DrawEvent, Events, State>;

export const TILE_SIZE = [16, 16];
export const DRAW_ORIGIN = [16, 4];

interface DrawableEntity extends Entity {
	tilePosition: Position;
	sprite: SpriteComponent;
}

export const draw: DrawEventHandler = (state, { time, canvas, context }) => {
	clearCanvas(canvas, context, '#000000');
	drawLevel(state, context);
	return state;
};

function drawLevel(state: State, context: CanvasRenderingContext2D) {
	state.tiles.forEach(tile => {
		drawTileFloor(state, tile, context);
		const entitiesOnTile = tile.entities.map(id => getEntity(state, id));
		const drawableEntities = findEntities<{
			tilePosition: Position;
			sprite: SpriteComponent;
		}>(entitiesOnTile, { tilePosition: true, sprite: true });

		drawEntities(state, drawableEntities, context);
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
}

function drawEntities(
	state: State,
	entities: DrawableEntity[],
	context: CanvasRenderingContext2D
) {
	entities.forEach(entity => {
		const drawPosition = add(multiplyByComponents(entity.tilePosition, TILE_SIZE), DRAW_ORIGIN) as Position;
		drawSprite(getSprite(state, entity.sprite.name), context, drawPosition);
	})
}
