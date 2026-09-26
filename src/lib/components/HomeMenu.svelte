<!--
	The HOME Menu overlay: dark bars slide in from the top and bottom over a
	dimmed screen, with big pale-blue buttons in between.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { House, RotateCcw, X } from '@lucide/svelte';
	import Meter from '$lib/components/ui/Meter.svelte';
	import SegmentDisplay from '$lib/components/SegmentDisplay.svelte';
	import { getPomodorii } from '$lib/console/pomodorii.svelte';
	import { drop, pop, rise } from '$lib/console/transitions';
	import { plural } from '$lib/i18n';

	type Props = { onclose: () => void; onmenu: () => void };

	let { onclose, onmenu }: Props = $props();

	const app = getPomodorii();
	const h = $derived(app.t.homeMenu);

	let panel = $state<HTMLDivElement>();

	/** The remote's battery, repurposed: how much of this session is left. */
	const bars = $derived(Math.ceil((1 - app.progress) * 4));

	onMount(() => {
		const previous = document.activeElement as HTMLElement | null;
		panel?.querySelector<HTMLElement>('button')?.focus({ preventScroll: true });
		// Wait a frame so the screen underneath is interactive again.
		return () => requestAnimationFrame(() => previous?.focus?.({ preventScroll: true }));
	});
</script>

<div
	class="home"
	role="dialog"
	aria-modal="true"
	aria-label={h.title}
	bind:this={panel}
	transition:fade={{ duration: app.ms(200) }}
>
	<div class="dim" aria-hidden="true"></div>

	<header class="top" transition:drop={{ duration: app.ms(280) }}>
		<h2>{h.title}</h2>
		<button class="close" type="button" data-sfx="back" onclick={onclose}>
			<X size={18} strokeWidth={3} />
			{h.close}
		</button>
	</header>

	<div class="center">
		<button
			class="lozenge"
			type="button"
			data-sfx="back"
			onclick={onmenu}
			in:pop={{ delay: app.ms(120), duration: app.ms(360), from: 0.9 }}
		>
			<House size={26} />
			{h.menu}
		</button>
		<button
			class="lozenge"
			type="button"
			onclick={() => {
				app.reset();
				onclose();
			}}
			in:pop={{ delay: app.ms(170), duration: app.ms(360), from: 0.9 }}
		>
			<RotateCcw size={26} />
			{h.reset}
		</button>
	</div>

	<footer class="bottom" transition:rise={{ duration: app.ms(300) }}>
		<div class="remote">
			<span class="label">{app.t.modes[app.timer.mode]}</span>
			<SegmentDisplay class="clock" value={app.clock} />
			<span class="battery" aria-hidden="true">
				{#each { length: 4 }, index (index)}
					<span class:lit={index < bars}></span>
				{/each}
			</span>
		</div>
		<div class="today">
			<span class="label">{h.today}</span>
			<strong>{plural(app.language, h.sessions, app.todayCount)}</strong>
		</div>
		<div class="volumes">
			<div class="volume">
				<span class="label">{h.effects}</span>
				<Meter
					label={h.effects}
					value={app.settings.effectsVolume}
					onchange={(value) => (app.settings.effectsVolume = value)}
				/>
			</div>
			<div class="volume">
				<span class="label">{h.music}</span>
				<Meter
					label={h.music}
					value={app.settings.musicVolume}
					onchange={(value) => (app.settings.musicVolume = value)}
				/>
			</div>
		</div>
	</footer>
</div>

<style>
	.home {
		position: fixed;
		inset: 0;
		z-index: 60;
		display: grid;
		grid-template-rows: auto 1fr auto;
	}

	.dim {
		position: absolute;
		inset: 0;
		background:
			repeating-linear-gradient(0deg, rgb(0 0 0 / 0.25) 0 1px, transparent 1px 3px),
			rgb(0 0 0 / 0.62);
		backdrop-filter: blur(3px);
	}

	.top,
	.bottom {
		position: relative;
		background: linear-gradient(180deg, #1a1f26 0%, #040608 100%);
		color: #fff;
		box-shadow: 0 0 30px rgb(0 0 0 / 0.5);
	}

	.top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: clamp(14px, 3vh, 26px) clamp(18px, 5vw, 64px);
		border-bottom: 2px solid var(--blue);
	}

	h2 {
		margin: 0;
		font-size: clamp(1.2rem, 3vw, 1.8rem);
		font-weight: 900;
	}

	.close {
		display: inline-flex;
		align-items: center;
		gap: 0.5em;
		padding: 0.55em 1.3em;
		border-radius: 999px;
		background: linear-gradient(180deg, #ffffff 50%, #dfe4e9);
		color: #2c3036;
		font-weight: 800;
		transition: transform 380ms var(--spring);
	}

	.close:hover,
	.close:focus-visible {
		outline: none;
		transform: scale(1.08);
		box-shadow: 0 0 0 4px var(--blue-glow);
	}

	.center {
		position: relative;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: clamp(16px, 4vw, 48px);
		padding: 24px;
	}

	.lozenge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.6em;
		min-width: min(80vw, 300px);
		min-height: clamp(76px, 15vh, 120px);
		padding: 0 2em;
		border-radius: 999px;
		border: 3px solid #fff;
		background: linear-gradient(
			180deg,
			var(--lozenge-top) 0%,
			var(--lozenge-top) 45%,
			var(--lozenge-bottom) 100%
		);
		color: var(--lozenge-text);
		font-size: clamp(1.1rem, 2.6vw, 1.5rem);
		font-weight: 900;
		box-shadow: 0 8px 30px rgb(0 0 0 / 0.45);
		transition:
			transform 400ms var(--spring),
			box-shadow 150ms ease;
	}

	.lozenge:hover,
	.lozenge:focus-visible {
		outline: none;
		transform: scale(1.07);
		box-shadow:
			0 0 0 5px var(--blue),
			0 0 40px var(--blue-glow);
	}

	.bottom {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 18px 32px;
		padding: clamp(14px, 3vh, 24px) clamp(18px, 5vw, 64px)
			max(clamp(14px, 3vh, 24px), env(safe-area-inset-bottom));
		border-top: 2px solid var(--blue);
		background: linear-gradient(0deg, #1a1f26 0%, #040608 100%);
	}

	.label {
		color: #8fa0b2;
		font-size: 0.75rem;
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.remote {
		display: grid;
		grid-template-columns: auto auto;
		align-items: center;
		gap: 4px 14px;
	}

	.remote .label {
		grid-column: 1 / -1;
	}

	.remote :global(.clock) {
		color: #e9f6fd;
		font-size: 2rem;
	}

	.battery {
		display: inline-flex;
		gap: 3px;
		padding: 4px;
		border-radius: 6px;
		border: 2px solid #8fa0b2;
	}

	.battery span {
		width: 7px;
		height: 18px;
		border-radius: 2px;
		background: #2a323c;
	}

	.battery span.lit {
		background: var(--blue);
		box-shadow: 0 0 6px var(--blue-glow);
	}

	.today {
		display: grid;
		gap: 4px;
	}

	.today strong {
		font-size: 1.3rem;
		font-weight: 900;
	}

	.volumes {
		display: flex;
		flex-wrap: wrap;
		gap: 12px 28px;
	}

	.volume {
		display: grid;
		gap: 2px;
	}

	.volume :global(.blocks) {
		height: 1.8rem;
	}
</style>
