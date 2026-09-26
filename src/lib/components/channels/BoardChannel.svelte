<!--
	The Message Board: every finished session is posted as a letter on the
	day it happened, the way the Wii logged what you played.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { Coffee, Hourglass, Mail } from '@lucide/svelte';
	import ChannelFrame from '$lib/components/ChannelFrame.svelte';
	import Arrow from '$lib/components/ui/Arrow.svelte';
	import { CHANNEL_ACCENTS } from '$lib/console/channels';
	import { getPomodorii } from '$lib/console/pomodorii.svelte';
	import { format, localeOf, plural } from '$lib/i18n';
	import { summarizeByDay, type LogEntry } from '$lib/store/log';

	type Props = { onmenu: () => void; onhome: () => void };

	let { onmenu, onhome }: Props = $props();

	const app = getPomodorii();

	const DAY_MS = 86_400_000;

	/** Local midnight `days` away from `time`, safe across daylight saving changes. */
	const shiftDay = (time: number, days: number) => {
		const date = new Date(time);
		return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days).getTime();
	};

	/** Days back from today; 0 is today. */
	let offset = $state(0);
	let direction = $state(0);
	let seenBefore = $state(0);

	onMount(() => {
		seenBefore = app.boardSeenAt;
		app.markBoardSeen();
	});

	const b = $derived(app.t.board);
	const locale = $derived(localeOf(app.language));
	const today = $derived(shiftDay(app.now, 0));
	const days = $derived(new Map(summarizeByDay(app.log).map((day) => [day.date.getTime(), day])));
	const oldest = $derived(Math.min(today, ...[...days.keys()]));
	const maxOffset = $derived(Math.round((today - oldest) / DAY_MS));

	const selected = $derived(shiftDay(today, -offset));
	const day = $derived(days.get(selected));

	const week = $derived(
		Array.from({ length: 7 }, (_, index) => {
			const time = shiftDay(today, index - 6);
			return { time, offset: 6 - index, count: days.get(time)?.focusCount ?? 0 };
		})
	);

	const dayLabel = (time: number) => {
		if (time === today) return b.today;
		if (time === shiftDay(today, -1)) return b.yesterday;
		return new Intl.DateTimeFormat(locale, {
			weekday: 'long',
			month: 'long',
			day: 'numeric'
		}).format(time);
	};

	const shortDay = (time: number) =>
		new Intl.DateTimeFormat(locale, { weekday: 'narrow' }).format(time);

	const clockTime = (time: number) =>
		new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' }).format(time);

	const letter = (entry: LogEntry) =>
		format(entry.mode === 'focus' ? b.focusLetter : b.breakLetter, { minutes: entry.minutes });

	const go = (next: number) => {
		direction = next > offset ? -1 : 1;
		offset = Math.max(0, Math.min(maxOffset, next));
	};
</script>

