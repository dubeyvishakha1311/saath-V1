import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  rmSync,
  lstatSync,
  readdirSync,
} from "node:fs";
import {
  createCipheriv,
  createHash,
  privateEncrypt,
  createPrivateKey,
  createPublicKey,
  randomBytes,
  sign,
  constants,
} from "node:crypto";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { nativeFingerprint } from "./ota-fingerprint.mjs";
const config = JSON.parse(readFileSync("src/ota-config.json"));
const version = JSON.parse(readFileSync("package.json")).version;
if (
  !/^\d+\.\d+\.\d+$/.test(version) ||
  !config.publicKeySpki ||
  nativeFingerprint() !== config.nativeFingerprint
)
  throw Error(
    "Signing not configured or native runtime changed. A new bootstrap APK is required.",
  );
const cap = JSON.parse(readFileSync("capacitor.config.json"));
if (
  createPublicKey(cap.plugins.CapacitorUpdater.publicKey).export({
    type: "spki",
    format: "pem",
  }) !== config.publicKeySpki
)
  throw Error("Native and web trust keys do not match");
const key = createPrivateKey(process.env.SAATH_OTA_SIGNING_KEY || "");
if (
  createPublicKey(key).export({ type: "spki", format: "pem" }) !==
  config.publicKeySpki
)
  throw Error("Signing key does not match pinned key");
if (!readFileSync("dist/index.html", "utf8").includes("script"))
  throw Error("Build web assets first");
function noLinks(dir) {
  for (const name of readdirSync(dir)) {
    const p = dir + "/" + name,
      s = lstatSync(p);
    if (s.isSymbolicLink()) throw Error("Bundle symlink forbidden");
    if (s.isDirectory()) noLinks(p);
  }
}
noLinks("dist");
mkdirSync("ota-release", { recursive: true });
const zip = resolve("ota-release/bundle.zip");
rmSync(zip, { force: true });
execFileSync("zip", ["-qr", zip, "."], { cwd: "dist" });
const plain = readFileSync(zip);
if (plain.length > 20 * 1024 * 1024 - 16) throw Error("Bundle exceeds 20 MiB");
const aes = randomBytes(16),
  iv = randomBytes(16),
  cipher = createCipheriv("aes-128-cbc", aes, iv);
const encrypted = Buffer.concat([cipher.update(plain), cipher.final()]);
const encrypt = (bytes) =>
  privateEncrypt({ key, padding: constants.RSA_PKCS1_PADDING }, bytes);
const release = {
  schema: 1,
  platform: "android",
  nativeFingerprint: config.nativeFingerprint,
  version,
  url: `https://github.com/${config.repo}/releases/download/saath-web-${version}/saath-update.bin`,
  size: encrypted.length,
  checksum: encrypt(createHash("sha256").update(plain).digest()).toString(
    "hex",
  ),
  sessionKey: iv.toString("base64") + ":" + encrypt(aes).toString("base64"),
};
const bytes = Buffer.from(JSON.stringify(release));
const envelope = {
  payload: bytes.toString("base64"),
  signature: sign("sha256", bytes, key).toString("base64"),
};
writeFileSync("ota-release/saath-update.bin", encrypted);
writeFileSync("ota-release/saath-update.json", JSON.stringify(envelope));
rmSync(zip);
console.log(`Packaged signed web release ${version}; no private key included.`);
