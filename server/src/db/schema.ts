
import { serial, text, pgTable, timestamp, boolean } from 'drizzle-orm/pg-core';

export const todosTable = pgTable('todos', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  completed: boolean('completed').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// TypeScript type for the table schema
export type Todo = typeof todosTable.$inferSelect;
export type NewTodo = typeof todosTable.$inferInsert;

// Export all tables for proper query building
export const tables = { todos: todosTable };
