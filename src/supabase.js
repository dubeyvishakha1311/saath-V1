import { createClient } from "@supabase/supabase-js";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import config from "./supabase-config.json";

// Publishable configuration is intentionally shipped in the client. RLS is the
// authorization boundary; no database password or privileged key belongs here.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || config.url,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || config.publishableKey,
  {
    auth: {
      flowType: "pkce",
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "saath.auth.v1",
    },
  },
);
export function authRedirectURL(recovery = false) {
  return Capacitor.isNativePlatform()
    ? "in.saath.wellness://auth/callback"
    : `${window.location.origin}/?auth=${recovery ? "recovery" : "callback"}`;
}
export async function listenForNativeAuth(onError) {
  if (!Capacitor.isNativePlatform()) return;
  async function handle({ url }) {
    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      return;
    }
    if (
      parsed.protocol !== "in.saath.wellness:" ||
      parsed.host !== "auth" ||
      parsed.pathname !== "/callback"
    )
      return;
    const code = parsed.searchParams.get("code");
    if (!code) {
      onError();
      return;
    }
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) onError(); // Never log callback URLs, codes or session tokens.
  }
  await App.addListener("appUrlOpen", (details) => {
    handle(details).catch(onError);
  });
  const launch = await App.getLaunchUrl();
  if (launch?.url) await handle(launch);
}
