import { assertEquals } from "https://deno.land/std@0.203.0/testing/asserts.ts";
import { getParams } from "./params.ts";
import { defaultTheme } from "./theme.ts";

Deno.test("getParams", () => {
  const url = new URL(
    "http://localhost:8080/?cursor_color=ff0000&prompt_color=00ff00&bg_color=0000ff&title_color=ffffff&command_color=000000&top_line_bg_color=000000&top_line_text_color=ffffff&bottom_line_bg_color=000000&bottom_line_text_color=ffffff&top_line_item_colors=ffffff&bottom_line_item_colors=ffffff&top_line_texts=swfz&bottom_line_texts=til",
  );
  const params = getParams(url);

  assertEquals(params, {
    title: "No Title",
    topLineTexts: ["swfz"],
    topLineTextColor: "#ffffff",
    topLineItemColors: ["#ffffff"],
    topLineBgText: null,
    topLineBgColor: "#000000",
    bgColor: "#0000ff",
    promptColor: "#00ff00",
    commandColor: "#000000",
    titleColor: "#ffffff",
    cursorColor: "#ff0000",
    bottomLineTexts: ["til"],
    bottomLineTextColor: "#ffffff",
    bottomLineItemColors: ["#ffffff"],
    bottomLineBgText: "Tags",
    bottomLineBgColor: "#000000",
  });
});

Deno.test("getParams default values", () => {
  const url = new URL(
    "http://localhost:8080/",
  );
  const params = getParams(url);

  assertEquals(params, {
    title: "No Title",
    topLineTexts: ["swfz", "til"],
    topLineTextColor: defaultTheme.topStatusLine.textColor,
    topLineItemColors: defaultTheme.topStatusLine.itemColors,
    topLineBgText: null,
    topLineBgColor: defaultTheme.topStatusLine.bgColor,
    bgColor: defaultTheme.bgColor,
    promptColor: defaultTheme.promptColor,
    commandColor: defaultTheme.commandColor,
    titleColor: defaultTheme.titleColor,
    cursorColor: defaultTheme.cursorColor,
    bottomLineTexts: [],
    bottomLineTextColor: defaultTheme.bottomStatusLine.textColor,
    bottomLineItemColors: defaultTheme.bottomStatusLine.itemColors,
    bottomLineBgText: "Tags",
    bottomLineBgColor: defaultTheme.bottomStatusLine.bgColor,
  });
});

Deno.test("getParams Full Parameter Specified", () => {
  const url = new URL(
    "http://localhost:8080/?title=なんかのテスト&top_line_bg_text=hoge&cursor_color=ff0000&prompt_color=00ff00&bg_color=0000ff&title_color=ffffff&command_color=000000&top_line_bg_color=000000&top_line_text_color=ffffff&bottom_line_bg_color=000000&bottom_line_text_color=ffffff&top_line_item_colors=ffffff,eeeeee,dddddd&bottom_line_item_colors=111111,222222,333333,444444&top_line_texts=swfz,til,test&bottom_line_texts=hoge,fuga,piyo&bottom_line_bg_text=Labels",
  );
  const params = getParams(url);

  assertEquals(params, {
    title: "なんかのテスト",
    topLineTexts: ["swfz", "til", "test"],
    topLineTextColor: "#ffffff",
    topLineItemColors: ["#ffffff", "#eeeeee", "#dddddd"],
    topLineBgText: "hoge",
    topLineBgColor: "#000000",
    bgColor: "#0000ff",
    promptColor: "#00ff00",
    commandColor: "#000000",
    titleColor: "#ffffff",
    cursorColor: "#ff0000",
    bottomLineTexts: ["hoge", "fuga", "piyo"],
    bottomLineTextColor: "#ffffff",
    bottomLineItemColors: ["#111111", "#222222", "#333333", "#444444"],
    bottomLineBgText: "Labels",
    bottomLineBgColor: "#000000",
  });
});
