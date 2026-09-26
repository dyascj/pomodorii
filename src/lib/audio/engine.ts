const SOUND_FILES = {
	hover: '/audio/shift.mp3',
	select: '/audio/button-press.mp3',
	back: '/audio/close-delete.mp3',
	toggle: '/audio/toggle.mp3',
	pickup: '/audio/task-pickup.mp3',
	drop: '/audio/task-drop.mp3',
	alarm: '/audio/alarm.mp3',
	boot: '/audio/start-chime.mp3'
} as const;

export type SoundName = keyof typeof SOUND_FILES;

export const MUSIC_FILE = '/audio/main-theme.mp3';

type PlayOptions = {
	/** Playback rate, which also shifts pitch. */
	rate?: number;
	/** Linear gain multiplier applied on top of the effects volume. */
	gain?: number;
};

type Download = readonly [name: string, data: ArrayBuffer | null];

type MusicTrack = {
	buffer: AudioBuffer;
	loopStart: number;
	loopEnd: number;
};

const HOVER_COOLDOWN_MS = 45;
const SILENCE_THRESHOLD = 0.002;
const FADE_SECONDS = 0.35;

/** Finds the audible region of a buffer so encoder padding never breaks the loop. */
const findAudibleRegion = (buffer: AudioBuffer) => {
	const samples = buffer.getChannelData(0);
	let start = 0;
	let end = samples.length;
	while (start < end && Math.abs(samples[start]) < SILENCE_THRESHOLD) start++;
	while (end > start && Math.abs(samples[end - 1]) < SILENCE_THRESHOLD) end--;
	return { loopStart: start / buffer.sampleRate, loopEnd: end / buffer.sampleRate };
};

/**
 * One Web Audio graph for the whole console. Effects are decoded once and
 * fired as cheap buffer sources, so rapid hover ticks can overlap and be
 * pitch-shifted without the latency of HTMLAudioElement.
 *
 *   effects ─► sfxBus ─┐
 *                      ├─► master ─► destination
 *   music ──► musicBus ┘
 */
class AudioEngine {
	private context: AudioContext | null = null;
	private master: GainNode | null = null;
	private sfxBus: GainNode | null = null;
	private musicBus: GainNode | null = null;
	private buffers = new Map<SoundName, AudioBuffer>();
	private downloads: Promise<Download[]> | null = null;
	private decoding: Promise<void> | null = null;
	private music: MusicTrack | null = null;
	private musicSource: AudioBufferSourceNode | null = null;
	private musicStartedAt = 0;
	private musicOffset = 0;
	private wantsMusic = false;
	private lastHoverAt = 0;
	private sfxVolume = 0.6;
	private musicVolume = 0.2;

	get ready() {
		return this.buffers.size > 0;
	}

	/**
	 * Downloads every sound up front. Decoding waits for `unlock`, because an
	 * AudioContext created before a user gesture starts out blocked.
	 */
	preload(): Promise<Download[]> {
		if (typeof window === 'undefined') return Promise.resolve([]);
		this.downloads ??= Promise.all(
			[...Object.entries(SOUND_FILES), ['music', MUSIC_FILE]].map(async ([name, url]) => {
				try {
					const response = await fetch(url);
					if (!response.ok) throw new Error(`Failed to load ${url}`);
					return [name, await response.arrayBuffer()] as const;
				} catch {
					// A missing sound should never take the rest of the console down.
					return [name, null] as const;
				}
			})
		);
		return this.downloads;
	}

	/** Must run inside a user gesture: browsers keep audio locked until then. */
	unlock() {
		const context = this.ensureContext();
		if (!context) return Promise.resolve();
		if (context.state === 'suspended') void context.resume();
		this.decoding ??= this.decodeAll(context);
		return this.decoding;
	}

	play(name: SoundName, { rate = 1, gain = 1 }: PlayOptions = {}) {
		const context = this.context;
		const buffer = this.buffers.get(name);
		if (!context || !buffer || !this.sfxBus || this.sfxVolume <= 0) return;

		if (name === 'hover') {
			const now = performance.now();
			if (now - this.lastHoverAt < HOVER_COOLDOWN_MS) return;
			this.lastHoverAt = now;
		}

		const source = context.createBufferSource();
		source.buffer = buffer;
		source.playbackRate.value = rate;

		const voice = context.createGain();
		voice.gain.value = gain;
		source.connect(voice).connect(this.sfxBus);
		source.start();
		source.onended = () => voice.disconnect();
	}

