<!-- A value with the Wii's blue arrow buttons on either side. -->
<script lang="ts">
	import Arrow from '$lib/components/ui/Arrow.svelte';
	import { format } from '$lib/i18n';
	import { getPomodorii } from '$lib/console/pomodorii.svelte';

	type Props = {
		label: string;
		value: number;
		min: number;
		max: number;
		step?: number;
		display: (value: number) => string;
		onchange: (value: number) => void;
	};

	let { label, value, min, max, step = 1, display, onchange }: Props = $props();

	const app = getPomodorii();
</script>

<div class="stepper" role="group" aria-label={label}>
	<Arrow
		direction="left"
		label={format(app.t.settings.decrease, { label })}
		disabled={value <= min}
		data-sfx="toggle"
		onclick={() => onchange(Math.max(min, value - step))}
	/>
	<output class="value" aria-live="polite">{display(value)}</output>
	<Arrow
		direction="right"
		label={format(app.t.settings.increase, { label })}
		disabled={value >= max}
		data-sfx="toggle"
		onclick={() => onchange(Math.min(max, value + step))}
	/>
</div>

<style>
	.stepper {
		display: inline-flex;
		align-items: center;
		gap: 10px;
	}

	.value {
		min-width: 6.5em;
		padding: 0.5em 0.9em;
		border-radius: 12px;
		background: var(--surface-sunk);
		box-shadow: inset 0 2px 4px rgb(0 0 0 / 0.12);
		color: var(--text-strong);
		font-weight: 800;
		font-variant-numeric: tabular-nums;
		text-align: center;
	}
</style>
