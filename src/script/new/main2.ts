import uuid from "@bakkerjoeri/uuid";
import { Loop } from "heks";

class Game {
	public rootScene: Scene;

	constructor(rootScene: Scene, canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
		this.rootScene = rootScene;

		const loop = new Loop((time: number) => {
			rootScene.update(time);
			rootScene.draw(time, canvas, context);
		});

		loop.start();
	}
}

class Scene {
	children: Scene[] = [];
	components: Component[] = [];
	update(time: number) {}
	draw(time: number, canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {}
}

class Entity {
	public readonly id: string = uuid();
}

class Component<Properties extends any = {}> {
	public readonly entityId: Entity['id'];
	public properties: Properties;

	constructor(entityId: Entity['id'], properties: Properties) {
		this.entityId = entityId;
		this.properties = properties;
	}

	update() {}

	draw() {}
}
