
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { todosTable } from '../db/schema';
import { getTodos } from '../handlers/get_todos';

describe('getTodos', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no todos exist', async () => {
    const result = await getTodos();
    expect(result).toEqual([]);
  });

  it('should return all todos', async () => {
    // Create test todos
    await db.insert(todosTable).values([
      {
        title: 'First Todo',
        description: 'First description',
        completed: false
      },
      {
        title: 'Second Todo',
        description: null,
        completed: true
      }
    ]).execute();

    const result = await getTodos();

    expect(result).toHaveLength(2);
    expect(result[0].title).toBeDefined();
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);
    expect(typeof result[0].completed).toBe('boolean');
  });

  it('should return todos ordered by created_at descending', async () => {
    // Create todos with slight delay to ensure different timestamps
    const firstTodo = await db.insert(todosTable).values({
      title: 'First Todo',
      description: 'Created first',
      completed: false
    }).returning().execute();

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    const secondTodo = await db.insert(todosTable).values({
      title: 'Second Todo',
      description: 'Created second',
      completed: false
    }).returning().execute();

    const result = await getTodos();

    expect(result).toHaveLength(2);
    // Most recent (second) todo should be first in results
    expect(result[0].title).toBe('Second Todo');
    expect(result[1].title).toBe('First Todo');
    expect(result[0].created_at >= result[1].created_at).toBe(true);
  });

  it('should handle todos with null descriptions', async () => {
    await db.insert(todosTable).values({
      title: 'Todo with null description',
      description: null,
      completed: false
    }).execute();

    const result = await getTodos();

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Todo with null description');
    expect(result[0].description).toBeNull();
  });
});
