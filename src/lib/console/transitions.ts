import { cubicInOut, cubicOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';

export type ZoomOrigin = { top: number; left: number; width: number; height: number };

export const rectOf = (element: Element): ZoomOrigin => {
	const { top, left, width, height } = element.getBoundingClientRect();
	return { top, left, width, height };
};

/**
 * The Wii's channel zoom: a full-screen layer grows out of the tile that was
 * picked. The clip opens from the tile's rectangle while the content scales
 * up around the tile's center, so it reads as one continuous zoom.
 */
export const zoom = (
	node: HTMLElement,
	{
		origin,
		duration = 520,
		radius = 18
	}: { origin: ZoomOrigin; duration?: number; radius?: number }
): TransitionConfig => {
	const { innerWidth: vw, innerHeight: vh } = window;
	const top = origin.top;
	const left = origin.left;
	const right = vw - origin.left - origin.width;
	const bottom = vh - origin.top - origin.height;
	const scale = Math.max(origin.width / vw, origin.height / vh);

	node.style.setProperty('--zoom-x', `${origin.left + origin.width / 2}px`);
	node.style.setProperty('--zoom-y', `${origin.top + origin.height / 2}px`);

	return {
		duration,
		easing: cubicInOut,
		css: (t, u) =>
			`clip-path: inset(${top * u}px ${right * u}px ${bottom * u}px ${left * u}px round ${radius * u}px);` +
			`--zoom: ${scale + (1 - scale) * t};`
	};
};

/** Rises from below with a soft settle, for panels and bars. */
export const rise = (
	_node: HTMLElement,
	{
		delay = 0,
		duration = 380,
		distance = 100
	}: { delay?: number; duration?: number; distance?: number } = {}
): TransitionConfig => ({
	delay,
	duration,
	easing: cubicOut,
	css: (t, u) => `transform: translateY(${u * distance}%); opacity: ${Math.min(1, t * 2)};`
});

/** Drops in from above, for the HOME Menu's top bar. */
export const drop = (
	_node: HTMLElement,
	{ delay = 0, duration = 300 }: { delay?: number; duration?: number } = {}
): TransitionConfig => ({
	delay,
	duration,
	easing: cubicOut,
	css: (_t, u) => `transform: translateY(${-u * 100}%);`
});

/** Pops in with a little overshoot, for tiles and buttons. */
export const pop = (
	_node: HTMLElement,
	{
		delay = 0,
		duration = 420,
		from = 0.86
	}: { delay?: number; duration?: number; from?: number } = {}
): TransitionConfig => ({
	delay,
	duration,
	easing: (t) => {
		// easeOutBack with a gentle overshoot.
		const c = 1.4;
		return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
	},
	css: (t) => `transform: scale(${from + (1 - from) * t}); opacity: ${Math.min(1, t * 1.6)};`
});
