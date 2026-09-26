import { describe, expect, it } from 'vitest';
import { parseLog, parseSettings, parseTasks, parseTimer } from './parse';
import { DEFAULT_SETTINGS } from './settings';

describe('stored data parsing', () => {
	it('fills missing settings from defaults and clamps out-of-range values', () => {
		const settings = parseSettings({ durations: { focus: 999, short: 'x' }, musicVolume: -4 });
		expect(settings?.durations).toEqual({ focus: 120, short: 5, long: 15 });
		expect(settings?.musicVolume).toBe(0);
		expect(settings?.pointer).toBe(DEFAULT_SETTINGS.pointer);
	});

	it('rejects settings that are not an object', () => {
		expect(parseSettings(null)).toBeUndefined();
		expect(parseSettings([1, 2])).toBeUndefined();
	});

	it('drops malformed tasks and log entries', () => {
		expect(parseTasks([{ id: 'a', title: 'Ok', completed: false }, { id: 2 }])).toEqual([
			{ id: 'a', title: 'Ok', completed: false }
		]);
		expect(
			parseLog([
				{ id: 'a', mode: 'focus', minutes: 25, finishedAt: 1 },
				{ id: 'b', mode: 'nap', minutes: 25, finishedAt: 1 }
			])
		).toHaveLength(1);
	});

	it('restores a running or paused timer', () => {
		expect(parseTimer({ status: 'running', mode: 'focus', endsAt: 42 })).toEqual({
			status: 'running',
			mode: 'focus',
			endsAt: 42
		});
		expect(parseTimer({ status: 'paused', mode: 'long', remainingMs: -5 })).toEqual({
			status: 'paused',
			mode: 'long',
			remainingMs: 0
		});
		expect(parseTimer({ status: 'running', mode: 'focus' })).toBeUndefined();
	});
});
