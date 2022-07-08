import { Handler, json, serve } from "https://deno.land/x/sift@0.5.0/mod.ts";

const cors = (next: Handler): Handler => {
  return async (req, ...args) => {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Headers":
            "Origin, X-Requested-With, Content-Type, Accept",
          "Access-Control-Allow-Methods":
            "GET, POST, PUT, PATCH, DELETE, OPTIONS",
          "Access-Control-Allow-Origin": "*",
        },
        status: 204,
      });
    }

    const res = await next(req, ...args);
    res.headers.append("Access-Control-Allow-Origin", "*");
    return res;
  };
};

const log = (next: Handler): Handler => {
  return async (req, ...args) => {
    const reqText = await req.clone().text();
    const res = await next(req, ...args);
    console.log(
      `${req.method} ${req.url} ${reqText} -> ${await res.clone().text()}`,
    );
    return res;
  };
};

type Todo = {
  url: URL;
  completed: boolean;
};

const todos: Todo[] = [];

serve({
  "/": cors(async (request: Request) => {
    if (request.method === "POST") {
      const data = await request.json();
      const base = new URL(request.url);
      const url = new URL(`/todos/${todos.length}`, base);
      const todo: Todo = { ...data, completed: false, url };
      todos.push(todo);
      return json(todo);
    } else if (request.method === "DELETE") {
      todos.length = 0;
      return json([]);
    }
    return json(todos);
  }),
  "/todos/:id": cors(log(async (request: Request, _, params = {}) => {
    const id = parseInt(params.id, 10);
    if (request.method === "PATCH") {
      const data = await request.json();
      const todo: Todo = { ...todos[id], ...data };
      todos[id] = todo;
      return json(todo);
    } else if (request.method === "DELETE") {
      const deleted: Todo = todos.splice(id, 1)[0];
      return json(deleted);
    }
    return json(todos[id]);
  })),
});
