<script lang="ts">
	import '../app.css';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';
	import { dev } from '$app/environment';

	let { children } = $props();

	injectAnalytics({ mode: dev ? 'development' : 'production' });
</script>

{@render children()}
