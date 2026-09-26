import { describe, expect, it } from 'vitest';
import { focusCountOn, summarizeByDay, type LogEntry } from './log';

const at = (day: number, hour: number) => new Date(2026, 8, day, hour).getTime();

const entries: LogEntry[] = [
	{ id: '1', mode: 'focus', minutes: 25, finishedAt: at(24, 9) },
	{ id: '2', mode: 'short', minutes: 5, finishedAt: at(24, 10) },
	{ id: '3', mode: 'focus', minutes: 25, finishedAt: at(26, 8), task: 'Write README' },
	{ id: '4', mode: 'focus', minutes: 50, finishedAt: at(26, 14) }
];

describe('session log', () => {
	it('groups by day with the newest day and entry first', () => {
		const days = summarizeByDay(entries);
		expect(days.map((day) => day.key)).toEqual(['2026-09-26', '2026-09-24']);
		expect(days[0].entries.map((entry) => entry.id)).toEqual(['4', '3']);
	});

	it('totals focus sessions only', () => {
		const [today, earlier] = summarizeByDay(entries);
		expect(today).toMatchObject({ focusCount: 2, focusMinutes: 75 });
		expect(earlier).toMatchObject({ focusCount: 1, focusMinutes: 25 });
	});

	it('counts focus sessions on a given day', () => {
		expect(focusCountOn(entries, new Date(2026, 8, 26, 23).getTime())).toBe(2);
		expect(focusCountOn(entries, new Date(2026, 8, 25).getTime())).toBe(0);
	});
});
