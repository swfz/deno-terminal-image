import { bundle } from "https://deno.land/x/emit@0.31.2/mod.ts";

const bundleCode = async (file: string) => {
  const url = new URL(import.meta.resolve(file));
  const { code } = await bundle(url);

  // NOTE: Workaround トランスパイルしたら連想配列のキーにマルチバイト文字が含まれていてクオートされていない状態になってしまうので無理やり判定してクォート付与
  const keyQuotedCode = code.replace(
    /(\s)([a-zA-Z0-9_\uFF21-\uFF3A\uFF41-\uFF5A]*[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uFF66-\uFF9F\uFF10-\uFF19々]+[a-zA-Z0-9_\uFF21-\uFF3A\uFF41-\uFF5A]*)(:)/g,
    '$1"$2"$3',
  );
  // NOTE: Workaround export ... も不要なため削除
  const exportRemovedCode = keyQuotedCode.replace(
    /(export { .+ };)$/gm,
    "/* $1 */",
  );

  return exportRemovedCode;
};

const renderCode = await bundleCode("./render.ts");
const themeCode = await bundleCode("./theme.ts");

Deno.writeTextFile("./static/app.js", renderCode + "\n" + themeCode);
