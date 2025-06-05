
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type DeleteTodoInput } from '../schema';
import { deleteTodo } from '../handlers/delete_todo';
import { eq } from 'drizzle-orm';

describe('deleteTodo', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing todo', async () => {
    // Create a test todo first
    const createResult = await db.insert(todosTable)
      .values({
        title: 'Test Todo',
        description: 'A todo for testing deletion',
        completed: false
      })
      .returning()
      .execute();

    const todoId = createResult[0].id;

    // Delete the todo
    const deleteInput: DeleteTodoInput = { id: todoId };
    const result = await deleteTodo(deleteInput);

    // Should return success
    expect(result.success).toBe(true);

    // Verify todo was deleted from database
    const todos = await db.select()
      .from(todosTable)
      .where(eq(todosTable.id, todoId))
      .execute();

    expect(todos).toHaveLength(0);
  });

  it('should return false when deleting non-existent todo', async () => {
    const deleteInput: DeleteTodoInput = { id: 999 };
    const result = await deleteTodo(deleteInput);

    // Should return false for non-existent todo
    expect(result.success).toBe(false);
  });

  it('should not affect other todos when deleting one', async () => {
    // Create multiple test todos
    const createResults = await db.insert(todosTable)
      .values([
        { title: 'Todo 1', completed: false },
        { title: 'Todo 2', completed: true },
        { title: 'Todo 3', completed: false }
      ])
      .returning()
      .execute();

    const todoToDelete = createResults[1]; // Delete the middle one

    // Delete one todo
    const deleteInput: DeleteTodoInput = { id: todoToDelete.id };
    const result = await deleteTodo(deleteInput);

    expect(result.success).toBe(true);

    // Verify only the target todo was deleted
    const remainingTodos = await db.select()
      .from(todosTable)
      .execute();

    expect(remainingTodos).toHaveLength(2);
    expect(remainingTodos.map(t => t.title)).toEqual(['Todo 1', 'Todo 3']);
  });
});
