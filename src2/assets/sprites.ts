import { Sprite } from 'heks';

export const spriteSheet: Sprite[] = [
	{
		name: 'wall',
		frames: [
			{
				file: '/assets/sprites/spritesheet.png',
				origin: [16, 0],
				size: [16, 20],
			}
		],
		offset: [0, -4],
	},
	{
		name: 'floor',
		frames: [
			{
				file: '/assets/sprites/spritesheet.png',
				origin: [0, 0],
				size: [16, 20],
			}
		],
		offset: [0, 0],
	},
	{
		name: 'ferromancer',
		frames: [
			{
				file: '/assets/sprites/spritesheet.png',
				origin: [0, 20],
				size: [16, 20],
			}
		],
		offset: [0, -5],
	},
	{
		name: 'transporter-bot',
		frames: [
			{
				file: '/assets/sprites/spritesheet.png',
				origin: [0, 40],
				size: [16, 20],
			},
		],
		offset: [0, -5],
	},
	{
		name: 'transporter-bot-carrying-core',
		frames: [
			{
				file: '/assets/sprites/spritesheet.png',
				origin: [16, 40],
				size: [16, 20],
			},
		],
		offset: [0, -5],
	},
	{
		name: 'core',
		frames: [
			{
				file: '/assets/sprites/spritesheet.png',
				origin: [0, 66],
				size: [16, 14],
			}
		],
		offset: [0, 0],
	},
]
