import { createCanvas } from "https://deno.land/x/canvas/mod.ts";
import {
  breakLines,
  renderBackground,
  renderBottomStatusLine,
  renderCommand,
  renderCursor,
  renderPrompt,
  renderTitle,
  renderTopStatusLine,
} from "./render.ts";
import { defaultTheme } from "./theme.ts";

import { serveDir, serveFile } from "https://deno.land/std@0.141.0/http/file_server.ts";

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

  return param.split(",").filter((p) => isValidColorCode(p)).map((p) => `#${p}`);
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
  const bottomBgText = url.searchParams.get("bottom_bg_text") ?? "Tags";
  const topBgText = url.searchParams.get("top_bg_text") ?? null;

  const topColors = colorsParamGetter(url, "top_colors") ?? defaultTheme.topColors;
  const topBgColor = colorParamGetter(url, "top_bg_color") ?? defaultTheme.topBgColor;
  const topColor = colorParamGetter(url, "top_color") ?? defaultTheme.topColor;
  const bottomColors = colorsParamGetter(url, "bottom_colors") ?? defaultTheme.bottomColors;
  const bottomBgColor = colorParamGetter(url, "bottom_bg_color") ?? defaultTheme.bottomBgColor;
  const bottomColor = colorParamGetter(url, "bottom_color") ?? defaultTheme.bottomColor;
  const cursorColor = colorParamGetter(url, "cursor_color") ?? defaultTheme.cursorColor;
  const promptColor = colorParamGetter(url, "prompt_color") ?? defaultTheme.promptColor;
  const bgColor = colorParamGetter(url, "bg_color") ?? defaultTheme.bgColor;
  const titleColor = colorParamGetter(url, "title_color") ?? defaultTheme.titleColor;
  const commandColor = colorParamGetter(url, "command_color") ?? defaultTheme.commandColor;

  console.log("title:", title);

  const [width, height] = [1200, 630];

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  const font = await Deno.readFile("./NotoSansCJK-Regular.ttc");
  canvas.loadFont(font, {
    family: "notosans",
  });
  ctx.font = "50pt notosans";

  renderBackground(ctx, bgColor, canvas.width, canvas.height);
  renderTopStatusLine(ctx, texts, topColors, topBgColor, topBgText, topColor);
  renderPrompt(ctx, 10, textLineBase * 2, promptColor);
  renderCommand(ctx, 80, textLineBase * 2, commandColor);
  const titleLines = breakLines(ctx, title, 1150);
  renderTitle(ctx, titleLines, 50, 300, titleColor);
  renderCursor(ctx, titleLines, 50, 100, cursorColor);
  renderBottomStatusLine(ctx, tags, titleLines, bottomColors, bottomBgColor, bottomBgText, bottomColor);

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
