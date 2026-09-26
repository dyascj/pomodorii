<!--
	Laid out like Wii System Settings: pages of wide buttons on the dark
	scanline screen, each opening a panel of options.
-->
<script lang="ts">
	import { fly } from 'svelte/transition';
	import { ChevronLeft, Settings } from '@lucide/svelte';
	import ChannelFrame from '$lib/components/ChannelFrame.svelte';
	import Arrow from '$lib/components/ui/Arrow.svelte';
	import Choice from '$lib/components/ui/Choice.svelte';
	import Meter from '$lib/components/ui/Meter.svelte';
	import Stepper from '$lib/components/ui/Stepper.svelte';
	import { CHANNEL_ACCENTS } from '$lib/console/channels';
	import { getPomodorii, type Theme } from '$lib/console/pomodorii.svelte';
	import { LANGUAGES, format, type Language, type Messages } from '$lib/i18n';
	import { LIMITS } from '$lib/store/settings';
	import { version } from '$app/environment';

	type Props = { onmenu: () => void; onhome: () => void };

	let { onmenu, onhome }: Props = $props();

	const app = getPomodorii();

	type Section = keyof Messages['settings']['sections'];

	const PAGES: readonly (readonly Section[])[] = [
		['timer', 'flow', 'sound', 'theme'],
		['language', 'access', 'about', 'erase']
	];

	let page = $state(0);
	let direction = $state(1);
	let section = $state<Section | null>(null);
	let confirming = $state(false);

	const s = $derived(app.t.settings);

	const titles = $derived(s.sections);

	const onOff = $derived([
		{ value: true, label: s.on },
		{ value: false, label: s.off }
	] as const);

	const minutes = (value: number) => format(s.minutes, { value });

	const turn = (step: number) => {
		direction = step;
		page = (page + step + PAGES.length) % PAGES.length;
	};

	const open = (next: Section) => {
		confirming = false;
		section = next;
	};

	const back = () => {
		section = null;
	};
</script>

