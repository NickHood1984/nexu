import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { auth } from "../auth.js";

export const authMiddleware = createMiddleware(async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session?.user) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  c.set("userId", session.user.id);
  c.set("session", session);
  await next();
});
