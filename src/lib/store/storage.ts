const PREFIX = 'pomodorii:';

/**
 * Reads a JSON value from localStorage. Stored data is untrusted (older
 * versions, manual edits, other tabs), so `parse` validates it and returns
 * `undefined` to fall back to the default.
 */
export const readStored = <T>(
	key: string,
	fallback: T,
	parse: (value: unknown) => T | undefined
) => {
	if (typeof localStorage === 'undefined') return fallback;
	try {
		const raw = localStorage.getItem(PREFIX + key);
		if (raw === null) return fallback;
		return parse(JSON.parse(raw)) ?? fallback;
	} catch {
		return fallback;
	}
};

export const writeStored = (key: string, value: unknown) => {
	try {
		localStorage.setItem(PREFIX + key, JSON.stringify(value));
	} catch {
		// Private mode or a full quota: the console keeps working in memory.
	}
};

export const clearStored = () => {
	try {
		for (const key of Object.keys(localStorage)) {
			if (key.startsWith(PREFIX)) localStorage.removeItem(key);
		}
	} catch {
		// Nothing to clear.
	}
};

export const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);
