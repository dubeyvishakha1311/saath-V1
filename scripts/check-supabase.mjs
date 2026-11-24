import { createHash, randomBytes } from "node:crypto";
import { validateGoogleOAuthRedirect } from "./google-oauth-redirect.mjs";
// Read-only live smoke test. No accounts, emails, secrets or notebook writes.
import config from "../src/supabase-config.json" with { type: "json" };
import assert from "node:assert/strict";
try {
  const headers = {
    apikey: config.publishableKey,
    "Content-Type": "application/json",
  };
  const settings = await fetch(`${config.url}/auth/v1/settings`, {
    headers,
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  assert.equal(settings.ok, true, "Supabase Auth must be reachable");
  const auth = await settings.json();
  assert.equal(auth.external?.email, true, "Email auth must be enabled");
  console.log(
    `::notice::Public Auth settings: Google enabled=${auth.external?.google === true}; email enabled=${auth.external?.email === true}. No OAuth token or user data requested.`,
  );
  if (
    process.argv.includes("--require-google") &&
    auth.external?.google !== true
  ) {
    console.error(
      "::error::Google sign-in is not enabled in this configured project's public Auth settings. No provider configuration was changed.",
    );
    assert.equal(auth.external?.google, true, "Google sign-in must be enabled");
  }
  if (process.argv.includes("--require-google")) {
    const authorize = new URL(`${config.url}/auth/v1/authorize`);
    authorize.searchParams.set("provider", "google");
    authorize.searchParams.set(
      "redirect_to",
      "in.saath.wellness://auth/callback",
    );
    authorize.searchParams.set(
      "code_challenge",
      createHash("sha256").update(randomBytes(32)).digest("base64url"),
    );
    authorize.searchParams.set("code_challenge_method", "s256");
    const handshake = await fetch(authorize, {
      headers,
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    assert.ok(
      [302, 303].includes(handshake.status),
      "Supabase must initiate Google authorization",
    );
    validateGoogleOAuthRedirect(handshake.headers.get("location"), config.url);
    console.log(
      "::notice::Google authorization preflight passed: trusted Google destination, correct Supabase callback, code flow and basic identity scopes. Google consent/audience/verification and real-account completion are NOT verified. No redirect followed or session created.",
    );
  }
  const denied = await fetch(
    `${config.url}/rest/v1/saath_vaults?select=user_id&limit=1`,
    { headers, signal: AbortSignal.timeout(15000) },
  );
  assert.ok(
    [401, 403].includes(denied.status),
    "Anonymous notebook reads must be denied",
  );
  const deleteDenied = await fetch(
    `${config.url}/rest/v1/rpc/saath_delete_my_data`,
    {
      method: "POST",
      headers,
      signal: AbortSignal.timeout(15000),
      body: JSON.stringify({
        expected_user_id: "00000000-0000-0000-0000-000000000000",
      }),
    },
  );
  assert.ok(
    [401, 403].includes(deleteDenied.status),
    "Anonymous deletion must be denied",
  );
  const accountDeleteDenied = await fetch(
    `${config.url}/functions/v1/saath-delete-account`,
    {
      method: "POST",
      headers,
      signal: AbortSignal.timeout(15000),
      body: '{"confirm":"DELETE"}',
    },
  );
  assert.ok(
    [401, 403].includes(accountDeleteDenied.status),
    "Account deletion requires authenticated identity",
  );
  console.log(
    "PASS: live Auth available; anonymous database reads, data deletion and account deletion denied. No user data read or modified.",
  );
} catch (error) {
  console.error(
    `::error::Supabase smoke check failed: ${String(error.message)
      .replace(/[\r\n]/g, " ")
      .slice(0, 250)}`,
  );
  process.exitCode = 1;
}
