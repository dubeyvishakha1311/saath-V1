// One-time provisioning: private key goes straight to a GitHub Actions secret,
// never a repository/workspace file or console. Only public keys are retained.
import { generateKeyPairSync } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
const repo = "dubeyvishakha1311/saath-V1";
if (
  existsSync("src/ota-config.json") &&
  JSON.parse(readFileSync("src/ota-config.json")).publicKeySpki
)
  throw Error(
    "OTA already configured; never silently rotate a deployed trust key.",
  );
const secrets = JSON.parse(
  execFileSync("gh", ["api", `repos/${repo}/actions/secrets`], {
    encoding: "utf8",
  }),
);
if (secrets.secrets.some((s) => s.name === "SAATH_OTA_SIGNING_KEY"))
  throw Error(
    "Signing secret already exists; reconcile its public key instead of overwriting.",
  );
const { privateKey, publicKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
});
const pem = privateKey.export({ type: "pkcs8", format: "pem" });
execFileSync("gh", ["secret", "set", "SAATH_OTA_SIGNING_KEY", "--repo", repo], {
  input: pem,
  stdio: ["pipe", "pipe", "pipe"],
});
const cap = JSON.parse(readFileSync("capacitor.config.json"));
cap.plugins = {
  ...cap.plugins,
  CapacitorUpdater: {
    autoUpdate: false,
    statsUrl: "",
    channelUrl: "",
    updateUrl: "",
    allowModifyUrl: false,
    autoDeleteFailed: false,
    autoDeletePrevious: false,
    appReadyTimeout: 30000,
    responseTimeout: 20,
    publicKey: publicKey.export({ type: "pkcs1", format: "pem" }),
  },
};
writeFileSync("capacitor.config.json", JSON.stringify(cap, null, 2) + "\n");
writeFileSync(
  "src/ota-config.json",
  JSON.stringify(
    {
      repo,
      channelTag: "saath-ota-stable",
      nativeVersion: "0.7.0",
      nativeFingerprint: "PENDING",
      publicKeySpki: publicKey.export({ type: "spki", format: "pem" }),
    },
    null,
    2,
  ) + "\n",
);
console.log(
  "OTA public key pinned; private signing key stored only in GitHub Actions secret SAATH_OTA_SIGNING_KEY.",
);
