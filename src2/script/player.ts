import { TiledScene } from "./main";
import { Component, Entity, SpriteComponent, TilePositionComponent } from "./library";
import { actInDirection } from "./actors";

export function createPlayerEntity() {
	return new Entity({
		sprite: new SpriteComponent({
			name: 'ferromancer',
		}),
		tilePosition: new TilePositionComponent(),
		playerInput: new PlayerInputComponent(),
	});
}

class PlayerInputComponent extends Component {
	constructor() {
		super('playerInput');

		window.addEventListener('keydown', this.handleInput.bind(this));
	}

	handleInput(event: KeyboardEvent) {
		if (event.repeat || !this.parent) {
			return;
		}

		if (event.key === 'ArrowUp' || event.key === 'w' || event.key === '8') {
			actInDirection(this.parent.scene as TiledScene, this.parent, [0, -1]);
		}

		if (event.key === 'ArrowRight' || event.key === 'd' || event.key === '6') {
			actInDirection(this.parent.scene as TiledScene, this.parent, [1, 0]);
		}

		if (event.key === 'ArrowDown' || event.key === 's' || event.key === '2') {
			actInDirection(this.parent.scene as TiledScene, this.parent, [0, 1]);
		}

		if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === '3') {
			actInDirection(this.parent.scene as TiledScene, this.parent, [-1, 0]);
		}
	}
}
