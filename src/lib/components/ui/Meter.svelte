<!-- A volume level drawn as lit blocks, after the Wii's volume display. -->
<script lang="ts">
	import Arrow from '$lib/components/ui/Arrow.svelte';
	import { format } from '$lib/i18n';
	import { getPomodorii } from '$lib/console/pomodorii.svelte';

	type Props = { label: string; value: number; onchange: (value: number) => void };

	let { label, value, onchange }: Props = $props();

	const app = getPomodorii();
	const STEPS = 10;

	const level = $derived(Math.round(value / (100 / STEPS)));
	const set = (next: number) => onchange(Math.max(0, Math.min(STEPS, next)) * (100 / STEPS));
</script>

<div class="meter" role="group" aria-label={label}>
	<Arrow
		direction="left"
		label={format(app.t.settings.decrease, { label })}
		disabled={level <= 0}
		data-sfx="toggle"
		onclick={() => set(level - 1)}
	/>
	<div
		class="blocks"
		role="meter"
		aria-valuemin={0}
		aria-valuemax={100}
		aria-valuenow={value}
		aria-label={label}
	>
		{#each { length: STEPS }, index (index)}
			<button
				class="block"
				class:lit={index < level}
				type="button"
				tabindex="-1"
				aria-hidden="true"
				data-sfx="toggle"
				style:--height="{40 + index * 6}%"
				onclick={() => set(index + 1 === level ? index : index + 1)}
			></button>
		{/each}
	</div>
	<Arrow
		direction="right"
		label={format(app.t.settings.increase, { label })}
		disabled={level >= STEPS}
		data-sfx="toggle"
		onclick={() => set(level + 1)}
	/>
</div>

<style>
	.meter {
		display: inline-flex;
		align-items: center;
		gap: 10px;
	}

	.blocks {
		display: flex;
		align-items: flex-end;
		gap: 4px;
		height: 2.4rem;
		padding: 0 4px;
	}

	.block {
		width: 12px;
		height: var(--height);
		border-radius: 4px;
		background: var(--surface-sunk);
		box-shadow: inset 0 1px 2px rgb(0 0 0 / 0.18);
		transition: background 120ms ease;
	}

	.block.lit {
		background: linear-gradient(180deg, #8fe3ff, var(--blue-strong));
		box-shadow: 0 0 6px var(--blue-glow);
	}
</style>
