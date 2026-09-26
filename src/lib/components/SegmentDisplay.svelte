<!--
	Seven-segment digits with rounded, gapped segments, after the Wii Menu clock.
	`outline` draws the hollow menu-clock style; `ghost` shows unlit segments
	faintly, like an LCD.
-->
<script lang="ts" module>
	const W = 36;
	const H = 64;
	const T = 7;
	const GAP = 1.6;
	const DIGIT_ADVANCE = W + 10;
	const COLON_ADVANCE = 16;

	type Segment = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g';

	const horizontal = (x1: number, x2: number, y: number) =>
		`M${x1} ${y}L${x1 + T / 2} ${y - T / 2}H${x2 - T / 2}L${x2} ${y}L${x2 - T / 2} ${y + T / 2}H${x1 + T / 2}Z`;

	const vertical = (x: number, y1: number, y2: number) =>
		`M${x} ${y1}L${x + T / 2} ${y1 + T / 2}V${y2 - T / 2}L${x} ${y2}L${x - T / 2} ${y2 - T / 2}V${y1 + T / 2}Z`;

	const SEGMENTS: Record<Segment, string> = {
		a: horizontal(T / 2 + GAP, W - T / 2 - GAP, T / 2),
		g: horizontal(T / 2 + GAP, W - T / 2 - GAP, H / 2),
		d: horizontal(T / 2 + GAP, W - T / 2 - GAP, H - T / 2),
		f: vertical(T / 2, T / 2 + GAP, H / 2 - GAP),
		b: vertical(W - T / 2, T / 2 + GAP, H / 2 - GAP),
		e: vertical(T / 2, H / 2 + GAP, H - T / 2 - GAP),
		c: vertical(W - T / 2, H / 2 + GAP, H - T / 2 - GAP)
	};

	const ALL = Object.keys(SEGMENTS) as Segment[];

	const DIGITS: Record<string, readonly Segment[]> = {
		'0': ['a', 'b', 'c', 'd', 'e', 'f'],
		'1': ['b', 'c'],
		'2': ['a', 'b', 'g', 'e', 'd'],
		'3': ['a', 'b', 'g', 'c', 'd'],
		'4': ['f', 'g', 'b', 'c'],
		'5': ['a', 'f', 'g', 'c', 'd'],
		'6': ['a', 'f', 'g', 'e', 'd', 'c'],
		'7': ['a', 'b', 'c'],
		'8': ALL,
		'9': ['a', 'b', 'c', 'd', 'f', 'g']
	};
</script>

<script lang="ts">
	type Props = {
		value: string;
		label?: string;
		outline?: boolean;
		ghost?: boolean;
		blinkColon?: boolean;
		class?: string;
	};

	let {
		value,
		label = value,
		outline = false,
		ghost = false,
		blinkColon = false,
		class: className = ''
	}: Props = $props();

	const glyphs = $derived.by(() => {
		let x = 0;
		return [...value].map((char) => {
			const glyph = { char, x };
			x += char === ':' ? COLON_ADVANCE : DIGIT_ADVANCE;
			return glyph;
		});
	});

	const width = $derived(
		glyphs.reduce((sum, { char }) => sum + (char === ':' ? COLON_ADVANCE : DIGIT_ADVANCE), 0) - 10
	);
</script>

<svg
	class="segments {className}"
	class:outline
	viewBox="-2 -2 {width + 4} {H + 4}"
	role="img"
	aria-label={label}
>
	{#each glyphs as { char, x }, index (index)}
		<g transform="translate({x} 0)">
			{#if char === ':'}
				<g class="colon" class:blink={blinkColon}>
					<rect x="0.5" y={H * 0.28} width={T} height={T} rx="2" />
					<rect x="0.5" y={H * 0.64} width={T} height={T} rx="2" />
				</g>
			{:else}
				{#if ghost}
					{#each ALL as segment (segment)}
						<path class="unlit" d={SEGMENTS[segment]} />
					{/each}
				{/if}
				{#each DIGITS[char] ?? [] as segment (segment)}
					<path d={SEGMENTS[segment]} />
				{/each}
			{/if}
		</g>
	{/each}
</svg>

<style>
	.segments {
		display: block;
		height: 1em;
		width: auto;
		overflow: visible;
		fill: currentColor;
		stroke: currentColor;
		stroke-width: 1.4;
		stroke-linejoin: round;
	}

	.outline {
		fill: none;
		stroke-width: 2.6;
	}

	.unlit {
		opacity: 0.07;
	}

	.blink {
		animation: blink 1s steps(1, end) infinite;
	}

	@keyframes blink {
		50% {
			opacity: 0;
		}
	}
</style>
