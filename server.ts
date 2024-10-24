import { createCanvas } from "https://deno.land/x/canvas@v1.4.2/mod.ts";
import { render } from "./render.ts";
import { getParams } from "./params.ts";
import { log } from "./logger.ts";
import { serveDir, serveFile } from "https://deno.land/std@0.224.0/http/file_server.ts";

const port = 8080;

const handler = async (request: Request): Promise<Response> => {
  const url = new URL(request.url);

  await log(request, {});

  if (url.pathname.startsWith("/generator")) { // URLが"/generator"始まりだった場合は
    return await serveFile(request, `${Deno.cwd()}/static/index.html`);
  }
  if (url.pathname.startsWith("/static")) {
    return await serveDir(request, {
      fsRoot: "",
    });
  }

  const [width, height] = [1200, 630];
  const params = getParams(url);

  console.log("title:", params.title);

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  const font = await Deno.readFile("./NotoSansCJK-Regular.ttc");
  canvas.loadFont(font, {
    family: "notosans",
  });
  ctx.font = "50pt notosans";

  render(ctx, { ...params, width, height });

  const headers = new Headers();
  headers.set("content-type", "image/png");

  const response = new Response(canvas.toBuffer(), {
    headers: headers,
    status: 200,
  });

  return response;
};

console.log(`HTTP webserver running. Access it at: http://localhost:8080/`);
Deno.serve({ port }, handler);
