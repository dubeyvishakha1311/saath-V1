import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
const source = readFileSync(
  new URL(
    "../supabase/functions/saath-delete-account/index.ts",
    import.meta.url,
  ),
  "utf8",
);
function handler(fakeFetch) {
  let route;
  const context = {
    Request,
    Response,
    fetch: fakeFetch,
    Deno: {
      env: {
        get: (key) =>
          ({
            SUPABASE_URL: "https://project.example",
            SUPABASE_ANON_KEY: "test-anon",
            SUPABASE_SERVICE_ROLE_KEY: "server-only-test-value",
          })[key],
      },
      serve: (fn) => (route = fn),
    },
  };
  vm.runInNewContext(source, context);
  return route;
}
test("account deletion denies anonymous requests and requires explicit confirmation", async () => {
  let requests = 0;
  const route = handler(async () => {
    requests++;
    throw Error();
  });
  assert.equal(
    (
      await route(
        new Request("https://edge.test", { method: "POST", body: "{}" }),
      )
    ).status,
    401,
  );
  assert.equal(
    (
      await route(
        new Request("https://edge.test", {
          method: "POST",
          headers: { Authorization: "Bearer test-token" },
          body: "{}",
        }),
      )
    ).status,
    400,
  );
  assert.equal(requests, 0);
});
test("deletion derives its target from verified identity, never a client-supplied user ID", async () => {
  const calls = [];
  const route = handler(async (url, options) => {
    calls.push({ url, options });
    return calls.length === 1
      ? Response.json({ id: "verified-owner" })
      : Response.json({});
  });
  const response = await route(
    new Request("https://edge.test", {
      method: "POST",
      headers: { Authorization: "Bearer valid-user-token" },
      body: JSON.stringify({
        confirm: "DELETE",
        user_id: "someone-else",
        expected_user_id: "verified-owner",
      }),
    }),
  );
  assert.equal(response.status, 200);
  assert.equal((await response.json()).deleted, true);
  assert.equal(calls[0].url, "https://project.example/auth/v1/user");
  assert.equal(
    calls[1].url,
    "https://project.example/auth/v1/admin/users/verified-owner",
  );
  assert.equal(calls[1].options.method, "DELETE");
});
test("invalid identity never reaches the privileged deletion endpoint", async () => {
  let calls = 0;
  const route = handler(async () => {
    calls++;
    return Response.json({ error: "invalid" }, { status: 401 });
  });
  const response = await route(
    new Request("https://edge.test", {
      method: "POST",
      headers: { Authorization: "Bearer invalid" },
      body: '{"confirm":"DELETE"}',
    }),
  );
  assert.equal(response.status, 401);
  assert.equal(calls, 1);
});
test("account change between confirmation and request prevents deletion", async () => {
  let calls = 0;
  const route = handler(async () => {
    calls++;
    return Response.json({ id: "new-account" });
  });
  const response = await route(
    new Request("https://edge.test", {
      method: "POST",
      headers: { Authorization: "Bearer valid-user-token" },
      body: '{"confirm":"DELETE","expected_user_id":"old-account"}',
    }),
  );
  assert.equal(response.status, 409);
  assert.equal(calls, 1);
});
