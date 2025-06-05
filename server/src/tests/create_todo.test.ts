
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type CreateTodoInput } from '../schema';
import { createTodo } from '../handlers/create_todo';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateTodoInput = {
  title: 'Test Todo',
  description: 'A todo for testing'
};

describe('createTodo', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a todo', async () => {
    const result = await createTodo(testInput);

    // Basic field validation
    expect(result.title).toEqual('Test Todo');
    expect(result.description).toEqual('A todo for testing');
    expect(result.completed).toEqual(false);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a todo with null description', async () => {
    const inputWithoutDescription: CreateTodoInput = {
      title: 'Todo without description'
    };

    const result = await createTodo(inputWithoutDescription);

    expect(result.title).toEqual('Todo without description');
    expect(result.description).toBeNull();
    expect(result.completed).toEqual(false);
  });

  it('should save todo to database', async () => {
    const result = await createTodo(testInput);

    // Query using proper drizzle syntax
    const todos = await db.select()
      .from(todosTable)
      .where(eq(todosTable.id, result.id))
      .execute();

    expect(todos).toHaveLength(1);
    expect(todos[0].title).toEqual('Test Todo');
    expect(todos[0].description).toEqual('A todo for testing');
    expect(todos[0].completed).toEqual(false);
    expect(todos[0].created_at).toBeInstanceOf(Date);
    expect(todos[0].updated_at).toBeInstanceOf(Date);
  });

  it('should create multiple todos independently', async () => {
    const todo1 = await createTodo({ title: 'First Todo', description: 'First description' });
    const todo2 = await createTodo({ title: 'Second Todo', description: 'Second description' });

    expect(todo1.id).not.toEqual(todo2.id);
    expect(todo1.title).toEqual('First Todo');
    expect(todo2.title).toEqual('Second Todo');

    // Verify both are in database
    const allTodos = await db.select().from(todosTable).execute();
    expect(allTodos).toHaveLength(2);
  });
});
