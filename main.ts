import { json, serve } from "sift/mod.ts";
import { catchAll, compose, cors, log } from "./lib/filters.ts";
import { methods } from "./lib/methods.ts";
import {
  clear,
  create,
  createDB,
  get,
  list,
  remove,
  update,
} from "./lib/todo.ts";

const filters = compose(cors, log, catchAll);
const db = createDB();

serve({
  "/": filters(
    methods({
      GET: () => json(list(db)),
      POST: async (req) => {
        const data = await req.json();
        return json(create(data, (id) => new URL(`/todos/${id}`, req.url), db));
      },
      DELETE: () => {
        return json(clear(db));
      },
    }),
  ),
  "/todos/:id": filters(
    methods({
      GET: (_req, _, params = {}) => {
        const id = parseInt(params.id, 10);
        return json(get(id, db));
      },
      PATCH: async (req, _, params = {}) => {
        const id = parseInt(params.id, 10);
        const data = await req.json();
        return json(update(id, data, db));
      },
      DELETE: (_req, _, params = {}) => {
        const id = parseInt(params.id, 10);
        return json(remove(id, db));
      },
    }),
  ),
  404: () => json({ error: "not found" }, { status: 404 }),
});
