<script lang="ts">
	import { flushSync } from 'svelte';
	import { flip } from 'svelte/animate';
	import { Check, GripVertical, ListTodo, Plus, X } from '@lucide/svelte';
	import ChannelFrame from '$lib/components/ChannelFrame.svelte';
	import { CHANNEL_ACCENTS } from '$lib/console/channels';
	import { getPomodorii } from '$lib/console/pomodorii.svelte';
	import { pop } from '$lib/console/transitions';
	import { format, plural } from '$lib/i18n';
	import { MAX_TASK_LENGTH } from '$lib/store/tasks';

	type Props = { onmenu: () => void; onhome: () => void };

	let { onmenu, onhome }: Props = $props();

	const app = getPomodorii();

	let draft = $state('');
	let input = $state<HTMLInputElement>();
	let list = $state<HTMLOListElement>();

	type Drag = { id: string; pointerId: number; startY: number; startTop: number; offset: number };
	let drag = $state<Drag | null>(null);

	const nextId = $derived(app.currentTask?.id);
	const open = $derived(app.tasks.filter((task) => !task.completed).length);
	const finished = $derived(app.tasks.length - open);

	const submit = (event: SubmitEvent) => {
		event.preventDefault();
		if (app.addTask(draft)) {
			app.play('select');
			draft = '';
		} else {
			app.play('back', { rate: 0.8 });
		}
		input?.focus();
	};

	const itemTop = (id: string) =>
		list?.querySelector<HTMLElement>(`[data-id="${id}"]`)?.offsetTop ?? 0;

	const startDrag = (event: PointerEvent, id: string) => {
		if (event.button !== 0) return;
		const handle = event.currentTarget as HTMLElement;
		handle.setPointerCapture(event.pointerId);
		drag = {
			id,
			pointerId: event.pointerId,
			startY: event.clientY,
			startTop: itemTop(id),
			offset: 0
		};
		app.play('pickup');
	};

	const moveDrag = (event: PointerEvent) => {
		if (!drag || event.pointerId !== drag.pointerId || !list) return;
		const id = drag.id;
		const index = app.tasks.findIndex((task) => task.id === id);
		const items = [...list.querySelectorAll<HTMLElement>('[data-id]')];
		const center = drag.startTop + (event.clientY - drag.startY) + items[index].offsetHeight / 2;
		const middle = (item: HTMLElement | undefined) =>
			item ? item.offsetTop + item.offsetHeight / 2 : NaN;

		// Swap with a neighbor once the dragged item's center passes theirs.
		if (center < middle(items[index - 1])) {
			flushSync(() => app.moveTask(index, index - 1));
			app.play('hover', { rate: 1.08, gain: 0.4 });
		} else if (center > middle(items[index + 1])) {
			flushSync(() => app.moveTask(index, index + 1));
			app.play('hover', { rate: 0.94, gain: 0.4 });
		}

		drag.offset = center - items[index].offsetHeight / 2 - itemTop(id);
	};

	const endDrag = (event: PointerEvent) => {
		if (!drag || event.pointerId !== drag.pointerId) return;
		drag = null;
		app.play('drop');
	};

	const nudge = (event: KeyboardEvent, index: number) => {
		const step = event.key === 'ArrowUp' ? -1 : event.key === 'ArrowDown' ? 1 : 0;
		if (!step) return;
		event.preventDefault();
		const target = index + step;
		if (target < 0 || target >= app.tasks.length) return;
		app.moveTask(index, target);
		app.play('drop');
		const handle = event.currentTarget as HTMLElement;
		requestAnimationFrame(() => handle.focus());
	};
</script>

