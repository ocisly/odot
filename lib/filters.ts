import { Handler, json } from "sift/mod.ts";
import { method } from "./methods.ts";

export type Filter = (h: Handler) => Handler;

export const compose = (...filters: Filter[]): Filter =>
  filters.reduce((acc, f) => (...args) => acc(f(...args)));

export const cors: Filter = (next) =>
  method("OPTIONS", () =>
    new Response(null, {
      headers: {
        "Access-Control-Allow-Headers":
          "Origin, X-Requested-With, Content-Type, Accept",
        "Access-Control-Allow-Methods":
          "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Origin": "*",
      },
      status: 204,
    }), async (...args) => {
    const res = await next(...args);
    res.headers.append("Access-Control-Allow-Origin", "*");
    return res;
  });

export const log: Filter = (next) =>
  async (req, ...args) => {
    const reqText = await req.clone().text();
    const res = await next(req, ...args);
    console.log(
      `${req.method} ${req.url} ${reqText} -> ${await res.clone().text()}`,
    );
    return res;
  };

export const catchAll: Filter = (h) =>
  async (...args) => {
    try {
      return await h(...args);
    } catch (e) {
      console.error(e);
      return json({
        error: e?.message ?? "something went wrong",
      }, { status: 500 });
    }
  };
