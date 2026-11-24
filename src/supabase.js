import { createNativeAuthHandler } from "./native-auth-callback.js";
import { createClient } from "@supabase/supabase-js";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import {
  beginGoogleSignIn,
  consumeAuthCallbackError,
} from "./google-sign-in.js";
import config from "./supabase-config.json";

// Publishable configuration is intentionally shipped in the client. RLS is the
// authorization boundary; no database password or privileged key belongs here.
const projectURL = import.meta.env.VITE_SUPABASE_URL || config.url;
const publishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || config.publishableKey;
export const supabase = createClient(projectURL, publishableKey, {
  auth: {
    flowType: "pkce",
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: "saath.auth.v1",
  },
});
export function authRedirectURL(recovery = false) {
  return Capacitor.isNativePlatform()
    ? "in.saath.wellness://auth/callback"
    : `${window.location.origin}/?auth=${recovery ? "recovery" : "callback"}`;
}
export function startGoogleSignIn() {
  return beginGoogleSignIn({
    client: supabase,
    projectURL,
    publishableKey,
    redirectTo: authRedirectURL(),
    native: Capacitor.isNativePlatform(),
    openExternal: (url) => Browser.open({ url }),
    navigate: (url) => window.location.assign(url),
  });
}
export async function listenForNativeAuth(onError) {
  if (!Capacitor.isNativePlatform()) return;
  const handle = createNativeAuthHandler({
    exchangeCode: (code) => supabase.auth.exchangeCodeForSession(code),
    closeBrowser: () => Browser.close(),
    onError,
  });
  await App.addListener("appUrlOpen", ({ url }) => {
    handle(url).catch(() => onError());
  });
  const launch = await App.getLaunchUrl();
  if (launch?.url) await handle(launch.url);
}

export function authCallbackFailed() {
  return consumeAuthCallbackError(window.location.href, (url) =>
    window.history.replaceState(window.history.state, "", url),
  );
}
