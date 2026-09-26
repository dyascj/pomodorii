<!-- A row of pills where exactly one is picked, like the Wii's On / Off pairs. -->
<script lang="ts" generics="T extends string | boolean">
	type Props = {
		label: string;
		value: T;
		options: readonly { value: T; label: string }[];
		onchange: (value: T) => void;
	};

	let { label, value, options, onchange }: Props = $props();
</script>

<div class="choice" role="radiogroup" aria-label={label}>
	{#each options as option (option.value)}
		<button
			class="pill"
			class:primary={option.value === value}
			type="button"
			role="radio"
			aria-checked={option.value === value}
			data-sfx="toggle"
			onclick={() => onchange(option.value)}
		>
			{option.label}
		</button>
	{/each}
</div>

<style>
	.choice {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}

	.pill {
		min-width: 6.5rem;
	}
</style>
