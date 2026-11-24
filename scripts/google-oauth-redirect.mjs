// Pure validation for the public, unauthenticated Supabase -> Google handshake.
// Do not print/store the full redirect: it contains one-time OAuth state.
export function validateGoogleOAuthRedirect(location, projectURL) {
  const target = new URL(location);
  const project = new URL(projectURL);
  if (
    project.protocol !== "https:" ||
    target.protocol !== "https:" ||
    target.hostname !== "accounts.google.com" ||
    target.port ||
    target.username ||
    target.password ||
    target.hash
  )
    throw new Error("Google authorization destination is not trusted");
  if (!["/o/oauth2/auth", "/o/oauth2/v2/auth"].includes(target.pathname))
    throw new Error("Unexpected Google authorization path");
  if (
    target.searchParams.get("redirect_uri") !==
    `${project.origin}/auth/v1/callback`
  )
    throw new Error(
      "Google callback does not match the configured Supabase project",
    );
  if (target.searchParams.get("response_type") !== "code")
    throw new Error("Google authorization must use the code flow");
  if (
    !target.searchParams
      .get("client_id")
      ?.endsWith(".apps.googleusercontent.com")
  )
    throw new Error("Google client ID is missing or malformed");
  const allowed = new Set([
    "openid",
    "email",
    "profile",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
  ]);
  const scopes = (target.searchParams.get("scope") || "")
    .split(/\s+/)
    .filter(Boolean);
  if (!scopes.length || scopes.some((scope) => !allowed.has(scope)))
    throw new Error(
      "Google request contains missing or unexpected identity scopes",
    );
  return true;
}
