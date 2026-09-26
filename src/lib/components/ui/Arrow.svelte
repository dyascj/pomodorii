<!-- The glossy cyan triangle from the Wii Menu's page arrows. -->
<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';

	type Props = HTMLButtonAttributes & { direction: 'left' | 'right'; label: string };

	let { direction, label, class: className = '', ...rest }: Props = $props();

	const id = $props.id();
</script>

<button class="arrow {direction} {className}" type="button" aria-label={label} {...rest}>
	<svg viewBox="0 0 40 48" aria-hidden="true">
		<defs>
			<linearGradient id="arrow-{id}" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stop-color="#e2fbff" />
				<stop offset="0.45" stop-color="#a5efff" />
				<stop offset="1" stop-color="#63d6fb" />
			</linearGradient>
		</defs>
		<path d="M8 24 34 6c2-1.3 3 0 3 1.6v32.8c0 1.6-1 2.9-3 1.6Z" fill="url(#arrow-{id})" />
		<path d="M8 24 34 6c2-1.3 3 0 3 1.6v32.8c0 1.6-1 2.9-3 1.6Z" class="edge" />
		<path d="M14 21 31 10.5v8Z" fill="rgb(255 255 255 / 0.7)" />
	</svg>
</button>

<style>
	.arrow {
		display: grid;
		place-items: center;
		width: 2.6rem;
		height: 3rem;
		transition:
			transform 380ms var(--spring),
			opacity 150ms ease;
	}

	svg {
		width: 100%;
		height: 100%;
		overflow: visible;
		filter: drop-shadow(0 2px 2px rgb(0 40 80 / 0.25));
	}

	.edge {
		fill: none;
		stroke: #2e8fd0;
		stroke-width: 2.5;
		stroke-linejoin: round;
	}

	.right svg {
		scale: -1 1;
	}

	.arrow:hover:not(:disabled),
	.arrow:focus-visible {
		outline: none;
		transform: scale(1.18);
	}

	.arrow:active:not(:disabled) {
		transform: scale(0.92);
		transition-duration: 80ms;
	}

	.arrow:disabled {
		opacity: 0.25;
	}
</style>
