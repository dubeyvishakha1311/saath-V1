import { Capacitor, CapacitorHttp } from "@capacitor/core";
import { CapacitorUpdater } from "@capgo/capacitor-updater";
import { createUpdateController } from "./updates.js";
import config from "./ota-config.json";
import pkg from "../package.json";
export function createNativeUpdater(ui) {
  return createUpdateController({
    ...ui,
    config,
    webVersion: pkg.version,
    native: Capacitor.getPlatform() === "android",
    plugin: CapacitorUpdater,
    async readEnvelope() {
      const result = await CapacitorHttp.get({
        url: `https://api.github.com/repos/${config.repo}/releases/tags/${config.channelTag}`,
        headers: { Accept: "application/vnd.github+json" },
        connectTimeout: 15000,
        readTimeout: 15000,
      });
      if (result.status === 404) return null;
      if (result.status !== 200) throw Error("Update service unavailable");
      const data =
        typeof result.data === "string" ? JSON.parse(result.data) : result.data;
      if (typeof data.body !== "string" || data.body.length > 50000)
        throw Error("Invalid update metadata");
      return JSON.parse(data.body);
    },
  });
}
