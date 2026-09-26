import { createContext } from 'svelte';
import { prefersReducedMotion } from 'svelte/motion';
import { audioEngine, type SoundName } from '$lib/audio/engine';
import { MESSAGES, detectLanguage, isLanguage, type Language } from '$lib/i18n';
import { RADIO_CHANNELS, getRadioChannel } from '$lib/radio/channels';
import type { RadioChannelId, RadioPlaybackState } from '$lib/radio/types';
import { MAX_LOG_ENTRIES, focusCountOn, type LogEntry } from '$lib/store/log';
import { parseLog, parseSettings, parseTasks, parseTimer } from '$lib/store/parse';
import { DEFAULT_SETTINGS, LIMITS, clamp, type Settings } from '$lib/store/settings';
import { clearStored, isRecord, readStored, writeStored } from '$lib/store/storage';
import {
	completeFirstOpen,
	createTask,
	firstOpenTask,
	toggleTask,
	type Task
} from '$lib/store/tasks';
import {
	createTimer,
	formatClock,
	isExpired,
	minutesToMs,
	nextMode,
	pauseTimer,
	progress,
	remainingMs,
	startTimer,
	type Mode,
	type TimerState
} from '$lib/timer/timer';

export type Theme = 'light' | 'dark' | 'system';
export type ChannelId = 'focus' | 'tasks' | 'radio' | 'settings' | 'board';

type Preferences = {
	language: Language;
	theme: Theme;
	muted: boolean;
	station: RadioChannelId;
	radioOn: boolean;
	cycle: number;
	boardSeenAt: number;
};

export type Celebration = { id: number; mode: Mode };

const THEMES: readonly Theme[] = ['light', 'dark', 'system'];
const COUNTDOWN_TICKS = 5;

const parsePreferences = (value: unknown): Partial<Preferences> | undefined => {
	if (!isRecord(value)) return undefined;
	return {
		language: isLanguage(value.language) ? value.language : undefined,
		theme: THEMES.includes(value.theme as Theme) ? (value.theme as Theme) : undefined,
		muted: typeof value.muted === 'boolean' ? value.muted : undefined,
		station: RADIO_CHANNELS.some((channel) => channel.id === value.station)
			? (value.station as RadioChannelId)
			: undefined,
		radioOn: typeof value.radioOn === 'boolean' ? value.radioOn : undefined,
		cycle: typeof value.cycle === 'number' ? Math.max(0, Math.floor(value.cycle)) : undefined,
		boardSeenAt: typeof value.boardSeenAt === 'number' ? value.boardSeenAt : undefined
	};
};

/**
 * All console state in one place: the timer, tasks, session log and
 * preferences. Everything that should survive a reload is written to
 * localStorage by `persist()`.
 */
export class Pomodorii {
	settings = $state<Settings>(structuredClone(DEFAULT_SETTINGS));
	tasks = $state<Task[]>([]);
	log = $state<LogEntry[]>([]);
	timer = $state<TimerState>(createTimer('focus', DEFAULT_SETTINGS.durations));
	/** Focus sessions finished since the last long break. */
	cycle = $state(0);
	language = $state<Language>('en');
	theme = $state<Theme>('system');
	muted = $state(false);
	station = $state<RadioChannelId>('pomodorii-main-theme');
	/** Whether the listener wants the radio on, whatever the station. */
	radioOn = $state(true);
	boardSeenAt = $state(0);
	/** Playback reported by whichever station is active. */
	radioState = $state<RadioPlaybackState>('idle');
	/** The mix picked on stations that have several. */
	radioTrack = $state<string | null>(null);
	/**
	 * Places the streaming video can sit, from most to least specific: the
	 * Radio Channel's screen, its banner, and its menu tile. The station player
	 * uses the best one on screen and falls back to a small corner TV.
	 */
	radioDocks = $state<Record<'channel' | 'banner' | 'tile', HTMLElement | null>>({
		channel: null,
		banner: null,
		tile: null
	});
	/** False while a channel covers the menu. */
	menuVisible = $state(true);
	loaded = $state(false);
	now = $state(Date.now());
	celebration = $state<Celebration | null>(null);