<ChannelFrame title={s.title} accent={CHANNEL_ACCENTS.settings} showTitle={false} {onmenu} {onhome}>
	{#snippet icon()}<Settings />{/snippet}

	<div class="settings">
		{#if section === null}
			<div class="tab">
				{s.title}
				<span class="number">{page + 1}</span>
			</div>

			<div class="pager">
				<Arrow
					direction="left"
					label={s.previous}
					data-sfx="none"
					onclick={() => {
						app.play('hover', { rate: 0.9 });
						turn(-1);
					}}
				/>
				{#key page}
					<ul class="buttons" in:fly={{ x: direction * 60, duration: app.ms(260) }}>
						{#each PAGES[page] as id (id)}
							<li>
								<button
									class="wide"
									class:danger={id === 'erase'}
									type="button"
									onclick={() => open(id)}
								>
									{titles[id]}
								</button>
							</li>
						{/each}
					</ul>
				{/key}
				<Arrow
					direction="right"
					label={s.next}
					data-sfx="none"
					onclick={() => {
						app.play('hover', { rate: 1.1 });
						turn(1);
					}}
				/>
			</div>
			<p class="page">{format(s.page, { page: page + 1, total: PAGES.length })}</p>
		{:else}
			<div class="tab">{titles[section]}</div>

			<div class="panel" in:fly={{ y: 24, duration: app.ms(260) }}>
				{#if section === 'timer'}
					<div class="row">
						<span>{s.focusLength}</span>
						<Stepper
							label={s.focusLength}
							value={app.settings.durations.focus}
							{...LIMITS.focus}
							display={minutes}
							onchange={(value) => app.setDuration('focus', value)}
						/>
					</div>
					<div class="row">
						<span>{s.shortLength}</span>
						<Stepper
							label={s.shortLength}
							value={app.settings.durations.short}
							{...LIMITS.short}
							display={minutes}
							onchange={(value) => app.setDuration('short', value)}
						/>
					</div>
					<div class="row">
						<span>{s.longLength}</span>
						<Stepper
							label={s.longLength}
							value={app.settings.durations.long}
							{...LIMITS.long}
							display={minutes}
							onchange={(value) => app.setDuration('long', value)}
						/>
					</div>
					<div class="row">
						<span>{s.longBreakInterval}</span>
						<Stepper
							label={s.longBreakInterval}
							value={app.settings.longBreakInterval}
							{...LIMITS.longBreakInterval}
							display={(value) => format(s.sessionsUnit, { value })}
							onchange={(value) => app.setLongBreakInterval(value)}
						/>
					</div>
				{:else if section === 'flow'}
					{#each [['autoStartBreaks', s.autoStartBreaks], ['autoStartFocus', s.autoStartFocus], ['autoCheckTasks', s.autoCheckTasks], ['completedToBottom', s.completedToBottom]] as const as [key, label] (key)}
						<div class="row">
							<span>{label}</span>
							<Choice
								{label}
								value={app.settings[key]}
								options={onOff}
								onchange={(value) => (app.settings[key] = value)}
							/>
						</div>
					{/each}
				{:else if section === 'sound'}
					<div class="row">
						<span>{s.effectsVolume}</span>
						<Meter
							label={s.effectsVolume}
							value={app.settings.effectsVolume}
							onchange={(value) => (app.settings.effectsVolume = value)}
						/>
					</div>
					<div class="row">
						<span>{s.musicVolume}</span>
						<Meter
							label={s.musicVolume}
							value={app.settings.musicVolume}
							onchange={(value) => (app.settings.musicVolume = value)}
						/>
					</div>
				{:else if section === 'theme'}
					<div class="row">
						<span>{s.theme}</span>
						<Choice
							label={s.theme}
							value={app.theme}
							options={(['light', 'dark', 'system'] as const).map((value) => ({
								value,
								label: s.themes[value]
							}))}
							onchange={(value: Theme) => (app.theme = value)}
						/>
					</div>
				{:else if section === 'language'}
					<div class="row">
						<span>{s.language}</span>
						<Choice
							label={s.language}
							value={app.language}
							options={LANGUAGES.map(({ id, label }) => ({ value: id, label }))}
							onchange={(value: Language) => (app.language = value)}
						/>
					</div>
				{:else if section === 'access'}
					<div class="row">
						<span>{s.pointer}</span>
						<Choice
							label={s.pointer}
							value={app.settings.pointer}
							options={onOff}
							onchange={(value) => (app.settings.pointer = value)}
						/>
					</div>
					<div class="row">
						<span>{s.reduceMotion}</span>
						<Choice
							label={s.reduceMotion}
							value={app.settings.reduceMotion}
							options={onOff}
							onchange={(value) => (app.settings.reduceMotion = value)}
						/>
					</div>
				{:else if section === 'about'}
					<div class="about">
						<img src="/icon-192.png" alt="" width="72" height="72" />
						<strong>{app.t.appName}</strong>
						<span>{format(s.version, { version })}</span>
						<span>{s.credit}</span>
						<a
							class="pill"
							href="https://github.com/dyascj/pomodorii"
							target="_blank"
							rel="noopener noreferrer"
						>
							{s.source}
						</a>
					</div>
				{:else if section === 'erase'}
					<div class="erase">
						{#if confirming}
							<p>{s.resetConfirm}</p>
							<div class="confirm">
								<button
									class="pill"
									type="button"
									data-sfx="back"
									onclick={() => (confirming = false)}
								>
									{s.resetNo}
								</button>
								<button
									class="pill danger-pill"
									type="button"
									data-sfx="back"
									onclick={() => {
										app.eraseAll();
										confirming = false;
										section = null;
									}}
								>
									{s.resetYes}
								</button>
							</div>
						{:else}
							<button class="wide danger" type="button" onclick={() => (confirming = true)}>
								{s.reset}
							</button>
						{/if}
					</div>
				{/if}
			</div>

			<button class="pill back" type="button" data-sfx="back" onclick={back}>
				<ChevronLeft size={20} strokeWidth={3} />
				{s.title}
			</button>
		{/if}
	</div>
</ChannelFrame>

<style>
	.settings {
		display: grid;
		align-content: start;
		justify-items: center;
		gap: clamp(14px, 3vh, 28px);
		min-height: 100%;
		padding: clamp(16px, 4vh, 40px) clamp(12px, 4vw, 56px);
		background:
			repeating-linear-gradient(0deg, rgb(255 255 255 / 0.045) 0 1px, transparent 1px 3px),
			linear-gradient(180deg, #1a2029 0%, #05070a 100%);
		color: #e8edf2;
	}

	.tab {
		justify-self: start;
		display: inline-flex;
		align-items: center;
		gap: 0.8em;
		padding: 0.5em 1.4em;
		border-radius: 14px 14px 14px 4px;
		background: linear-gradient(180deg, #ffffff 0%, #ffffff 50%, #e3e7eb 100%);
		color: #3a3d44;
		font-size: clamp(1rem, 2.2vw, 1.3rem);
		font-weight: 800;
		box-shadow: 0 0 0 2px var(--blue);
	}

	.number {
		display: grid;
		place-items: center;
		min-width: 1.6em;
		height: 1.6em;
		border-radius: 50%;
		background: var(--blue);
		color: #fff;
		font-size: 0.85em;
	}

	.pager {
		display: grid;
		grid-template-columns: auto minmax(0, 720px) auto;
		align-items: center;
		gap: clamp(8px, 2vw, 28px);
		width: 100%;
		justify-content: center;
	}

	.buttons {
		display: grid;
		gap: clamp(10px, 2vh, 18px);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.wide {
		width: 100%;
		min-height: clamp(56px, 10vh, 84px);
		padding: 0 1.5em;
		border-radius: 18px;
		border: 2.5px solid #3dbce2;
		background: linear-gradient(180deg, #ffffff 0%, #fafcf9 48%, #e6ebee 100%);
		color: #33363c;
		font-size: clamp(1rem, 2.4vw, 1.35rem);
		font-weight: 800;
		box-shadow:
			inset 0 1px 0 #fff,
			0 4px 14px rgb(0 0 0 / 0.35);
		transition:
			transform 380ms var(--spring),
			box-shadow 150ms ease;
	}

	.wide:hover,
	.wide:focus-visible {
		outline: none;
		transform: scale(1.03);
		box-shadow:
			0 0 0 4px rgb(61 188 226 / 0.45),
			0 0 28px rgb(61 188 226 / 0.35);
	}

	.wide.danger {
		border-color: #e5534b;
		color: #b3342d;
	}

	.page {
		margin: 0;
		color: #8d97a3;
		font-weight: 700;
	}

	.panel {
		display: grid;
		gap: 12px;
		width: min(100%, 760px);
		padding: clamp(14px, 3vw, 28px);
		border-radius: 22px;
		background: var(--surface);
		color: var(--text);
		box-shadow:
			0 0 0 2.5px #3dbce2,
			0 10px 40px rgb(0 0 0 / 0.5);
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 12px 20px;
		padding: 10px 4px;
		border-bottom: 1.5px dashed var(--border-soft);
		color: var(--text-strong);
		font-weight: 700;
	}

	.row:last-child {
		border-bottom: 0;
	}

	.about {
		display: grid;
		justify-items: center;
		gap: 8px;
		padding: 12px;
		text-align: center;
	}

	.about img {
		border-radius: 50%;
		box-shadow: var(--shadow-md);
	}

	.about strong {
		color: var(--text-strong);
		font-size: 1.4rem;
	}

	.about a {
		margin-top: 8px;
		text-decoration: none;
	}

	.erase {
		display: grid;
		gap: 16px;
		text-align: center;
	}

	.erase p {
		margin: 0;
		color: var(--text-strong);
		font-weight: 700;
	}

	.confirm {
		display: flex;
		justify-content: center;
		gap: 12px;
	}

	.danger-pill {
		border-color: #c7433c;
		background: linear-gradient(180deg, #ff8f88 0%, var(--danger) 55%, #c7433c 100%);
		color: #fff;
	}

	.back {
		justify-self: start;
	}
</style>
