<!--
	The Wii Menu's bottom bar: high at the sides, scooped down in the middle
	where the clock sits, with the round buttons set into tracks at each end.
-->
<script lang="ts">
	import { Mail, Volume2, VolumeX } from '@lucide/svelte';
	import SegmentDisplay from '$lib/components/SegmentDisplay.svelte';
	import { getPomodorii } from '$lib/console/pomodorii.svelte';
	import { localeOf, plural } from '$lib/i18n';

	type Props = {
		onsettings: (origin: HTMLElement) => void;
		onboard: (origin: HTMLElement) => void;
	};

	let { onsettings, onboard }: Props = $props();

	const app = getPomodorii();

	let settingsButton = $state<HTMLButtonElement>();
	let boardButton = $state<HTMLButtonElement>();

	const locale = $derived(localeOf(app.language));
	const twelveHour = $derived(
		new Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions().hourCycle === 'h12'
	);

	const time = $derived.by(() => {
		const date = new Date(app.now);
		const hours = date.getHours();
		const shown = twelveHour ? hours % 12 || 12 : hours;
		return {
			clock: `${twelveHour ? shown : String(shown).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`,
			period: twelveHour ? (hours < 12 ? 'AM' : 'PM') : '',
			label: new Intl.DateTimeFormat(locale, { timeStyle: 'short' }).format(date)
		};
	});

	const date = $derived(
		new Intl.DateTimeFormat(locale, { weekday: 'short', month: 'numeric', day: 'numeric' }).format(
			new Date(app.now)
		)
	);
</script>

<footer class="bar">
	<svg class="shape" viewBox="0 0 1000 120" preserveAspectRatio="none" aria-hidden="true">
		<defs>
			<linearGradient id="bar-fill" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stop-color="var(--bar-top)" />
				<stop offset="0.35" stop-color="var(--bar-mid)" />
				<stop offset="1" stop-color="var(--bar-bottom)" />
			</linearGradient>
		</defs>
		<path
			class="fill"
			d="M0,0 H167 C230,0 250,51 317,51 H683 C750,51 770,0 833,0 H1000 V120 H0 Z"
		/>
		<path class="edge" d="M0,0 H167 C230,0 250,51 317,51 H683 C750,51 770,0 833,0 H1000" />
	</svg>

	<div class="clock">
		<time class="time" datetime={new Date(app.now).toISOString()} aria-label={time.label}>
			<SegmentDisplay value={time.clock} label={time.label} outline blinkColon />
			{#if time.period}<span class="period">{time.period}</span>{/if}
		</time>
	</div>
	<div class="date">{date}</div>

	<div class="track left">
		<button
			bind:this={settingsButton}
			class="round logo"
			type="button"
			aria-label={app.t.menu.settings}
			data-sfx="none"
			onclick={() => settingsButton && onsettings(settingsButton)}
		>
			<span>Pomo<br />dorii</span>
		</button>
		<button
			class="round small"
			type="button"
			aria-label={app.muted ? app.t.menu.unmute : app.t.menu.mute}
			aria-pressed={app.muted}
			data-sfx="toggle"
			onclick={() => (app.muted = !app.muted)}
		>
			{#if app.muted}<VolumeX />{:else}<Volume2 />{/if}
		</button>
	</div>

	<div class="track right">
		<button
			bind:this={boardButton}
			class="round mail"
			class:unread={app.unread > 0}
			type="button"
			aria-label={app.unread > 0
				? `${app.t.menu.board}, ${plural(app.language, app.t.menu.unread, app.unread)}`
				: app.t.menu.board}
			data-sfx="none"
			onclick={() => boardButton && onboard(boardButton)}
		>
			<Mail strokeWidth={1.8} />
		</button>
	</div>
</footer>

<style>
	.bar {
		position: relative;
		height: 100%;
		container-type: size;
	}

	.shape {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		overflow: visible;
		filter: drop-shadow(0 -2px 6px rgb(0 0 0 / 0.06));
	}

	.fill {
		fill: url(#bar-fill);
	}

	.edge {
		fill: none;
		stroke: var(--blue);
		stroke-width: 2.5;
		vector-effect: non-scaling-stroke;
	}

	.clock {
		position: absolute;
		left: 50%;
		top: -2cqh;
		translate: -50% 0;
	}

	.time {
		display: flex;
		align-items: flex-end;
		gap: 0.6cqh;
		color: var(--clock);
		font-size: min(26cqh, 13cqw);
	}

	.period {
		font-size: 9cqh;
		font-weight: 800;
		line-height: 1.4;
	}

	.date {
		position: absolute;
		left: 50%;
		top: 54cqh;
		translate: -50% 0;
		color: var(--date);
		font-size: clamp(0.85rem, min(11cqh, 4.4cqw), 1.8rem);
		font-weight: 800;
		white-space: nowrap;
	}

	.track {
		position: absolute;
		top: 22cqh;
		display: flex;
		align-items: center;
		gap: min(3cqh, 1.5cqw);
		height: min(60cqh, 20cqw);
		padding: 0 3cqh;
		background: linear-gradient(180deg, rgb(0 0 0 / 0.08), rgb(255 255 255 / 0.05));
		box-shadow:
			inset 0 2px 4px rgb(0 0 0 / 0.12),
			0 1px 0 var(--highlight);
	}

	.left {
		left: 0;
		padding-left: max(3cqh, 2.5cqw);
		border-radius: 0 999px 999px 0;
	}

	.right {
		right: 0;
		padding-right: max(3cqh, 2.5cqw);
		border-radius: 999px 0 0 999px;
	}

	.round {
		display: grid;
		place-items: center;
		width: min(54cqh, 17cqw);
		height: min(54cqh, 17cqw);
		border-radius: 50%;
		border: 2px solid var(--blue);
		background: radial-gradient(circle at 32% 26%, #ffffff 0%, #eeeeee 40%, #c9c9c9 100%);
		box-shadow:
			inset 0 -3px 6px rgb(0 0 0 / 0.12),
			var(--shadow-md);
		color: #6e7178;
		transition:
			transform 420ms var(--spring),
			box-shadow 160ms ease;
	}

	:global([data-theme='dark']) .round {
		background: radial-gradient(circle at 32% 26%, #4a525d 0%, #2a3038 45%, #151a20 100%);
		color: #c3c8d0;
	}

	.round:hover,
	.round:focus-visible {
		outline: none;
		transform: scale(1.1);
		box-shadow:
			0 0 0 4px var(--blue-glow),
			var(--shadow-md);
	}

	.round:active {
		transform: scale(0.96);
		transition-duration: 90ms;
	}

	.round :global(svg) {
		width: 46%;
		height: 46%;
	}

	.small {
		width: min(32cqh, 10cqw);
		height: min(32cqh, 10cqw);
	}

	.logo span {
		color: #7b7f86;
		font-size: min(9.5cqh, 3cqw);
		font-weight: 900;
		line-height: 0.95;
		letter-spacing: -0.02em;
	}

	:global([data-theme='dark']) .logo span {
		color: #c3c8d0;
	}

	/* On narrow screens the date needs the room the tracks would take. */
	@container (max-width: 560px) {
		.track {
			top: auto;
			bottom: 8cqh;
		}

		.date {
			top: 60cqh;
		}
	}

	.mail.unread {
		color: var(--blue-strong);
		animation: glow 1.6s ease-in-out infinite;
	}

	@keyframes glow {
		50% {
			box-shadow:
				0 0 0 6px var(--blue-glow),
				0 0 24px var(--blue-glow);
		}
	}
</style>
