import { describe, expect, it } from 'vitest';
import { completeFirstOpen, toggleTask, type Task } from './tasks';

const task = (id: string, completed = false): Task => ({ id, title: `Task ${id}`, completed });

describe('tasks', () => {
	it('toggles a task in place', () => {
		const result = toggleTask([task('a'), task('b'), task('c')], 'b', false);
		expect(result.map((t) => [t.id, t.completed])).toEqual([
			['a', false],
			['b', true],
			['c', false]
		]);
	});

	it('drops a finished task to the bottom', () => {
		const result = toggleTask([task('a'), task('b', true), task('c'), task('d')], 'a', true);
		expect(result.map((t) => t.id)).toEqual(['b', 'c', 'd', 'a']);
	});

	it('returns a reopened task to the end of the open tasks', () => {
		const result = toggleTask([task('a'), task('b'), task('c', true), task('d', true)], 'd', true);
		expect(result.map((t) => [t.id, t.completed])).toEqual([
			['a', false],
			['b', false],
			['d', false],
			['c', true]
		]);
	});

	it('completes the first open task and reports its title', () => {
		const result = completeFirstOpen([task('a', true), task('b'), task('c')], false);
		expect(result.title).toBe('Task b');
		expect(result.tasks.find((t) => t.id === 'b')?.completed).toBe(true);
	});

	it('leaves the list alone when nothing is open', () => {
		const tasks = [task('a', true)];
		expect(completeFirstOpen(tasks, true)).toEqual({ tasks, title: undefined });
	});
});
