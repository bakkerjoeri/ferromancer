import { Loop } from "heks";

let fpsElement = document.querySelector('.fps');

export function updateDebuggingInfo(loop: Loop) {
	fpsElement!.innerHTML = loop.fps.toFixed(1).toString();
}
