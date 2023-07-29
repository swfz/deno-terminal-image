import { defaultTheme } from "./theme.ts";

const isValidColorCode = (str: string) => {
  return /^([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(str);
};

const getColor = (url: URL, key: string) => {
  const param = url.searchParams.get(key) ?? "";

  return isValidColorCode(param) ? `#${param}` : null;
};

const getColors = (url: URL, key: string) => {
  const param = url.searchParams.get(key) ?? null;

  if (!param) {
    return null;
  }

  return param.split(",").filter((p) => isValidColorCode(p)).map((p) => `#${p}`);
};

const snakeToCamel = (s: string) => {
  return s.replace(/(_\w)/g, function (m) {
    return m[1].toUpperCase();
  });
};

const getParams = (url: URL) => {
  const bottomLineTextsParam = url.searchParams.get("bottom_line_texts");
  const topLineTextsParam = url.searchParams.get("top_line_texts");
  const bottomLineTexts = bottomLineTextsParam ? bottomLineTextsParam.split(",") : [];
  const topLineTexts = topLineTextsParam ? topLineTextsParam.split(",") : ["swfz", "til"];

  const colorParams = ["cursor_color", "prompt_color", "bg_color", "title_color", "command_color"].reduce(
    (acc, key) => {
      acc[snakeToCamel(key)] = getColor(url, key) ?? defaultTheme[snakeToCamel(key)];

      return acc;
    },
    {},
  );

  const statusLineColorParams = [
    "top_line_bg_color",
    "top_line_text_color",
    "bottom_line_bg_color",
    "bottom_line_text_color",
    "top_line_item_colors",
    "bottom_line_item_colors",
  ].reduce((acc, key) => {
    const statusLine = key.includes("top_") ? "topStatusLine" : "bottomStatusLine";
    if (key.endsWith("_colors")) {
      acc[snakeToCamel(key)] = getColors(url, key) ?? defaultTheme[statusLine].itemColors;
    } else {
      const k = snakeToCamel(key.split("_").slice(2).join("_"));
      acc[snakeToCamel(key)] = getColor(url, key) ?? defaultTheme[statusLine][k];
    }
    return acc;
  }, {});

  return {
    topLineTexts,
    bottomLineTexts,
    ...colorParams,
    ...statusLineColorParams,
    title: url.searchParams.get("title") ?? "No Title",
    bottomLineBgText: url.searchParams.get("bottom_line_bg_text") ?? "Tags",
    topLineBgText: url.searchParams.get("top_line_bg_text") ?? null,
  };
};

export { getParams };
