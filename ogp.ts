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
  const bottomLineTextsParam = url.searchParams.get("bottom_line_texts");
  const bottomLineTexts = bottomLineTextsParam ? bottomLineTextsParam.split(",") : [];
  const topLineTextsParam = url.searchParams.get("top_line_texts");
  const topLineTexts = topLineTextsParam ? topLineTextsParam.split(",") : ["swfz", "til"];

  const bottomLineBgText = url.searchParams.get("bottom_line_bg_text") ?? "Tags";
  const topLineBgText = url.searchParams.get("top_line_bg_text") ?? null;

  const topLineItemColors = colorsParamGetter(url, "top_line_item_colors") ?? defaultTheme.topStatusLine.itemColors;
  const topLineBgColor = colorParamGetter(url, "top_line_bg_color") ?? defaultTheme.topStatusLine.bgColor;
  const topLineTextColor = colorParamGetter(url, "top_line_text_color") ?? defaultTheme.topStatusLine.textColor;
  const bottomLineItemColors = colorsParamGetter(url, "bottom_line_item_colors") ??
    defaultTheme.bottomStatusLine.itemColors;
  const bottomLineBgColor = colorParamGetter(url, "bottom_line_bg_color") ?? defaultTheme.bottomStatusLine.bgColor;
  const bottomLineTextColor = colorParamGetter(url, "bottom_line_text_color") ??
    defaultTheme.bottomStatusLine.textColor;
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
  renderTopStatusLine(ctx, topLineTexts, topLineItemColors, topLineBgColor, topLineBgText, topLineTextColor);
  renderPrompt(ctx, 10, textLineBase * 2, promptColor);
  renderCommand(ctx, 80, textLineBase * 2, commandColor);
  const titleLines = breakLines(ctx, title, 1150);
  renderTitle(ctx, titleLines, 50, 300, titleColor);
  renderCursor(ctx, titleLines, 50, 100, cursorColor);
  renderBottomStatusLine(
    ctx,
    bottomLineTexts,
    titleLines,
    bottomLineItemColors,
    bottomLineBgColor,
    bottomLineBgText,
    bottomLineTextColor,
  );

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
