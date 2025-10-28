import { useState, useEffect } from 'react';
import './TodoApp.css';

const API_URL = 'http://localhost:5000/api/v1';

function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Fetch all todos
  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/get/todos`);
      const data = await response.json();
      if (data.success) {
        setTodos(data.todos);
      }
    } catch (error) {
      console.error('Error fetching todos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create a new todo
  const createTodo = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/create/todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description }),
      });

      const data = await response.json();
      if (data.success) {
        setTitle('');
        setDescription('');
        fetchTodos();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error creating todo:', error);
      alert('Error creating todo');
    } finally {
      setLoading(false);
    }
  };

  // Update todo
  const updateTodo = async (id, updatedData) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/update/todo/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      const data = await response.json();
      if (data.success) {
        fetchTodos();
        setEditingId(null);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error updating todo:', error);
      alert('Error updating todo');
    } finally {
      setLoading(false);
    }
  };

  // Delete todo
  const deleteTodo = async (id) => {
    if (!window.confirm('Are you sure you want to delete this todo?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/delete/todo/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        fetchTodos();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
      alert('Error deleting todo');
    } finally {
      setLoading(false);
    }
  };

  // Toggle todo completion status
  const toggleComplete = async (todo) => {
    await updateTodo(todo._id, { completed: !todo.completed });
  };

  // Handle edit
  const startEdit = (todo) => {
    setTitle(todo.title);
    setDescription(todo.description || '');
    setEditingId(todo._id);
  };

  const cancelEdit = () => {
    setTitle('');
    setDescription('');
    setEditingId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateTodo(editingId, { title, description });
    } else {
      createTodo(e);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <div className="todo-app">
      <div className="todo-container">
        <h1>My Todo App</h1>
        
        <form onSubmit={handleSubmit} className="todo-form">
          <input
            type="text"
            placeholder="Enter todo title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="todo-input"
          />
          <textarea
            placeholder="Enter description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="todo-textarea"
          />
          <button type="submit" className="todo-submit" disabled={loading}>
            {editingId ? 'Update Todo' : 'Add Todo'}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} className="todo-cancel">
              Cancel
            </button>
          )}
        </form>

        <div className="todo-list">
          {loading && <p>Loading...</p>}
          {todos.length === 0 && !loading && (
            <p className="no-todos">No todos yet. Add one above!</p>
          )}
          {todos.map((todo) => (
            <div
              key={todo._id}
              className={`todo-item ${todo.completed ? 'completed' : ''}`}
            >
              <div className="todo-content">
                <h3 className={todo.completed ? 'strike-through' : ''}>
                  {todo.title}
                </h3>
                {todo.description && (
                  <p className={todo.completed ? 'strike-through' : ''}>
                    {todo.description}
                  </p>
                )}
              </div>
              <div className="todo-actions">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleComplete(todo)}
                  className="todo-checkbox"
                />
                <button
                  onClick={() => startEdit(todo)}
                  className="todo-edit"
                  disabled={loading}
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteTodo(todo._id)}
                  className="todo-delete"
                  disabled={loading}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TodoApp;


