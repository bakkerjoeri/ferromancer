import { Loop } from "heks";
import { State } from "./main";

let fpsElement = document.querySelector('.fps');
let stateElement = document.querySelector('.state');

export function updateDebuggingInfo(loop: Loop, state: State) {
	fpsElement!.innerHTML = loop.fps.toFixed(1).toString();
	stateElement!.innerHTML = JSON.stringify(state, null, 4);

}
