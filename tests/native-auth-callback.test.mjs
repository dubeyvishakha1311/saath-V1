import { test } from "node:test";
import assert from "node:assert/strict";
import { createNativeAuthHandler } from "../src/native-auth-callback.js";
import { validateGoogleOAuthRedirect } from "../scripts/google-oauth-redirect.mjs";
const callback = "in.saath.wellness://auth/callback?code=synthetic-code";
test("native launch/event duplicate callbacks exchange a single-use code exactly once", async () => {
  let exchanges = 0,
    closed = 0,
    errors = 0,
    finish;
  const hold = new Promise((resolve) => (finish = resolve));
  const handle = createNativeAuthHandler({
    exchangeCode: async () => {
      exchanges++;
      await hold;
      return {};
    },
    closeBrowser: async () => {
      closed++;
    },
    onError: () => errors++,
  });
  const a = handle(callback),
    b = handle(callback);
  await Promise.resolve();
  assert.equal(exchanges, 1);
  finish();
  await Promise.all([a, b]);
  await handle(callback);
  assert.equal(exchanges, 1);
  assert.equal(closed, 1);
  assert.equal(errors, 0);
});
test("native callback ignores unrelated links and never exchanges rejected or malformed provider responses", async () => {
  let exchanges = 0,
    errors = 0;
  const handle = createNativeAuthHandler({
    exchangeCode: async () => {
      exchanges++;
      return {};
    },
    closeBrowser: async () => {},
    onError: () => errors++,
  });
  for (const url of [
    "https://attacker.invalid/callback?code=secret",
    "in.saath.wellness://other/callback?code=secret",
    "in.saath.wellness://auth/callback/other?code=secret",
    "not-url",
  ])
    assert.equal(await handle(url), false);
  for (const url of [
    "in.saath.wellness://auth/callback?error=access_denied&error_description=private",
    "in.saath.wellness://auth/callback?code=one&code=two",
    "in.saath.wellness://auth/callback",
    "in.saath.wellness://auth/callback?code=one#error=denied",
  ])
    assert.equal(await handle(url), true);
  assert.equal(exchanges, 0);
  assert.equal(errors, 4);
});
test("callback errors are generic, retry after exchange failure remains possible, unsupported browser closing is harmless", async () => {
  let attempts = 0,
    errors = 0;
  const handle = createNativeAuthHandler({
    exchangeCode: async () =>
      ++attempts === 1 ? { error: Error("private") } : {},
    closeBrowser: async () => {
      throw Error("not supported");
    },
    onError: (...args) => {
      assert.equal(args.length, 0);
      errors++;
    },
  });
  await handle(callback);
  await handle(callback);
  await handle(callback);
  assert.equal(attempts, 2);
  assert.equal(errors, 1);
});
test("public authorization handshake validates callback, provider destination and minimal scopes without following redirects", () => {
  const target = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  target.search = new URLSearchParams({
    client_id: "synthetic.apps.googleusercontent.com",
    redirect_uri: "https://project.supabase.co/auth/v1/callback",
    response_type: "code",
    scope: "email profile",
    state: "must-never-be-logged",
  });
  assert.equal(
    validateGoogleOAuthRedirect(target.href, "https://project.supabase.co"),
    true,
  );
  for (const [key, value] of [
    ["redirect_uri", "https://attacker.invalid/callback"],
    ["response_type", "token"],
    ["scope", "email https://www.googleapis.com/auth/drive"],
    ["client_id", ""],
  ]) {
    const bad = new URL(target);
    bad.searchParams.set(key, value);
    assert.throws(() =>
      validateGoogleOAuthRedirect(bad.href, "https://project.supabase.co"),
    );
  }
  const bad = new URL(target);
  bad.hostname = "attacker.invalid";
  assert.throws(() =>
    validateGoogleOAuthRedirect(bad.href, "https://project.supabase.co"),
  );
});
