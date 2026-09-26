<!--
	Shared chrome for an open channel: a title tab, the channel's content, and
	a bottom bar with the way back to the menu and the HOME button.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { ChevronLeft, House } from '@lucide/svelte';
	import { getPomodorii } from '$lib/console/pomodorii.svelte';

	type Props = {
		title: string;
		accent: string;
		/** Hide the title tab for channels that draw their own heading. */
		showTitle?: boolean;
		onmenu: () => void;
		onhome: () => void;
		icon?: Snippet;
		actions?: Snippet;
		children: Snippet;
	};

	let {
		title,
		accent,
		showTitle = true,
		onmenu,
		onhome,
		icon,
		actions,
		children
	}: Props = $props();

	const app = getPomodorii();
</script>

<div class="frame" style:--accent={accent}>
	<main class="content">
		{@render children()}
	</main>

	<header class:visually-hidden={!showTitle}>
		<h1 class="tab">
			{#if icon}<span class="icon">{@render icon()}</span>{/if}
			{title}
		</h1>
	</header>

	<footer>
		<button class="pill" type="button" data-sfx="back" onclick={onmenu}>
			<ChevronLeft size={20} strokeWidth={3} />
			{app.t.menu.back}
		</button>
		<div class="actions">
			{#if actions}{@render actions()}{/if}
		</div>
		<button
			class="home"
			type="button"
			aria-label={app.t.homeMenu.title}
			data-sfx="none"
			onclick={onhome}
		>
			<House size={22} strokeWidth={2.4} />
		</button>
	</footer>
</div>

<style>
	/*
	 * The title tab floats over the channel so each channel's background runs
	 * edge to edge; channels leave `--header-space` clear at the top.
	 */
	.frame {
		--header-space: clamp(76px, 12vh, 104px);
		position: absolute;
		inset: 0;
		display: grid;
		grid-template-rows: minmax(0, 1fr) auto;
		grid-template-columns: minmax(0, 1fr);
		color: var(--text);
	}

	header {
		position: absolute;
		top: clamp(14px, 3vh, 28px);
		left: clamp(16px, 4vw, 48px);
	}

	.tab {
		display: inline-flex;
		align-items: center;
		gap: 0.6em;
		margin: 0;
		padding: 0.45em 1.2em 0.45em 0.5em;
		border-radius: 999px;
		background: var(--surface);
		box-shadow:
			0 0 0 1.5px var(--border-soft),
			var(--shadow-sm);
		color: var(--text-strong);
		font-size: clamp(0.95rem, 2vw, 1.15rem);
		font-weight: 800;
	}

	.icon {
		display: grid;
		place-items: center;
		width: 2em;
		height: 2em;
		border-radius: 50%;
		background: var(--accent);
		color: #fff;
	}

	.icon :global(svg) {
		width: 58%;
		height: 58%;
	}

	.content {
		position: relative;
		min-height: 0;
		overflow: hidden auto;
		overscroll-behavior: contain;
	}

	footer {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: 16px;
		padding: 14px clamp(16px, 4vw, 48px) max(14px, env(safe-area-inset-bottom));
		border-top: 2.5px solid var(--blue);
		background: linear-gradient(180deg, var(--bar-mid), var(--bar-bottom));
	}

	.actions {
		display: flex;
		justify-content: center;
		gap: 12px;
		flex-wrap: wrap;
	}

	.home {
		display: grid;
		place-items: center;
		width: 48px;
		height: 48px;
		border-radius: 50%;
		border: 2px solid var(--blue);
		background: radial-gradient(circle at 32% 26%, #ffffff 0%, #eeeeee 40%, #c9c9c9 100%);
		color: #5e636b;
		box-shadow: var(--shadow-sm);
		transition: transform 420ms var(--spring);
	}

	.home:hover,
	.home:focus-visible {
		outline: none;
		transform: scale(1.1);
		box-shadow:
			0 0 0 4px var(--blue-glow),
			var(--shadow-sm);
	}

	:global([data-theme='dark']) .home {
		background: radial-gradient(circle at 32% 26%, #4a525d 0%, #2a3038 45%, #151a20 100%);
		color: #c3c8d0;
	}

	@media (max-width: 520px) {
		footer {
			grid-template-columns: auto auto;
		}

		.actions {
			grid-column: 1 / -1;
			grid-row: 1;
		}
	}
</style>
