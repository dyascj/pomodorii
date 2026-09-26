export type Mode = 'focus' | 'short' | 'long';

export const MODES: readonly Mode[] = ['focus', 'short', 'long'];

export type Durations = Record<Mode, number>;

/**
 * The timer is stored as a deadline rather than a ticking counter, so it
 * stays accurate when the tab is throttled in the background and survives a
 * page reload.
 */
export type TimerState =
	| { status: 'idle'; mode: Mode; remainingMs: number }
	| { status: 'paused'; mode: Mode; remainingMs: number }
	| { status: 'running'; mode: Mode; endsAt: number };

export const minutesToMs = (minutes: number) => Math.round(minutes * 60_000);

export const createTimer = (mode: Mode, durations: Durations): TimerState => ({
	status: 'idle',
	mode,
	remainingMs: minutesToMs(durations[mode])
});

export const remainingMs = (timer: TimerState, now: number) =>
	timer.status === 'running' ? Math.max(0, timer.endsAt - now) : timer.remainingMs;

export const startTimer = (timer: TimerState, now: number): TimerState =>
	timer.status === 'running'
		? timer
		: { status: 'running', mode: timer.mode, endsAt: now + timer.remainingMs };

export const pauseTimer = (timer: TimerState, now: number): TimerState =>
	timer.status === 'running'
		? { status: 'paused', mode: timer.mode, remainingMs: remainingMs(timer, now) }
		: timer;

export const isExpired = (timer: TimerState, now: number) =>
	timer.status === 'running' && now >= timer.endsAt;

/** Fraction of the session that has elapsed, from 0 to 1. */
export const progress = (timer: TimerState, durations: Durations, now: number) => {
	const total = minutesToMs(durations[timer.mode]);
	if (total <= 0) return 1;
	return Math.min(1, Math.max(0, 1 - remainingMs(timer, now) / total));
};

/** Picks the session that follows a finished one. */
export const nextMode = (finished: Mode, focusCount: number, longBreakInterval: number): Mode => {
	if (finished !== 'focus') return 'focus';
	return longBreakInterval > 0 && focusCount % longBreakInterval === 0 ? 'long' : 'short';
};

export const formatClock = (ms: number) => {
	const totalSeconds = Math.ceil(ms / 1000);
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};
