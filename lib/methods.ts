import { Handler, json } from "sift/mod.ts";

export const method = (m: string, handler: Handler, next: Handler): Handler =>
  (req, ...args) =>
    req.method === m ? handler(req, ...args) : next(req, ...args);

export const methods = (handlers: Record<string, Handler>): Handler =>
  Object.entries(handlers).reduce(
    (acc: Handler, [m, handler]) => method(m, handler, acc),
    () => json({ error: "method not allowed" }, { status: 405 }),
  );
