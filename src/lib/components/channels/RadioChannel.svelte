<script lang="ts">
	import { ExternalLink, Pause, Play, Radio } from '@lucide/svelte';
	import ChannelFrame from '$lib/components/ChannelFrame.svelte';
	import Disc from '$lib/components/Disc.svelte';
	import Equalizer from '$lib/components/Equalizer.svelte';
	import { CHANNEL_ACCENTS } from '$lib/console/channels';
	import { getPomodorii } from '$lib/console/pomodorii.svelte';
	import { RADIO_CHANNELS } from '$lib/radio/channels';

	type Props = { onmenu: () => void; onhome: () => void };

	let { onmenu, onhome }: Props = $props();

	const app = getPomodorii();

	let dock = $state<HTMLDivElement>();

	const streaming = $derived(app.channel.provider === 'youtube');
	const tracks = $derived(app.channel.provider === 'youtube' ? (app.channel.tracks ?? []) : []);
	const nowPlaying = $derived(app.track?.title ?? app.channel.trackLabel);

	// Hand the video screen's position to the station player while open.
	$effect(() => {
		app.radioDocks.channel = streaming && dock ? dock : null;
		return () => {
			app.radioDocks.channel = null;
		};
	});
</script>

<ChannelFrame title={app.t.channels.radio} accent={CHANNEL_ACCENTS.radio} {onmenu} {onhome}>
	{#snippet icon()}<Radio />{/snippet}

	<div class="radio">
		<section class="player">
			<div class="screen" class:streaming>
				{#if streaming}
					<div class="dock" bind:this={dock}></div>
				{:else}
					<div class="local" class:live={app.onAir}>
						<div class="record">
							<Disc spinning={app.onAir} progress={0}>
								<span class="spindle"><Equalizer active={app.onAir} /></span>
							</Disc>
						</div>
					</div>
				{/if}
			</div>

			<div class="now">
				<div class="meta">
					<span class="kicker">
						{app.onAir ? app.t.radio.onAir : app.t.radio.nowPlaying}
					</span>
					<strong class="track">{nowPlaying}</strong>
					<span class="station">{app.channel.title}</span>
				</div>
				<div class="controls">
					{#if app.track}
						<a
							class="link"
							href="https://www.youtube.com/watch?v={app.track.videoId}"
							target="_blank"
							rel="noopener noreferrer"
							aria-label={app.t.radio.openOnYoutube}
							title={app.t.radio.openOnYoutube}
						>
							<ExternalLink size={18} />
						</a>
					{/if}
					<button
						class="pill primary play"
						type="button"
						data-sfx={app.radioOn ? 'back' : 'select'}
						onclick={() => (app.radioOn = !app.radioOn)}
					>
						{#if app.radioOn}<Pause fill="currentColor" size={18} />{:else}<Play
								fill="currentColor"
								size={18}
							/>{/if}
						{app.radioOn ? app.t.radio.pause : app.t.radio.play}
					</button>
				</div>
			</div>

			<label class="volume">
				<span>{app.t.radio.volume}</span>
				<input
					type="range"
					min="0"
					max="100"
					step="1"
					bind:value={app.settings.musicVolume}
					style:--fill="{app.settings.musicVolume}%"
				/>
			</label>
		</section>

		<section class="stations">
			<h2>{app.t.radio.stations}</h2>
			<ul>
				{#each RADIO_CHANNELS as station (station.id)}
					<li>
						<button
							class="station-card"
							class:active={station.id === app.station}
							type="button"
							aria-pressed={station.id === app.station}
							onclick={() => app.tune(station.id)}
						>
							<span class="badge" class:builtin={station.provider === 'local'}>
								{#if station.id === app.station && app.onAir}
									<Equalizer active />
								{:else}
									<Radio size={18} />
								{/if}
							</span>
							<span class="text">
								<strong>{station.title}</strong>
								<small
									>{station.provider === 'local' ? app.t.radio.builtIn : station.subtitle}</small
								>
							</span>
						</button>
					</li>
				{/each}
			</ul>

			{#if tracks.length > 1}
				<ul class="tracks">
					{#each tracks as track (track.id)}
						<li>
							<button
								class="track-tile"
								class:active={track.id === app.track?.id}
								type="button"
								aria-pressed={track.id === app.track?.id}
								data-sfx="toggle"
								onclick={() => {
									app.radioTrack = track.id;
									app.radioOn = true;
								}}
							>
								<img
									src="https://i.ytimg.com/vi/{track.videoId}/mqdefault.jpg"
									alt=""
									loading="lazy"
									referrerpolicy="no-referrer"
								/>
								<span class="track-title">{track.title}</span>
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</section>
	</div>
</ChannelFrame>

<style>
	.radio {
		display: grid;
		grid-template-columns: minmax(0, 1.4fr) minmax(260px, 1fr);
		gap: clamp(16px, 3vw, 40px);
		min-height: 100%;
		padding: var(--header-space) clamp(16px, 5vw, 72px) clamp(16px, 3vh, 32px);
		background:
			radial-gradient(ellipse at 20% 0%, rgb(255 135 82 / 0.16), transparent 55%), var(--bg-top);
	}

	.player,
	.stations {
		display: grid;
		align-content: start;
		gap: 16px;
	}

	.screen {
		position: relative;
		aspect-ratio: 16 / 9;
		overflow: hidden;
		border-radius: 22px;
		background: #000;
		box-shadow:
			0 0 0 5px var(--surface),
			0 0 0 7px var(--border),
			var(--shadow-lg);
	}

	.dock {
		position: absolute;
		inset: 0;
	}

	.local {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		background:
			repeating-conic-gradient(
				from 0deg at 50% 50%,
				rgb(255 255 255 / 0.12) 0deg 10deg,
				transparent 10deg 20deg
			),
			linear-gradient(160deg, #ffb37a, var(--radio) 60%, #f26b3a);
	}

	.record {
		height: 78%;
		aspect-ratio: 1;
	}

	.record :global(.disc) {
		width: auto;
		height: 100%;
	}

	.spindle {
		display: grid;
		place-items: center;
		width: 34%;
		aspect-ratio: 1;
		border-radius: 50%;
		background: radial-gradient(circle at 35% 30%, #fff, #ffe3cf);
		color: var(--radio);
		box-shadow: var(--shadow-md);
	}

	.spindle :global(.equalizer) {
		width: 56%;
		height: 42%;
	}

	.now {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		padding: 16px 20px;
		border-radius: 20px;
		background: var(--surface);
		box-shadow:
			0 0 0 1.5px var(--border-soft),
			var(--shadow-md);
	}

	.meta {
		display: grid;
		gap: 2px;
		min-width: 0;
	}

	.kicker,
	h2 {
		margin: 0;
		color: var(--radio);
		font-size: 0.75rem;
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.track {
		color: var(--text-strong);
		font-size: 1.1rem;
		font-weight: 800;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.station {
		color: var(--text-muted);
		font-size: 0.85rem;
		font-weight: 600;
	}

	.controls {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.play {
		border-color: #e0632f;
		background: linear-gradient(180deg, #ffb58f 0%, var(--radio) 55%, #e8683a 100%);
		text-shadow: 0 1px 1px rgb(120 40 0 / 0.35);
	}

	.link {
		display: grid;
		place-items: center;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		color: var(--text-muted);
		transition: color 150ms ease;
	}

	.link:hover {
		color: var(--radio);
	}

	.volume {
		display: grid;
		grid-template-columns: auto 1fr;
		align-items: center;
		gap: 16px;
		padding: 0 8px;
		color: var(--text);
		font-size: 0.85rem;
		font-weight: 800;
	}

	input[type='range'] {
		appearance: none;
		height: 10px;
		border-radius: 999px;
		background: linear-gradient(90deg, var(--radio) var(--fill), var(--surface-sunk) var(--fill));
		box-shadow: inset 0 1px 2px rgb(0 0 0 / 0.15);
	}

	input[type='range']::-webkit-slider-thumb {
		appearance: none;
		width: 26px;
		height: 26px;
		border-radius: 50%;
		border: 2px solid var(--pill-border);
		background: radial-gradient(circle at 35% 30%, #fff, #dfe4ea);
		box-shadow: var(--shadow-sm);
	}

	input[type='range']::-moz-range-thumb {
		width: 22px;
		height: 22px;
		border-radius: 50%;
		border: 2px solid var(--pill-border);
		background: radial-gradient(circle at 35% 30%, #fff, #dfe4ea);
	}

	ul {
		display: grid;
		gap: 10px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.station-card {
		display: flex;
		align-items: center;
		gap: 14px;
		width: 100%;
		padding: 12px 14px;
		border-radius: 18px;
		background: var(--surface);
		text-align: left;
		box-shadow:
			0 0 0 1.5px var(--border-soft),
			inset 0 1px 0 var(--highlight),
			var(--shadow-sm);
		transition:
			transform 380ms var(--spring),
			box-shadow 150ms ease;
	}

	.station-card:hover,
	.station-card:focus-visible {
		outline: none;
		transform: scale(1.03);
		box-shadow:
			0 0 0 2.5px var(--blue),
			0 0 14px var(--blue-glow);
	}

	.station-card.active {
		box-shadow:
			0 0 0 2.5px var(--radio),
			var(--shadow-md);
	}

	.badge {
		flex: none;
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		border-radius: 14px;
		background: linear-gradient(160deg, #ff5f5f, #d93b3b);
		color: #fff;
	}

	.badge.builtin {
		background: linear-gradient(160deg, #5fd3f7, var(--blue-strong));
	}

	.badge :global(.equalizer) {
		width: 50%;
		height: 44%;
	}

	.text {
		display: grid;
		min-width: 0;
	}

	.text strong {
		color: var(--text-strong);
		font-weight: 800;
	}

	.text small {
		color: var(--text-muted);
		font-size: 0.8rem;
		font-weight: 600;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.tracks {
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
	}

	.track-tile {
		display: grid;
		gap: 6px;
		width: 100%;
		padding: 6px 6px 10px;
		border-radius: 16px;
		background: var(--surface);
		text-align: left;
		box-shadow: 0 0 0 1.5px var(--border-soft);
		transition:
			transform 380ms var(--spring),
			box-shadow 150ms ease;
	}

	.track-tile:hover,
	.track-tile:focus-visible {
		outline: none;
		transform: scale(1.04);
		box-shadow:
			0 0 0 2.5px var(--blue),
			0 0 14px var(--blue-glow);
	}

	.track-tile.active {
		box-shadow: 0 0 0 2.5px var(--radio);
	}

	.track-tile img {
		width: 100%;
		aspect-ratio: 16 / 9;
		object-fit: cover;
		border-radius: 11px;
		background: var(--surface-sunk);
	}

	.track-title {
		padding: 0 4px;
		color: var(--text-strong);
		font-size: 0.85rem;
		font-weight: 700;
	}

	@media (max-width: 900px) {
		.radio {
			grid-template-columns: 1fr;
		}
	}
</style>
