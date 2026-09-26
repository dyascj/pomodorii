<script lang="ts">
	import Disc from '$lib/components/Disc.svelte';
	import SegmentDisplay from '$lib/components/SegmentDisplay.svelte';
	import { getPomodorii } from '$lib/console/pomodorii.svelte';

	const app = getPomodorii();
</script>

<div class="preview pinstripes" class:running={app.running}>
	<div class="disc">
		<Disc spinning={app.running} progress={app.progress} />
	</div>
	<div class="readout">
		<span class="mode">{app.t.modes[app.timer.mode]}</span>
		<SegmentDisplay class="time" value={app.clock} ghost />
		<span class="title">{app.t.channels.focus}</span>
	</div>
</div>

<style>
	.preview {
		position: absolute;
		inset: 0;
		display: grid;
		grid-template-columns: 44cqh 1fr;
		align-items: center;
		gap: 6cqw;
		padding: 0 8cqw 0 7cqw;
		background: linear-gradient(180deg, transparent 55%, rgb(52 190 237 / 0.18)), var(--surface);
	}

	.disc {
		width: 100%;
	}

	.readout {
		display: grid;
		justify-items: start;
		gap: 3cqh;
		min-width: 0;
	}

	.mode {
		padding: 1.2cqh 3cqw;
		border-radius: 999px;
		background: var(--blue);
		color: #fff;
		font-size: 7.5cqh;
		font-weight: 800;
		white-space: nowrap;
	}

	.readout :global(.time) {
		width: 100%;
		height: auto;
		max-height: 32cqh;
		color: var(--text-strong);
		transition: color 300ms ease;
	}

	.running .readout :global(.time) {
		color: var(--blue-text);
	}

	.title {
		color: var(--text-muted);
		font-size: 8cqh;
		font-weight: 800;
		white-space: nowrap;
	}

	/* Tall tiles, as on a phone: stack the disc over the readout. */
	@container (aspect-ratio < 1.4) {
		.preview {
			grid-template-columns: minmax(0, 1fr);
			grid-template-rows: 40cqh auto;
			justify-items: center;
			align-content: center;
			gap: 4cqh;
			padding: 6cqh 8cqw;
		}

		.disc {
			width: 40cqh;
		}

		.readout {
			justify-items: center;
			gap: 2.5cqh;
		}

		.mode {
			font-size: 6cqh;
		}

		.readout :global(.time) {
			max-height: 18cqh;
			width: auto;
		}

		.title {
			display: none;
		}
	}
</style>
