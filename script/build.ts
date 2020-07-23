import {
  ensureDir,
  walk,
  readFileStr,
  writeFileStr,
  ensureFile,
  copy,
} from "https://deno.land/std/fs/mod.ts";

export async function build() {
  await ensureDir("./dist");
  const sources = {} as Record<string, string>;
  for await (const item of walk("./src")) {
    if (
      item.isFile && item.path.endsWith(".ts") &&
      !item.path.endsWith("_test.ts")
    ) {
      sources[item.path] = await readFileStr(item.path);
    }
  }
  console.log(sources);
  return;
  const [diagnostics, emit] = await Deno.compile(
    "./src/main.ts",
    sources,
    { lib: ["dom", "esnext"] },
  );
  for (let [filename, content] of Object.entries(emit)) {
    const distfile = "./dist" + filename.substring(3);
    if (distfile.endsWith(".js")) {
      const filter_ts_import = /from "(.*)\.ts"/;
      content = (content.replace(filter_ts_import, 'from "$1.js"'));
    }
    await ensureFile(distfile);
    writeFileStr(distfile, content);
  }
  await copy("./src/index.html", "./dist/index.html");
}

if (import.meta.main) {
  build();
}
