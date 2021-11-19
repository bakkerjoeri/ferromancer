import uuid from "@bakkerjoeri/uuid";
import { createSpriteComponent, Entity, SpriteComponent } from "heks";
import { Position } from "./types";

export interface Wall extends Entity {
	isSolid: true;
	sprite: SpriteComponent;
	tilePosition: Position;
}

export function createEntity<ExpectedComponents>(components: ExpectedComponents): Entity & ExpectedComponents {
	return {
		id: uuid(),
		...components,
	};
}

export function createWall(components: Partial<Wall> = {}): Wall {
	return {
		isSolid: true,
		tilePosition: [0, 0],
		sprite: createSpriteComponent('wall'),
		...createEntity(components)
	};
}
