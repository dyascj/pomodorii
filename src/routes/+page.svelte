<script lang="ts">
	import Console from '$lib/components/Console.svelte';

	const title = 'Pomodorii';
	const description =
		'A pomodoro timer that plays like a Wii channel. Boot it up, pick a channel, and focus to the sound of the console.';
	const url = 'https://www.pomodorii.com';
	const image = `${url}/og.png`;
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={url} />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={title} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={url} />
	<meta property="og:image" content={image} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta
		property="og:image:alt"
		content="The Pomodorii menu, a grid of channels in the style of the Wii."
	/>
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={image} />
</svelte:head>

<Console />
