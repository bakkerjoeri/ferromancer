import { EventHandler } from "heks";
import type { Events, State } from "./main";

export interface UpdateEvent { time: number; }
export type UpdateEventHandler = EventHandler<UpdateEvent, Events, State>;

export const update: UpdateEventHandler = (state, { time }) => {
	return state;
};
