import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
export function nativeFingerprint() {
  const files = ["capacitor.config.json"];
  function walk(dir) {
    for (const f of readdirSync(dir, { withFileTypes: true })) {
      const path = dir + "/" + f.name;
      if (
        ["build", ".gradle", ".git", "local.properties"].includes(f.name) ||
        path === "android/app/src/main/assets/public"
      )
        continue;
      if (f.isSymbolicLink()) throw Error("Native symlink not allowed");
      if (f.isDirectory()) walk(path);
      else files.push(path);
    }
  }
  walk("android");
  const pkg = JSON.parse(readFileSync("package.json"));
  const plugins = Object.entries(pkg.dependencies)
    .filter(([name]) => {
      try {
        return (
          !!JSON.parse(readFileSync(`node_modules/${name}/package.json`))
            .capacitor || name.startsWith("@capacitor/")
        );
      } catch {
        return false;
      }
    })
    .map(([name, spec]) => [
      name,
      spec,
      JSON.parse(readFileSync(`node_modules/${name}/package.json`)).version,
    ])
    .sort();
  const hash = createHash("sha256").update(JSON.stringify(plugins));
  for (const file of files.sort())
    hash
      .update(file + "\0")
      .update(readFileSync(file))
      .update("\0");
  return hash.digest("hex");
}
if (process.argv.includes("--write")) {
  const config = JSON.parse(readFileSync("src/ota-config.json"));
  if (!config.publicKeySpki)
    throw Error(
      "Provision signing key first. Never distribute an unsigned updater APK.",
    );
  config.nativeFingerprint = nativeFingerprint();
  writeFileSync("src/ota-config.json", JSON.stringify(config, null, 2) + "\n");
  console.log(
    "Native compatibility baseline recorded. Build/distribute the bootstrap APK before publishing updates for this runtime.",
  );
}
