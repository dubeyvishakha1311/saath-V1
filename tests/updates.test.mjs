import { test } from "node:test";
import assert from "node:assert/strict";
import {
  generateKeyPairSync,
  sign,
  webcrypto,
  publicDecrypt,
  createDecipheriv,
  createHash,
  constants,
  createPublicKey,
} from "node:crypto";
import {
  createUpdateController,
  verifyRelease,
  compareVersions,
} from "../src/updates.js";
import {
  readFileSync,
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  cpSync,
  rmSync,
} from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
const { privateKey, publicKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
});
const config = {
  repo: "example/app",
  nativeFingerprint: "a".repeat(64),
  publicKeySpki: publicKey.export({ type: "spki", format: "pem" }),
};
function envelope(patch = {}) {
  const bytes = Buffer.from(
    JSON.stringify({
      schema: 1,
      platform: "android",
      nativeFingerprint: config.nativeFingerprint,
      version: "0.7.1",
      url: "https://github.com/example/app/releases/download/saath-web-0.7.1/saath-update.bin",
      size: 200,
      checksum: "f".repeat(512),
      sessionKey: "aaaa:bbbb",
      ...patch,
    }),
  );
  return {
    payload: bytes.toString("base64"),
    signature: sign("sha256", bytes, privateKey).toString("base64"),
  };
}
test("OTA signatures, runtime, source URL, version, platform and bounds are enforced before download", async () => {
  assert.equal(
    (await verifyRelease(envelope(), config, "0.7.0", webcrypto)).version,
    "0.7.1",
  );
  for (const patch of [
    { platform: "ios" },
    { nativeFingerprint: "b".repeat(64) },
    {
      url: "http://github.com/example/app/releases/download/saath-web-0.7.1/saath-update.bin",
    },
    { url: "https://attacker.invalid/bundle" },
    { size: 999999999 },
    { checksum: "unsigned" },
    { version: "01.7.1" },
    { sessionKey: "" },
  ])
    await assert.rejects(
      verifyRelease(envelope(patch), config, "0.7.0", webcrypto),
    );
  const bad = envelope();
  bad.payload = Buffer.from("{}").toString("base64");
  await assert.rejects(
    verifyRelease(bad, config, "0.7.0", webcrypto),
    /signature/,
  );
  await assert.rejects(
    verifyRelease(
      envelope(),
      { ...config, publicKeySpki: "" },
      "0.7.0",
      webcrypto,
    ),
  );
  assert.equal(
    await verifyRelease(envelope(), config, "0.7.1", webcrypto),
    null,
  );
  assert.equal(
    await verifyRelease(envelope(), config, "0.8.0", webcrypto),
    null,
  );
  assert.equal(compareVersions("0.7.10", "0.7.2"), 1);
  assert.throws(() => compareVersions("999999999999999999999.1.1", "0.7.0"));
});
function fixture({ native = true, enabled = true, failed = false } = {}) {
  let page = "settings",
    accountBusy = false,
    confirmed = true;
  const calls = [];
  const options = {
    native,
    config: enabled ? config : { ...config, publicKeySpki: "" },
    webVersion: "0.7.0",
    cryptoAPI: webcrypto,
    getPage: () => page,
    accountBusy: () => accountBusy,
    confirm: () => confirmed,
    t: (en) => en,
    escape: (s) => String(s),
    render: () => {},
    readEnvelope: async () => {
      calls.push("feed");
      return envelope();
    },
    plugin: {
      notifyAppReady: async () => calls.push("ready"),
      current: async () => ({
        bundle: { version: "builtin" },
        native: "0.7.0",
      }),
      list: async () => ({
        bundles: failed ? [{ version: "0.7.1", status: "error" }] : [],
      }),
      download: async (o) => {
        calls.push(["download", o]);
        return { id: "fixture-bundle", version: o.version };
      },
      set: async (o) => calls.push(["set", o]),
      reset: async (o) => calls.push(["reset", o]),
    },
  };
  const controller = createUpdateController(options);
  return {
    controller,
    calls,
    options,
    setPage: (p) => {
      page = p;
    },
    busy: (v) => {
      accountBusy = v;
    },
    confirm: (v) => {
      confirmed = v;
    },
  };
}
async function settled(f) {
  for (let i = 0; i < 200 && f.controller.isBusy(); i++)
    await new Promise((r) => setTimeout(r, 5));
  assert.equal(f.controller.isBusy(), false);
}
test("OTA boot acknowledges healthy render, checks metadata but never auto-downloads/restarts", async () => {
  const f = fixture();
  await f.controller.boot();
  assert.deepEqual(f.calls, ["ready", "feed"]);
  assert.match(f.controller.renderCard(), /Download verified update/);
  assert.doesNotMatch(f.controller.renderCard(), /Restart &amp;/);
});
test("OTA only applies after an explicit Settings confirmation, never on crisis/journal or during account operations", async () => {
  const f = fixture();
  await f.controller.boot();
  f.controller.handle("update-download");
  await settled(f);
  assert.equal(
    f.calls.filter((x) => Array.isArray(x) && x[0] === "download").length,
    1,
  );
  for (const page of ["panic", "crisis", "journal", "login"]) {
    f.setPage(page);
    f.controller.handle("update-install");
    await settled(f);
  }
  f.setPage("settings");
  f.busy(true);
  f.controller.handle("update-install");
  f.busy(false);
  f.confirm(false);
  f.controller.handle("update-install");
  assert.equal(
    f.calls.some((x) => x[0] === "set"),
    false,
  );
  f.confirm(true);
  f.controller.handle("update-install");
  await settled(f);
  assert.deepEqual(f.calls.at(-1), ["set", { id: "fixture-bundle" }]);
});
test("background download finishing during crisis never schedules or applies itself; failed downloads keep current app", async () => {
  const f = fixture();
  await f.controller.boot();
  let finish;
  f.options.plugin.download = () =>
    new Promise((r) => {
      finish = r;
    });
  f.controller.handle("update-download");
  f.setPage("crisis");
  finish({ id: "fixture-bundle", version: "0.7.1" });
  await settled(f);
  assert.equal(
    f.calls.some((x) => Array.isArray(x) && x[0] === "set"),
    false,
  );
  const g = fixture();
  await g.controller.boot();
  g.options.plugin.download = async () => {
    throw Error("offline");
  };
  g.controller.handle("update-download");
  await settled(g);
  assert.match(g.controller.renderCard(), /current app and notebook are kept/);
  assert.equal(
    g.calls.some((x) => x[0] === "set"),
    false,
  );
});
test("unconfigured/web builds make no network check; failed releases are blocked; reset requires Settings confirmation", async () => {
  for (const opts of [{ native: false }, { enabled: false }]) {
    const f = fixture(opts);
    await f.controller.boot();
    f.controller.handle("update-check");
    await settled(f);
    assert.equal(f.calls.includes("feed"), false);
  }
  const f = fixture({ failed: true });
  await f.controller.boot();
  assert.match(f.controller.renderCard(), /failed its previous startup/);
  f.controller.handle("update-download");
  await settled(f);
  assert.equal(
    f.calls.some((x) => x[0] === "download"),
    false,
  );
  f.setPage("crisis");
  f.controller.handle("update-reset");
  assert.equal(
    f.calls.some((x) => x[0] === "reset"),
    false,
  );
  f.setPage("settings");
  f.controller.handle("update-reset");
  await settled(f);
  assert.deepEqual(f.calls.at(-1), ["reset", { toLastSuccessful: false }]);
});
test("withdrawing a release clears pending installation; checksums/session keys are passed intact to native verification", async () => {
  const f = fixture();
  await f.controller.boot();
  f.controller.handle("update-download");
  await settled(f);
  const request = f.calls.find(
    (x) => Array.isArray(x) && x[0] === "download",
  )[1];
  assert.equal(request.checksum, "f".repeat(512));
  assert.equal(request.sessionKey, "aaaa:bbbb");
  f.options.readEnvelope = async () => null;
  f.controller.handle("update-check");
  await settled(f);
  f.controller.handle("update-install");
  assert.equal(
    f.calls.some((x) => x[0] === "set"),
    false,
  );
});
test("packager creates signed manifest and native-compatible RSA/AES/SHA256 bundle and rejects native changes", async () => {
  const dir = mkdtempSync(join(tmpdir(), "saath-ota-test-"));
  try {
    for (const path of ["src", "scripts", "android", "dist"])
      mkdirSync(join(dir, path));
    for (const file of ["package-ota.mjs", "ota-fingerprint.mjs"])
      cpSync(
        new URL("../scripts/" + file, import.meta.url),
        join(dir, "scripts", file),
      );
    writeFileSync(
      join(dir, "package.json"),
      JSON.stringify({ type: "module", version: "0.7.1", dependencies: {} }),
    );
    writeFileSync(
      join(dir, "capacitor.config.json"),
      JSON.stringify({
        plugins: {
          CapacitorUpdater: {
            publicKey: publicKey.export({ type: "pkcs1", format: "pem" }),
          },
        },
      }),
    );
    writeFileSync(join(dir, "android", "native.txt"), "native ABI");
    writeFileSync(
      join(dir, "dist", "index.html"),
      '<script src="app.js"></script>',
    );
    writeFileSync(join(dir, "dist", "app.js"), 'console.log("fixture")');
    const c = { ...config, nativeVersion: "0.7.0" };
    writeFileSync(join(dir, "src", "ota-config.json"), JSON.stringify(c));
    execFileSync(process.execPath, ["scripts/ota-fingerprint.mjs", "--write"], {
      cwd: dir,
    });
    const env = {
      ...process.env,
      SAATH_OTA_SIGNING_KEY: privateKey.export({
        type: "pkcs8",
        format: "pem",
      }),
    };
    execFileSync(process.execPath, ["scripts/package-ota.mjs"], {
      cwd: dir,
      env,
    });
    const cfg = JSON.parse(readFileSync(join(dir, "src", "ota-config.json")));
    const signed = JSON.parse(
      readFileSync(join(dir, "ota-release", "saath-update.json")),
    );
    const release = await verifyRelease(signed, cfg, "0.7.0", webcrypto);
    const [iv, key] = release.sessionKey.split(":");
    const decrypt = (bytes) =>
      publicDecrypt(
        { key: publicKey, padding: constants.RSA_PKCS1_PADDING },
        bytes,
      );
    const aes = decrypt(Buffer.from(key, "base64"));
    const cipher = createDecipheriv(
      "aes-128-cbc",
      aes,
      Buffer.from(iv, "base64"),
    );
    const plain = Buffer.concat([
      cipher.update(readFileSync(join(dir, "ota-release", "saath-update.bin"))),
      cipher.final(),
    ]);
    assert.equal(plain.subarray(0, 2).toString(), "PK");
    assert.equal(
      decrypt(Buffer.from(release.checksum, "hex")).toString("hex"),
      createHash("sha256").update(plain).digest("hex"),
    );
    writeFileSync(join(dir, "android", "native.txt"), "native CHANGED");
    assert.throws(() =>
      execFileSync(process.execPath, ["scripts/package-ota.mjs"], {
        cwd: dir,
        env,
        stdio: "pipe",
      }),
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
