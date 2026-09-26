<script lang="ts">
	type Props = { active: boolean; bars?: number };

	let { active, bars = 5 }: Props = $props();
</script>

<span class="equalizer" class:active aria-hidden="true">
	{#each { length: bars }, index (index)}
		<span
			style:animation-delay="{index * -0.23}s"
			style:animation-duration="{0.7 + (index % 3) * 0.18}s"
		></span>
	{/each}
</span>

<style>
	.equalizer {
		display: flex;
		align-items: flex-end;
		justify-content: center;
		gap: 12%;
	}

	span span {
		flex: 1;
		height: 22%;
		border-radius: 999px;
		background: currentColor;
		transition: height 300ms ease;
	}

	.active span {
		animation: bounce ease-in-out infinite alternate;
	}

	@keyframes bounce {
		0% {
			height: 18%;
		}
		40% {
			height: 90%;
		}
		70% {
			height: 45%;
		}
		100% {
			height: 70%;
		}
	}
</style>