<ChannelFrame title={app.t.channels.tasks} accent={CHANNEL_ACCENTS.tasks} {onmenu} {onhome}>
	{#snippet icon()}<ListTodo />{/snippet}
	{#snippet actions()}
		{#if finished > 0}
			<button class="pill" type="button" data-sfx="back" onclick={() => app.clearCompleted()}>
				{app.t.tasks.clearCompleted}
			</button>
		{/if}
	{/snippet}

	<div class="tasks">
		<div class="notebook">
			<form class="add" onsubmit={submit}>
				<input
					bind:this={input}
					bind:value={draft}
					type="text"
					maxlength={MAX_TASK_LENGTH}
					placeholder={app.t.tasks.placeholder}
					aria-label={app.t.tasks.placeholder}
					enterkeyhint="done"
				/>
				<button class="pill primary" type="submit" data-sfx="none" disabled={!draft.trim()}>
					<Plus size={18} strokeWidth={3} />
					{app.t.tasks.add}
				</button>
			</form>

			{#if app.tasks.length > 0}
				<p class="summary">
					{open > 0 ? plural(app.language, app.t.tasks.remaining, open) : app.t.tasks.allDone}
				</p>
			{/if}

			<ol class="list" bind:this={list}>
				{#each app.tasks as task, index (task.id)}
					<li
						class="task"
						class:done={task.completed}
						class:dragging={drag?.id === task.id}
						data-id={task.id}
						style:translate={drag?.id === task.id ? `0 ${drag.offset}px` : null}
						animate:flip={{ duration: drag?.id === task.id ? 0 : app.ms(220) }}
						in:pop={{ duration: app.ms(360) }}
					>
						<button
							class="grip"
							type="button"
							aria-label={format(app.t.tasks.reorder, { title: task.title })}
							data-sfx="none"
							onpointerdown={(event) => startDrag(event, task.id)}
							onpointermove={moveDrag}
							onpointerup={endDrag}
							onpointercancel={endDrag}
							onkeydown={(event) => nudge(event, index)}
						>
							<GripVertical size={18} />
						</button>
						<button
							class="check"
							type="button"
							role="checkbox"
							aria-checked={task.completed}
							aria-label={format(task.completed ? app.t.tasks.untoggle : app.t.tasks.toggle, {
								title: task.title
							})}
							data-sfx="toggle"
							onclick={() => app.toggleTask(task.id)}
						>
							{#if task.completed}<Check size={18} strokeWidth={4} />{/if}
						</button>
						<span class="title">{task.title}</span>
						{#if task.id === nextId}
							<span class="next">{app.t.tasks.first}</span>
						{/if}
						<button
							class="remove"
							type="button"
							aria-label={format(app.t.tasks.remove, { title: task.title })}
							data-sfx="back"
							onclick={() => app.removeTask(task.id)}
						>
							<X size={18} strokeWidth={3} />
						</button>
					</li>
				{:else}
					<li class="empty">{app.t.tasks.empty}</li>
				{/each}
			</ol>
		</div>
	</div>
</ChannelFrame>

<style>
	.tasks {
		min-height: 100%;
		padding: var(--header-space) clamp(16px, 5vw, 72px) clamp(16px, 3vh, 32px);
		background:
			radial-gradient(ellipse at 50% 0%, rgb(67 181 74 / 0.12), transparent 60%), var(--bg-top);
	}

	.notebook {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 14px;
		width: min(100%, 680px);
		margin: 0 auto;
	}

	.add {
		display: flex;
		gap: 10px;
		padding: 8px;
		border-radius: 999px;
		background: var(--surface);
		box-shadow:
			0 0 0 2px var(--tasks),
			var(--shadow-md);
	}

	.add input {
		flex: 1;
		width: 0;
		min-width: 0;
		padding: 0 1rem;
		border: 0;
		background: transparent;
		color: var(--text-strong);
		font-size: 1.05rem;
		font-weight: 600;
		outline: none;
	}

	.add input::placeholder {
		color: var(--text-muted);
	}

	.add .pill {
		min-height: 2.6rem;
		padding-inline: 1.2em;
		border-color: #3a9e40;
		background: linear-gradient(180deg, #7ddc80 0%, var(--tasks) 60%, #3a9e40 100%);
		text-shadow: 0 1px 1px rgb(0 60 0 / 0.3);
	}

	.summary {
		margin: 4px 8px 0;
		color: var(--tasks);
		font-size: 0.8rem;
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.list {
		position: relative;
		display: grid;
		gap: 8px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.task {
		position: relative;
		display: flex;
		align-items: center;
		gap: 10px;
		min-height: 3.5rem;
		padding: 6px 10px 6px 4px;
		border-radius: 16px;
		background: var(--surface);
		box-shadow:
			0 0 0 1.5px var(--border-soft),
			inset 0 1px 0 var(--highlight),
			var(--shadow-sm);
		transition:
			box-shadow 150ms ease,
			scale 200ms var(--ease-out);
	}

	.task:hover {
		box-shadow:
			0 0 0 2px var(--blue),
			var(--shadow-sm);
	}

	.dragging {
		z-index: 2;
		scale: 1.03;
		box-shadow:
			0 0 0 2.5px var(--blue),
			var(--shadow-lg);
	}

	.grip {
		display: grid;
		place-items: center;
		width: 28px;
		height: 40px;
		border-radius: 10px;
		color: var(--text-muted);
		touch-action: none;
		cursor: grab;
	}

	.dragging .grip {
		cursor: grabbing;
	}

	.check {
		flex: none;
		display: grid;
		place-items: center;
		width: 30px;
		height: 30px;
		border-radius: 50%;
		border: 3px solid var(--tasks);
		color: #fff;
		transition:
			background 180ms ease,
			transform 380ms var(--spring);
	}

	.check:hover {
		transform: scale(1.12);
	}

	.done .check {
		background: var(--tasks);
		animation: stamp 420ms var(--spring);
	}

	.title {
		flex: 1;
		min-width: 0;
		color: var(--text-strong);
		font-size: 1rem;
		font-weight: 600;
		overflow-wrap: anywhere;
	}

	.done .title {
		color: var(--text-muted);
		text-decoration: line-through;
	}

	.next {
		flex: none;
		padding: 0.2em 0.7em;
		border-radius: 999px;
		background: rgb(52 190 237 / 0.14);
		color: var(--blue-text);
		font-size: 0.72rem;
		font-weight: 800;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	.remove {
		flex: none;
		display: grid;
		place-items: center;
		width: 34px;
		height: 34px;
		border-radius: 50%;
		color: var(--text-muted);
		opacity: 0.6;
		transition:
			opacity 150ms ease,
			color 150ms ease,
			background 150ms ease;
	}

	.task:hover .remove,
	.remove:focus-visible {
		opacity: 1;
	}

	.remove:hover {
		background: rgb(229 83 75 / 0.12);
		color: var(--danger);
	}

	.empty {
		padding: 40px 20px;
		border-radius: 20px;
		border: 2px dashed var(--border-soft);
		color: var(--text-muted);
		text-align: center;
		font-weight: 600;
	}

	@keyframes stamp {
		0% {
			transform: scale(0.6);
		}
		100% {
			transform: scale(1);
		}
	}
</style>
