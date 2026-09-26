import type { Messages } from './en';

export const zh: Messages = {
	appName: 'Pomodorii',
	boot: {
		title: '警告 - 专注与安全',
		body: '开始专注之前，请选好一项任务，将手机静音，并在手边准备一杯水。',
		note: '休息也是工作的一部分。站起来，伸展一下，让眼睛休息。',
		prompt: '点击或按 Ⓐ 继续。',
		promptTouch: '轻触以继续。'
	},
	channels: {
		focus: '专注频道',
		tasks: '任务频道',
		radio: '电台频道',
		settings: 'Pomodorii 设置',
		board: '留言板'
	},
	menu: {
		label: 'Pomodorii 菜单',
		settings: 'Pomodorii 设置',
		board: '留言板',
		mute: '静音',
		unmute: '打开声音',
		back: '菜单',
		start: '开始',
		unread: { other: '{count} 条新消息' }
	},
	homeMenu: {
		title: 'HOME 菜单',
		close: '关闭',
		menu: 'Pomodorii 菜单',
		reset: '重置计时器',
		today: '今天',
		sessions: { other: '{count} 次' },
		effects: '音效',
		music: '音乐'
	},
	modes: {
		focus: '专注',
		short: '短休息',
		long: '长休息'
	},
	focus: {
		ready: '准备就绪',
		running: '专注中',
		runningBreak: '休息中',
		paused: '已暂停',
		start: '开始',
		pause: '暂停',
		resume: '继续',
		reset: '重置',
		skip: '跳过',
		nowWorkingOn: '正在进行',
		noTask: '还没有选择任务。去任务频道添加一个吧。',
		untilLongBreak: '距离长休息还有',
		complete: {
			focus: '专注完成！',
			short: '休息结束！',
			long: '长休息结束！'
		},
		completeHint: {
			focus: '该休息一下了，这是你应得的。',
			short: '准备好再来一轮了吗？',
			long: '电量已充满，继续加油。'
		}
	},
	tasks: {
		placeholder: '添加新任务...',
		add: '添加',
		empty: '这里还是空的。你打算做什么？',
		remaining: { other: '还剩 {count} 项' },
		allDone: '全部完成！',
		clearCompleted: '清除已完成',
		toggle: '将“{title}”标记为已完成',
		untoggle: '将“{title}”标记为未完成',
		remove: '删除“{title}”',
		reorder: '拖动以调整“{title}”的顺序',
		first: '下一项'
	},
	radio: {
		stations: '电台',
		nowPlaying: '正在播放',
		play: '播放',
		pause: '暂停',
		volume: '音量',
		builtIn: 'Pomodorii 内置',
		openOnYoutube: '在 YouTube 上打开',
		loadError: '无法在这里加载此视频，请在 YouTube 上打开。',
		idle: '未播出',
		onAir: '播出中'
	},
	settings: {
		title: 'Pomodorii 设置',
		page: '{page} / {total}',
		previous: '上一页',
		next: '下一页',
		on: '开',
		off: '关',
		minutes: '{value} 分钟',
		decrease: '减少{label}',
		increase: '增加{label}',
		sections: {
			timer: '计时器',
			flow: '节奏',
			sound: '声音',
			theme: '主题',
			language: '语言',
			access: '辅助功能',
			about: '关于',
			erase: '清除数据'
		},
		focusLength: '专注',
		shortLength: '短休息',
		longLength: '长休息',
		longBreakInterval: '长休息间隔',
		sessionsUnit: '每 {value} 次',
		autoStartBreaks: '自动开始休息',
		autoStartFocus: '自动开始专注',
		autoCheckTasks: '专注结束时勾选任务',
		completedToBottom: '已完成的任务移到底部',
		effectsVolume: '音效',
		musicVolume: '音乐',
		theme: '主题',
		themes: { light: '浅色', dark: '夜间', system: '自动' },
		language: '语言',
		pointer: '手形指针',
		reduceMotion: '减少动态效果',
		credit: '设计与开发：Charles J. (CJ) Dyas',
		version: '版本 {version}',
		source: '源代码',
		reset: '清除所有数据',
		resetConfirm: '要清除任务、记录和设置吗？此操作无法撤销。',
		resetYes: '清除',
		resetNo: '保留'
	},
	board: {
		title: '留言板',
		empty: '还没有消息。完成一次专注后，消息会出现在这里。',
		today: '今天',
		yesterday: '昨天',
		summary: { other: '专注 {count} 次 · {minutes} 分钟' },
		focusLetter: '专注了 {minutes} 分钟',
		breakLetter: '休息了 {minutes} 分钟',
		onTask: '任务：“{task}”',
		week: '本周'
	}
};
