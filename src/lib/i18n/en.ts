export const en = {
	appName: 'Pomodorii',
	boot: {
		title: 'WARNING - FOCUS AND SAFETY',
		body: 'BEFORE FOCUSING, CHOOSE ONE TASK, SILENCE YOUR PHONE AND KEEP A GLASS OF WATER NEARBY.',
		note: 'Breaks are part of the work. Stand up, stretch and rest your eyes.',
		prompt: 'Click or press Ⓐ to continue.',
		promptTouch: 'Tap to continue.'
	},
	channels: {
		focus: 'Focus Channel',
		tasks: 'Tasks Channel',
		radio: 'Radio Channel',
		settings: 'Pomodorii Settings',
		board: 'Message Board'
	},
	menu: {
		label: 'Pomodorii Menu',
		settings: 'Pomodorii Settings',
		board: 'Message Board',
		mute: 'Mute sound',
		unmute: 'Turn sound on',
		back: 'Menu',
		start: 'Start',
		unread: { one: '1 new message', other: '{count} new messages' }
	},
	homeMenu: {
		title: 'HOME Menu',
		close: 'Close',
		menu: 'Pomodorii Menu',
		reset: 'Reset Timer',
		today: 'Today',
		sessions: { one: '1 session', other: '{count} sessions' },
		effects: 'Effects',
		music: 'Music'
	},
	modes: {
		focus: 'Focus',
		short: 'Short Break',
		long: 'Long Break'
	},
	focus: {
		ready: 'Ready',
		running: 'Focusing',
		runningBreak: 'On a break',
		paused: 'Paused',
		start: 'Start',
		pause: 'Pause',
		resume: 'Resume',
		reset: 'Reset',
		skip: 'Skip',
		nowWorkingOn: 'Now working on',
		noTask: 'No task picked. Add one in the Tasks Channel.',
		untilLongBreak: 'Sessions until a long break',
		complete: {
			focus: 'Session complete!',
			short: 'Break is over!',
			long: 'Long break is over!'
		},
		completeHint: {
			focus: 'Time for a break. You earned it.',
			short: 'Ready for another round?',
			long: 'Fully recharged. Back to it.'
		}
	},
	tasks: {
		placeholder: 'Add a new task...',
		add: 'Add',
		empty: 'Nothing here yet. What are you working on?',
		remaining: { other: '{count} to go' },
		allDone: 'All done!',
		clearCompleted: 'Clear finished',
		toggle: 'Mark "{title}" as done',
		untoggle: 'Mark "{title}" as not done',
		remove: 'Remove "{title}"',
		reorder: 'Drag to reorder "{title}"',
		first: 'Up next'
	},
	radio: {
		stations: 'Stations',
		nowPlaying: 'Now Playing',
		play: 'Play',
		pause: 'Pause',
		volume: 'Volume',
		builtIn: 'Built into Pomodorii',
		openOnYoutube: 'Open on YouTube',
		loadError: 'This video could not be loaded here. Open it on YouTube instead.',
		idle: 'Off air',
		onAir: 'On air'
	},
	settings: {
		title: 'Pomodorii Settings',
		page: '{page} / {total}',
		previous: 'Previous page',
		next: 'Next page',
		on: 'On',
		off: 'Off',
		minutes: '{value} min',
		decrease: 'Decrease {label}',
		increase: 'Increase {label}',
		sections: {
			timer: 'Timer',
			flow: 'Flow',
			sound: 'Sound',
			theme: 'Theme',
			language: 'Language',
			access: 'Accessibility',
			about: 'About',
			erase: 'Erase Data'
		},
		focusLength: 'Focus',
		shortLength: 'Short Break',
		longLength: 'Long Break',
		longBreakInterval: 'Long break every',
		sessionsUnit: '{value} sessions',
		autoStartBreaks: 'Start breaks automatically',
		autoStartFocus: 'Start focus automatically',
		autoCheckTasks: 'Check off tasks when focus ends',
		completedToBottom: 'Move finished tasks down',
		effectsVolume: 'Sound effects',
		musicVolume: 'Music',
		theme: 'Theme',
		themes: { light: 'Light', dark: 'Night', system: 'Auto' },
		language: 'Language',
		pointer: 'Hand pointer',
		reduceMotion: 'Reduce motion',
		credit: 'Designed and developed by Charles J. (CJ) Dyas',
		version: 'Version {version}',
		source: 'Source code',
		reset: 'Erase all data',
		resetConfirm: 'Erase tasks, history and settings? This cannot be undone.',
		resetYes: 'Erase',
		resetNo: 'Keep'
	},
	board: {
		title: 'Message Board',
		empty: 'No messages yet. Finish a session and it will be posted here.',
		today: 'Today',
		yesterday: 'Yesterday',
		summary: {
			one: '1 focus session · {minutes} min',
			other: '{count} focus sessions · {minutes} min'
		},
		focusLetter: 'Focused for {minutes} min',
		breakLetter: 'Took a {minutes} min break',
		onTask: 'on "{task}"',
		week: 'This week'
	}
};

type Widen<T> = {
	[K in keyof T]: T[K] extends string
		? string
		: T[K] extends { other: string }
			? { one?: string; other: string }
			: Widen<T[K]>;
};

export type Messages = Widen<typeof en>;
