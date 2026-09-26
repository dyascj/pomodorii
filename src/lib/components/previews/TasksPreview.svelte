<script lang="ts">
	import { Check } from '@lucide/svelte';
	import { plural } from '$lib/i18n';
	import { getPomodorii } from '$lib/console/pomodorii.svelte';

	const app = getPomodorii();

	const shown = $derived(app.tasks.slice(0, 3));
	const open = $derived(app.tasks.filter((task) => !task.completed).length);
</script>

<div class="preview">
	<header>
		<span>{app.t.channels.tasks}</span>
		{#if app.tasks.length > 0}
			<span class="count">
				{open > 0 ? plural(app.language, app.t.tasks.remaining, open) : app.t.tasks.allDone}
			</span>
		{/if}
	</header>
	<ul>
		{#each shown as task (task.id)}
			<li class:done={task.completed}>
				<span class="box">
					{#if task.completed}<Check strokeWidth={4} />{/if}
				</span>
				<span class="text">{task.title}</span>
			</li>
		{:else}
			<li class="placeholder">{app.t.tasks.empty}</li>
		{/each}
	</ul>
</div>

<style>
	.preview {
		position: absolute;
		inset: 0;
		display: grid;
		grid-template-rows: auto 1fr;
		grid-template-columns: minmax(0, 1fr);
		background:
			repeating-linear-gradient(
					180deg,
					transparent 0 calc(16cqh - 1px),
					rgb(67 181 74 / 0.22) calc(16cqh - 1px) 16cqh
				)
				0 22cqh / 100% 100% no-repeat,
			#fffef8;
	}

	:global([data-theme='dark']) .preview {
		background:
			repeating-linear-gradient(
					180deg,
					transparent 0 calc(16cqh - 1px),
					rgb(67 181 74 / 0.25) calc(16cqh - 1px) 16cqh
				)
				0 22cqh / 100% 100% no-repeat,
			#1c231d;
	}

	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 4cqw;
		height: 22cqh;
		padding: 0 6cqw;
		background: linear-gradient(180deg, #6bd26f, var(--tasks));
		color: #fff;
		font-size: 9cqh;
		font-weight: 800;
		text-shadow: 0 1px 1px rgb(0 60 0 / 0.3);
		white-space: nowrap;
	}

	header > span:first-child {
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.count {
		flex: none;
		padding: 0.6cqh 2.6cqw;
		border-radius: 999px;
		background: rgb(255 255 255 / 0.25);
		font-size: 7cqh;
	}

	ul {
		margin: 0;
		padding: 0 6cqw;
		list-style: none;
	}

	li {
		display: flex;
		align-items: center;
		gap: 3cqw;
		height: 16cqh;
		color: var(--text-strong);
		font-size: 8.5cqh;
		font-weight: 700;
		min-width: 0;
	}

	.text {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.box {
		flex: none;
		display: grid;
		place-items: center;
		width: 9cqh;
		height: 9cqh;
		border-radius: 50%;
		border: 0.8cqh solid var(--tasks);
		color: #fff;
	}

	.box :global(svg) {
		width: 80%;
		height: 80%;
	}

	.done .box {
		background: var(--tasks);
	}

	.done .text {
		color: var(--text-muted);
		text-decoration: line-through;
	}

	.placeholder {
		height: auto;
		padding-top: 4cqh;
		color: var(--text-muted);
		font-weight: 600;
		line-height: 1.5;
		white-space: normal;
	}
	@container (aspect-ratio < 1.4) {
		header {
			font-size: 7cqh;
			height: 18cqh;
		}

		.count {
			display: none;
		}

		li {
			font-size: 6.5cqh;
			height: 13cqh;
		}

		.box {
			width: 7cqh;
			height: 7cqh;
		}
	}
</style>
