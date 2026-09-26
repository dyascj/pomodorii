<!--
	The console's home screen: a 4 by 3 grid of channels over pinstripes,
	navigable with the pointer or the arrow keys like a controller.
-->
<script lang="ts">
	import ChannelTile from '$lib/components/ChannelTile.svelte';
	import MenuBar from '$lib/components/MenuBar.svelte';
	import FocusPreview from '$lib/components/previews/FocusPreview.svelte';
	import RadioPreview from '$lib/components/previews/RadioPreview.svelte';
	import SettingsPreview from '$lib/components/previews/SettingsPreview.svelte';
	import TasksPreview from '$lib/components/previews/TasksPreview.svelte';
	import { MENU_CHANNELS } from '$lib/console/channels';
	import { getPomodorii, type ChannelId } from '$lib/console/pomodorii.svelte';
	import { pop } from '$lib/console/transitions';

	type Props = {
		onopen: (id: ChannelId, origin: HTMLElement, options?: { direct?: boolean }) => void;
	};

	let { onopen }: Props = $props();

	const app = getPomodorii();

	const SLOTS = 12;
	const COLUMNS = 4;

	let grid = $state<HTMLElement>();

	const previews = {
		focus: FocusPreview,
		tasks: TasksPreview,
		radio: RadioPreview,
		settings: SettingsPreview
	};

	/** Arrow keys walk the grid the way a D-pad did. */
	const onKeydown = (event: KeyboardEvent) => {
		const moves: Record<string, number> = {
			ArrowLeft: -1,
			ArrowRight: 1,
			ArrowUp: -COLUMNS,
			ArrowDown: COLUMNS
		};
		const step = moves[event.key];
		if (step === undefined || !grid) return;

		const buttons = [...grid.querySelectorAll<HTMLButtonElement>('button.tile')];
		const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
		const next = index === -1 ? 0 : index + step;
		if (next < 0 || next >= buttons.length) {
			app.play('back', { rate: 0.8, gain: 0.5 });
			return;
		}
		event.preventDefault();
		buttons[next].focus();
	};
</script>

<svelte:window onkeydown={onKeydown} />

<div class="menu pinstripes">
	<nav class="grid" bind:this={grid} aria-label={app.t.menu.label}>
		{#each { length: SLOTS }, slot (slot)}
			{@const channel = MENU_CHANNELS[slot]}
			<div
				class="slot"
				class:extra={slot >= 6}
				class:live={channel === 'focus' && app.running}
				in:pop={{
					delay: app.ms(120 + (slot % COLUMNS) * 45 + Math.floor(slot / COLUMNS) * 70),
					duration: app.ms(480)
				}}
			>
				{#if channel}
					{@const Preview = previews[channel]}
					<ChannelTile label={app.t.channels[channel]} onopen={(tile) => onopen(channel, tile)}>
						{#if channel === 'radio'}
							<RadioPreview dock="tile" />
						{:else}
							<Preview />
						{/if}
					</ChannelTile>
				{:else}
					<ChannelTile />
				{/if}
			</div>
		{/each}
	</nav>

	<MenuBar
		onsettings={(origin) => onopen('settings', origin, { direct: true })}
		onboard={(origin) => onopen('board', origin, { direct: true })}
	/>
</div>

<style>
	.menu {
		position: fixed;
		inset: 0;
		display: grid;
		grid-template-rows: 1fr clamp(150px, 28vh, 300px);
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		grid-template-rows: repeat(3, 1fr);
		gap: clamp(10px, 1.7vh, 22px) clamp(10px, 1.2vw, 24px);
		width: min(100%, calc((100vh - 28vh) * 2.9));
		margin: 0 auto;
		padding: 7vh 5.5vw 2vh;
	}

	.slot {
		min-width: 0;
		min-height: 0;
		border-radius: var(--radius-tile);
	}

	/* A running session makes its tile glow, like a disc spinning in the drive. */
	.live {
		animation: live 2.4s ease-in-out infinite;
	}

	@keyframes live {
		50% {
			box-shadow:
				0 0 0 4px var(--blue-glow),
				0 0 26px var(--blue-glow);
		}
	}

	@media (max-aspect-ratio: 1/1) {
		.grid {
			grid-template-columns: repeat(2, 1fr);
			grid-template-rows: repeat(3, 1fr);
			padding: 5vh 5vw 2vh;
		}

		.extra {
			display: none;
		}
	}
</style>
