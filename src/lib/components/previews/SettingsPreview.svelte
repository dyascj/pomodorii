<script lang="ts">
	import { Settings } from '@lucide/svelte';
	import { getPomodorii } from '$lib/console/pomodorii.svelte';

	const app = getPomodorii();
</script>

<div class="preview">
	<span class="gear"><Settings strokeWidth={1.6} /></span>
	<span class="title">{app.t.channels.settings}</span>
</div>

<style>
	.preview {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 5cqh;
		background:
			repeating-linear-gradient(0deg, rgb(255 255 255 / 0.05) 0 1px, transparent 1px 3px),
			linear-gradient(180deg, #1d232b 0%, #07090c 100%);
		color: #fff;
	}

	.gear {
		display: grid;
		place-items: center;
		width: 42cqh;
		height: 42cqh;
		border-radius: 24%;
		border: 0.9cqh solid var(--blue);
		background: linear-gradient(180deg, #ffffff 0%, #ffffff 45%, #dfe5ea 100%);
		box-shadow: 0 0 3cqh rgb(52 190 237 / 0.45);
		color: #5d6570;
	}

	.gear :global(svg) {
		width: 72%;
		height: 72%;
		animation: turn 12s linear infinite;
	}

	.title {
		max-width: 90%;
		font-size: min(9cqh, 7.5cqw);
		font-weight: 800;
		letter-spacing: 0.02em;
		text-align: center;
	}

	@keyframes turn {
		to {
			rotate: 1turn;
		}
	}
</style>
