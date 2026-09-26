<!--
	The Wii Remote hand pointer. It trails the mouse slightly and rolls with
	horizontal speed, the way the cursor tilted as you twisted the remote.
-->
<script lang="ts">
	import { onMount } from 'svelte';

	type Props = { reduceMotion: boolean };

	let { reduceMotion }: Props = $props();

	const MAX_ROLL = 16;

	let element = $state<HTMLDivElement>();
	let visible = $state(false);
	let pressed = $state(false);

	onMount(() => {
		let targetX = -100;
		let targetY = -100;
		let x = targetX;
		let y = targetY;
		let roll = 0;
		let frame = 0;

		const render = () => {
			const follow = reduceMotion ? 1 : 0.55;
			const dx = targetX - x;
			x += dx * follow;
			y += (targetY - y) * follow;
			const targetRoll = reduceMotion ? 0 : Math.max(-MAX_ROLL, Math.min(MAX_ROLL, dx * 0.9));
			roll += (targetRoll - roll) * 0.3;
			if (element) {
				element.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${roll}deg)`;
			}
			frame = requestAnimationFrame(render);
		};

		const move = (event: PointerEvent) => {
			if (event.pointerType !== 'mouse') {
				visible = false;
				return;
			}
			targetX = event.clientX;
			targetY = event.clientY;
			if (!visible) {
				x = targetX;
				y = targetY;
				visible = true;
			}
		};
		const hide = () => (visible = false);
		const down = () => (pressed = true);
		const up = () => (pressed = false);

		window.addEventListener('pointermove', move, { passive: true });
		window.addEventListener('pointerdown', down, { passive: true });
		window.addEventListener('pointerup', up, { passive: true });
		document.documentElement.addEventListener('pointerleave', hide);
		window.addEventListener('blur', hide);
		frame = requestAnimationFrame(render);

		return () => {
			cancelAnimationFrame(frame);
			window.removeEventListener('pointermove', move);
			window.removeEventListener('pointerdown', down);
			window.removeEventListener('pointerup', up);
			document.documentElement.removeEventListener('pointerleave', hide);
			window.removeEventListener('blur', hide);
		};
	});
</script>

<div class="pointer" class:visible class:pressed bind:this={element} aria-hidden="true">
	<svg viewBox="0 0 64 72" width="54" height="61">
		<g class="outline">
			<rect x="15" y="2" width="13" height="38" rx="6.5" />
			<rect x="26" y="20" width="11" height="22" rx="5.5" />
			<rect x="35" y="23" width="10.5" height="21" rx="5.25" />
			<rect x="43.5" y="27" width="9.5" height="19" rx="4.75" />
			<rect x="3" y="33" width="14" height="24" rx="7" transform="rotate(-32 10 45)" />
			<path d="M13 34h40v14c0 11-8.5 20-20 20h-2c-10 0-18-8-18-18z" />
		</g>
		<g class="fill">
			<rect x="15" y="2" width="13" height="38" rx="6.5" />
			<rect x="26" y="20" width="11" height="22" rx="5.5" />
			<rect x="35" y="23" width="10.5" height="21" rx="5.25" />
			<rect x="43.5" y="27" width="9.5" height="19" rx="4.75" />
			<rect x="3" y="33" width="14" height="24" rx="7" transform="rotate(-32 10 45)" />
			<path d="M13 34h40v14c0 11-8.5 20-20 20h-2c-10 0-18-8-18-18z" />
		</g>
		<g class="creases">
			<path d="M31 36v6M40 38v6M48 40v5" />
		</g>
		<text x="33" y="61" text-anchor="middle">1</text>
	</svg>
</div>

<style>
	.pointer {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 1000;
		pointer-events: none;
		opacity: 0;
		/* Put the fingertip on the hotspot. */
		margin: -3px 0 0 -21px;
		transform-origin: 21px 3px;
		will-change: transform;
		filter: drop-shadow(3px 5px 3px rgb(0 0 0 / 0.3));
		transition: opacity 120ms ease;
	}

	.visible {
		opacity: 1;
	}

	svg {
		display: block;
		transition: scale 120ms var(--ease-out);
		transform-origin: 21px 3px;
	}

	.pressed svg {
		scale: 0.9;
	}

	.outline {
		fill: #16181c;
		stroke: #16181c;
		stroke-width: 6;
		stroke-linejoin: round;
	}

	.fill {
		fill: #ffffff;
	}

	.creases {
		fill: none;
		stroke: #c9ccd2;
		stroke-width: 1.6;
		stroke-linecap: round;
	}

	text {
		fill: var(--blue-strong);
		font-family: var(--font-ui);
		font-size: 13px;
		font-weight: 900;
	}
</style>
