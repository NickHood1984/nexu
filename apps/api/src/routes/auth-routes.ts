import type { OpenAPIHono } from "@hono/zod-openapi";
import { auth } from "../auth.js";
import type { AppBindings } from "../types.js";

export function registerAuthRoutes(app: OpenAPIHono<AppBindings>) {
  app.on(["POST", "GET"], "/api/auth/*", (c) => {
    return auth.handler(c.req.raw);
  });
}
