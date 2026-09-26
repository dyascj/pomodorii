<!--
	The YouTube player for streaming stations. It lives above the channels so
	a mix keeps playing anywhere in the console: docked into the Radio
	Channel's screen when that is open, and as a small TV in the corner
	everywhere else.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { getPomodorii } from '$lib/console/pomodorii.svelte';
	import {
		loadYouTubeApi,
		mountPlayer,
		toPlaybackState,
		type YouTubePlayer
	} from '$lib/radio/youtube';

	const app = getPomodorii();

	let host = $state<HTMLDivElement>();
	let frame = $state<HTMLDivElement>();
	let player: YouTubePlayer | null = null;
	let ready = $state(false);
	let failed = $state(false);
	let loadedVideo: string | null = null;

	const track = $derived(app.track);

	onMount(() => {
		let cancelled = false;

		loadYouTubeApi()
			.then((YT) => {
				if (cancelled || !host || !track) return;
				loadedVideo = track.videoId;

				player = mountPlayer(YT, host, {
					host: 'https://www.youtube-nocookie.com',
					height: '100%',
					width: '100%',
					videoId: track.videoId,
					playerVars: {
						autoplay: app.radioOn ? 1 : 0,
						controls: 1,
						enablejsapi: 1,
						origin: location.origin,
						playsinline: 1,
						rel: 0,
						start: track.startSeconds ?? 0
					},
					events: {
						onReady: () => {
							ready = true;
							app.radioState = 'ready';
						},
						onStateChange: ({ data }) => {
							if (!player) return;
							if (data === YT.PlayerState.ENDED) {
								player.seekTo(app.track?.startSeconds ?? 0, true);
								player.playVideo();
								return;
							}
							const state = toPlaybackState(data, YT.PlayerState);
							app.radioState = state;
							// Keep the console's intent in step with the player's own controls.
							if (state === 'playing') app.radioOn = true;
							if (state === 'paused') app.radioOn = false;
						},
						onError: () => {
							failed = true;
							app.radioState = 'idle';
						}
					}
				});
			})
			.catch(() => {
				failed = true;
			});

		return () => {
			cancelled = true;
			player?.destroy();
			player = null;
			app.radioState = 'idle';
		};
	});

	// Switch mixes in place instead of rebuilding the iframe.
	$effect(() => {
		if (!ready || !player || !track || track.videoId === loadedVideo) return;
		loadedVideo = track.videoId;
		failed = false;
		player.loadVideoById({ videoId: track.videoId, startSeconds: track.startSeconds ?? 0 });
	});

	$effect(() => {
		if (!ready || !player) return;
		if (app.radioOn) player.playVideo();
		else player.pauseVideo();
	});

	$effect(() => {
		if (!ready || !player) return;
		player.setVolume(app.settings.musicVolume);
		if (app.muted) player.mute();
		else player.unMute();
	});

	const dock = $derived(
		app.radioDocks.channel ??
			(app.menuVisible ? app.radioDocks.tile : app.radioDocks.banner) ??
			null
	);
	const inChannel = $derived(dock !== null && dock === app.radioDocks.channel);

	// Follow the chosen dock, or fall back to the corner.
	$effect(() => {
		if (!frame) return;
		const target = frame;
		const anchor = dock;

		if (!anchor) {
			target.removeAttribute('style');
			return;
		}

		let raf = 0;
		const follow = () => {
			const rect = anchor.getBoundingClientRect();
			target.style.top = `${rect.top}px`;
			target.style.left = `${rect.left}px`;
			target.style.width = `${rect.width}px`;
			target.style.height = `${rect.height}px`;
			raf = requestAnimationFrame(follow);
		};
		follow();
		return () => cancelAnimationFrame(raf);
	});
</script>

<div
	class="station"
	class:docked={dock !== null}
	class:passive={dock !== null && !inChannel}
	class:hidden={!app.radioOn && !inChannel}
	bind:this={frame}
>
	<div class="screen" bind:this={host}></div>
	{#if failed}
		<p class="error">{app.t.radio.loadError}</p>
	{/if}
</div>

<style>
	.station {
		position: fixed;
		top: 16px;
		right: 16px;
		z-index: 40;
		width: clamp(144px, 16vw, 224px);
		aspect-ratio: 16 / 9;
		overflow: hidden;
		border-radius: 14px;
		background: #000;
		box-shadow:
			0 0 0 3px var(--surface),
			0 0 0 4.5px var(--border),
			var(--shadow-lg);
		transition:
			opacity 300ms ease,
			border-radius 300ms ease;
	}

	.docked {
		aspect-ratio: auto;
		border-radius: 18px;
		box-shadow: none;
	}

	/* In a tile or banner the video is a live preview; clicks go to the tile. */
	.passive {
		pointer-events: none;
		border-radius: calc(var(--radius-tile) - 5px);
	}

	.hidden {
		opacity: 0;
		pointer-events: none;
	}

	.screen {
		width: 100%;
		height: 100%;
	}

	.screen :global(iframe) {
		display: block;
		border: 0;
	}

	.error {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		margin: 0;
		padding: 12px;
		background: rgb(0 0 0 / 0.8);
		color: #fff;
		font-size: 0.85rem;
		text-align: center;
	}
</style>
