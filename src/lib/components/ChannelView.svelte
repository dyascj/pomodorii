<!--
	A channel opened from the menu. It zooms out of its tile into a full-screen
	banner with Menu and Start below, then flashes white into the channel
	itself, the way a Wii channel boots.
-->
<script lang="ts">
	import { onMount, untrack, type Component } from 'svelte';
	import { ChevronLeft } from '@lucide/svelte';
	import BoardChannel from '$lib/components/channels/BoardChannel.svelte';
	import FocusChannel from '$lib/components/channels/FocusChannel.svelte';
	import RadioChannel from '$lib/components/channels/RadioChannel.svelte';
	import SettingsChannel from '$lib/components/channels/SettingsChannel.svelte';
	import TasksChannel from '$lib/components/channels/TasksChannel.svelte';
	import FocusPreview from '$lib/components/previews/FocusPreview.svelte';
	import RadioPreview from '$lib/components/previews/RadioPreview.svelte';
	import SettingsPreview from '$lib/components/previews/SettingsPreview.svelte';
	import TasksPreview from '$lib/components/previews/TasksPreview.svelte';
	import { getPomodorii, type ChannelId } from '$lib/console/pomodorii.svelte';
	import { rise, zoom, type ZoomOrigin } from '$lib/console/transitions';

	type Props = {
		id: ChannelId;
		stage: 'banner' | 'open';
		origin: ZoomOrigin;
		onstart: () => void;
		onmenu: () => void;
		onhome: () => void;
	};

	let { id, stage, origin, onstart, onmenu, onhome }: Props = $props();

	const app = getPomodorii();

	type ChannelProps = { onmenu: () => void; onhome: () => void };

	const CHANNELS: Record<ChannelId, Component<ChannelProps>> = {
		focus: FocusChannel,
		tasks: TasksChannel,
		radio: RadioChannel,
		settings: SettingsChannel,
		board: BoardChannel
	};

	const BANNERS: Partial<Record<ChannelId, Component>> = {
		focus: FocusPreview,
		tasks: TasksPreview,
		radio: RadioPreview,
		settings: SettingsPreview
	};

	const Channel = $derived(CHANNELS[id]);
	const Banner = $derived(BANNERS[id]);

	let startButton = $state<HTMLButtonElement>();

	/** Only a channel booted from its banner gets the white flash. */
	const bootsFromBanner = untrack(() => stage === 'banner');

	onMount(() => {
		if (stage === 'banner') startButton?.focus({ preventScroll: true });
	});
</script>

<div
	class="view"
	role="region"
	aria-label={app.t.channels[id]}
	transition:zoom={{ origin, duration: app.ms(520) }}
>
	<div class="content">
		{#if stage === 'open'}
			<div class="channel pinstripes">
				<Channel {onmenu} {onhome} />
			</div>
		{:else if Banner}
			<div class="banner">
				<div class="art">
					{#if id === 'radio'}
						<RadioPreview dock="banner" />
					{:else}
						<Banner />
					{/if}
				</div>
				<div class="panel" in:rise={{ delay: app.ms(260), duration: app.ms(360) }}>
					<button class="pill big" type="button" data-sfx="back" onclick={onmenu}>
						<ChevronLeft size={22} strokeWidth={3} />
						{app.t.menu.back}
					</button>
					<button
						bind:this={startButton}
						class="pill big primary"
						type="button"
						data-sfx="none"
						onclick={onstart}
					>
						{app.t.menu.start}
					</button>
				</div>
			</div>
		{/if}
	</div>
	{#if stage === 'open' && bootsFromBanner}
		<div class="flash" aria-hidden="true"></div>
	{/if}
</div>

<style>
	.view {
		position: fixed;
		inset: 0;
		z-index: 20;
		overflow: hidden;
		background: var(--bg-bottom);
	}

	.content {
		position: absolute;
		inset: 0;
		transform: scale(var(--zoom, 1));
		transform-origin: var(--zoom-x, 50%) var(--zoom-y, 50%);
	}

	.channel {
		position: absolute;
		inset: 0;
	}

	.banner {
		position: absolute;
		inset: 0;
		display: grid;
		grid-template-rows: 1fr auto;
	}

	.art {
		position: relative;
		container-type: size;
	}

	.panel {
		display: flex;
		justify-content: center;
		gap: clamp(24px, 12vw, 180px);
		padding: clamp(18px, 4vh, 36px) 24px max(clamp(18px, 4vh, 36px), env(safe-area-inset-bottom));
		border-top: 2.5px solid var(--blue);
		background: linear-gradient(180deg, #e7e6e0 0%, #c1c2b4 100%);
	}

	:global([data-theme='dark']) .panel {
		background: linear-gradient(180deg, #262a30 0%, #111418 100%);
	}

	.big {
		min-width: min(38vw, 280px);
		min-height: clamp(56px, 9vh, 76px);
		font-size: clamp(1.1rem, 2.6vw, 1.5rem);
	}

	/* A white flash between the banner and the channel, like a channel boot. */
	.flash {
		position: absolute;
		inset: 0;
		background: #fff;
		opacity: 0;
		pointer-events: none;
		animation: flash 420ms ease-out;
	}

	:global([data-theme='dark']) .flash {
		background: #000;
	}

	@keyframes flash {
		0% {
			opacity: 0;
		}
		35% {
			opacity: 1;
		}
		100% {
			opacity: 0;
		}
	}
</style>
