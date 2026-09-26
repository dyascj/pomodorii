import { defineConfig } from 'vitest/config';
import adapter from '@sveltejs/adapter-vercel';
import { sveltekit } from '@sveltejs/kit/vite';
import pkg from './package.json' with { type: 'json' };

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter(),
			version: { name: pkg.version }
		})
	],
	test: {
		expect: { requireAssertions: true },
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
