
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import { Edit2, Trash2, Plus, CheckCircle2, Circle } from 'lucide-react';
import type { Todo, CreateTodoInput, UpdateTodoInput } from '../../server/src/schema';

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  // New todo form state
  const [newTodoData, setNewTodoData] = useState<CreateTodoInput>({
    title: '',
    description: null
  });

  // Edit todo state
  const [editFormData, setEditFormData] = useState<UpdateTodoInput>({
    id: 0,
    title: '',
    description: null
  });

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const loadTodos = useCallback(async () => {
    try {
      const result = await trpc.getTodos.query();
      setTodos(result);
    } catch (error) {
      console.error('Failed to load todos:', error);
    }
  }, []);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoData.title.trim()) return;

    setIsLoading(true);
    try {
      const newTodo = await trpc.createTodo.mutate(newTodoData);
      setTodos((prev: Todo[]) => [...prev, newTodo]);
      setNewTodoData({ title: '', description: null });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create todo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTodo = async (id: number) => {
    try {
      const updatedTodo = await trpc.toggleTodo.mutate({ id });
      setTodos((prev: Todo[]) =>
        prev.map((todo: Todo) => todo.id === id ? updatedTodo : todo)
      );
    } catch (error) {
      console.error('Failed to toggle todo:', error);
    }
  };

  const handleEditTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData.title?.trim()) return;

    setIsLoading(true);
    try {
      const updatedTodo = await trpc.updateTodo.mutate(editFormData);
      setTodos((prev: Todo[]) =>
        prev.map((todo: Todo) => todo.id === updatedTodo.id ? updatedTodo : todo)
      );
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Failed to update todo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTodo = async (id: number) => {
    try {
      await trpc.deleteTodo.mutate({ id });
      setTodos((prev: Todo[]) => prev.filter((todo: Todo) => todo.id !== id));
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  const openEditDialog = (todo: Todo) => {
    setEditFormData({
      id: todo.id,
      title: todo.title,
      description: todo.description
    });
    setIsEditDialogOpen(true);
  };

  const filteredTodos = todos.filter((todo: Todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const completedCount = todos.filter((todo: Todo) => todo.completed).length;
  const activeCount = todos.length - completedCount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">✅ My Todo List</h1>
          <p className="text-gray-600">Stay organized and get things done!</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-white/80 backdrop-blur">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{todos.length}</div>
                <div className="text-sm text-gray-600">Total Tasks</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{activeCount}</div>
                <div className="text-sm text-gray-600">Active</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{completedCount}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            className="rounded-full"
          >
            All ({todos.length})
          </Button>
          <Button
            variant={filter === 'active' ? 'default' : 'outline'}
            onClick={() => setFilter('active')}
            className="rounded-full"
          >
            Active ({activeCount})
          </Button>
          <Button
            variant={filter === 'completed' ? 'default' : 'outline'}
            onClick={() => setFilter('completed')}
            className="rounded-full"
          >
            Completed ({completedCount})
          </Button>
        </div>

        {/* Add Todo Button */}
        <div className="flex justify-center mb-6">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="rounded-full px-8">
                <Plus className="w-5 h-5 mr-2" />
                Add New Todo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Todo</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateTodo} className="space-y-4">
                <div>
                  <Input
                    placeholder="What needs to be done?"
                    value={newTodoData.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNewTodoData((prev: CreateTodoInput) => ({ ...prev, title: e.target.value }))
                    }
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="Add a description (optional)"
                    value={newTodoData.description || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setNewTodoData((prev: CreateTodoInput) => ({
                        ...prev,
                        description: e.target.value || null
                      }))
                    }
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Create Todo'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Todo List */}
        <div className="space-y-4">
          {filteredTodos.length === 0 ? (
            <Card className="bg-white/80 backdrop-blur">
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🎯</div>
                  <p className="text-gray-500 text-lg">
                    {filter === 'all' && 'No todos yet. Create your first one!'}
                    {filter === 'active' && 'No active todos. Great job!'}
                    {filter === 'completed' && 'No completed todos yet.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredTodos.map((todo: Todo) => (
              <Card
                key={todo.id}
                className={`bg-white/80 backdrop-blur transition-all hover:shadow-md ${
                  todo.completed ? 'opacity-75' : ''
                }`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <div className="flex items-center pt-1">
                      <Checkbox
                        checked={todo.completed}
                        onCheckedChange={() => handleToggleTodo(todo.id)}
                        className="w-5 h-5"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3
                            className={`text-lg font-medium ${
                              todo.completed
                                ? 'line-through text-gray-500'
                                : 'text-gray-800'
                            }`}
                          >
                            {todo.title}
                          </h3>
                          {todo.description && (
                            <p
                              className={`mt-1 text-sm ${
                                todo.completed
                                  ? 'line-through text-gray-400'
                                  : 'text-gray-600'
                              }`}
                            >
                              {todo.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-3">
                            <Badge variant={todo.completed ? 'secondary' : 'default'}>
                              {todo.completed ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Completed
                                </>
                              ) : (
                                <>
                                  <Circle className="w-3 h-3 mr-1" />
                                  Active
                                </>
                              )}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              Created {todo.created_at.toLocaleDateString()}
                            </span>
                            {todo.updated_at.getTime() !== todo.created_at.getTime() && (
                              <span className="text-xs text-gray-500">
                                Updated {todo.updated_at.toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(todo)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Todo</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{todo.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteTodo(todo.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Todo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditTodo} className="space-y-4">
              <div>
                <Input
                  placeholder="Todo title"
                  value={editFormData.title || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditFormData((prev: UpdateTodoInput) => ({ ...prev, title: e.target.value }))
                  }
                  required
                  autoFocus
                />
              </div>
              <div>
                <Textarea
                  placeholder="Description (optional)"
                  value={editFormData.description || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setEditFormData((prev: UpdateTodoInput) => ({
                      ...prev,
                      description: e.target.value || null
                    }))
                  }
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default App;
