import { json, serve } from "sift/mod.ts";
import { catchAll, compose, cors, log } from "./lib/filters.ts";
import { methods } from "./lib/methods.ts";

type Todo = {
  url: URL;
  completed: boolean;
};

const todos: Todo[] = [];

const filters = compose(cors, log, catchAll);
serve({
  "/": filters(
    methods({
      GET: () => json(todos),
      POST: async (req) => {
        const base = new URL(req.url);
        const url = new URL(`/todos/${todos.length}`, base);
        const data = await req.json();
        const todo: Todo = { ...data, completed: false, url };
        todos.push(todo);
        return json(todo);
      },
      DELETE: () => {
        todos.length = 0;
        return json([]);
      },
    }),
  ),
  "/todos/:id": filters(
    methods({
      GET: (_req, _, params = {}) => {
        const id = parseInt(params.id, 10);
        return json(todos[id]);
      },
      PATCH: async (req, _, params = {}) => {
        const id = parseInt(params.id, 10);
        const data = await req.json();
        const todo: Todo = { ...todos[id], ...data };
        todos[id] = todo;
        return json(todo);
      },
      DELETE: (_req, _, params = {}) => {
        const id = parseInt(params.id, 10);
        const deleted: Todo = todos.splice(id, 1)[0];
        return json(deleted);
      },
    }),
  ),
  404: () => json({ error: "not found" }, { status: 404 }),
});
