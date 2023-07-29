import { defaultTheme } from "./theme.ts";

interface Params {
  title: string;
  topLineTexts: string[];
  topLineTextColor: string;
  topLineItemColors: string[];
  topLineBgText: string | null;
  topLineBgColor: string;
  bgColor: string;
  promptColor: string;
  commandColor: string;
  titleColor: string;
  cursorColor: string;
  bottomLineTexts: string[];
  bottomLineTextColor: string;
  bottomLineItemColors: string[];
  bottomLineBgText: string;
  bottomLineBgColor: string;
}

type ColorParams = Pick<Params, "cursorColor" | "promptColor" | "bgColor" | "titleColor" | "commandColor">;
type StatusLineColorParams = Pick<
  Params,
  | "topLineBgColor"
  | "topLineTextColor"
  | "bottomLineBgColor"
  | "bottomLineTextColor"
  | "topLineItemColors"
  | "bottomLineItemColors"
>;

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

const getParams = (url: URL): Params => {
  const bottomLineTextsParam = url.searchParams.get("bottom_line_texts");
  const topLineTextsParam = url.searchParams.get("top_line_texts");
  const bottomLineTexts = bottomLineTextsParam ? bottomLineTextsParam.split(",") : [];
  const topLineTexts = topLineTextsParam ? topLineTextsParam.split(",") : ["swfz", "til"];

  const colorParams = ["cursor_color", "prompt_color", "bg_color", "title_color", "command_color"].reduce(
    (acc, key) => {
      const k = snakeToCamel(key);
      if (k === "cursorColor" || k === "promptColor" || k === "bgColor" || k === "titleColor" || k === "commandColor") {
        acc[k] = getColor(url, key) ?? defaultTheme[k];
      }

      return acc;
    },
    {} as ColorParams,
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
      const k = snakeToCamel(key);
      if (k === "topLineItemColors" || k === "bottomLineItemColors") {
        acc[k] = getColors(url, key) ?? defaultTheme[statusLine].itemColors;
      }
    } else {
      const k = snakeToCamel(key.split("_").slice(2).join("_"));
      if (k === "textColor" || k === "bgColor") {
        const paramKey = snakeToCamel(key);
        if (
          paramKey === "topLineBgColor" || paramKey === "bottomLineBgColor" || paramKey === "topLineTextColor" ||
          paramKey === "bottomLineTextColor"
        ) {
          acc[paramKey] = getColor(url, key) ?? defaultTheme[statusLine][k];
        }
      }
    }
    return acc;
  }, {} as StatusLineColorParams);

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
export type { Params };
