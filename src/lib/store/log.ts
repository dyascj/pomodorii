import type { Mode } from '$lib/timer/timer';

/** One finished session, shown on the Message Board like the Wii's play log. */
export type LogEntry = {
	id: string;
	mode: Mode;
	minutes: number;
	finishedAt: number;
	task?: string;
};

/** Enough history for a few months of daily use without growing forever. */
export const MAX_LOG_ENTRIES = 500;

export type DaySummary = {
	key: string;
	date: Date;
	focusCount: number;
	focusMinutes: number;
	entries: LogEntry[];
};

const dayKey = (date: Date) =>
	`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

/** Groups entries by local calendar day, newest day first. */
export const summarizeByDay = (entries: LogEntry[]): DaySummary[] => {
	const days = new Map<string, DaySummary>();

	for (const entry of [...entries].sort((a, b) => b.finishedAt - a.finishedAt)) {
		const date = new Date(entry.finishedAt);
		const key = dayKey(date);
		let day = days.get(key);
		if (!day) {
			day = {
				key,
				date: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
				focusCount: 0,
				focusMinutes: 0,
				entries: []
			};
			days.set(key, day);
		}
		day.entries.push(entry);
		if (entry.mode === 'focus') {
			day.focusCount += 1;
			day.focusMinutes += entry.minutes;
		}
	}

	return [...days.values()];
};

export const focusCountOn = (entries: LogEntry[], time: number) => {
	const key = dayKey(new Date(time));
	return entries.filter(
		(entry) => entry.mode === 'focus' && dayKey(new Date(entry.finishedAt)) === key
	).length;
};
