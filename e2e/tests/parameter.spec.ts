import { test, expect } from '@playwright/test';

// BottomStatusLine非表示
test('Empty Parameter', async ({ page }) => {
  await page.goto('http://localhost:8080');
  await expect(page).toHaveScreenshot();
});

// 全パラメータをデフォルトから変更する
test('All Parameter', async ({ page }) => {
  await page.goto('http://localhost:8080?title=Terminal%20Image%20VRTの開発中&top_line_texts=Blog,Title,hoge,fuga&bottom_line_texts=hoge,fuga,piyo,test&top_line_text_color=002834&top_line_item_colors=278bd2,2aa198,b58901,6c71c4&bottom_line_text_color=002834&bottom_line_item_colors=278bd2,2aa198,b58901,6c71c4&title_color=ffffff&command_color=93a1a1&prompt_color=d33682&cursor_color=fdf6e3&bg_color=002834&top_line_bg_color=2c545e&bottom_line_bg_color=2b555f&top_line_bg_text=Status&bottom_line_bg_text=Tags');
  await expect(page).toHaveScreenshot();
});

// top_line_texts4つ、TopStatuLineの背景を表示させる
test('Top StatusLine', async ({ page }) => {
  await page.goto('http://localhost:8080?title=Terminal%20Image%20URL%20Generatorのテスト中&top_line_texts=ブログ,Author,他,test');
  await expect(page).toHaveScreenshot();
});

// Tagsのテキストを書き換える
test('Bottom StatusLine', async ({ page }) => {
  await page.goto('http://localhost:8080??title=Terminal%20Image%20URL%20Generatorのテスト中&bottom_line_texts=Deno,Canvas,画像,test&bottom_line_bg_text=Tag');
  await expect(page).toHaveScreenshot();
});

// タイトル3行までのパターン
test('Title 3 Lines And Bottom Texts', async ({ page }) => {
  await page.goto('http://localhost:8080/?title=GA4%E3%81%AEBigQuery%E3%81%AB%E3%82%A8%E3%82%AF%E3%82%B9%E3%83%9D%E3%83%BC%E3%83%88%E3%81%97%E3%81%9F%E3%83%87%E3%83%BC%E3%82%BF%E3%81%AEevent%E5%80%A4%E3%81%AE%E6%A0%BC%E7%B4%8D%E3%82%AB%E3%83%A9%E3%83%A0%E3%81%8C%E3%82%A4%E3%83%99%E3%83%B3%E3%83%88%E3%81%AB%E3%82%88%E3%81%A3%E3%81%A6%E9%81%95%E3%81%86&bottom_line_texts=BigQuery,GA4');
  await expect(page).toHaveScreenshot();
});

// タイトル4行以上のパターン、Tagsと競合
test('Title 4 Lines And Bottom Texts', async ({ page }) => {
  await page.goto('http://localhost:8080/?title=GoogleSlide%E3%81%AE%E3%83%97%E3%83%AC%E3%82%BC%E3%83%B3%E3%83%86%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3%E3%83%A2%E3%83%BC%E3%83%89%E3%81%A7%E3%83%AC%E3%83%BC%E3%82%B6%E3%83%BC%E3%83%9D%E3%82%A4%E3%83%B3%E3%82%BF%E9%A2%A8%E8%A1%A8%E7%A4%BA%E3%81%AE%E3%82%B7%E3%83%A7%E3%83%BC%E3%83%88%E3%82%AB%E3%83%83%E3%83%88%E3%82%AD%E3%83%BC&bottom_line_texts=GoogleSlide');
  await expect(page).toHaveScreenshot();
});
