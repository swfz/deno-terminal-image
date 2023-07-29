import TinySegmenter from "https://esm.sh/tiny-segmenter@0.2.0";

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
  color: string;
}

interface Params {
  width: number;
  height: number;
  title: string;
  bottomLineTexts: string[];
  topLineTexts: string[];
  bottomLineBgText: string;
  topLineBgText: string;
  topLineItemColors: string[];
  topLineBgColor: string;
  topLineTextColor: string;
  bottomLineItemColors: string[];
  bottomLineBgColor: string;
  bottomLineTextColor: string;
  cursorColor: string;
  promptColor: string;
  bgColor: string;
  titleColor: string;
  commandColor: string;
}

const triangleBase = 40;
const statusLineBase = 80;
const textLineBase = 100;

const measuredCorrectly = (ctx: CanvasRenderingContext2D) => {
  return ctx.measureText("あ").width !== ctx.measureText("a").width;
};

const selectASCII = (str: string) => {
  const matches = str.match(/[\x20-\x7F]/g);

  return matches ?? [];
};

// ASCII文字列を含めてmeasureTextを通すとASCII文字列の分だけマルチバイトで判断されている？ようなので実測した結果6割ほどだったので4割分は減算する
const measureTextWithASCII = (ctx: CanvasRenderingContext2D, str: string) => {
  const fullWidth = ctx.measureText(str).width;
  const ascii = selectASCII(str);
  const asciiWidth = ctx.measureText(ascii.join("")).width;

  return measuredCorrectly(ctx) ? fullWidth : fullWidth - (asciiWidth * 0.4);
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

const renderPrompt = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
) => {
  ctx.fillStyle = color;
  ctx.fillText("$", x, y);
};

const renderStatusLineItem = (
  ctx: CanvasRenderingContext2D,
  item: StatusLineItem,
  fixed: FixedPosition,
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
  ctx.fillStyle = fixed.color;
  ctx.fillText(item.text, item.position.text, fixed.textY);
};

const renderBottomStatusLine = (
  ctx: CanvasRenderingContext2D,
  texts: string[],
  titleLines: string[],
  colors: string[],
  bgColor: string,
  bgText: string,
  color: string,
) => {
  // タイトル表示を優先させるため、タイトルが3行までの場合はTagも表示させる
  if (texts.length === 0 || titleLines.length > 3) {
    return;
  }

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 540, 1200, 80);
  ctx.fillStyle = color;
  ctx.fillText(bgText, 10, 600);

  const tagsStartPositions = texts.reverse().reduce((acc, tag, i) => {
    const textWidth = measureTextWithASCII(ctx, tag);
    const x = acc.at(-1) - textWidth - (triangleBase * i);

    return [...acc, x];
  }, [1200]).reverse();

  const fixed = {
    y: 540,
    height: statusLineBase,
    textY: 600,
    color: color,
  };

  texts.reverse().forEach((tag, i) => {
    const item = {
      text: tag,
      color: colors[i] || "#000",
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
  colors: string[],
  bgColor: string,
  bgText: string,
  color: string,
) => {
  if (bgText) {
    const bgTextWidth = measureTextWithASCII(ctx, bgText);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 30, 1200, 80);
    ctx.fillStyle = color;
    ctx.fillText(bgText, 1200 - bgTextWidth - 10, 90);
  }

  const startPositions = texts.reduce((acc, text) => {
    const textWidth = measureTextWithASCII(ctx, text);
    const x = acc.at(-1) + textWidth;

    return [...acc, x];
  }, [0]);

  const fixed = {
    y: 30,
    height: statusLineBase,
    textY: 90,
    color: color,
  };

  texts.map((text, i) => {
    const item = {
      text: text,
      color: colors[i] || "#000",
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

const renderBackground = (ctx: CanvasRenderingContext2D, color: string, width: number, height: number) => {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
};

const renderCommand = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
  ctx.fillStyle = color;
  ctx.fillText("article --title \\", x, y);
};

const renderTitle = (ctx: CanvasRenderingContext2D, titleLines: string[], x: number, y: number, color: string) => {
  ctx.fillStyle = color;
  titleLines.forEach((line, i) => {
    ctx.fillText(line, x, y + i * textLineBase);
  });
};

const renderCursor = (
  ctx: CanvasRenderingContext2D,
  titleLines: string[],
  width: number,
  height: number,
  color: string,
) => {
  const lastLineWidth = measureTextWithASCII(ctx, titleLines.at(-1));
  const cursorX = 50 + lastLineWidth + 10;
  const cursorY = (textLineBase * 2) + 30 +
    (titleLines.length - 1) * textLineBase;

  ctx.fillStyle = color;
  ctx.fillRect(cursorX, cursorY, width, height);
};

const render = (ctx: CanvasRenderingContext2D, params: Params) => {
  renderBackground(ctx, params.bgColor, params.width, params.height);
  renderTopStatusLine(
    ctx,
    params.topLineTexts,
    params.topLineItemColors,
    params.topLineBgColor,
    params.topLineBgText,
    params.topLineTextColor,
  );
  renderPrompt(ctx, 10, textLineBase * 2, params.promptColor);
  renderCommand(ctx, 80, textLineBase * 2, params.commandColor);
  const titleLines = breakLines(ctx, params.title, 1150);
  renderTitle(ctx, titleLines, 50, 300, params.titleColor);
  renderCursor(ctx, titleLines, 50, 100, params.cursorColor);
  renderBottomStatusLine(
    ctx,
    params.bottomLineTexts,
    titleLines,
    params.bottomLineItemColors,
    params.bottomLineBgColor,
    params.bottomLineBgText,
    params.bottomLineTextColor,
  );
};

export { render };
