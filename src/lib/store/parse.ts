import { MODES, type Mode, type TimerState } from '$lib/timer/timer';
import { DEFAULT_SETTINGS, LIMITS, clamp, type Settings } from './settings';
import { MAX_LOG_ENTRIES, type LogEntry } from './log';
import { MAX_TASK_LENGTH, type Task } from './tasks';
import { isRecord } from './storage';

const isMode = (value: unknown): value is Mode => MODES.includes(value as Mode);
const isFiniteNumber = (value: unknown): value is number =>
	typeof value === 'number' && Number.isFinite(value);

const numberOr = (value: unknown, fallback: number, min: number, max: number) =>
	isFiniteNumber(value) ? clamp(value, min, max) : fallback;

const booleanOr = (value: unknown, fallback: boolean) =>
	typeof value === 'boolean' ? value : fallback;

export const parseSettings = (value: unknown): Settings | undefined => {
	if (!isRecord(value)) return undefined;
	const d = DEFAULT_SETTINGS;
	const durations = isRecord(value.durations) ? value.durations : {};

	return {
		durations: {
			focus: numberOr(durations.focus, d.durations.focus, LIMITS.focus.min, LIMITS.focus.max),
			short: numberOr(durations.short, d.durations.short, LIMITS.short.min, LIMITS.short.max),
			long: numberOr(durations.long, d.durations.long, LIMITS.long.min, LIMITS.long.max)
		},
		longBreakInterval: numberOr(
			value.longBreakInterval,
			d.longBreakInterval,
			LIMITS.longBreakInterval.min,
			LIMITS.longBreakInterval.max
		),
		autoStartBreaks: booleanOr(value.autoStartBreaks, d.autoStartBreaks),
		autoStartFocus: booleanOr(value.autoStartFocus, d.autoStartFocus),
		autoCheckTasks: booleanOr(value.autoCheckTasks, d.autoCheckTasks),
		completedToBottom: booleanOr(value.completedToBottom, d.completedToBottom),
		effectsVolume: numberOr(value.effectsVolume, d.effectsVolume, 0, 100),
		musicVolume: numberOr(value.musicVolume, d.musicVolume, 0, 100),
		pointer: booleanOr(value.pointer, d.pointer),
		reduceMotion: booleanOr(value.reduceMotion, d.reduceMotion)
	};
};

export const parseTasks = (value: unknown): Task[] | undefined => {
	if (!Array.isArray(value)) return undefined;
	return value
		.filter(
			(task): task is Task =>
				isRecord(task) &&
				typeof task.id === 'string' &&
				typeof task.title === 'string' &&
				typeof task.completed === 'boolean'
		)
		.map(({ id, title, completed }) => ({ id, title: title.slice(0, MAX_TASK_LENGTH), completed }));
};

export const parseLog = (value: unknown): LogEntry[] | undefined => {
	if (!Array.isArray(value)) return undefined;
	return value
		.filter(
			(entry): entry is LogEntry =>
				isRecord(entry) &&
				typeof entry.id === 'string' &&
				isMode(entry.mode) &&
				isFiniteNumber(entry.minutes) &&
				isFiniteNumber(entry.finishedAt) &&
				(entry.task === undefined || typeof entry.task === 'string')
		)
		.slice(-MAX_LOG_ENTRIES);
};

export const parseTimer = (value: unknown): TimerState | undefined => {
	if (!isRecord(value) || !isMode(value.mode)) return undefined;
	const { status, mode } = value;

	if (status === 'running' && isFiniteNumber(value.endsAt)) {
		return { status, mode, endsAt: value.endsAt };
	}
	if ((status === 'idle' || status === 'paused') && isFiniteNumber(value.remainingMs)) {
		return { status, mode, remainingMs: Math.max(0, value.remainingMs) };
	}
	return undefined;
};
