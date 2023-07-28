import { bundle } from "https://deno.land/x/emit/mod.ts";

const url = new URL(import.meta.resolve("./render.ts"));
const { code } = await bundle(url);

// NOTE: Workaround トランスパイルしたら連想配列のキーにマルチバイト文字が含まれていてクオートされていない状態になってしまうので無理やり判定してクォート付与
const keyQuotedCode = code.replace(/(\s)([a-zA-Z0-9_\uFF21-\uFF3A\uFF41-\uFF5A]*[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uFF66-\uFF9F\uFF10-\uFF19々]+[a-zA-Z0-9_\uFF21-\uFF3A\uFF41-\uFF5A]*)(:)/g, '$1"$2"$3');
// NOTE: Workaround export ... も不要なため削除
const exportRemovedCode = keyQuotedCode.replace(/(export { .+ };)$/gm, '/* $1 */');

Deno.writeTextFile("./static/app.js", exportRemovedCode);