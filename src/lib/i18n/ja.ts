import type { Messages } from './en';

export const ja: Messages = {
	appName: 'ポモドーリ',
	boot: {
		title: '警告 - 集中と安全のために',
		body: '集中する前に、タスクをひとつ選び、スマートフォンの通知を切り、水を一杯用意してください。',
		note: '休憩も仕事のうちです。立ち上がって、体を伸ばし、目を休めましょう。',
		prompt: 'クリックするか Ⓐ を押してください。',
		promptTouch: 'タップして続ける'
	},
	channels: {
		focus: '集中チャンネル',
		tasks: 'タスクチャンネル',
		radio: 'ラジオチャンネル',
		settings: 'ポモドーリ本体設定',
		board: '伝言板'
	},
	menu: {
		label: 'ポモドーリメニュー',
		settings: 'ポモドーリ本体設定',
		board: '伝言板',
		mute: '音を消す',
		unmute: '音を出す',
		back: 'メニュー',
		start: 'はじめる',
		unread: { other: '新着 {count} 件' }
	},
	homeMenu: {
		title: 'HOMEメニュー',
		close: 'とじる',
		menu: 'ポモドーリメニュー',
		reset: 'タイマーをリセット',
		today: '今日',
		sessions: { other: '{count} セッション' },
		effects: '効果音',
		music: '音楽'
	},
	modes: {
		focus: '集中',
		short: '小休憩',
		long: '長休憩'
	},
	focus: {
		ready: '準備OK',
		running: '集中中',
		runningBreak: '休憩中',
		paused: '一時停止',
		start: 'スタート',
		pause: '一時停止',
		resume: '再開',
		reset: 'リセット',
		skip: 'スキップ',
		nowWorkingOn: 'いま取り組んでいること',
		noTask: 'タスクが選ばれていません。タスクチャンネルで追加しましょう。',
		untilLongBreak: '長休憩までのセッション',
		complete: {
			focus: 'セッション完了！',
			short: '休憩おわり！',
			long: '長休憩おわり！'
		},
		completeHint: {
			focus: 'おつかれさま。ひと休みしましょう。',
			short: 'もうひと頑張りしますか？',
			long: '充電完了。さあ、再開しましょう。'
		}
	},
	tasks: {
		placeholder: '新しいタスクを追加...',
		add: '追加',
		empty: 'まだ何もありません。何に取り組みますか？',
		remaining: { other: '残り {count} 件' },
		allDone: 'ぜんぶ完了！',
		clearCompleted: '完了したものを消す',
		toggle: '「{title}」を完了にする',
		untoggle: '「{title}」を未完了に戻す',
		remove: '「{title}」を削除',
		reorder: '「{title}」をドラッグして並べ替え',
		first: '次はこれ'
	},
	radio: {
		stations: '放送局',
		nowPlaying: '再生中',
		play: '再生',
		pause: '一時停止',
		volume: '音量',
		builtIn: 'ポモドーリ内蔵',
		openOnYoutube: 'YouTubeで開く',
		loadError: 'この動画はここでは再生できません。YouTubeで開いてください。',
		idle: '放送休止中',
		onAir: '放送中'
	},
	settings: {
		title: 'ポモドーリ本体設定',
		page: '{page} / {total}',
		previous: '前のページ',
		next: '次のページ',
		on: 'する',
		off: 'しない',
		minutes: '{value} 分',
		decrease: '{label}を減らす',
		increase: '{label}を増やす',
		sections: {
			timer: 'タイマー',
			flow: '流れ',
			sound: 'サウンド',
			theme: 'テーマ',
			language: '言語',
			access: 'アクセシビリティ',
			about: 'このソフトについて',
			erase: 'データの消去'
		},
		focusLength: '集中',
		shortLength: '小休憩',
		longLength: '長休憩',
		longBreakInterval: '長休憩の間隔',
		sessionsUnit: '{value} セッションごと',
		autoStartBreaks: '休憩を自動で始める',
		autoStartFocus: '集中を自動で始める',
		autoCheckTasks: '集中が終わったらタスクを完了にする',
		completedToBottom: '完了したタスクを下へ移動',
		effectsVolume: '効果音',
		musicVolume: '音楽',
		theme: 'テーマ',
		themes: { light: 'ライト', dark: 'ナイト', system: '自動' },
		language: '言語',
		pointer: '手のポインター',
		reduceMotion: '動きを減らす',
		credit: 'デザイン・開発: Charles J. (CJ) Dyas',
		version: 'バージョン {version}',
		source: 'ソースコード',
		reset: 'すべてのデータを消去',
		resetConfirm: 'タスク、記録、設定をすべて消去しますか？元に戻すことはできません。',
		resetYes: '消去する',
		resetNo: 'やめる'
	},
	board: {
		title: '伝言板',
		empty: 'まだメッセージはありません。セッションを終えるとここに届きます。',
		today: '今日',
		yesterday: '昨日',
		summary: { other: '集中 {count} 回 · {minutes} 分' },
		focusLetter: '{minutes} 分集中しました',
		breakLetter: '{minutes} 分休憩しました',
		onTask: '「{task}」',
		week: '今週'
	}
};
