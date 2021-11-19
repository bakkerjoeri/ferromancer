import uuid from "@bakkerjoeri/uuid";
import { multiplyByComponents } from "dotspace";
import { clearCanvas, drawSprite, loadAssets, Sprite } from "heks";
import { Position } from "./types";

interface Events {
	update: { time: number };
	draw: { time: number };
	changePosition: Position;
	moveToTile: Position;
	takeTurn: {};
}

interface EventContext {
	game: Game;
	scene: Scene;
}

interface EventHandler<EventType extends keyof Events> {
	(event: Events[EventType], context: EventContext): any;
}

export class Game {
	readonly canvas: HTMLCanvasElement;
	readonly context: CanvasRenderingContext2D;
	readonly sprites: SpriteManager;

	currentScene: Scene | null = null;

	constructor(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
		this.sprites = new SpriteManager();
		this.canvas = canvas;
		this.context = context;
	}

	tick(time: number) {
		if (!this.currentScene) {
			return;
		}
	
		this.currentScene.update(time, this);
		this.currentScene.draw(time, this);
	}
}

export class Scene {
	public entities: Entity[] = [];

	public getEntity(id: Entity['id']): Entity {
		const entity = this.entities.find(entity => entity.id === id);

		if (!entity) {
			throw new Error(`No entity with id ${id} found.`);
		}

		return entity;
	}

	public update(time: number, game: Game): void {
		this.entities.forEach(entity => {
			entity.trigger('update', { time }, { scene: this, game });
		});
	}

	public draw(time: number, game: Game): void {
		clearCanvas(game.canvas, game.context);

		this.entities.forEach(entity => {
			entity.trigger('draw', { time }, { scene: this, game });
		});
	}

	public addEntity(entity: Entity): void {
		this.entities.push(entity);
		entity.scene = this;
	}
}

export class Entity {
	public readonly id: string = uuid();
	public scene: Scene | null = null;
	public components: { [name: string]: Component } = {};

	constructor(components: Entity['components']) {
		Object.entries(components).forEach(([name, component]) => {
			this.setComponent(name, component);
		});
	}
	
	private get componentList() {
		return Object.values(this.components);
	}

	public trigger<EventType extends keyof Events>(
		eventType: EventType,
		event: Events[EventType],
		context: EventContext
	) {
		this.componentList.forEach(component => {
			component.trigger(eventType, event, context);
		});
	}

	public setComponent(name: string, component: Component) {
		this.components[name] = component;
		component.parent = this;
	}

	public updateComponent(name: string, value: any) {
		if (!this.components[name]) {
			throw new Error(`No component with name ${name} found.`);
		}

		this.components[name].value = value;
	}
}

export class Component<ValueType = unknown> {
	public parent: Entity | null = null;
	public value: ValueType;
	public readonly type: string;
	private handlers: any = {};

	constructor(
		type: string,
		value: ValueType = {} as ValueType,
		events: any = {},
	) {
		this.type = type;
		this.value = value;

		Object.entries(events).forEach(([name, handlers]: any) => {
			handlers.forEach((handler: any) => {
				this.on(name, handler);
			});
		});
	}

	triggerToParent<EventType extends keyof Events>(
		eventType: EventType,
		event: Events[EventType],
		context: EventContext
	) {
		if (!this.parent) {
			return;
		}

		this.parent.trigger(eventType, event, context);
	}

	trigger<EventType extends keyof Events>(
		eventType: EventType,
		event: Events[EventType],
		context: EventContext
	) {
		if (!this.handlers[eventType]) {
			return;
		}

		this.handlers[eventType].forEach((handler: EventHandler<EventType>) => {
			handler(event, context);
		});
	}

	on<EventType extends keyof Events>(
		eventType: EventType,
		handler: EventHandler<EventType>
	) {
		if (!this.handlers[eventType]) {
			this.handlers[eventType] = [];
		}

		this.handlers[eventType].push(handler);
	}
}

interface SpriteComponentValue {
	name: string;
	position: Position;
	frameIndex: number;
}

const spriteComponentDefaults = {
	name: '',
	position: [0, 0] as Position,
	frameIndex: 0,
};

export class SpriteComponent extends Component<SpriteComponentValue> {
	constructor(value: Partial<SpriteComponentValue>) {
		super('sprite', {...spriteComponentDefaults, ...value});

		this.on('draw', this.draw.bind(this));
		this.on('changePosition', (position) => {
			this.value.position = position;
		});
	}

	draw(event: Events['draw'], { game }: EventContext): void {
		drawSprite(
			game.sprites.getSprite(this.value.name),
			game.context,
			this.value.position,
			this.value.frameIndex
		);
	}
}

export class SpriteManager {
	public sprites: {
		[name: string]: Sprite;
	} = {}

	async load() {
		const assetUrls: string[] = [];

		Object.values(this.sprites).forEach(sprite => {
			sprite.frames.forEach(frame => {
				if (!assetUrls.includes(frame.file)) {
					assetUrls.push(frame.file);
				}
			})
		});

		await loadAssets(assetUrls.map(url => ({ type: 'image', url })));
	}

	addSprites(sprites: Sprite[]) {
		this.sprites = {
			...this.sprites,
			...sprites.reduce((spriteMap, sprite) => {
				return {
					...spriteMap,
					[sprite.name]: sprite,
				};
			}, {}),
		};
	}

	hasSprite(name: string) {
		return !!this.sprites[name];
	}

	getSprite(name: string) {
		if (!this.hasSprite(name)) {
			throw Error(`No sprite with name ${name} found.`);
		}
		
		return this.sprites[name];
	}
}

export class TilePositionComponent extends Component {
	constructor(value: Position = [0, 0]) {
		super('tilePosition', value);

		this.on('moveToTile', (position, context) => {
			this.value = position;
			this.triggerToParent(
				'changePosition',
				multiplyByComponents(position, [16, 16]) as Position,
				context
			);
		});
	}
}
