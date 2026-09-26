<!--
	A glossy optical disc, after the Disc Channel. The sheen spins while the
	timer runs and a Wii-blue ring around the rim fills with progress.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		spinning: boolean;
		progress: number;
		children?: Snippet;
	};

	let { spinning, progress, children }: Props = $props();

	const RADIUS = 48.5;
	const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
</script>

<div class="disc" class:spinning>
	<div class="platter">
		<div class="sheen"></div>
		<div class="grooves"></div>
		<div class="hub"></div>
	</div>
	<svg class="ring" viewBox="0 0 100 100" aria-hidden="true">
		<circle class="track" cx="50" cy="50" r={RADIUS} />
		<circle
			class="fill"
			cx="50"
			cy="50"
			r={RADIUS}
			stroke-dasharray={CIRCUMFERENCE}
			stroke-dashoffset={CIRCUMFERENCE * (1 - progress)}
		/>
	</svg>
	{#if children}
		<div class="label">{@render children()}</div>
	{/if}
</div>

<style>
	.disc {
		position: relative;
		aspect-ratio: 1;
		width: 100%;
		container-type: inline-size;
	}

	.platter {
		position: absolute;
		inset: 3%;
		border-radius: 50%;
		overflow: hidden;
		background: radial-gradient(circle, #f8fbfd 0 16%, #d9e0e6 16.5% 17.5%, #f3f6f8 18% 100%);
		box-shadow:
			inset 0 0 0 1px rgb(0 0 0 / 0.08),
			inset 0 -6px 18px rgb(0 0 0 / 0.08),
			var(--shadow-md);
	}

	:global([data-theme='dark']) .platter {
		background: radial-gradient(circle, #cfd6dc 0 16%, #9aa3ab 16.5% 17.5%, #c4ccd3 18% 100%);
	}

	/* Iridescent light sweeping across the data side. */
	.sheen {
		position: absolute;
		inset: 0;
		border-radius: 50%;
		background: conic-gradient(
			from 0deg,
			rgb(255 255 255 / 0) 0deg,
			rgb(150 225 255 / 0.55) 30deg,
			rgb(255 255 255 / 0.9) 45deg,
			rgb(255 214 160 / 0.45) 62deg,
			rgb(255 255 255 / 0) 95deg,
			rgb(255 255 255 / 0) 180deg,
			rgb(160 240 220 / 0.45) 215deg,
			rgb(255 255 255 / 0.85) 228deg,
			rgb(170 200 255 / 0.45) 245deg,
			rgb(255 255 255 / 0) 280deg
		);
		mask: radial-gradient(circle, transparent 0 18%, #000 19% 100%);
		animation: spin 9s linear infinite paused;
	}

	.spinning .sheen {
		animation-play-state: running;
		animation-duration: 2.4s;
	}

	.grooves {
		position: absolute;
		inset: 0;
		border-radius: 50%;
		background: repeating-radial-gradient(
			circle,
			rgb(0 0 0 / 0) 0 1.2%,
			rgb(0 0 0 / 0.025) 1.2% 1.5%
		);
		mask: radial-gradient(circle, transparent 0 18%, #000 19% 100%);
	}

	.hub {
		position: absolute;
		inset: 42%;
		border-radius: 50%;
		background: var(--bg-bottom);
		box-shadow: inset 0 2px 4px rgb(0 0 0 / 0.25);
	}

	.ring {
		position: absolute;
		inset: 0;
		rotate: -90deg;
		overflow: visible;
	}

	.ring circle {
		fill: none;
		stroke-width: 2.2;
	}

	.track {
		stroke: var(--border-soft);
	}

	.fill {
		stroke: var(--blue);
		stroke-linecap: round;
		filter: drop-shadow(0 0 2px var(--blue-glow));
		transition: stroke-dashoffset 400ms linear;
	}

	.label {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
	}

	@keyframes spin {
		to {
			rotate: 1turn;
		}
	}
</style>
