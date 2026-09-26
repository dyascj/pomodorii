<script lang="ts">
	import { Hourglass, Pause, Play, RotateCcw, SkipForward } from '@lucide/svelte';
	import ChannelFrame from '$lib/components/ChannelFrame.svelte';
	import Disc from '$lib/components/Disc.svelte';
	import SegmentDisplay from '$lib/components/SegmentDisplay.svelte';
	import { CHANNEL_ACCENTS } from '$lib/console/channels';
	import { getPomodorii } from '$lib/console/pomodorii.svelte';
	import { MODES } from '$lib/timer/timer';

	type Props = { onmenu: () => void; onhome: () => void };

	let { onmenu, onhome }: Props = $props();

	const app = getPomodorii();

	/** Soft bubbles that drift up behind the disc while a session runs. */
	const BUBBLES = Array.from({ length: 14 }, (_, index) => ({
		x: (index * 37) % 100,
		size: 14 + ((index * 23) % 46),
		duration: 9 + ((index * 7) % 8),
		delay: -((index * 13) % 17)
	}));

	const status = $derived.by(() => {
		if (app.timer.status === 'running') {
			return app.timer.mode === 'focus' ? app.t.focus.running : app.t.focus.runningBreak;
		}
		return app.timer.status === 'paused' ? app.t.focus.paused : app.t.focus.ready;
	});

	const startLabel = $derived(
		app.running
			? app.t.focus.pause
			: app.timer.status === 'paused'
				? app.t.focus.resume
				: app.t.focus.start
	);
</script>

