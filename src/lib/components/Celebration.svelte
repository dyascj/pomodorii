<!--
	Plays when a session ends: a burst of bubbles and stars behind a banner
	that pops in, then clears itself.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { getPomodorii, type Celebration } from '$lib/console/pomodorii.svelte';
	import { pop } from '$lib/console/transitions';

	type Props = { celebration: Celebration; ondismiss: () => void };

	let { celebration, ondismiss }: Props = $props();

	const app = getPomodorii();

	const COLORS = ['#34beed', '#8fe3ff', '#43b54a', '#ff8752', '#ffd84d', '#ffffff'];

	// Deterministic per celebration, so it never reshuffles mid-animation.
	const particles = $derived.by(() => {
		let seed = celebration.id * 9301 + 49297;
		const random = () => {
			seed = (seed * 9301 + 49297) % 233280;
			return seed / 233280;
		};
		return Array.from({ length: 36 }, (_, index) => {
			const angle = (index / 36) * Math.PI * 2 + random() * 0.3;
			const distance = 28 + random() * 26;
			return {
				x: Math.cos(angle) * distance,
				y: Math.sin(angle) * distance * 0.8,
				size: 10 + random() * 22,
				color: COLORS[index % COLORS.length],
				star: index % 3 === 0,
				delay: random() * 120,
				spin: (random() - 0.5) * 540
			};
		});
	});

	onMount(() => {
		const timer = setTimeout(ondismiss, 4200);
		return () => clearTimeout(timer);
	});
</script>

<button
	class="celebration"
	type="button"
	data-sfx="none"
	aria-live="assertive"
	onclick={ondismiss}
	transition:fade={{ duration: app.ms(300) }}
>
	{#if !app.reducedMotion}
		<div class="burst" aria-hidden="true">
			{#each particles as particle, index (index)}
				<span
					class="particle"
					class:star={particle.star}
					style:--x="{particle.x}vmin"
					style:--y="{particle.y}vmin"
					style:--size="{particle.size}px"
					style:--color={particle.color}
					style:--spin="{particle.spin}deg"
					style:animation-delay="{particle.delay}ms"
				></span>
			{/each}
		</div>
	{/if}

	<div class="banner" in:pop={{ duration: app.ms(520), from: 0.4 }}>
		<strong>{app.t.focus.complete[celebration.mode]}</strong>
		<span>{app.t.focus.completeHint[celebration.mode]}</span>
	</div>
</button>

<style>
	.celebration {
		position: fixed;
		inset: 0;
		z-index: 70;
		display: grid;
		place-items: center;
		background: radial-gradient(circle, rgb(255 255 255 / 0.55), rgb(255 255 255 / 0.1) 70%);
	}

	:global([data-theme='dark']) .celebration {
		background: radial-gradient(circle, rgb(0 0 0 / 0.35), rgb(0 0 0 / 0.1) 70%);
	}

	.burst {
		position: absolute;
		left: 50%;
		top: 50%;
	}

	.particle {
		position: absolute;
		width: var(--size);
		height: var(--size);
		margin: calc(var(--size) / -2);
		border-radius: 50%;
		background: radial-gradient(circle at 35% 30%, #fff 0 18%, var(--color) 60%);
		box-shadow: 0 0 12px var(--color);
		opacity: 0;
		animation: burst 1.6s var(--ease-out) forwards;
	}

	.particle.star {
		border-radius: 0;
		background: var(--color);
		clip-path: polygon(
			50% 0,
			61% 35%,
			98% 35%,
			68% 57%,
			79% 91%,
			50% 70%,
			21% 91%,
			32% 57%,
			2% 35%,
			39% 35%
		);
		box-shadow: none;
	}

	.banner {
		position: relative;
		display: grid;
		gap: 8px;
		padding: clamp(22px, 4vh, 36px) clamp(28px, 6vw, 64px);
		border-radius: 32px;
		border: 4px solid var(--blue);
		background: linear-gradient(180deg, #ffffff 0%, #ffffff 55%, #e6f7fd 100%);
		box-shadow:
			0 0 0 8px rgb(255 255 255 / 0.6),
			0 0 60px var(--blue-glow),
			var(--shadow-lg);
		text-align: center;
	}

	.banner strong {
		color: var(--blue-text);
		font-size: clamp(1.6rem, 5vw, 3rem);
		font-weight: 900;
	}

	.banner span {
		color: #5a5d62;
		font-size: clamp(1rem, 2.4vw, 1.3rem);
		font-weight: 700;
	}

	@keyframes burst {
		0% {
			opacity: 1;
			transform: translate(0, 0) scale(0.2) rotate(0deg);
		}
		70% {
			opacity: 1;
		}
		100% {
			opacity: 0;
			transform: translate(var(--x), var(--y)) scale(1) rotate(var(--spin));
		}
	}
</style>
