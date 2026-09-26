<!--
	The console shell: boot screen, menu, the open channel, and the overlays,
	plus everything that syncs state out to the page (theme, audio, title).
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { audioEngine } from '$lib/audio/engine';
	import BootScreen from '$lib/components/BootScreen.svelte';
	import Celebration from '$lib/components/Celebration.svelte';
	import ChannelView from '$lib/components/ChannelView.svelte';
	import HomeMenu from '$lib/components/HomeMenu.svelte';
	import Menu from '$lib/components/Menu.svelte';
	import Pointer from '$lib/components/Pointer.svelte';
	import YouTubeStation from '$lib/components/YouTubeStation.svelte';
	import { Pomodorii, setPomodorii, type ChannelId } from '$lib/console/pomodorii.svelte';
	import { rectOf, type ZoomOrigin } from '$lib/console/transitions';
	import { attachUiSounds } from '$lib/console/ui-sounds';

	const app = setPomodorii(new Pomodorii());
	app.persist();

	/** `from` is the tile or button the channel zooms out of and back into. */
	type View = { id: ChannelId; stage: 'banner' | 'open'; origin: ZoomOrigin; from: HTMLElement };

	let booted = $state(false);
	let view = $state<View | null>(null);
	/** Kept separate from `view` so the closing zoom can still read the last channel. */
	let viewOpen = $state(false);
	let homeOpen = $state(false);
	let root = $state<HTMLElement>();
	let systemDark = $state(false);
	let finePointer = $state(false);

	onMount(() => {
		app.load();
		void audioEngine.preload();

		const dark = matchMedia('(prefers-color-scheme: dark)');
		const fine = matchMedia('(hover: hover) and (pointer: fine)');
		const sync = () => {
			systemDark = dark.matches;
			finePointer = fine.matches;
		};
		sync();
		dark.addEventListener('change', sync);
		fine.addEventListener('change', sync);

		const interval = setInterval(() => app.tick(), 250);
		const onVisible = () => document.visibilityState === 'visible' && app.tick();
		document.addEventListener('visibilitychange', onVisible);

		return () => {
			clearInterval(interval);
			dark.removeEventListener('change', sync);
			fine.removeEventListener('change', sync);
			document.removeEventListener('visibilitychange', onVisible);
		};
	});

	$effect(() => {
		if (!root) return;
		return attachUiSounds(root, (sound, options) => app.play(sound, options));
	});

	// Page-level state.
	$effect(() => {
		const html = document.documentElement;
		html.dataset.theme = app.theme === 'system' ? (systemDark ? 'dark' : 'light') : app.theme;
		html.dataset.pointer = booted && finePointer && app.settings.pointer ? 'wii' : '';
		html.dataset.motion = app.settings.reduceMotion ? 'reduced' : '';
		html.lang = app.language;
	});

	$effect(() => {
		app.menuVisible = !viewOpen;
	});

	$effect(() => {
		document.title =
			app.timer.status === 'idle'
				? app.t.appName
				: `${app.clock} · ${app.t.modes[app.timer.mode]} · ${app.t.appName}`;
	});

	// Audio levels and the built-in station.
	$effect(() => {
		audioEngine.setEffectsVolume(app.settings.effectsVolume / 100);
		audioEngine.setMusicVolume(app.muted ? 0 : app.settings.musicVolume / 100);
	});

	$effect(() => {
		if (!booted || app.channel.provider !== 'local') return;
		if (app.radioOn) {
			audioEngine.playMusic();
			app.radioState = 'playing';
		} else {
			audioEngine.pauseMusic();
			app.radioState = 'paused';
		}
		return () => audioEngine.pauseMusic();
	});

	const boot = () => {
		if (booted) return;
		booted = true;
		void audioEngine.unlock().then(() => app.play('boot', { gain: 0.6 }));
	};

	const open = (id: ChannelId, from: HTMLElement, { direct = false } = {}) => {
		if (viewOpen) return;
		app.play('select', { rate: 1.05 });
		view = { id, stage: direct ? 'open' : 'banner', origin: rectOf(from), from };
		viewOpen = true;
	};

	const start = () => {
		if (!view || !viewOpen) return;
		app.play('select', { rate: 1.2 });
		view.stage = 'open';
	};

	const close = () => {
		if (!view || !viewOpen) return;
		const target = view.from;
		homeOpen = false;
		viewOpen = false;
		requestAnimationFrame(() => target.focus({ preventScroll: true }));
	};

	const toggleHome = () => {
		homeOpen = !homeOpen;
		app.play(homeOpen ? 'select' : 'back', { rate: homeOpen ? 1.15 : 1 });
	};

	const isTyping = (target: EventTarget | null) =>
		target instanceof HTMLElement &&
		(target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

	const onKeydown = (event: KeyboardEvent) => {
		if (!booted || event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;

		if (event.key === 'Escape') {
			if (app.celebration) app.dismissCelebration();
			else if (homeOpen) toggleHome();
			else if (viewOpen) {
				app.play('back');
				close();
			}
			return;
		}

		if (isTyping(event.target)) return;

		if (event.key === 'h' || event.key === 'H') {
			event.preventDefault();
			toggleHome();
		} else if (event.code === 'Space' && !(event.target instanceof HTMLButtonElement)) {
			event.preventDefault();
			app.toggle();
		}
	};
</script>

<svelte:window onkeydown={onKeydown} />

<div class="console" bind:this={root}>
	{#if booted}
		<div class="boot-flash" aria-hidden="true"></div>
		<div
			class="menu-layer"
			class:behind={viewOpen}
			inert={viewOpen || homeOpen}
			in:fade={{ duration: app.ms(700) }}
		>
			<Menu onopen={open} />
		</div>

		{#if viewOpen && view}
			<div inert={homeOpen}>
				<ChannelView
					id={view.id}
					stage={view.stage}
					origin={view.origin}
					onstart={start}
					onmenu={close}
					onhome={toggleHome}
				/>
			</div>
		{/if}

		{#if app.channel.provider === 'youtube'}
			<YouTubeStation />
		{/if}

		{#if homeOpen}
			<HomeMenu
				onclose={toggleHome}
				onmenu={() => {
					homeOpen = false;
					close();
				}}
			/>
		{/if}

		{#if app.celebration}
			{#key app.celebration.id}
				<Celebration celebration={app.celebration} ondismiss={() => app.dismissCelebration()} />
			{/key}
		{/if}

		{#if finePointer && app.settings.pointer}
			<Pointer reduceMotion={app.reducedMotion} />
		{/if}
	{:else}
		<div out:fade={{ duration: app.ms(400) }}>
			<BootScreen t={app.t} ready={app.loaded} oncontinue={boot} />
		</div>
	{/if}
</div>

<style>
	.console {
		position: fixed;
		inset: 0;
		overflow: hidden;
	}

	/* The flash of white as the warning screen gives way to the menu. */
	.boot-flash {
		position: absolute;
		inset: 0;
		z-index: 90;
		background: var(--bg-top);
		pointer-events: none;
		animation: boot-flash 900ms ease-out forwards;
	}

	@keyframes boot-flash {
		0% {
			opacity: 0;
		}
		18% {
			opacity: 1;
		}
		100% {
			opacity: 0;
			visibility: hidden;
		}
	}

	.menu-layer {
		position: absolute;
		inset: 0;
		transition:
			opacity 520ms var(--ease-zoom),
			scale 520ms var(--ease-zoom),
			filter 520ms var(--ease-zoom);
	}

	.menu-layer.behind {
		opacity: 0;
		scale: 1.12;
		filter: blur(4px);
	}
</style>