<ChannelFrame title={app.t.channels.focus} accent={CHANNEL_ACCENTS.focus} {onmenu} {onhome}>
	{#snippet icon()}<Hourglass />{/snippet}

	<div class="focus pinstripes" class:running={app.running} data-mode={app.timer.mode}>
		<div class="halo" aria-hidden="true"></div>
		{#if app.running && !app.reducedMotion}
			<div class="bubbles" aria-hidden="true">
				{#each BUBBLES as bubble, index (index)}
					<span
						style:left="{bubble.x}%"
						style:--size="{bubble.size}px"
						style:animation-duration="{bubble.duration}s"
						style:animation-delay="{bubble.delay}s"
					></span>
				{/each}
			</div>
		{/if}

		<section class="stage">
			<div class="modes" role="tablist" aria-label={app.t.channels.focus}>
				{#each MODES as mode (mode)}
					<button
						class="mode"
						class:active={app.timer.mode === mode}
						type="button"
						aria-pressed={app.timer.mode === mode}
						data-sfx="toggle"
						onclick={() => app.switchMode(mode)}
					>
						{app.t.modes[mode]}
					</button>
				{/each}
			</div>

			<div class="disc">
				<Disc spinning={app.running} progress={app.progress}>
					<div class="label">
						<SegmentDisplay class="digits" value={app.clock} ghost />
						<span class="status" aria-live="polite">{status}</span>
					</div>
				</Disc>
			</div>

			<div class="controls">
				<button
					class="round"
					type="button"
					aria-label={app.t.focus.reset}
					onclick={() => app.reset()}
				>
					<RotateCcw />
				</button>
				<button
					class="pill primary start"
					type="button"
					data-sfx="none"
					aria-keyshortcuts="Space"
					onclick={() => app.toggle()}
				>
					{#if app.running}<Pause fill="currentColor" />{:else}<Play fill="currentColor" />{/if}
					{startLabel}
				</button>
				<button
					class="round"
					type="button"
					aria-label={app.t.focus.skip}
					onclick={() => app.skip()}
				>
					<SkipForward />
				</button>
			</div>
		</section>

		<aside class="side">
			<div class="card">
				<span class="kicker">{app.t.focus.nowWorkingOn}</span>
				{#if app.currentTask}
					<p class="task">{app.currentTask.title}</p>
				{:else}
					<p class="task muted">{app.t.focus.noTask}</p>
				{/if}
			</div>
			<div class="card">
				<span class="kicker">{app.t.focus.untilLongBreak}</span>
				<ol class="cycle">
					{#each { length: app.settings.longBreakInterval }, index (index)}
						<li class:done={index < app.cycle}></li>
					{/each}
				</ol>
			</div>
		</aside>
	</div>
</ChannelFrame>

<style>
	.focus {
		position: relative;
		display: grid;
		grid-template-columns: minmax(0, 560px) minmax(240px, 320px);
		justify-content: center;
		align-items: center;
		gap: clamp(20px, 6vw, 96px);
		min-height: 100%;
		padding: var(--header-space) clamp(16px, 5vw, 72px) clamp(12px, 3vh, 32px);
		overflow: hidden;
	}

	.halo {
		position: absolute;
		left: 50%;
		top: 50%;
		width: min(90vh, 110vw);
		aspect-ratio: 1;
		translate: -50% -50%;
		border-radius: 50%;
		background: radial-gradient(circle, rgb(52 190 237 / 0.22) 0%, rgb(52 190 237 / 0) 62%);
		opacity: 0.5;
		scale: 0.85;
		transition:
			opacity 900ms ease,
			scale 900ms ease;
		pointer-events: none;
	}

	.running .halo {
		opacity: 1;
		scale: 1;
		animation: breathe 5s ease-in-out infinite;
	}

	[data-mode='short'] .halo,
	[data-mode='long'] .halo {
		background: radial-gradient(circle, rgb(67 181 74 / 0.2) 0%, rgb(67 181 74 / 0) 62%);
	}

	.bubbles {
		position: absolute;
		inset: 0;
		overflow: hidden;
		pointer-events: none;
	}

	.bubbles span {
		position: absolute;
		bottom: -80px;
		width: var(--size);
		height: var(--size);
		border-radius: 50%;
		background: radial-gradient(
			circle at 32% 28%,
			rgb(255 255 255 / 0.9) 0 12%,
			rgb(52 190 237 / 0.18) 55%,
			rgb(52 190 237 / 0.05) 100%
		);
		box-shadow: inset 0 0 0 1px rgb(52 190 237 / 0.25);
		animation: rise linear infinite;
	}

	[data-mode='short'] .bubbles span,
	[data-mode='long'] .bubbles span {
		background: radial-gradient(
			circle at 32% 28%,
			rgb(255 255 255 / 0.9) 0 12%,
			rgb(67 181 74 / 0.18) 55%,
			rgb(67 181 74 / 0.05) 100%
		);
		box-shadow: inset 0 0 0 1px rgb(67 181 74 / 0.25);
	}

	@keyframes rise {
		0% {
			transform: translate(0, 0);
			opacity: 0;
		}
		10% {
			opacity: 1;
		}
		50% {
			transform: translate(18px, -55vh);
		}
		90% {
			opacity: 1;
		}
		100% {
			transform: translate(-12px, -115vh);
			opacity: 0;
		}
	}

	.stage {
		position: relative;
		display: grid;
		justify-items: center;
		gap: clamp(14px, 3vh, 28px);
	}

	.modes {
		display: flex;
		gap: 6px;
		padding: 5px;
		border-radius: 999px;
		background: var(--surface-sunk);
		box-shadow: inset 0 2px 4px rgb(0 0 0 / 0.08);
	}

	.mode {
		padding: 0.5em 1.2em;
		border-radius: 999px;
		color: var(--text);
		font-size: clamp(0.8rem, 1.6vw, 0.95rem);
		font-weight: 700;
		white-space: nowrap;
		transition:
			background 200ms ease,
			color 200ms ease,
			transform 380ms var(--spring);
	}

	.mode:hover {
		transform: scale(1.05);
	}

	.mode.active {
		background: linear-gradient(180deg, #5fd3f7, var(--blue-strong));
		color: #fff;
		box-shadow:
			inset 0 1px 0 rgb(255 255 255 / 0.5),
			var(--shadow-sm);
		text-shadow: 0 1px 1px rgb(0 60 90 / 0.3);
	}

	.disc {
		width: min(52vh, 78vw, 460px);
	}

	.label {
		display: grid;
		justify-items: center;
		gap: 2cqw;
		width: 72%;
		padding: 5cqw 6cqw 4cqw;
		border-radius: 7cqw;
		background: rgb(255 255 255 / 0.82);
		backdrop-filter: blur(6px);
		box-shadow:
			0 0 0 1px rgb(0 0 0 / 0.06),
			var(--shadow-md);
	}

	:global([data-theme='dark']) .label {
		background: rgb(22 27 34 / 0.82);
	}

	.label :global(.digits) {
		width: 100%;
		height: auto;
		color: var(--text-strong);
		transition: color 300ms ease;
	}

	.running .label :global(.digits) {
		color: var(--blue-text);
	}

	.status {
		color: var(--text-muted);
		font-size: 5cqw;
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.controls {
		display: flex;
		align-items: center;
		gap: clamp(14px, 3vw, 28px);
	}

	.start {
		min-width: 11rem;
		min-height: 3.6rem;
		font-size: 1.15rem;
	}

	.start :global(svg) {
		width: 1.1em;
		height: 1.1em;
	}

	.round {
		display: grid;
		place-items: center;
		width: 3.2rem;
		height: 3.2rem;
		border-radius: 50%;
		border: 2px solid var(--pill-border);
		background: linear-gradient(180deg, var(--pill-top) 45%, var(--pill-bottom));
		color: var(--text);
		box-shadow: var(--shadow-sm);
		transition:
			transform 380ms var(--spring),
			border-color 150ms ease;
	}

	.round:hover,
	.round:focus-visible {
		outline: none;
		border-color: var(--blue);
		transform: scale(1.1);
		box-shadow:
			0 0 0 3px var(--blue-glow),
			var(--shadow-sm);
	}

	.round:active {
		transform: scale(0.94);
	}

	.round :global(svg) {
		width: 45%;
		height: 45%;
	}

	.side {
		position: relative;
		display: grid;
		gap: 16px;
	}

	.card {
		display: grid;
		gap: 10px;
		padding: 18px 20px;
		border-radius: 20px;
		background: var(--surface);
		box-shadow:
			0 0 0 1.5px var(--border-soft),
			inset 0 1px 0 var(--highlight),
			var(--shadow-md);
	}

	.kicker {
		color: var(--blue-text);
		font-size: 0.75rem;
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.task {
		margin: 0;
		color: var(--text-strong);
		font-size: 1.1rem;
		font-weight: 700;
		line-height: 1.4;
		overflow-wrap: anywhere;
	}

	.task.muted {
		color: var(--text-muted);
		font-size: 0.95rem;
		font-weight: 600;
	}

	.cycle {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.cycle li {
		width: 22px;
		height: 22px;
		border-radius: 50%;
		background: var(--surface-sunk);
		box-shadow: inset 0 2px 3px rgb(0 0 0 / 0.12);
		transition: background 300ms ease;
	}

	.cycle li.done {
		background: radial-gradient(circle at 35% 30%, #8fe3ff, var(--blue-strong));
		box-shadow: 0 0 8px var(--blue-glow);
	}

	@keyframes breathe {
		50% {
			scale: 1.06;
			opacity: 0.8;
		}
	}

	@media (max-width: 900px) {
		.focus {
			grid-template-columns: 1fr;
			align-content: start;
		}

		.side {
			grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		}
	}
</style>
