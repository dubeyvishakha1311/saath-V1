// Both platforms use Supabase PKCE. Android opens a system browser/Custom Tab,
// never an embedded WebView (Google rejects embedded OAuth user agents).
export async function beginGoogleSignIn({
  client,
  projectURL,
  publishableKey,
  redirectTo,
  native,
  openExternal,
  navigate,
  fetchImpl = fetch,
}) {
  let providers;
  try {
    const settings = await fetchImpl(`${projectURL}/auth/v1/settings`, {
      headers: { apikey: publishableKey },
      cache: "no-store",
      credentials: "omit",
      signal: AbortSignal.timeout(15000),
    });
    if (!settings.ok) throw new Error("Auth unavailable");
    providers = await settings.json();
    if (typeof providers?.external?.google !== "boolean")
      throw new Error("Unknown provider status");
  } catch {
    const error = new Error("Could not check Google availability");
    error.code = "google_settings_unavailable";
    throw error;
  }
  if (providers.external.google !== true) {
    const error = new Error("Google provider is not configured");
    error.code = "google_provider_disabled";
    throw error;
  }
  const { data, error } = await client.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      skipBrowserRedirect: true,
      queryParams: { prompt: "select_account" },
    },
  });
  if (error) throw error;
  const target = new URL(data?.url);
  if (
    target.origin !== new URL(projectURL).origin ||
    target.pathname !== "/auth/v1/authorize" ||
    target.protocol !== "https:" ||
    target.username ||
    target.password ||
    target.hash ||
    target.searchParams.get("provider") !== "google"
  )
    throw new Error("Invalid authorization URL");
  if (native) await openExternal(target.href);
  else navigate(target.href);
}

// Surface a cancelled/failed provider callback without reflecting provider text
// or leaving error descriptions (which may contain identifying data) in URLs.
export function consumeAuthCallbackError(href, replaceURL) {
  const url = new URL(href),
    hash = new URLSearchParams(url.hash.slice(1));
  const keys = ["error", "error_code", "error_description"];
  if (!keys.some((key) => url.searchParams.has(key) || hash.has(key)))
    return false;
  for (const key of keys) {
    url.searchParams.delete(key);
    hash.delete(key);
  }
  url.hash = hash.toString();
  replaceURL(url.href);
  return true;
}
