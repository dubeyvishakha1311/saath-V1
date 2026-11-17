import { test } from "node:test";
import assert from "node:assert/strict";
import { beginGoogleSignIn } from "../src/google-sign-in.js";
function fixture(native = false) {
  const calls = [];
  return {
    calls,
    options: {
      native,
      projectURL: "https://project.supabase.co",
      publishableKey: "public-test-key",
      redirectTo: native
        ? "in.saath.wellness://auth/callback"
        : "https://saath.test/?auth=callback",
      fetchImpl: async (url, options) => {
        calls.push(["settings", url, options]);
        return Response.json({ external: { google: true } });
      },
      client: {
        auth: {
          signInWithOAuth: async (options) => {
            calls.push(["oauth", options]);
            return {
              data: {
                url: "https://project.supabase.co/auth/v1/authorize?provider=google",
              },
              error: null,
            };
          },
        },
      },
      openExternal: async (url) => calls.push(["external", url]),
      navigate: (url) => calls.push(["navigate", url]),
    },
  };
}
test("Google web sign-in requests PKCE flow through Supabase and navigates the current browser", async () => {
  const f = fixture();
  await beginGoogleSignIn(f.options);
  assert.equal(f.calls[1][1].provider, "google");
  assert.equal(f.calls[1][1].options.skipBrowserRedirect, true);
  assert.equal(
    f.calls[1][1].options.redirectTo,
    "https://saath.test/?auth=callback",
  );
  assert.equal(f.calls[2][0], "navigate");
  assert.equal(
    f.calls.some((x) => x[0] === "external"),
    false,
  );
});
test("Google Android sign-in uses the external browser and native callback, not WebView navigation", async () => {
  const f = fixture(true);
  await beginGoogleSignIn(f.options);
  assert.equal(
    f.calls[1][1].options.redirectTo,
    "in.saath.wellness://auth/callback",
  );
  assert.equal(f.calls[2][0], "external");
  assert.equal(
    f.calls.some((x) => x[0] === "navigate"),
    false,
  );
});
test("disabled provider and settings failures never launch OAuth", async () => {
  for (const response of [
    Response.json({ external: { google: false } }),
    new Response("", { status: 503 }),
  ]) {
    const f = fixture();
    f.options.fetchImpl = async () => response;
    await assert.rejects(beginGoogleSignIn(f.options));
    assert.equal(f.calls.length, 0);
  }
});
test("SDK errors, untrusted redirect URLs and browser failures are reported without creating a session", async () => {
  for (const result of [
    { error: new Error("provider failed") },
    { data: { url: "https://attacker.invalid/auth/v1/authorize" } },
    { data: { url: "https://project.supabase.co/untrusted" } },
  ]) {
    const f = fixture();
    f.options.client.auth.signInWithOAuth = async () => result;
    await assert.rejects(beginGoogleSignIn(f.options));
    assert.equal(
      f.calls.some((x) => ["navigate", "external"].includes(x[0])),
      false,
    );
  }
  const f = fixture(true);
  f.options.openExternal = async () => {
    throw Error("browser unavailable");
  };
  await assert.rejects(beginGoogleSignIn(f.options), /browser unavailable/);
});

test("failed OAuth callback removes error details without displaying them or touching successful callbacks", async () => {
  const { consumeAuthCallbackError } = await import("../src/google-sign-in.js");
  for (const href of [
    "https://saath.test/?auth=callback&error=access_denied&error_description=private-detail",
    "https://saath.test/?auth=callback#error=access_denied&error_code=denied",
  ]) {
    let replaced;
    assert.equal(
      consumeAuthCallbackError(href, (url) => {
        replaced = url;
      }),
      true,
    );
    assert.equal(replaced.includes("error"), false);
    assert.equal(replaced.includes("private-detail"), false);
    assert.equal(new URL(replaced).searchParams.get("auth"), "callback");
  }
  assert.equal(
    consumeAuthCallbackError(
      "https://saath.test/?auth=callback&code=private-code",
      () => {
        throw Error("Must not modify successful callback");
      },
    ),
    false,
  );
});
