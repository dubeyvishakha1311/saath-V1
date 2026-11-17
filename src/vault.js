import { dailyQuestions, creativeOptions, validOptionIds } from "./journal.js";
export const KDF_ITERATIONS = 600000;
export const CLOUD_CONSENT = "cloud-backup-v1";
const MAX_BYTES = 2 * 1024 * 1024;
const fields = [
  "entries",
  "draft",
  "journalChoices",
  "featureChoices",
  "lang",
  "phone",
  "mood",
  "experiences",
  "featureDrafts",
  "featureMeta",
  "screeningDraft",
  "selectedExperience",
  "selectedExercise",
  "rejectedThemes",
  "positiveDays",
  "consent",
];
const encoder = new TextEncoder();
function fail(message = "Invalid notebook backup.") {
  throw new Error(message);
}
export function notebookSnapshot(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail();
  const copy = {};
  for (const key of fields)
    if (Object.hasOwn(value, key)) copy[key] = value[key];
  const raw = JSON.stringify(copy);
  if (encoder.encode(raw).length > MAX_BYTES)
    fail("Notebook is too large for a backup.");
  // JSON round-trip drops prototypes; nested dangerous property names are rejected.
  const data = JSON.parse(raw, (key, v) => {
    if (["__proto__", "constructor", "prototype"].includes(key)) fail();
    return v;
  });
  if (
    !Array.isArray(data.entries) ||
    data.entries.length > 7 ||
    !["en", "hi"].includes(data.lang)
  )
    fail();
  const text = (v, max = 12000) => typeof v === "string" && v.length <= max;
  if (data.entries.some((x) => !x || !text(x.text) || !text(x.date, 50)))
    fail();
  if (data.draft !== undefined && !text(data.draft)) fail();
  const validJournal = (x) =>
    !!x &&
    Number.isInteger(x.day) &&
    x.day >= 1 &&
    x.day <= 7 &&
    validOptionIds(
      x.optionIds,
      dailyQuestions[x.day - 1].options,
      !!dailyQuestions[x.day - 1].single,
    );
  for (const entry of data.entries)
    if (
      entry.optionIds !== undefined &&
      (!validJournal(entry) || entry.questionVersion !== 1)
    )
      fail();
  if (data.journalChoices !== undefined && !validJournal(data.journalChoices))
    fail();
  if (data.featureChoices !== undefined) {
    if (
      !data.featureChoices ||
      typeof data.featureChoices !== "object" ||
      Array.isArray(data.featureChoices)
    )
      fail();
    for (const [kind, ids] of Object.entries(data.featureChoices))
      if (!creativeOptions[kind] || !validOptionIds(ids, creativeOptions[kind]))
        fail();
  }
  if (data.experiences !== undefined && !Array.isArray(data.experiences))
    fail();
  for (const x of data.experiences || [])
    if (
      !x ||
      (x.optionIds !== undefined &&
        (!creativeOptions[x.type] ||
          !validOptionIds(x.optionIds, creativeOptions[x.type]) ||
          x.questionVersion !== 1))
    )
      fail();

  if (data.consent !== undefined && typeof data.consent !== "boolean") fail();
  if (data.phone !== undefined && !text(data.phone, 50)) fail();
  if (
    data.mood !== undefined &&
    (!data.mood ||
      !["low", "heavy", "okay", "good", "bright"].includes(data.mood.value) ||
      !text(data.mood.date, 50))
  )
    fail();
  if (
    data.experiences !== undefined &&
    (!Array.isArray(data.experiences) ||
      data.experiences.length > 10000 ||
      data.experiences.some(
        (x) =>
          !x ||
          !text(x.id, 100) ||
          !["story", "song", "poem", "exercise"].includes(x.type) ||
          !text(x.text) ||
          !text(x.date, 50) ||
          ["songTitle", "songLink", "exercise"].some(
            (k) => x[k] !== undefined && !text(x[k], 1200),
          ),
      ))
  )
    fail();
  for (const key of ["featureDrafts", "featureMeta", "rejectedThemes"])
    if (
      data[key] !== undefined &&
      (!data[key] || typeof data[key] !== "object" || Array.isArray(data[key]))
    )
      fail();
  for (const key of ["featureDrafts", "featureMeta"])
    if (data[key] && Object.values(data[key]).some((x) => !text(x))) fail();
  if (
    data.rejectedThemes &&
    Object.values(data.rejectedThemes).some(
      (x) => !Array.isArray(x) || x.some((y) => !text(y, 50)),
    )
  )
    fail();
  if (
    data.positiveDays !== undefined &&
    (!Array.isArray(data.positiveDays) ||
      data.positiveDays.some((x) => !Number.isInteger(x) || x < 0 || x > 6))
  )
    fail();
  for (const key of ["selectedExercise", "selectedExperience"])
    if (data[key] !== undefined && !text(data[key], 100)) fail();
  if (data.screeningDraft) {
    const q = data.screeningDraft,
      size = q.kind === "phq9" ? 9 : q.kind === "gad7" ? 7 : 0;
    if (
      !size ||
      !Number.isInteger(q.index) ||
      q.index < 0 ||
      q.index > size ||
      !Array.isArray(q.answers) ||
      q.answers.length > size ||
      Array.from(q.answers).some(
        (n) => !Number.isInteger(n) || n < 0 || n > 3,
      ) ||
      (q.difficulty !== undefined && !text(q.difficulty, 100))
    )
      fail();
  } else if (data.screeningDraft !== undefined) fail();
  return data;
}
function to64(bytes) {
  let result = "";
  for (let i = 0; i < bytes.length; i += 8192)
    result += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(result);
}
function from64(text, max) {
  if (
    typeof text !== "string" ||
    text.length > max ||
    !/^[A-Za-z0-9+/]+={0,2}$/.test(text)
  )
    fail();
  try {
    return Uint8Array.from(atob(text), (x) => x.charCodeAt(0));
  } catch {
    fail();
  }
}
async function derive(passphrase, salt, cryptoAPI) {
  if (
    typeof passphrase !== "string" ||
    passphrase.length < 12 ||
    passphrase.length > 1024
  )
    fail("Use a backup passphrase of 12–1024 characters.");
  const material = await cryptoAPI.subtle.importKey(
    "raw",
    encoder.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return cryptoAPI.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: KDF_ITERATIONS, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}
export async function encryptNotebook(
  notebook,
  passphrase,
  userId,
  cryptoAPI = globalThis.crypto,
) {
  if (!cryptoAPI?.subtle || !userId)
    fail("Secure encryption is unavailable. Use HTTPS or the Android app.");
  const payload = notebookSnapshot(notebook),
    salt = cryptoAPI.getRandomValues(new Uint8Array(16)),
    iv = cryptoAPI.getRandomValues(new Uint8Array(12));
  const key = await derive(passphrase, salt, cryptoAPI);
  const encrypted = await cryptoAPI.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
      additionalData: encoder.encode(`saath:v1:${userId}`),
    },
    key,
    encoder.encode(JSON.stringify({ schema: 1, notebook: payload })),
  );
  return {
    ciphertext: to64(new Uint8Array(encrypted)),
    salt: to64(salt),
    iv: to64(iv),
    kdf_iterations: KDF_ITERATIONS,
    format_version: 1,
    consent_version: CLOUD_CONSENT,
  };
}
export async function decryptNotebook(
  row,
  passphrase,
  userId,
  cryptoAPI = globalThis.crypto,
) {
  if (
    row?.format_version !== 1 ||
    row.kdf_iterations !== KDF_ITERATIONS ||
    row.consent_version !== CLOUD_CONSENT ||
    !userId ||
    !cryptoAPI?.subtle
  )
    fail();
  const salt = from64(row.salt, 24),
    iv = from64(row.iv, 16),
    cipher = from64(row.ciphertext, 3 * 1024 * 1024);
  if (salt.length !== 16 || iv.length !== 12 || cipher.length < 16) fail();
  try {
    const key = await derive(passphrase, salt, cryptoAPI);
    const plaintext = await cryptoAPI.subtle.decrypt(
      {
        name: "AES-GCM",
        iv,
        additionalData: encoder.encode(`saath:v1:${userId}`),
      },
      key,
      cipher,
    );
    if (plaintext.byteLength > MAX_BYTES + 100) fail();
    const parsed = JSON.parse(new TextDecoder().decode(plaintext));
    if (parsed.schema !== 1) fail();
    return notebookSnapshot(parsed.notebook);
  } catch {
    fail(
      "Could not unlock this backup. Check your passphrase and account; the backup may also be damaged.",
    );
  }
}
