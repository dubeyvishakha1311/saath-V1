import { test } from "node:test";
import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import {
  encryptNotebook,
  decryptNotebook,
  notebookSnapshot,
  KDF_ITERATIONS,
} from "../src/vault.js";
const notebook = {
  entries: [{ date: "2026-11-07", text: "A private journal entry" }],
  lang: "en",
  consent: true,
  draft: "not yet finished",
  phone: "+919999999999",
  screeningDraft: { kind: "gad7", index: 1, answers: [1] },
};
test("encrypted round trip preserves notebook, excludes session material and binds to account", async () => {
  const pass = "a separate backup passphrase";
  const row = await encryptNotebook(
    {
      ...notebook,
      session: { access_token: "must not be exported" },
      password: "never export",
    },
    pass,
    "account-a",
    webcrypto,
  );
  assert.equal(row.kdf_iterations, KDF_ITERATIONS);
  assert.equal(row.ciphertext.includes("private"), false);
  assert.equal(row.iv.length, 16);
  assert.equal(row.salt.length, 24);
  const restored = await decryptNotebook(row, pass, "account-a", webcrypto);
  assert.deepEqual(restored, notebook);
  assert.equal(restored.session, undefined);
  assert.equal(restored.password, undefined);
  await assert.rejects(
    decryptNotebook(row, "a wrong backup passphrase", "account-a", webcrypto),
    /Could not unlock/,
  );
  await assert.rejects(
    decryptNotebook(row, pass, "account-b", webcrypto),
    /Could not unlock/,
  );
  const corrupted = {
    ...row,
    ciphertext:
      (row.ciphertext[0] === "A" ? "B" : "A") + row.ciphertext.slice(1),
  };
  await assert.rejects(
    decryptNotebook(corrupted, pass, "account-a", webcrypto),
    /Could not unlock/,
  );
});
test("backup encryption uses fresh randomness and rejects unsupported/invalid input", async () => {
  const a = await encryptNotebook(
      notebook,
      "a long backup passphrase",
      "account-a",
      webcrypto,
    ),
    b = await encryptNotebook(
      notebook,
      "a long backup passphrase",
      "account-a",
      webcrypto,
    );
  assert.notEqual(a.salt, b.salt);
  assert.notEqual(a.iv, b.iv);
  assert.notEqual(a.ciphertext, b.ciphertext);
  await assert.rejects(
    encryptNotebook(notebook, "short", "account-a", webcrypto),
    /12/,
  );
  await assert.rejects(
    decryptNotebook(
      { ...a, kdf_iterations: 1 },
      "a long backup passphrase",
      "account-a",
      webcrypto,
    ),
  );
  assert.throws(() => notebookSnapshot({ entries: "invalid", lang: "en" }));
  assert.throws(() =>
    notebookSnapshot({ ...notebook, entries: [{ date: "today", text: 42 }] }),
  );
  assert.throws(() =>
    notebookSnapshot({
      ...notebook,
      featureDrafts: JSON.parse('{"__proto__":{"bad":true}}'),
    }),
  );
});

test("one encrypted notebook preserves journal and creative choice records/drafts and rejects unknown choice IDs", async () => {
  const data = {
    ...notebook,
    entries: [
      {
        date: "2026-11-07",
        text: "",
        day: 1,
        optionIds: ["mixed"],
        questionVersion: 1,
      },
    ],
    journalChoices: { day: 2, optionIds: ["work", "health"] },
    featureChoices: { song: ["calm", "memories"] },
    experiences: [
      {
        id: "story-1",
        type: "story",
        date: "2026-11-07",
        text: "",
        optionIds: ["asha"],
        questionVersion: 1,
      },
    ],
  };
  const row = await encryptNotebook(
    data,
    "separate backup passphrase",
    "account-a",
    webcrypto,
  );
  assert.deepEqual(
    await decryptNotebook(
      row,
      "separate backup passphrase",
      "account-a",
      webcrypto,
    ),
    data,
  );
  assert.equal(row.ciphertext.includes("memories"), false);
  for (const patch of [
    { journalChoices: { day: 1, optionIds: ["good", "mixed"] } },
    { journalChoices: { day: 5, optionIds: ["not-a-choice"] } },
    { featureChoices: { song: ["calm", "unsure"] } },
    { featureChoices: { toString: [] } },
    {
      entries: [
        {
          date: "today",
          text: "",
          day: 9,
          optionIds: ["mixed"],
          questionVersion: 1,
        },
      ],
    },
  ])
    assert.throws(() => notebookSnapshot({ ...data, ...patch }));
});
