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

const triangleBase = 40;
const statusLineBase = 80;

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

const renderPrompt = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
  ctx.fillStyle = color;
  ctx.fillText("$", x, y);
};

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
  ctx.fillStyle = fixed.color;
  ctx.fillText(item.text, item.position.text, fixed.textY);
};

const renderBottomStatusLine = (
  ctx: CanvasRenderingContext2D,
  texts: string[],
  colors: string[],
  color: string,
) => {
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
    color: color,
  };

  texts.reverse().forEach((tag, i) => {
    const item = {
      text: tag,
      color: colors[i] || '#000',
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
  color: string
) => {
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
      color: colors[i] || '#000',
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

export {
  renderTriangle,
  renderPrompt,
  renderBottomStatusLine,
  renderTopStatusLine,
  renderStatusLineItem,
  measureTextWithASCII,
  breakLines
}