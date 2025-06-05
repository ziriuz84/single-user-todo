
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type ToggleTodoInput } from '../schema';
import { toggleTodo } from '../handlers/toggle_todo';
import { eq } from 'drizzle-orm';

describe('toggleTodo', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should toggle todo from incomplete to complete', async () => {
    // Create a test todo that is incomplete
    const insertResult = await db.insert(todosTable)
      .values({
        title: 'Test Todo',
        description: 'A todo for testing',
        completed: false
      })
      .returning()
      .execute();

    const createdTodo = insertResult[0];
    const input: ToggleTodoInput = { id: createdTodo.id };

    const result = await toggleTodo(input);

    // Should toggle to completed
    expect(result.id).toEqual(createdTodo.id);
    expect(result.title).toEqual('Test Todo');
    expect(result.description).toEqual('A todo for testing');
    expect(result.completed).toBe(true);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at > createdTodo.updated_at).toBe(true);
  });

  it('should toggle todo from complete to incomplete', async () => {
    // Create a test todo that is complete
    const insertResult = await db.insert(todosTable)
      .values({
        title: 'Completed Todo',
        description: 'Already done',
        completed: true
      })
      .returning()
      .execute();

    const createdTodo = insertResult[0];
    const input: ToggleTodoInput = { id: createdTodo.id };

    const result = await toggleTodo(input);

    // Should toggle to incomplete
    expect(result.id).toEqual(createdTodo.id);
    expect(result.title).toEqual('Completed Todo');
    expect(result.description).toEqual('Already done');
    expect(result.completed).toBe(false);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at > createdTodo.updated_at).toBe(true);
  });

  it('should save toggle changes to database', async () => {
    // Create a test todo
    const insertResult = await db.insert(todosTable)
      .values({
        title: 'Database Test Todo',
        completed: false
      })
      .returning()
      .execute();

    const createdTodo = insertResult[0];
    const input: ToggleTodoInput = { id: createdTodo.id };

    await toggleTodo(input);

    // Verify changes were saved to database
    const todos = await db.select()
      .from(todosTable)
      .where(eq(todosTable.id, createdTodo.id))
      .execute();

    expect(todos).toHaveLength(1);
    expect(todos[0].completed).toBe(true);
    expect(todos[0].updated_at).toBeInstanceOf(Date);
    expect(todos[0].updated_at > createdTodo.updated_at).toBe(true);
  });

  it('should throw error when todo does not exist', async () => {
    const input: ToggleTodoInput = { id: 999 };

    expect(toggleTodo(input)).rejects.toThrow(/not found/i);
  });
});
