import { ulid } from "jsr:@std/ulid";

const EXPIRE_LOGS_DAYS = 90;

const logObject = async (now: Date, req: Request) => {
  const ts = Math.floor(now.getTime() / 1000);

  return {
    method: req.method,
    url: req.url,
    redirect: req.redirect,
    bodyUsed: req.bodyUsed,
    ...{ ts: ts },
    headers: Object.fromEntries(req.headers.entries()),
    ...(req.body ? { body: await req.text() } : {}),
  };
};

const log = async (request: Request, additionalData) => {
  const kv = await Deno.openKv();
  const now = new Date();
  const logRecord = { ...(await logObject(now, request)), ...additionalData };

  return await kv.set(["logs", now.getFullYear(), now.getMonth() + 1, now.getDate(), ulid()], logRecord, {
    expireIn: 1000 * 60 * 60 * 24 * EXPIRE_LOGS_DAYS,
  });
};

export { log };
