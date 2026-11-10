const versionPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
export function compareVersions(a, b) {
  if (!versionPattern.test(a) || !versionPattern.test(b))
    throw Error("Invalid version");
  const x = a.split(".").map(Number),
    y = b.split(".").map(Number);
  if (![...x, ...y].every(Number.isSafeInteger)) throw Error("Invalid version");
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] > y[i] ? 1 : -1;
  return 0;
}
const decode = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
export function configured(config) {
  return (
    /^[a-f0-9]{64}$/.test(config.nativeFingerprint) &&
    config.publicKeySpki?.startsWith("-----BEGIN PUBLIC KEY-----")
  );
}
export async function verifyRelease(
  envelope,
  config,
  currentVersion,
  cryptoAPI = globalThis.crypto,
) {
  if (
    !configured(config) ||
    !envelope ||
    typeof envelope.payload !== "string" ||
    typeof envelope.signature !== "string" ||
    envelope.payload.length > 32768 ||
    envelope.signature.length > 1024
  )
    throw Error("Invalid release envelope");
  const pem = config.publicKeySpki.replace(/-----[^-]+-----|\s/g, "");
  const key = await cryptoAPI.subtle.importKey(
    "spki",
    decode(pem),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const bytes = decode(envelope.payload);
  if (
    !(await cryptoAPI.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      key,
      decode(envelope.signature),
      bytes,
    ))
  )
    throw Error("Release signature rejected");
  const release = JSON.parse(new TextDecoder().decode(bytes));
  const url = new URL(release.url);
  const prefix = `/${config.repo}/releases/download/saath-web-${release.version}/`;
  if (
    release.schema !== 1 ||
    release.platform !== "android" ||
    release.nativeFingerprint !== config.nativeFingerprint ||
    !versionPattern.test(release.version) ||
    url.origin !== "https://github.com" ||
    url.username ||
    url.password ||
    url.pathname !== prefix + "saath-update.bin" ||
    url.search ||
    url.hash ||
    !Number.isSafeInteger(release.size) ||
    release.size < 1 ||
    release.size > 20 * 1024 * 1024 ||
    !/^([a-f0-9]{512})$/.test(release.checksum) ||
    typeof release.sessionKey !== "string" ||
    !/^[-A-Za-z0-9+/=]+:[-A-Za-z0-9+/=]+$/.test(release.sessionKey)
  )
    throw Error("Incompatible or invalid release");
  if (compareVersions(release.version, currentVersion) <= 0) return null;
  return release;
}
export function createUpdateController(c) {
  let busy = false,
    message = "",
    current = c.webVersion,
    release = null,
    downloaded = null,
    booted = false;
  const tr = (en, hi) => c.t(en, hi);
  const refresh = () => {
    if (c.getPage() === "settings") c.render();
  };
  const say = (en, hi) => {
    message = tr(en, hi);
    refresh();
  };
  async function run(fn) {
    if (busy) return;
    busy = true;
    refresh();
    try {
      await fn();
    } catch {
      say(
        "Update could not be completed. Your current app and notebook are kept. Check your connection or contact the release owner.",
        "अपडेट पूरा नहीं हुआ। वर्तमान ऐप और डायरी रखी गई हैं। कनेक्शन जाँचें या रिलीज़ मालिक से संपर्क करें।",
      );
    } finally {
      busy = false;
      refresh();
    }
  }
  async function check() {
    if (!c.native || !configured(c.config)) return;
    const envelope = await c.readEnvelope();
    if (!envelope) {
      release = null;
      downloaded = null;
      say(
        "No published update is available yet.",
        "अभी कोई प्रकाशित अपडेट उपलब्ध नहीं है।",
      );
      return;
    }
    const next = await verifyRelease(envelope, c.config, current, c.cryptoAPI);
    if (!next) {
      release = null;
      downloaded = null;
      say(
        "You have the latest compatible published version.",
        "आपके पास नवीनतम संगत प्रकाशित संस्करण है।",
      );
      return;
    }
    const { bundles } = await c.plugin.list();
    if (
      bundles.some((b) => b.version === next.version && b.status === "error")
    ) {
      release = null;
      downloaded = null;
      say(
        "This release failed its previous startup check. It will not be retried; wait for a new release.",
        "यह रिलीज़ पिछली स्टार्टअप जाँच में विफल हुई। इसे फिर नहीं लगाएँगे; नई रिलीज़ की प्रतीक्षा करें।",
      );
      return;
    }
    if (release?.version !== next.version) downloaded = null;
    release = next;
    say(
      "A verified web update is available. Download it here, then choose when to restart.",
      "एक सत्यापित वेब अपडेट उपलब्ध है। यहाँ डाउनलोड करें, फिर रीस्टार्ट का समय चुनें।",
    );
  }
  async function boot() {
    if (booted || !c.native) return;
    booted = true;
    // Called only after the first screen and navigation successfully rendered.
    await c.plugin.notifyAppReady();
    const info = await c.plugin.current();
    current =
      info.bundle.version === "builtin" ? c.webVersion : info.bundle.version;
    refresh();
    if (configured(c.config)) await run(check);
  }
  function renderCard() {
    const ready = configured(c.config);
    return `<section class="card" id="app-updates"><h2>${tr("App updates", "ऐप अपडेट")}</h2><p>${tr("Web version", "वेब संस्करण")}: ${c.escape(current)}</p><p>${tr("Most screen, content and JavaScript fixes can arrive without reinstalling. Native features, Android permissions and plugins still need a new APK. Updates never upload your notebook.", "अधिकांश स्क्रीन, सामग्री और JavaScript सुधार दोबारा इंस्टॉल किए बिना आ सकते हैं। नेटिव सुविधाओं, Android अनुमतियों और प्लगइन के लिए नया APK चाहिए। अपडेट आपकी डायरी अपलोड नहीं करते।")}</p><p class="notice">${!c.native ? tr("Browser preview: refresh the website for changes. OTA installation is Android-only.", "ब्राउज़र प्रीव्यू: बदलाव के लिए वेबसाइट रिफ्रेश करें। OTA इंस्टॉलेशन केवल Android में है।") : !ready ? tr("Update delivery is not activated: the owner must provision the signing key and build the one-time updater APK first. Unsigned updates are blocked.", "अपडेट वितरण सक्रिय नहीं है: मालिक को साइनिंग कुंजी सेट करके एक बार updater APK बनाना होगा। बिना हस्ताक्षर के अपडेट रोके गए हैं।") : tr("Checks contact GitHub for public release metadata on app launch. Downloading is your choice. Restart only here, when you are ready—not during writing or crisis help.", "ऐप शुरू होने पर सार्वजनिक रिलीज़ जानकारी के लिए GitHub से जाँच होती है। डाउनलोड करना आपकी पसंद है। तैयार होने पर केवल यहाँ रीस्टार्ट करें—लिखते समय या संकट सहायता के बीच नहीं।")}</p><p id="update-status" role="status" aria-live="polite">${c.escape(message || (busy ? tr("Working…", "काम चल रहा है…") : ""))}</p>${c.native && ready ? `<div class="row"><button data-action="update-check" ${busy ? "disabled" : ""}>${tr("Check for updates", "अपडेट जाँचें")}</button>${release && !downloaded ? `<button data-action="update-download" ${busy ? "disabled" : ""}>${tr("Download verified update", "सत्यापित अपडेट डाउनलोड करें")}</button>` : ""}${downloaded ? `<button class="primary" data-action="update-install" ${busy ? "disabled" : ""}>${tr("Restart & install update", "रीस्टार्ट करके अपडेट लगाएँ")}</button>` : ""}</div><button class="text-button" data-action="update-reset" ${busy ? "disabled" : ""}>${tr("Return to installed APK version", "इंस्टॉल किए APK संस्करण पर लौटें")}</button>` : ""}</section>`;
  }
  function handle(action) {
    if (!action.startsWith("update-")) return false;
    if (busy || !c.native || !configured(c.config)) return true;
    if (action === "update-check") run(check);
    if (action === "update-download" && release)
      run(async () => {
        const result = await c.plugin.download({
          url: release.url,
          version: release.version,
          checksum: release.checksum,
          sessionKey: release.sessionKey,
        });
        if (!result?.id || result.version !== release.version)
          throw Error("Download failed");
        downloaded = result;
        say(
          "Verified update downloaded. It will NOT restart automatically. Return to My space when ready.",
          "सत्यापित अपडेट डाउनलोड है। अपने आप रीस्टार्ट नहीं होगा। तैयार होने पर मेरी जगह पर लौटें।",
        );
      });
    if (["update-install", "update-reset"].includes(action)) {
      if (c.getPage() !== "settings" || c.accountBusy()) return true;
      if (action === "update-install" && !downloaded) return true;
      if (
        !c.confirm(
          tr(
            "Restart Saath now? Local saved drafts are kept. Finish any current writing or support activity first.",
            "अभी साथ रीस्टार्ट करें? सेव स्थानीय ड्राफ़्ट रखे जाएँगे। पहले लिखना या सहायता गतिविधि पूरी करें।",
          ),
        )
      )
        return true;
      if (c.getPage() !== "settings" || c.accountBusy()) return true;
      run(async () => {
        if (action === "update-reset")
          await c.plugin.reset({ toLastSuccessful: false });
        else await c.plugin.set({ id: downloaded.id });
      });
    }
    return true;
  }
  return {
    boot,
    renderCard,
    handle,
    isBusy: () => busy,
    versionLabel: () => current,
  };
}
