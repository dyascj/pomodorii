export type Task = {
	id: string;
	title: string;
	completed: boolean;
};

export const MAX_TASK_LENGTH = 120;

export const createTask = (title: string): Task => ({
	id: crypto.randomUUID(),
	title: title.trim().slice(0, MAX_TASK_LENGTH),
	completed: false
});

/**
 * Flips a task. With `completedToBottom`, a finished task drops to the very
 * bottom and a reopened one rejoins the end of the open tasks.
 */
export const toggleTask = (tasks: Task[], id: string, completedToBottom: boolean) => {
	const target = tasks.find((task) => task.id === id);
	if (!target) return tasks;
	const toggled = { ...target, completed: !target.completed };
	if (!completedToBottom) return tasks.map((task) => (task.id === id ? toggled : task));

	const rest = tasks.filter((task) => task.id !== id);
	if (toggled.completed) return [...rest, toggled];
	const firstDone = rest.findIndex((task) => task.completed);
	const at = firstDone === -1 ? rest.length : firstDone;
	return [...rest.slice(0, at), toggled, ...rest.slice(at)];
};

/** Checks off the first open task, returning its title for the session log. */
export const completeFirstOpen = (tasks: Task[], completedToBottom: boolean) => {
	const target = tasks.find((task) => !task.completed);
	if (!target) return { tasks, title: undefined };
	return { tasks: toggleTask(tasks, target.id, completedToBottom), title: target.title };
};

export const firstOpenTask = (tasks: Task[]) => tasks.find((task) => !task.completed);