<ChannelFrame title={b.title} accent={CHANNEL_ACCENTS.board} {onmenu} {onhome}>
	{#snippet icon()}<Mail />{/snippet}

	<div class="board pinstripes">
		<header class="day">
			<Arrow
				direction="left"
				label={dayLabel(shiftDay(selected, -1))}
				disabled={offset >= maxOffset}
				onclick={() => go(offset + 1)}
			/>
			<div class="heading">
				<h2>{dayLabel(selected)}</h2>
				<p>
					{plural(app.language, b.summary, day?.focusCount ?? 0, {
						minutes: day?.focusMinutes ?? 0
					})}
				</p>
			</div>
			<Arrow
				direction="right"
				label={dayLabel(shiftDay(selected, 1))}
				disabled={offset <= 0}
				onclick={() => go(offset - 1)}
			/>
		</header>

		<ol class="week" aria-label={b.week}>
			{#each week as entry (entry.time)}
				<li>
					<button
						class="weekday"
						class:selected={entry.offset === offset}
						type="button"
						aria-label={`${dayLabel(entry.time)}: ${entry.count}`}
						aria-current={entry.offset === offset ? 'date' : undefined}
						data-sfx="toggle"
						onclick={() => go(entry.offset)}
					>
						<span class="initial">{shortDay(entry.time)}</span>
						<span class="bar" style:--level={Math.min(1, entry.count / 8)}></span>
						<span class="count">{entry.count}</span>
					</button>
				</li>
			{/each}
		</ol>

		{#key selected}
			<ul class="letters" in:fly={{ x: direction * 40, duration: app.ms(240) }}>
				{#each day?.entries ?? [] as entry, index (entry.id)}
					<li
						class="letter"
						class:break={entry.mode !== 'focus'}
						class:new={entry.finishedAt > seenBefore}
						in:fly={{ y: 16, delay: app.ms(index * 40), duration: app.ms(260) }}
					>
						<span class="stamp">
							{#if entry.mode === 'focus'}<Hourglass size={20} />{:else}<Coffee size={20} />{/if}
						</span>
						<span class="text">
							<strong>{letter(entry)}</strong>
							{#if entry.task}<span class="task">{format(b.onTask, { task: entry.task })}</span
								>{/if}
						</span>
						<time datetime={new Date(entry.finishedAt).toISOString()}
							>{clockTime(entry.finishedAt)}</time
						>
					</li>
				{:else}
					<li class="empty">{b.empty}</li>
				{/each}
			</ul>
		{/key}
	</div>
</ChannelFrame>

<style>
	.board {
		display: grid;
		align-content: start;
		gap: clamp(14px, 3vh, 24px);
		min-height: 100%;
		padding: var(--header-space) clamp(16px, 5vw, 72px) clamp(16px, 3vh, 32px);
	}

	.day {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: 16px;
		width: min(100%, 720px);
		margin: 0 auto;
	}

	.heading {
		text-align: center;
	}

	h2 {
		margin: 0;
		color: var(--text-strong);
		font-size: clamp(1.3rem, 3.4vw, 2rem);
		font-weight: 900;
	}

	.heading p {
		margin: 4px 0 0;
		color: var(--blue-text);
		font-weight: 800;
	}

	.week {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 8px;
		width: min(100%, 720px);
		margin: 0 auto;
		padding: 0;
		list-style: none;
	}

	.weekday {
		display: grid;
		justify-items: center;
		gap: 6px;
		width: 100%;
		padding: 10px 0;
		border-radius: 16px;
		background: var(--surface);
		box-shadow:
			0 0 0 1.5px var(--border-soft),
			var(--shadow-sm);
		transition:
			transform 380ms var(--spring),
			box-shadow 150ms ease;
	}

	.weekday:hover,
	.weekday:focus-visible {
		outline: none;
		transform: scale(1.06);
	}

	.weekday.selected {
		box-shadow:
			0 0 0 2.5px var(--blue),
			0 0 14px var(--blue-glow);
	}

	.initial {
		color: var(--text-muted);
		font-size: 0.8rem;
		font-weight: 800;
	}

	.bar {
		position: relative;
		width: 10px;
		height: 42px;
		border-radius: 999px;
		background: var(--surface-sunk);
		overflow: hidden;
	}

	.bar::after {
		content: '';
		position: absolute;
		inset: auto 0 0;
		height: calc(var(--level) * 100%);
		border-radius: inherit;
		background: linear-gradient(180deg, #8fe3ff, var(--blue-strong));
	}

	.count {
		color: var(--text-strong);
		font-weight: 800;
	}

	.letters {
		display: grid;
		gap: 10px;
		width: min(100%, 720px);
		margin: 0 auto;
		padding: 0;
		list-style: none;
	}

	.letter {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 14px 18px;
		border-radius: 16px;
		background: var(--surface);
		box-shadow:
			0 0 0 1.5px var(--border-soft),
			inset 0 1px 0 var(--highlight),
			var(--shadow-sm);
	}

	.letter.new {
		box-shadow:
			0 0 0 2px var(--blue),
			var(--shadow-sm);
	}

	.stamp {
		flex: none;
		display: grid;
		place-items: center;
		width: 42px;
		height: 42px;
		border-radius: 12px;
		background: linear-gradient(160deg, #5fd3f7, var(--blue-strong));
		color: #fff;
	}

	.break .stamp {
		background: linear-gradient(160deg, #7ddc80, var(--tasks));
	}

	.text {
		display: grid;
		flex: 1;
		min-width: 0;
	}

	.text strong {
		color: var(--text-strong);
		font-weight: 800;
	}

	.task {
		color: var(--text-muted);
		font-weight: 600;
		overflow-wrap: anywhere;
	}

	time {
		color: var(--text-muted);
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}

	.empty {
		padding: 40px 20px;
		border-radius: 20px;
		border: 2px dashed var(--border-soft);
		color: var(--text-muted);
		text-align: center;
		font-weight: 600;
	}
</style>
