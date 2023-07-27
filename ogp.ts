import { createCanvas } from "https://deno.land/x/canvas/mod.ts";
import TinySegmenter from "https://esm.sh/tiny-segmenter@0.2.0";

const port = 8080;
const textLineBase = 100;
const statusLineBase = 80;
const triangleBase = 40;

const renderTriangle = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  direction: "left" | "right",
) => {
  const base = triangleBase;
  ctx.fillStyle = color;

  const vertexX = direction === "left" ? x - base : x + base;
  const vertexY = y + base;

  ctx.beginPath();
  ctx.moveTo(vertexX, vertexY);
  ctx.lineTo(x, y + (base * 2));
  ctx.lineTo(x, y);
  ctx.fill();
};

const renderPrefix = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
  ctx.fillStyle = "#efb24a";
  ctx.fillText("$", x, y);
};

const selectASCII = (str: string) => {
  const matches = str.match(/[\x00-\x7F]/g);

  return matches ?? [];
};

// ASCII文字列を含めてmeasureTextを通すとASCII文字列の分だけマルチバイトで判断されている？ようなので実測した結果6割ほどだったので4割分は減算する
const measureTextWithASCII = (ctx: CanvasRenderingContext2D, str: string) => {
  const fullWidth = ctx.measureText(str).width;
  const ascii = selectASCII(str);
  const asciiWidth = ctx.measureText(ascii.join("")).width;

  return fullWidth - (asciiWidth * 0.4);
};

const breakLines = (
  ctx: CanvasRenderingContext2D,
  title: string,
  maxWidth: number,
): string[] => {
  const segmenter = new TinySegmenter();
  const segments = segmenter.segment(title);

  const processWord = (segments, line = "", result = []) => {
    if (segments.length === 0) return [...result, line];

    const testLine = `${line}${segments[0]}`;
    const testWidth = measureTextWithASCII(ctx, testLine);

    return testWidth > maxWidth
      ? processWord(segments.slice(1), `${segments[0]}`, [...result, line])
      : processWord(segments.slice(1), testLine, result);
  };

  return processWord(segments);
};

interface ItemPosition {
  triangle: number;
  rect: number;
  text: number;
}

interface StatusLineItem {
  text: string;
  color: string;
  width: number;
  position: ItemPosition;
  direction: "left" | "right";
}

interface FixedPosition {
  y: number;
  height: number;
  textY: number;
}

const renderStatusLineItem = (
  ctx: CanvasRenderingContext2D,
  item: StatusLineItem,
  fixed: FixedPosition
) => {
  renderTriangle(
    ctx,
    item.position.triangle,
    fixed.y,
    item.color,
    item.direction,
  );
  ctx.fillStyle = item.color;
  ctx.fillRect(item.position.rect, fixed.y, item.width, fixed.height);
  ctx.fillStyle = "#555";
  ctx.fillText(item.text, item.position.text, fixed.textY);
};

const renderBottomStatusLine = (
  ctx: CanvasRenderingContext2D,
  texts: string[],
) => {
  const colors = ["#6797e8", "#a4e083", "#efb24a", "#ec7563"];

  ctx.fillStyle = "#333";
  ctx.fillRect(0, 540, 1200, 80);
  ctx.fillStyle = "#999";
  ctx.fillText("Tags", 10, 600);

  const tagsStartPositions = texts.reverse().reduce((acc, tag, i) => {
    const textWidth = measureTextWithASCII(ctx, tag);
    const x = acc.at(-1) - textWidth - (triangleBase * i);

    return [...acc, x];
  }, [1200]).reverse();

  const fixed = {
    y: 540,
    height: statusLineBase,
    textY: 600,
  };

  texts.reverse().forEach((tag, i) => {
    const item = {
      text: tag,
      color: colors[i],
      position: {
        rect: tagsStartPositions[i],
        triangle: tagsStartPositions[i],
        text: tagsStartPositions[i],
      },
      direction: "left" as const,
      width: measureTextWithASCII(ctx, tag) +
        (triangleBase * (texts.length - i)),
    };
    renderStatusLineItem(ctx, item, fixed, i);
  });
};

const renderTopStatusLine = (
  ctx: CanvasRenderingContext2D,
  texts: string[],
) => {
  const colors = ["#6797e8", "#a4e083", "#efb24a", "#ec7563"];

  const startPositions = texts.reduce((acc, text) => {
    const textWidth = measureTextWithASCII(ctx, text);
    const x = acc.at(-1) + textWidth;

    return [...acc, x];
  }, [0]);

  const fixed = {
    y: 30,
    height: statusLineBase,
    textY: 90,
  };

  texts.map((text, i) => {
    const item = {
      text: text,
      color: colors[i],
      position: {
        rect: startPositions[i],
        triangle: startPositions[i + 1] + (triangleBase * i),
        text: startPositions[i] + (triangleBase * i) + 10,
      },
      direction: "right" as const,
      width: measureTextWithASCII(ctx, text) + (triangleBase * i),
    };
    return item;
  }).reverse().forEach((item, i) => {
    renderStatusLineItem(ctx, item, fixed, i);
  });
};

const handler = async (request: Request): Promise<Response> => {
  const url = new URL(request.url);
  const title = url.searchParams.get("title") ?? "No Title";
  const tagsParam = url.searchParams.get("tags");
  const tags = tagsParam ? tagsParam.split(",") : [];

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
  ctx.fillStyle = "#313d4f";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // StatusLine
  const terminalHeaders = ["swfz", "til"];
  renderTopStatusLine(ctx, terminalHeaders);

  // Command
  renderPrefix(ctx, 10, textLineBase * 2);
  ctx.fillStyle = "#888";
  ctx.fillText("article --title \\", 80, textLineBase * 2);

  // Title
  const titleLines = breakLines(ctx, title, 1150);
  ctx.fillStyle = "#FFFFFF";
  titleLines.forEach((line, i) => {
    ctx.fillText(line, 50, 300 + i * textLineBase);
  });

  // Cursor
  const lastLineWidth = measureTextWithASCII(ctx, titleLines.at(-1));
  const cursorX = 50 + lastLineWidth + 10;
  const cursorY = (textLineBase * 2) + 30 +
    (titleLines.length - 1) * textLineBase;

  ctx.fillStyle = "#ec80f7";
  ctx.fillRect(cursorX, cursorY, 50, 100);

  // タイトル表示を優先させるため、タイトルが3行までの場合はTagも表示させる
  if (tags.length > 0 && titleLines.length <= 3) {
    renderBottomStatusLine(ctx, tags);
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
