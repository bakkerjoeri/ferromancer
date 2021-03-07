import { SpriteComponent } from "heks";

export type Position = [x: number, y: number];
export type Size = [width: number, height: number];

export interface Entity {
	id: string;
}

export interface GameObject extends Entity {
	tilePosition: Position;
	isSolid: boolean;
	sprite: SpriteComponent;
}
