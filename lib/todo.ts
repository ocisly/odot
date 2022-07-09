type Todo = {
  title: string;
  url: URL;
  completed: boolean;
};

type TodoSpec = {
  title: string;
};

export const list = (todos: Todo[]) => todos;

export const create = (
  data: TodoSpec,
  urlGenerator: (id: number) => URL,
  todos: Todo[],
) => {
  const todo: Todo = {
    ...data,
    completed: false,
    url: urlGenerator(todos.length),
  };
  todos.push(todo);
  return todo;
};

export const clear = (todos: Todo[]) => {
  todos.length = 0;
  return todos;
};

export const update = (id: number, data: TodoSpec, todos: Todo[]) => {
  const todo: Todo = { ...todos[id], ...data };
  todos[id] = todo;
  return todo;
};

export const remove = (id: number, todos: Todo[]) => {
  const deleted: Todo = todos.splice(id, 1)[0];
  return deleted;
};

export const get = (id: number, todos: Todo[]) => {
  return todos[id];
};

export const createDB = () => [];
