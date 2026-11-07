import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";

// At the root, do not unexpectedly exit a wellness exercise or the app.
// Android's Home gesture remains available to leave the app.
if (Capacitor.isNativePlatform()) {
  App.addListener("backButton", () => {
    window.dispatchEvent(new Event("saath:back"));
  }).catch((error) =>
    console.warn("Could not register Android back navigation", error.code),
  );
}
