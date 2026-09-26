import type { ChannelId } from './pomodorii.svelte';

export const MENU_CHANNELS = [
	'focus',
	'tasks',
	'radio',
	'settings'
] as const satisfies readonly ChannelId[];

export type MenuChannelId = (typeof MENU_CHANNELS)[number];

/** Each channel's signature color, used for its banner and chrome. */
export const CHANNEL_ACCENTS: Record<ChannelId, string> = {
	focus: 'var(--focus)',
	tasks: 'var(--tasks)',
	radio: 'var(--radio)',
	settings: 'var(--settings)',
	board: 'var(--board)'
};
