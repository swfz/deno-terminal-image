import { createCanvas } from "https://deno.land/x/canvas/mod.ts";
import {
  breakLines,
  measureTextWithASCII,
  renderBottomStatusLine,
  renderPrompt,
  renderTopStatusLine,
} from "./render.ts";
import {
  serveDir,
  serveFile,
} from "https://deno.land/std@0.141.0/http/file_server.ts";

const port = 8080;
const textLineBase = 100;

const isValidColorCode = (str: string) => {
  return /^([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(str);
};

const colorParamGetter = (url: URL, key: string) => {
  const param = url.searchParams.get(key) ?? "";

  return isValidColorCode(param) ? `#${param}` : null;
};

const colorsParamGetter = (url: URL, key: string) => {
  const param = url.searchParams.get(key) ?? null;

  if (!param) {
    return null;
  }

  return param.split(",").filter((p) => isValidColorCode(p)).map((p) =>
    `#${p}`
  );
};

const handler = async (request: Request): Promise<Response> => {
  const url = new URL(request.url);
  if (url.pathname.startsWith("/generator")) { // URLが"/generator"始まりだった場合は
    return await serveFile(request, `${Deno.cwd()}/static/index.html`);
  }
  if (url.pathname.startsWith("/static")) {
    return await serveDir(request, {
      fsRoot: "",
    });
  }

  const title = url.searchParams.get("title") ?? "No Title";
  const tagsParam = url.searchParams.get("tags");
  const tags = tagsParam ? tagsParam.split(",") : [];

  const textsParam = url.searchParams.get("texts");
  const texts = textsParam ? textsParam.split(",") : ["swfz", "til"];

  const topColors = colorsParamGetter(url, "top_colors") ??
    ["#6797e8", "#a4e083", "#efb24a", "#ec7563"];
  const bottomColors = colorsParamGetter(url, "bottom_colors") ??
    ["#6797e8", "#a4e083", "#efb24a", "#ec7563"];
  const topColor = colorParamGetter(url, "top_color") ?? "#555";
  const bottomColor = colorParamGetter(url, "bottom_color") ?? "#555";
  const cursorColor = colorParamGetter(url, "cursor_color") ?? "#ec80f7";
  const promptColor = colorParamGetter(url, "prompt_color") ?? "#efb24a";
  const bgColor = colorParamGetter(url, "bg_color") ?? "#313d4f";
  const titleColor = colorParamGetter(url, "title_color") ?? "#FFFFFF";
  const commandColor = colorParamGetter(url, "command_color") ?? "#888";

  console.log("title:", title);

  const [width, height] = [1200, 630];

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  const font = await Deno.readFile("./NotoSansCJK-Regular.ttc");
  canvas.loadFont(font, {
    family: "notosans",
  });
  ctx.font = "50pt notosans";

  // background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  renderTopStatusLine(ctx, texts, topColors, topColor);

  // Command
  renderPrompt(ctx, 10, textLineBase * 2, promptColor);
  ctx.fillStyle = commandColor;
  ctx.fillText("article --title \\", 80, textLineBase * 2);

  // Title
  const titleLines = breakLines(ctx, title, 1150);
  ctx.fillStyle = titleColor;
  titleLines.forEach((line, i) => {
    ctx.fillText(line, 50, 300 + i * textLineBase);
  });

  // Cursor
  const lastLineWidth = measureTextWithASCII(ctx, titleLines.at(-1));
  const cursorX = 50 + lastLineWidth + 10;
  const cursorY = (textLineBase * 2) + 30 +
    (titleLines.length - 1) * textLineBase;

  ctx.fillStyle = cursorColor;
  ctx.fillRect(cursorX, cursorY, 50, 100);

  // タイトル表示を優先させるため、タイトルが3行までの場合はTagも表示させる
  if (tags.length > 0 && titleLines.length <= 3) {
    renderBottomStatusLine(ctx, tags, bottomColors, bottomColor);
  }

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
