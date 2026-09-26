import type { SoundName } from '$lib/audio/engine';

const INTERACTIVE =
	'button, a[href], [role="button"], [role="tab"], input[type="range"], [data-sfx]';

const findInteractive = (target: EventTarget | null) => {
	if (!(target instanceof Element)) return null;
	const element = target.closest<HTMLElement>(INTERACTIVE);
	if (!element || element.matches(':disabled, [aria-disabled="true"]')) return null;
	return element;
};

/**
 * Gives every control in the console the Wii's audio feedback without
 * wiring each one by hand: a tick when the pointer or keyboard focus lands on
 * a control, and a confirm sound on click. A control can opt into another
 * sound with `data-sfx="back" | "toggle" | ...` or out with `data-sfx="none"`.
 */
export const attachUiSounds = (
	root: HTMLElement,
	play: (sound: SoundName, options?: { rate?: number; gain?: number }) => void
) => {
	let hovered: HTMLElement | null = null;

	const tick = (element: HTMLElement) => {
		if (element.dataset.sfxHover === 'none') return;
		// A little pitch jitter keeps a long session of hovering from grating.
		play('hover', { rate: 0.97 + Math.random() * 0.06, gain: 0.45 });
	};

	const onPointerOver = (event: PointerEvent) => {
		if (event.pointerType !== 'mouse') return;
		const element = findInteractive(event.target);
		if (element === hovered) return;
		hovered = element;
		if (element) tick(element);
	};

	const onFocusIn = (event: FocusEvent) => {
		const element = findInteractive(event.target);
		if (element && element !== hovered && element.matches(':focus-visible')) {
			hovered = element;
			tick(element);
		}
	};

	const onClick = (event: MouseEvent) => {
		const element = findInteractive(event.target);
		if (!element || element instanceof HTMLInputElement) return;
		const sound = element.dataset.sfx ?? 'select';
		if (sound !== 'none') play(sound as SoundName);
	};

	root.addEventListener('pointerover', onPointerOver);
	root.addEventListener('focusin', onFocusIn);
	root.addEventListener('click', onClick);

	return () => {
		root.removeEventListener('pointerover', onPointerOver);
		root.removeEventListener('focusin', onFocusIn);
		root.removeEventListener('click', onClick);
	};
};
