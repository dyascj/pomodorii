import type { Messages } from './en';

export const es: Messages = {
	appName: 'Pomodorii',
	boot: {
		title: 'ADVERTENCIA - CONCENTRACIÓN Y SEGURIDAD',
		body: 'ANTES DE CONCENTRARTE, ELIGE UNA TAREA, SILENCIA TU TELÉFONO Y TEN UN VASO DE AGUA A MANO.',
		note: 'Los descansos también son parte del trabajo. Levántate, estírate y descansa la vista.',
		prompt: 'Haz clic o pulsa Ⓐ para continuar.',
		promptTouch: 'Toca para continuar.'
	},
	channels: {
		focus: 'Canal Enfoque',
		tasks: 'Canal Tareas',
		radio: 'Canal Radio',
		settings: 'Configuración de Pomodorii',
		board: 'Tablón de mensajes'
	},
	menu: {
		label: 'Menú de Pomodorii',
		settings: 'Configuración de Pomodorii',
		board: 'Tablón de mensajes',
		mute: 'Silenciar',
		unmute: 'Activar sonido',
		back: 'Menú',
		start: 'Comenzar',
		unread: { one: '1 mensaje nuevo', other: '{count} mensajes nuevos' }
	},
	homeMenu: {
		title: 'Menú HOME',
		close: 'Cerrar',
		menu: 'Menú de Pomodorii',
		reset: 'Reiniciar temporizador',
		today: 'Hoy',
		sessions: { one: '1 sesión', other: '{count} sesiones' },
		effects: 'Efectos',
		music: 'Música'
	},
	modes: {
		focus: 'Enfoque',
		short: 'Descanso corto',
		long: 'Descanso largo'
	},
	focus: {
		ready: 'Listo',
		running: 'Concentrado',
		runningBreak: 'En descanso',
		paused: 'En pausa',
		start: 'Iniciar',
		pause: 'Pausar',
		resume: 'Reanudar',
		reset: 'Reiniciar',
		skip: 'Saltar',
		nowWorkingOn: 'Trabajando en',
		noTask: 'No has elegido ninguna tarea. Añade una en el Canal Tareas.',
		untilLongBreak: 'Sesiones hasta el descanso largo',
		complete: {
			focus: '¡Sesión completada!',
			short: '¡Se acabó el descanso!',
			long: '¡Se acabó el descanso largo!'
		},
		completeHint: {
			focus: 'Hora de descansar. Te lo has ganado.',
			short: '¿Listo para otra ronda?',
			long: 'Energía recargada. A seguir.'
		}
	},
	tasks: {
		placeholder: 'Añade una tarea...',
		add: 'Añadir',
		empty: 'Todavía no hay nada. ¿En qué vas a trabajar?',
		remaining: { one: 'Queda 1', other: 'Quedan {count}' },
		allDone: '¡Todo listo!',
		clearCompleted: 'Borrar terminadas',
		toggle: 'Marcar "{title}" como hecha',
		untoggle: 'Marcar "{title}" como pendiente',
		remove: 'Eliminar "{title}"',
		reorder: 'Arrastra para mover "{title}"',
		first: 'Siguiente'
	},
	radio: {
		stations: 'Emisoras',
		nowPlaying: 'Sonando ahora',
		play: 'Reproducir',
		pause: 'Pausar',
		volume: 'Volumen',
		builtIn: 'Incluida en Pomodorii',
		openOnYoutube: 'Abrir en YouTube',
		loadError: 'Este video no se puede cargar aquí. Ábrelo en YouTube.',
		idle: 'Fuera del aire',
		onAir: 'Al aire'
	},
	settings: {
		title: 'Configuración de Pomodorii',
		page: '{page} / {total}',
		previous: 'Página anterior',
		next: 'Página siguiente',
		on: 'Sí',
		off: 'No',
		minutes: '{value} min',
		decrease: 'Reducir {label}',
		increase: 'Aumentar {label}',
		sections: {
			timer: 'Temporizador',
			flow: 'Ritmo',
			sound: 'Sonido',
			theme: 'Tema',
			language: 'Idioma',
			access: 'Accesibilidad',
			about: 'Acerca de',
			erase: 'Borrar datos'
		},
		focusLength: 'Enfoque',
		shortLength: 'Descanso corto',
		longLength: 'Descanso largo',
		longBreakInterval: 'Descanso largo cada',
		sessionsUnit: '{value} sesiones',
		autoStartBreaks: 'Iniciar descansos automáticamente',
		autoStartFocus: 'Iniciar enfoque automáticamente',
		autoCheckTasks: 'Completar tareas al terminar el enfoque',
		completedToBottom: 'Mover tareas terminadas abajo',
		effectsVolume: 'Efectos de sonido',
		musicVolume: 'Música',
		theme: 'Tema',
		themes: { light: 'Claro', dark: 'Noche', system: 'Automático' },
		language: 'Idioma',
		pointer: 'Puntero de mano',
		reduceMotion: 'Reducir movimiento',
		credit: 'Diseñado y desarrollado por Charles J. (CJ) Dyas',
		version: 'Versión {version}',
		source: 'Código fuente',
		reset: 'Borrar todos los datos',
		resetConfirm: '¿Borrar tareas, historial y configuración? No se puede deshacer.',
		resetYes: 'Borrar',
		resetNo: 'Conservar'
	},
	board: {
		title: 'Tablón de mensajes',
		empty: 'Aún no hay mensajes. Termina una sesión y aparecerá aquí.',
		today: 'Hoy',
		yesterday: 'Ayer',
		summary: {
			one: '1 sesión de enfoque · {minutes} min',
			other: '{count} sesiones de enfoque · {minutes} min'
		},
		focusLetter: 'Te concentraste {minutes} min',
		breakLetter: 'Descansaste {minutes} min',
		onTask: 'en "{task}"',
		week: 'Esta semana'
	}
};
