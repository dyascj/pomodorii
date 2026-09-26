import type { RadioPlaybackState } from './types';

type PlayerStateMap = {
	ENDED: number;
	PLAYING: number;
	PAUSED: number;
	BUFFERING: number;
	CUED: number;
	UNSTARTED: number;
};

export type YouTubePlayer = {
	destroy: () => void;
	loadVideoById: (args: { videoId: string; startSeconds?: number }) => void;
	mute: () => void;
	unMute: () => void;
	setVolume: (volume: number) => void;
	pauseVideo: () => void;
	playVideo: () => void;
	seekTo: (seconds: number, allowSeekAhead: boolean) => void;
};

type PlayerConstructor = new (
	element: HTMLElement,
	options: {
		host: string;
		height: string;
		width: string;
		videoId: string;
		playerVars: Record<string, number | string>;
		events: {
			onReady: () => void;
			onStateChange: (event: { data: number }) => void;
			onError: () => void;
		};
	}
) => YouTubePlayer;

declare global {
	interface Window {
		YT?: { Player: PlayerConstructor; PlayerState: PlayerStateMap };
		onYouTubeIframeAPIReady?: () => void;
	}
}

const API_URL = 'https://www.youtube.com/iframe_api';
let apiPromise: Promise<NonNullable<Window['YT']>> | null = null;

/** Loads the IFrame API once and shares it between players. */
export const loadYouTubeApi = () => {
	if (window.YT?.Player) return Promise.resolve(window.YT);

	apiPromise ??= new Promise((resolve, reject) => {
		const previousReady = window.onYouTubeIframeAPIReady;
		window.onYouTubeIframeAPIReady = () => {
			previousReady?.();
			if (window.YT) resolve(window.YT);
		};

		const script = document.createElement('script');
		script.src = API_URL;
		script.async = true;
		script.onerror = () => {
			apiPromise = null;
			reject(new Error('Failed to load the YouTube IFrame API'));
		};
		document.head.append(script);
	});

	return apiPromise;
};

export type YouTubeApi = NonNullable<Window['YT']>;

/**
 * Mounts a player inside `host`. The API swaps the node it is given for an
 * iframe, so it gets a fresh child rather than an element Svelte manages.
 */
export const mountPlayer = (
	api: YouTubeApi,
	host: HTMLElement,
	options: ConstructorParameters<PlayerConstructor>[1]
) => {
	const mount = document.createElement('div');
	host.replaceChildren(mount);
	return new api.Player(mount, options);
};

export const toPlaybackState = (state: number, map: PlayerStateMap): RadioPlaybackState => {
	if (state === map.PLAYING) return 'playing';
	if (state === map.PAUSED) return 'paused';
	if (state === map.CUED || state === map.BUFFERING) return 'ready';
	return 'idle';
};
