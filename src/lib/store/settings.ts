import type { Durations } from '$lib/timer/timer';

export type Settings = {
	durations: Durations;
	longBreakInterval: number;
	autoStartBreaks: boolean;
	autoStartFocus: boolean;
	autoCheckTasks: boolean;
	completedToBottom: boolean;
	effectsVolume: number;
	musicVolume: number;
	pointer: boolean;
	reduceMotion: boolean;
};

export const DEFAULT_SETTINGS: Settings = {
	durations: { focus: 25, short: 5, long: 15 },
	longBreakInterval: 4,
	autoStartBreaks: false,
	autoStartFocus: false,
	autoCheckTasks: false,
	completedToBottom: true,
	effectsVolume: 60,
	musicVolume: 25,
	pointer: true,
	reduceMotion: false
};

export const LIMITS = {
	focus: { min: 1, max: 120 },
	short: { min: 1, max: 60 },
	long: { min: 1, max: 90 },
	longBreakInterval: { min: 2, max: 12 }
} as const;

export const clamp = (value: number, min: number, max: number) =>
	Math.min(max, Math.max(min, Math.round(value)));
