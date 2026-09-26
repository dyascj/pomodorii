import { describe, expect, it } from 'vitest';
import {
	createTimer,
	formatClock,
	isExpired,
	nextMode,
	pauseTimer,
	progress,
	remainingMs,
	startTimer
} from './timer';

const durations = { focus: 25, short: 5, long: 15 };

describe('timer', () => {
	it('starts from the full duration of the mode', () => {
		const timer = createTimer('short', durations);
		expect(timer).toEqual({ status: 'idle', mode: 'short', remainingMs: 300_000 });
	});

	it('counts down against a deadline', () => {
		const running = startTimer(createTimer('focus', durations), 1_000);
		expect(remainingMs(running, 1_000)).toBe(1_500_000);
		expect(remainingMs(running, 61_000)).toBe(1_440_000);
	});

	it('keeps the remaining time across a pause and resume', () => {
		const running = startTimer(createTimer('focus', durations), 0);
		const paused = pauseTimer(running, 600_000);
		expect(paused).toEqual({ status: 'paused', mode: 'focus', remainingMs: 900_000 });

		const resumed = startTimer(paused, 5_000_000);
		expect(remainingMs(resumed, 5_000_000)).toBe(900_000);
	});

	it('never reports negative time and flags expiry', () => {
		const running = startTimer(createTimer('short', durations), 0);
		expect(remainingMs(running, 999_999)).toBe(0);
		expect(isExpired(running, 299_999)).toBe(false);
		expect(isExpired(running, 300_000)).toBe(true);
	});

	it('reports progress through the session', () => {
		const running = startTimer(createTimer('short', durations), 0);
		expect(progress(running, durations, 0)).toBe(0);
		expect(progress(running, durations, 150_000)).toBe(0.5);
		expect(progress(running, durations, 400_000)).toBe(1);
	});

	it('alternates focus with short breaks and a long break every interval', () => {
		expect(nextMode('focus', 1, 4)).toBe('short');
		expect(nextMode('focus', 4, 4)).toBe('long');
		expect(nextMode('focus', 8, 4)).toBe('long');
		expect(nextMode('short', 3, 4)).toBe('focus');
		expect(nextMode('long', 4, 4)).toBe('focus');
		expect(nextMode('focus', 4, 0)).toBe('short');
	});

	it('formats the clock rounding partial seconds up', () => {
		expect(formatClock(1_500_000)).toBe('25:00');
		expect(formatClock(59_001)).toBe('01:00');
		expect(formatClock(999)).toBe('00:01');
		expect(formatClock(0)).toBe('00:00');
	});
});