	t = $derived(MESSAGES[this.language]);
	channel = $derived(getRadioChannel(this.station) ?? RADIO_CHANNELS[0]);
	track = $derived.by(() => {
		const channel = this.channel;
		if (channel.provider !== 'youtube') return null;
		const tracks = channel.tracks ?? [];
		return (
			tracks.find((track) => track.id === this.radioTrack) ??
			tracks[0] ?? {
				id: channel.id,
				videoId: channel.videoId,
				title: channel.trackLabel,
				startSeconds: channel.startSeconds
			}
		);
	});
	onAir = $derived(this.radioOn && this.radioState === 'playing');
	reducedMotion = $derived(this.settings.reduceMotion || prefersReducedMotion.current);
	remaining = $derived(remainingMs(this.timer, this.now));
	clock = $derived(formatClock(this.remaining));
	progress = $derived(progress(this.timer, this.settings.durations, this.now));
	running = $derived(this.timer.status === 'running');
	currentTask = $derived(firstOpenTask(this.tasks));
	todayCount = $derived(focusCountOn(this.log, this.now));
	unread = $derived(this.log.filter((entry) => entry.finishedAt > this.boardSeenAt).length);

	private lastTickSecond = -1;
	private celebrationId = 0;

	/** Restores saved state. Runs on the client after hydration. */
	load() {
		const preferences = readStored('preferences', {}, parsePreferences);
		this.settings = readStored('settings', this.settings, parseSettings);
		this.tasks = readStored('tasks', [], parseTasks);
		this.log = readStored('log', [], parseLog);
		this.language = preferences.language ?? detectLanguage(navigator.languages);
		this.theme = preferences.theme ?? 'system';
		this.muted = preferences.muted ?? false;
		this.station = preferences.station ?? 'pomodorii-main-theme';
		this.radioOn = preferences.radioOn ?? true;
		this.cycle = preferences.cycle ?? 0;
		this.boardSeenAt = preferences.boardSeenAt ?? 0;
		this.timer = readStored('timer', createTimer('focus', this.settings.durations), parseTimer);
		this.now = Date.now();

		// A session that ran out while the tab was closed still counts.
		if (isExpired(this.timer, this.now)) this.finish({ quiet: true });
		this.loaded = true;
	}

	/** Mirrors state to localStorage. Call once from a component. */
	persist() {
		$effect(() => {
			if (!this.loaded) return;
			writeStored('settings', $state.snapshot(this.settings));
		});
		$effect(() => {
			if (!this.loaded) return;
			writeStored('tasks', $state.snapshot(this.tasks));
		});
		$effect(() => {
			if (!this.loaded) return;
			writeStored('log', $state.snapshot(this.log));
		});
		$effect(() => {
			if (!this.loaded) return;
			writeStored('timer', $state.snapshot(this.timer));
		});
		$effect(() => {
			if (!this.loaded) return;
			writeStored('preferences', {
				language: this.language,
				theme: this.theme,
				muted: this.muted,
				station: this.station,
				radioOn: this.radioOn,
				cycle: this.cycle,
				boardSeenAt: this.boardSeenAt
			} satisfies Preferences);
		});
	}

	/** Advances the clock. Driven by an interval while the console is open. */
	tick(now = Date.now()) {
		this.now = now;
		if (this.timer.status !== 'running') return;

		if (isExpired(this.timer, now)) {
			this.finish();
			return;
		}

		const second = Math.ceil(this.remaining / 1000);
		if (second <= COUNTDOWN_TICKS && second !== this.lastTickSecond) {
			this.lastTickSecond = second;
			this.play('pickup', { rate: 1 + (COUNTDOWN_TICKS - second) * 0.08, gain: 0.7 });
		}
	}

	/** A transition duration, or zero when motion should be reduced. */
	ms(duration: number) {
		return this.reducedMotion ? 0 : duration;
	}

	play(sound: SoundName, options?: { rate?: number; gain?: number }) {
		if (!this.muted) audioEngine.play(sound, options);
	}

	// Timer

	start() {
		this.now = Date.now();
		this.timer = startTimer(this.timer, this.now);
	}

	pause() {
		this.now = Date.now();
		this.timer = pauseTimer(this.timer, this.now);
	}

	toggle() {
		if (this.running) {
			this.pause();
			this.play('back');
		} else {
			this.start();
			this.play('select');
		}
	}

	reset() {
		this.timer = createTimer(this.timer.mode, this.settings.durations);
		this.lastTickSecond = -1;
	}