	setEffectsVolume(volume: number) {
		this.sfxVolume = volume;
		this.ramp(this.sfxBus, volume, 0.05);
	}

	setMusicVolume(volume: number) {
		this.musicVolume = volume;
		this.ramp(this.musicBus, volume, 0.15);
	}

	/** Briefly lowers the music so an important cue can be heard. */
	duckMusic(seconds: number) {
		const bus = this.musicBus;
		const context = this.context;
		if (!bus || !context) return;
		const now = context.currentTime;
		bus.gain.cancelScheduledValues(now);
		bus.gain.setTargetAtTime(this.musicVolume * 0.25, now, 0.08);
		bus.gain.setTargetAtTime(this.musicVolume, now + seconds, 0.6);
	}

	playMusic() {
		this.wantsMusic = true;
		this.startMusic();
	}

	pauseMusic() {
		this.wantsMusic = false;
		this.stopMusic();
	}

	private startMusic() {
		const context = this.context;
		const track = this.music;
		if (!context || !track || !this.musicBus || this.musicSource) return;

		const source = context.createBufferSource();
		source.buffer = track.buffer;
		source.loop = true;
		source.loopStart = track.loopStart;
		source.loopEnd = track.loopEnd;

		const fade = context.createGain();
		fade.gain.setValueAtTime(0, context.currentTime);
		fade.gain.linearRampToValueAtTime(1, context.currentTime + FADE_SECONDS);
		source.connect(fade).connect(this.musicBus);

		source.start(0, track.loopStart + this.musicOffset);
		this.musicStartedAt = context.currentTime - this.musicOffset;
		this.musicSource = source;
	}

	private stopMusic() {
		const context = this.context;
		const track = this.music;
		const source = this.musicSource;
		if (!context || !track || !source) return;

		const loopLength = track.loopEnd - track.loopStart;
		this.musicOffset = (context.currentTime - this.musicStartedAt) % loopLength;
		this.musicSource = null;

		const fade = context.createGain();
		source.disconnect();
		source.connect(fade).connect(this.musicBus!);
		fade.gain.setValueAtTime(1, context.currentTime);
		fade.gain.linearRampToValueAtTime(0, context.currentTime + FADE_SECONDS);
		source.stop(context.currentTime + FADE_SECONDS);
		source.onended = () => fade.disconnect();
	}

	private ensureContext() {
		if (this.context) return this.context;
		if (typeof window === 'undefined') return null;

		const AudioContextClass =
			window.AudioContext ??
			(window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
		if (!AudioContextClass) return null;

		const context = new AudioContextClass();
		this.master = context.createGain();
		this.master.connect(context.destination);
		this.sfxBus = context.createGain();
		this.sfxBus.gain.value = this.sfxVolume;
		this.sfxBus.connect(this.master);
		this.musicBus = context.createGain();
		this.musicBus.gain.value = this.musicVolume;
		this.musicBus.connect(this.master);
		this.context = context;
		return context;
	}

	private async decodeAll(context: AudioContext) {
		const downloads = await this.preload();
		await Promise.all(
			downloads.map(async ([name, data]) => {
				if (!data) return;
				try {
					const buffer = await context.decodeAudioData(data);
					if (name === 'music') {
						this.music = { buffer, ...findAudibleRegion(buffer) };
						if (this.wantsMusic) this.startMusic();
					} else {
						this.buffers.set(name as SoundName, buffer);
					}
				} catch {
					// Skip anything the browser cannot decode.
				}
			})
		);
	}

	private ramp(node: GainNode | null, value: number, timeConstant: number) {
		if (!node || !this.context) return;
		const now = this.context.currentTime;
		node.gain.cancelScheduledValues(now);
		node.gain.setTargetAtTime(value, now, timeConstant);
	}
}

export const audioEngine = new AudioEngine();
