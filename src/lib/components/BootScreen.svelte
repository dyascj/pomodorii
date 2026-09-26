<!--
	The health and safety screen. It doubles as the gesture browsers require
	before audio may play, so the boot chime and menu music can start on the
	first press.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { TriangleAlert } from '@lucide/svelte';
	import type { Messages } from '$lib/i18n';

	type Props = { t: Messages; ready: boolean; oncontinue: () => void };

	let { t, ready, oncontinue }: Props = $props();

	let showPrompt = $state(false);
	let touch = $state(false);

	onMount(() => {
		touch = matchMedia('(pointer: coarse)').matches;
		const timer = setTimeout(() => (showPrompt = true), 900);

		const onKey = (event: KeyboardEvent) => {
			if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
			event.preventDefault();
			oncontinue();
		};
		window.addEventListener('keydown', onKey);

		return () => {
			clearTimeout(timer);
			window.removeEventListener('keydown', onKey);
		};
	});
</script>

<section class="boot">
	{#if ready}
		<div class="content" in:fade={{ duration: 500 }}>
			<h1>
				<TriangleAlert size="1.15em" strokeWidth={2.6} aria-hidden="true" />
				{t.boot.title}
			</h1>
			<p class="body">{t.boot.body}</p>
			<p class="note">{t.boot.note}</p>
		</div>
		<!-- One full-screen button, so a press anywhere continues. -->
		<button class="continue" type="button" onclick={oncontinue} data-sfx="none">
			<span class="prompt" class:shown={showPrompt}>
				{touch ? t.boot.promptTouch : t.boot.prompt}
			</span>
		</button>
	{/if}
</section>

<style>
	.boot {
		position: fixed;
		inset: 0;
		display: grid;
		place-items: center;
		padding: 8vh 8vw 18vh;
		background: #000;
		color: #fff;
		text-align: center;
		font-weight: 800;
		text-transform: uppercase;
	}

	.continue {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		padding-bottom: 9vh;
	}

	.continue:focus-visible {
		outline: none;
	}

	.content {
		display: grid;
		gap: clamp(1.25rem, 5vh, 3rem);
		max-width: 56rem;
	}

	h1 {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.6em;
		margin: 0;
		font-size: clamp(1.1rem, 3.4vw, 2.3rem);
		font-weight: 900;
		letter-spacing: 0.02em;
	}

	.body {
		margin: 0;
		font-size: clamp(0.95rem, 2.6vw, 1.75rem);
		line-height: 1.55;
	}

	.note {
		margin: 0;
		font-size: clamp(0.8rem, 1.8vw, 1.15rem);
		font-weight: 600;
		text-transform: none;
		opacity: 0.85;
	}

	.prompt {
		opacity: 0;
		font-size: clamp(0.95rem, 2.2vw, 1.5rem);
		font-weight: 700;
		text-transform: none;
		transition: opacity 400ms ease;
	}

	.prompt.shown {
		opacity: 1;
		animation: pulse 1.6s ease-in-out 400ms infinite;
	}

	@keyframes pulse {
		50% {
			opacity: 0.35;
		}
	}
</style>
