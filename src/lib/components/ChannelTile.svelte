<!--
	One slot on the menu grid: a glossy framed window onto a live channel
	preview, or an empty slot with faint static.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		label?: string;
		onopen?: (tile: HTMLElement) => void;
		children?: Snippet;
	};

	let { label, onopen, children }: Props = $props();

	let tile = $state<HTMLButtonElement>();
</script>

{#if children && label}
	<button
		bind:this={tile}
		class="tile"
		type="button"
		aria-label={label}
		data-sfx="none"
		onclick={() => tile && onopen?.(tile)}
	>
		<span class="screen">{@render children()}</span>
		<span class="gloss" aria-hidden="true"></span>
	</button>
{:else}
	<div class="tile empty" aria-hidden="true">
		<span class="screen static"></span>
	</div>
{/if}

<style>
	.tile {
		position: relative;
		display: block;
		width: 100%;
		height: 100%;
		padding: 0;
		border-radius: var(--radius-tile);
		background: var(--surface);
		box-shadow:
			0 0 0 1.5px var(--border),
			inset 0 0 0 3px var(--highlight),
			var(--shadow-md);
		transition:
			transform 420ms var(--spring),
			box-shadow 160ms ease;
	}

	button.tile:hover,
	button.tile:focus-visible {
		z-index: 1;
		outline: none;
		transform: scale(1.06);
		box-shadow:
			0 0 0 3.5px var(--blue),
			0 0 18px 3px var(--blue-glow),
			var(--shadow-lg);
		animation: bob 2.8s ease-in-out 420ms infinite;
	}

	button.tile:active {
		transform: scale(1.02);
		transition-duration: 90ms;
	}

	.screen {
		position: absolute;
		inset: 5px;
		overflow: hidden;
		border-radius: calc(var(--radius-tile) - 5px);
		container-type: size;
		background: var(--surface);
	}

	.gloss {
		position: absolute;
		inset: 5px 5px 55%;
		border-radius: calc(var(--radius-tile) - 5px) calc(var(--radius-tile) - 5px) 40% 40% /
			calc(var(--radius-tile) - 5px) calc(var(--radius-tile) - 5px) 18% 18%;
		background: linear-gradient(180deg, rgb(255 255 255 / 0.45), rgb(255 255 255 / 0));
		pointer-events: none;
	}

	.empty {
		background: var(--empty);
		box-shadow:
			0 0 0 1.5px var(--border-soft),
			inset 0 0 0 3px var(--highlight);
	}

	.static {
		background:
			repeating-linear-gradient(0deg, var(--empty-line) 0 1px, transparent 1px 3px),
			url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='90'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0.09 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"),
			var(--empty);
		animation: static 0.5s steps(4) infinite;
	}

	@keyframes static {
		0% {
			background-position:
				0 0,
				0 0,
				0 0;
		}
		100% {
			background-position:
				0 0,
				160px 90px,
				0 0;
		}
	}

	@keyframes bob {
		0%,
		100% {
			translate: 0 0;
		}
		50% {
			translate: 0 -3px;
		}
	}
</style>