	switchMode(mode: Mode) {
		this.timer = createTimer(mode, this.settings.durations);
		this.lastTickSecond = -1;
	}

	/** Ends the current session early without logging it. */
	skip() {
		const finished = this.timer.mode;
		const focusCount = finished === 'focus' ? this.cycle + 1 : this.cycle;
		const upcoming = nextMode(finished, focusCount, this.settings.longBreakInterval);
		if (finished === 'focus') this.cycle = upcoming === 'long' ? 0 : focusCount;
		this.switchMode(upcoming);
	}

	private finish({ quiet = false } = {}) {
		const finished = this.timer.mode;
		const finishedAt = this.timer.status === 'running' ? this.timer.endsAt : this.now;
		let task: string | undefined;

		if (finished === 'focus') {
			task = this.currentTask?.title;
			if (this.settings.autoCheckTasks) {
				const result = completeFirstOpen(this.tasks, this.settings.completedToBottom);
				this.tasks = result.tasks;
				task = result.title;
			}
		}

		this.log = [
			...this.log,
			{
				id: crypto.randomUUID(),
				mode: finished,
				minutes: this.settings.durations[finished],
				finishedAt,
				task
			}
		].slice(-MAX_LOG_ENTRIES);

		const focusCount = finished === 'focus' ? this.cycle + 1 : this.cycle;
		const upcoming = nextMode(finished, focusCount, this.settings.longBreakInterval);
		if (finished === 'focus') this.cycle = upcoming === 'long' ? 0 : focusCount;

		this.switchMode(upcoming);
		const autoStart =
			upcoming === 'focus' ? this.settings.autoStartFocus : this.settings.autoStartBreaks;
		if (autoStart) this.timer = startTimer(this.timer, this.now);

		if (quiet) return;
		this.celebration = { id: ++this.celebrationId, mode: finished };
		audioEngine.duckMusic(2.5);
		this.play('alarm');
	}

	dismissCelebration() {
		this.celebration = null;
	}

	// Settings

	setDuration(mode: Mode, minutes: number) {
		const { min, max } = LIMITS[mode];
		this.settings.durations[mode] = clamp(minutes, min, max);
		if (this.timer.mode === mode && this.timer.status === 'idle') {
			this.timer = { ...this.timer, remainingMs: minutesToMs(this.settings.durations[mode]) };
		}
	}

	setLongBreakInterval(value: number) {
		const { min, max } = LIMITS.longBreakInterval;
		this.settings.longBreakInterval = clamp(value, min, max);
	}

	eraseAll() {
		clearStored();
		this.settings = structuredClone(DEFAULT_SETTINGS);
		this.tasks = [];
		this.log = [];
		this.cycle = 0;
		this.boardSeenAt = 0;
		this.timer = createTimer('focus', this.settings.durations);
	}

	// Tasks

	addTask(title: string) {
		if (!title.trim()) return false;
		const task = createTask(title);
		const openCount = this.tasks.filter((entry) => !entry.completed).length;
		// New tasks join the end of the open list, above anything finished.
		this.tasks = this.settings.completedToBottom
			? [...this.tasks.slice(0, openCount), task, ...this.tasks.slice(openCount)]
			: [...this.tasks, task];
		return true;
	}

	toggleTask(id: string) {
		this.tasks = toggleTask(this.tasks, id, this.settings.completedToBottom);
	}

	removeTask(id: string) {
		this.tasks = this.tasks.filter((task) => task.id !== id);
	}

	moveTask(from: number, to: number) {
		if (from === to || from < 0 || to < 0 || from >= this.tasks.length) return;
		const next = [...this.tasks];
		const [task] = next.splice(from, 1);
		next.splice(Math.min(to, next.length), 0, task);
		this.tasks = next;
	}

	clearCompleted() {
		this.tasks = this.tasks.filter((task) => !task.completed);
	}

	// Radio

	tune(station: RadioChannelId) {
		if (station !== this.station) {
			this.station = station;
			this.radioTrack = null;
			this.radioState = 'idle';
		}
		this.radioOn = true;
	}

	markBoardSeen() {
		this.boardSeenAt = Date.now();
	}
}

export const [getPomodorii, setPomodorii] = createContext<Pomodorii>();
