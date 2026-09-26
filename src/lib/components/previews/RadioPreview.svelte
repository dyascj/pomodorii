<script lang="ts">
	import { getPomodorii } from '$lib/console/pomodorii.svelte';
	import Equalizer from '$lib/components/Equalizer.svelte';

	type Props = {
		/** Lets a streaming station play its video right inside this preview. */
		dock?: 'banner' | 'tile';
	};

	let { dock }: Props = $props();

	const app = getPomodorii();

	let preview = $state<HTMLDivElement>();

	$effect(() => {
		if (!dock || !preview) return;
		const slot = dock;
		app.radioDocks[slot] = preview;
		return () => {
			app.radioDocks[slot] = null;
		};
	});
</script>

<div class="preview" class:live={app.onAir} bind:this={preview}>
	<div class="burst"></div>
	<div class="content">
		<div class="dial">
			<Equalizer active={app.onAir} />
		</div>
		<div class="meta">
			<span class="title">{app.t.channels.radio}</span>
			<span class="station">
				<span class="dot"></span>
				<span class="name">{app.onAir ? app.channel.title : app.t.radio.idle}</span>
			</span>
		</div>
	</div>
</div>

<style>
	.preview {
		position: absolute;
		inset: 0;
		overflow: hidden;
		background: linear-gradient(160deg, #ffb37a 0%, var(--radio) 55%, #f26b3a 100%);
	}

	.burst {
		position: absolute;
		inset: -60%;
		background: repeating-conic-gradient(
			from 0deg,
			rgb(255 255 255 / 0.14) 0deg 10deg,
			transparent 10deg 20deg
		);
		animation: turn 40s linear infinite;
	}

	.live .burst {
		animation-duration: 14s;
	}

	.content {
		position: relative;
		display: flex;
		align-items: center;
		gap: 6cqw;
		height: 100%;
		padding: 0 8cqw;
	}

	.dial {
		flex: none;
		display: grid;
		place-items: center;
		width: 52cqh;
		height: 52cqh;
		border-radius: 50%;
		background: radial-gradient(circle at 35% 30%, #fff 0%, #fff4ea 60%, #ffd9bf 100%);
		box-shadow:
			0 0 0 1.2cqh rgb(255 255 255 / 0.45),
			0 2cqh 5cqh rgb(140 50 0 / 0.3);
		color: var(--radio);
	}

	.dial :global(.equalizer) {
		width: 58%;
		height: 44%;
	}

	.meta {
		display: grid;
		gap: 2.5cqh;
		min-width: 0;
		color: #fff;
		text-shadow: 0 1px 2px rgb(120 40 0 / 0.35);
	}

	.title {
		font-size: 11cqh;
		font-weight: 900;
		line-height: 1.1;
	}

	.station {
		display: flex;
		align-items: center;
		gap: 2cqw;
		font-size: 8cqh;
		font-weight: 700;
		min-width: 0;
	}

	.name {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.dot {
		flex: none;
		width: 4.5cqh;
		height: 4.5cqh;
		border-radius: 50%;
		background: rgb(255 255 255 / 0.5);
	}

	.live .dot {
		background: #fff;
		box-shadow: 0 0 2cqh #fff;
		animation: pulse 1.2s ease-in-out infinite;
	}

	@container (aspect-ratio < 1.4) {
		.content {
			flex-direction: column;
			justify-content: center;
			gap: 5cqh;
			padding: 0 8cqw;
			text-align: center;
		}

		.dial {
			width: 42cqh;
			height: 42cqh;
		}

		.meta {
			justify-items: center;
			max-width: 100%;
		}

		.title {
			font-size: 8.5cqh;
		}

		.station {
			font-size: 6.5cqh;
		}
	}

	@keyframes turn {
		to {
			rotate: 1turn;
		}
	}

	@keyframes pulse {
		50% {
			opacity: 0.4;
		}
	}
</style>
