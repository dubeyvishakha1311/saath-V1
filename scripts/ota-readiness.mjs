import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { configured } from "../src/updates.js";

// Only a preliminary publication gate. The packager independently validates
// matching keys, signatures, the immutable version and native compatibility.
export function otaReady(config, bootstrapReady) {
  return Boolean(configured(config) && bootstrapReady === "true");
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const config = JSON.parse(readFileSync("src/ota-config.json", "utf8"));
  console.log(otaReady(config, process.env.BOOTSTRAP_READY));
}
