import { createAccountController, accountPages } from "../src/account.js";
import * as features from "../src/features.js";
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
const source = readFileSync(new URL("../src/main.js", import.meta.url), "utf8")
  .replace(
    /^import\s+['"]\.\/(?:style\.css|native-navigation\.js)['"];?\s*$/gm,
    "",
  )
  .replace(
    /import\s*\{[\s\S]*?\}\s*from\s*['"]\.\/features\.js['"];?/,
    "const { extraPages, renderExtra, bindExtra, handleExtra, riskSignal, weeklyThemes } = window.__features;",
  )
  .replace(
    /import\s*\{[\s\S]*?\}\s*from\s*['"]\.\/account\.js['"];?/,
    "const {createAccountController,accountPages}=window.__account;",
  )
  .replace(
    /import\s*\{[\s\S]*?\}\s*from\s*['"]\.\/supabase\.js['"];?/,
    'const supabase=window.__supabase;const authRedirectURL=()=>"https://saath.test/?auth=callback";const listenForNativeAuth=async()=>{};const authCallbackFailed=()=>false;const startGoogleSignIn=async()=>{window.__googleCalls=(window.__googleCalls||0)+1;if(window.__googleError)throw window.__googleError;};',
  );

function app(saved, client = null) {
  const dom = new JSDOM('<div id="app"></div>', {
    url: "https://saath.test",
    runScripts: "outside-only",
  });
  const w = dom.window;
  w.__features = features;
  w.__account = { createAccountController, accountPages };
  w.__supabase = client;
  w.scrollTo = () => {};
  w.confirm = () => true;
  if (saved)
    w.localStorage.setItem("saath-prototype-v1", JSON.stringify(saved));
  w.eval(
    source + "\nwindow.__accountTest=account;window.__notebookTest=()=>state;",
  );
  return {
    w,
    doc: w.document,
    click(action) {
      const b = w.document.querySelector(`[data-action="${action}"]`);
      assert.ok(b, action);
      b.click();
    },
    data() {
      return JSON.parse(w.localStorage.getItem("saath-prototype-v1"));
    },
    close() {
      w.close();
    },
  };
}
test("onboarding, draft recovery, save, same-day edit and deletion", () => {
  const a = app();
  a.click("consent");
  a.click("journal");
  const box = a.doc.querySelector("textarea");
  box.value = "<script>alert(1)</script> A small hopeful moment";
  box.dispatchEvent(new a.w.Event("input"));
  assert.equal(a.data().draft, box.value);
  a.click("home");
  a.click("journal");
  assert.equal(a.doc.querySelector("textarea").value, box.value);
  a.click("save");
  assert.equal(a.data().entries.length, 1);
  a.click("journal");
  a.doc.querySelector("textarea").value = "Edited";
  a.click("save");
  assert.equal(a.data().entries.length, 1);
  assert.equal(a.data().entries[0].text, "Edited");
  a.click("settings");
  a.click("delete");
  assert.equal(a.data(), null);
  assert.match(a.doc.body.textContent, /Before we begin/);
  a.close();
});
test("panic tools and crisis guidance work before consent", () => {
  const a = app();
  a.click("crisis");
  assert.match(a.doc.body.textContent, /Nobody has been notified/);
  a.click("panic");
  a.click("count");
  a.click("next");
  assert.equal(a.doc.querySelector("#number").textContent, "19");
  a.click("stop");
  a.click("ground");
  assert.match(a.doc.body.textContent, /5 things you can see/);
  a.close();
});
test("Hindi and seven-day reflection escape stored text", () => {
  const a = app({
    consent: true,
    lang: "en",
    entries: Array.from({ length: 7 }, (_, i) => ({
      date: `2026-01-0${i + 1}`,
      text: "<img src=x onerror=alert(1)>",
    })),
  });
  a.click("reflection");
  assert.equal(a.doc.querySelectorAll("details").length, 7);
  assert.equal(a.doc.querySelectorAll("img").length, 0);
  a.click("language");
  assert.equal(a.doc.documentElement.lang, "hi");
  a.click("journal");
  assert.match(a.doc.body.textContent, /सात दिन पूरे/);
  a.close();
});
test("empty entries do not advance progress; contact input validated", () => {
  const a = app({ consent: true, lang: "en", entries: [] });
  a.click("journal");
  a.click("save");
  assert.equal(a.data().entries.length, 0);
  a.click("settings");
  a.doc.querySelector("input").value = "javascript:alert(1)";
  a.click("contact");
  assert.match(a.doc.querySelector("#status").textContent, /valid phone/);
  a.doc.querySelector("input").value = "+91 99999 99999";
  a.click("contact");
  assert.equal(a.data().phone, "+919999999999");
  a.click("panic");
  assert.equal(
    a.doc.querySelector("a").getAttribute("href"),
    "tel:+919999999999",
  );
  a.close();
});
test("app-style mood check-in persists and quick tools open directly", () => {
  const a = app({ consent: true, lang: "en", entries: [] });
  assert.equal(a.doc.querySelectorAll("nav .tab").length, 5);
  a.click("mood-good");
  assert.equal(a.data().mood.value, "good");
  assert.equal(
    a.doc
      .querySelector('[data-action="mood-good"]')
      .getAttribute("aria-pressed"),
    "true",
  );
  a.click("quick-breath");
  assert.ok(a.doc.querySelector("#phase"));
  a.click("home");
  assert.equal(
    a.doc
      .querySelector('[data-action="mood-good"]')
      .getAttribute("aria-pressed"),
    "true",
  );
  a.click("quick-ground");
  assert.match(a.doc.body.textContent, /5 things you can see/);
  a.click("home");
  a.click("settings");
  a.click("delete");
  assert.equal(a.data(), null);
  a.close();
});
test("pre-consent back button returns to onboarding, not journal dashboard", () => {
  const a = app();
  a.click("crisis");
  a.click("back");
  assert.match(a.doc.body.textContent, /Before we begin/);
  assert.equal(a.doc.querySelector("nav"), null);
  a.close();
});
test("Back follows screen and exercise history; hardware back shares the same route", () => {
  const a = app({ consent: true, lang: "en", entries: [] });
  assert.equal(a.doc.querySelector('[data-action="back"]').disabled, true);
  a.click("settings");
  a.click("panic");
  a.click("ground");
  a.click("crisis");
  a.click("back");
  assert.match(a.doc.body.textContent, /5 things you can see/);
  a.w.dispatchEvent(new a.w.Event("saath:back"));
  assert.ok(a.doc.querySelector('[data-action="ground"]'));
  a.click("back");
  assert.ok(a.doc.querySelector("#phone"));
  a.click("back");
  assert.equal(a.doc.querySelector(".app-shell").dataset.page, "home");
  assert.equal(a.doc.querySelector('[data-action="back"]').disabled, true);
  a.close();
});
test("basic controls exist on all screens and Home resets navigation", () => {
  const a = app({
    consent: true,
    lang: "en",
    entries: Array.from({ length: 7 }, (_, i) => ({
      date: `2026-01-0${i + 1}`,
      text: "A moment",
    })),
  });
  for (const screen of [
    "home",
    "journal",
    "reflection",
    "panic",
    "settings",
    "crisis",
  ]) {
    a.w.eval(`go('${screen}')`);
    for (const action of ["back", "home-root", "crisis", "language"])
      assert.ok(
        a.doc.querySelector(`[data-action="${action}"]`),
        `${screen}: ${action}`,
      );
  }
  a.click("home-root");
  assert.equal(a.doc.querySelector(".app-shell").dataset.page, "home");
  assert.equal(a.doc.querySelector('[data-action="back"]').disabled, true);
  a.close();
});
test("Home before consent stays on welcome, and deletion clears history", () => {
  const a = app();
  a.click("crisis");
  a.click("home-root");
  assert.match(a.doc.body.textContent, /Before we begin/);
  assert.equal(a.data(), null);
  a.click("consent");
  a.click("settings");
  a.click("delete");
  a.w.dispatchEvent(new a.w.Event("saath:back"));
  assert.match(a.doc.body.textContent, /Before we begin/);
  assert.equal(a.doc.querySelector('[data-action="back"]').disabled, true);
  a.close();
});
test("journal drafts and contact edits survive Back; Cancel restores saved contact", () => {
  const a = app({
    consent: true,
    lang: "en",
    entries: [],
    phone: "+919999999999",
  });
  a.click("journal");
  a.doc.querySelector("textarea").value = "Keep this draft";
  a.doc.querySelector("textarea").dispatchEvent(new a.w.Event("input"));
  a.click("crisis");
  a.click("back");
  assert.equal(a.doc.querySelector("textarea").value, "Keep this draft");
  a.click("settings");
  a.doc.querySelector("input").value = "+918888888888";
  a.doc.querySelector("input").dispatchEvent(new a.w.Event("input"));
  a.click("crisis");
  a.click("back");
  assert.equal(a.doc.querySelector("input").value, "+918888888888");
  a.click("cancel-contact");
  assert.equal(a.doc.querySelector("input").value, "+919999999999");
  a.close();
});
test("story and poem save, reflect, reject themes, recover drafts and escape user text", () => {
  const a = app({ consent: true, lang: "en", entries: [] });
  a.click("explore");
  a.click("story");
  const field = a.doc.querySelector("#response");
  field.value = "I felt lonely and tired <img src=x onerror=alert(1)>";
  field.dispatchEvent(new a.w.Event("input"));
  a.click("crisis");
  a.click("back");
  assert.equal(a.doc.querySelector("#response").value, field.value);
  a.click("reflect:story");
  assert.equal(a.data().experiences.length, 1);
  assert.match(a.doc.body.textContent, /Connection or loneliness/);
  assert.equal(a.doc.querySelectorAll("img").length, 0);
  const id = a.data().experiences[0].id;
  a.click(`reject:${id}:connection`);
  assert.doesNotMatch(a.doc.body.textContent, /Connection or loneliness/);
  a.click("explore");
  a.click("poem");
  a.doc.querySelector("#response").value = "hope for tomorrow";
  a.click("reflect:poem");
  assert.equal(a.data().experiences[1].type, "poem");
  a.click("explore");
  a.click("history");
  assert.equal(a.doc.querySelectorAll(".history-item").length, 2);
  a.close();
});
test("song metadata never drives themes; only user-authored explanation is reflected", () => {
  const a = app({ consent: true, lang: "en", entries: [] });
  a.click("explore");
  a.click("song");
  const title = a.doc.querySelector("#song-title");
  title.value = "Lonely sad worried tired";
  title.dispatchEvent(new a.w.Event("input"));
  a.doc.querySelector("#response").value = "I like the rhythm";
  a.click("reflect:song");
  assert.equal(a.data().experiences[0].songTitle, title.value);
  assert.match(a.doc.body.textContent, /No clear word matches/);
  assert.equal(a.doc.querySelectorAll(".theme-chip").length, 0);
  a.close();
});
test("risky story, song, poem, exercise and journal answers route to crisis; returning never shows normal reflection", () => {
  for (const route of ["story", "song", "poem", "exercise", "journal"]) {
    const a = app({ consent: true, lang: "en", entries: [] });
    if (route === "exercise") {
      a.click("explore");
      a.click("library");
      a.click("exercise:kindness");
    } else if (route !== "journal") {
      a.click("explore");
      a.click(route);
    } else a.click("journal");
    const field = a.doc.querySelector("textarea");
    field.value = "I want to kill myself";
    a.click(route === "journal" ? "save" : `reflect:${route}`);
    assert.equal(a.doc.querySelector(".app-shell").dataset.page, "crisis");
    assert.equal(
      a.doc.querySelector('a[href="tel:112"]').textContent,
      "Call emergency · 112",
    );
    if (route !== "journal") {
      a.click("explore");
      a.click("history");
      a.click(`open:${a.data().experiences[0].id}`);
      assert.match(a.doc.body.textContent, /Let’s put support first/);
      assert.equal(a.doc.querySelectorAll(".theme-chip").length, 0);
    }
    a.close();
  }
});
test("weekly themes, user-chosen positive moments and risk override", () => {
  const entries = Array.from({ length: 7 }, (_, i) => ({
    date: `2026-01-0${i + 1}`,
    text: i === 0 ? "I felt lonely" : "An ordinary day",
  }));
  const a = app({ consent: true, lang: "en", entries });
  a.click("reflection");
  assert.match(a.doc.body.textContent, /Connection or loneliness/);
  a.click("positive:1");
  assert.deepEqual(a.data().positiveDays, [1]);
  a.click("positive:1");
  assert.deepEqual(a.data().positiveDays, []);
  a.close();
  entries[0].text = "I want to die";
  const b = app({ consent: true, lang: "en", entries });
  b.click("reflection");
  assert.match(b.doc.body.textContent, /Let’s put support first/);
  assert.equal(b.doc.querySelectorAll("details").length, 0);
  b.close();
});
test("questionnaire completion has correct score, no diagnosis and supports previous question", () => {
  const a = app({ consent: true, lang: "en", entries: [] });
  a.click("explore");
  a.click("screening");
  a.click("start:gad7");
  a.click("answer:2");
  a.click("previous-question");
  assert.match(a.doc.body.textContent, /Feeling nervous/);
  a.click("answer:1");
  for (let i = 1; i < 7; i++) a.click("answer:1");
  assert.equal(a.doc.querySelector(".app-shell").dataset.page, "screen-result");
  assert.match(a.doc.querySelector(".score-number").textContent, /7/);
  assert.match(a.doc.body.textContent, /not a diagnosis/);
  a.click("screening");
  a.click("start:phq9");
  for (let i = 0; i < 9; i++) a.click("answer:0");
  assert.equal(a.doc.querySelector(".app-shell").dataset.page, "screen-result");
  assert.match(a.doc.querySelector(".score-number").textContent, /0/);
  a.close();
});
test("PHQ-9 item 9 above zero overrides low total, blocks ordinary results and survives Back", () => {
  const a = app({ consent: true, lang: "en", entries: [] });
  a.click("explore");
  a.click("screening");
  a.click("start:phq9");
  for (let i = 0; i < 8; i++) a.click("answer:0");
  a.click("answer:1");
  assert.equal(a.doc.querySelector(".app-shell").dataset.page, "crisis");
  a.click("back");
  assert.match(a.doc.body.textContent, /Let’s put support first/);
  a.w.eval("go('screen-result')");
  assert.equal(a.doc.querySelector(".score-number"), null);
  a.close();
});
test("PHQ-9 safety routing does not depend on storage success", () => {
  const a = app({ consent: true, lang: "en", entries: [] });
  a.click("explore");
  a.click("screening");
  a.click("start:phq9");
  for (let i = 0; i < 8; i++) a.click("answer:0");
  a.w.alert = () => {};
  a.w.Storage.prototype.setItem = () => {
    throw Error("full");
  };
  a.click("answer:1");
  assert.equal(a.doc.querySelector(".app-shell").dataset.page, "crisis");
  a.close();
});
test("screening discard and delete-all remove all new sensitive fields", () => {
  const a = app({
    consent: true,
    lang: "en",
    entries: [],
    experiences: [{ id: "test", type: "song", text: "hello", date: "today" }],
    featureDrafts: { story: "a draft" },
  });
  a.click("explore");
  a.click("screening");
  a.click("start:gad7");
  a.click("answer:1");
  a.click("discard-screening");
  assert.equal(a.data().screeningDraft, undefined);
  a.click("settings");
  a.click("delete");
  assert.equal(a.data(), null);
  a.w.dispatchEvent(new a.w.Event("saath:back"));
  assert.match(a.doc.body.textContent, /Before we begin/);
  a.close();
});
test("new flows preserve basic controls, Hindi UI and pre-consent guards", () => {
  const a = app();
  a.w.eval("go('story')");
  assert.equal(a.doc.querySelector(".app-shell").dataset.page, "welcome");
  a.click("consent");
  a.click("language");
  for (const p of features.extraPages) {
    a.w.eval(`go('${p}')`);
    for (const action of ["back", "home-root", "crisis", "language"])
      assert.ok(
        a.doc.querySelector(`[data-action="${action}"]`),
        `${p}: ${action}`,
      );
    assert.equal(a.doc.documentElement.lang, "hi");
  }
  a.close();
});
test("all exercises are selectable and their optional notes can be saved", () => {
  const a = app({ consent: true, lang: "en", entries: [] });
  for (const x of features.exercises) {
    a.w.eval("go('library')");
    a.click(`exercise:${x.id}`);
    assert.equal(a.doc.querySelectorAll(".exercise-steps li").length, 3);
    a.doc.querySelector("#response").value = "A small note";
    a.click("reflect:exercise");
  }
  assert.equal(a.data().experiences.length, 6);
  a.close();
});

test("Calm is the prominent middle tab and opens the panic tools", () => {
  const a = app({ consent: true, lang: "en", entries: [] });
  const tabs = [...a.doc.querySelectorAll("nav .tab")];
  assert.deepEqual(
    tabs.map((el) => el.dataset.action),
    ["home", "explore", "panic", "journal", "settings"],
  );
  assert.equal(tabs[2].classList.contains("calm-tab"), true);
  tabs[2].click();
  assert.equal(a.doc.querySelector(".app-shell").dataset.page, "panic");
  assert.equal(
    a.doc.querySelector("nav .calm-tab").getAttribute("aria-current"),
    "page",
  );
  assert.ok(a.doc.querySelector('[data-action="breath"]'));
  a.click("language");
  assert.match(a.doc.querySelector("nav .calm-tab").textContent, /सुकून/);
  a.close();
});

test("tapping the same feeling clears it, persists the change, and permits reselection", () => {
  const a = app({ consent: true, lang: "en", entries: [] });
  a.click("mood-good");
  assert.equal(a.data().mood.value, "good");
  a.click("mood-good");
  assert.equal(a.data().mood, undefined);
  assert.equal(a.doc.querySelectorAll(".mood.selected").length, 0);
  assert.equal(
    a.doc
      .querySelector('[data-action="mood-good"]')
      .getAttribute("aria-pressed"),
    "false",
  );
  assert.match(
    a.doc.querySelector(".mood-note").textContent,
    /No right or wrong way/,
  );
  a.click("journal");
  a.click("home");
  assert.equal(a.doc.querySelectorAll(".mood.selected").length, 0);
  const reopened = app(a.data());
  assert.equal(reopened.doc.querySelectorAll(".mood.selected").length, 0);
  reopened.close();
  a.click("mood-good");
  assert.equal(a.data().mood.value, "good");
  a.click("mood-low");
  assert.equal(a.data().mood.value, "low");
  assert.equal(a.doc.querySelectorAll(".mood.selected").length, 1);
  a.click("language");
  a.click("mood-low");
  assert.equal(a.data().mood, undefined);
  assert.equal(a.doc.querySelectorAll(".mood.selected").length, 0);
  a.close();
});

test("failed mood deselection restores the prior selection", () => {
  const a = app({ consent: true, lang: "en", entries: [] });
  a.click("mood-good");
  a.w.alert = () => {};
  a.w.Storage.prototype.setItem = () => {
    throw new Error("Storage unavailable");
  };
  a.click("mood-good");
  assert.equal(
    a.doc
      .querySelector('[data-action="mood-good"]')
      .getAttribute("aria-pressed"),
    "true",
  );
  assert.equal(a.data().mood.value, "good");
  a.close();
});

test("selection updates keep keyboard focus; navigation focuses the new screen heading", () => {
  const a = app({ consent: true, lang: "en", entries: [] });
  a.doc.querySelector('[data-action="mood-good"]').focus();
  a.click("mood-good");
  assert.equal(a.doc.activeElement.dataset.action, "mood-good");
  a.click("mood-good");
  assert.equal(a.doc.activeElement.dataset.action, "mood-good");
  assert.equal(a.doc.activeElement.getAttribute("aria-pressed"), "false");
  a.click("journal");
  assert.equal(a.doc.activeElement, a.doc.querySelector("main h1"));
  assert.match(
    a.doc.querySelector("#status").textContent,
    /Only stored on this device/,
  );
  a.close();
});

function fakeSupabase() {
  let current = null;
  const calls = [];
  let row = null;
  const sdk = {
    calls,
    auth: {
      onAuthStateChange() {
        return { data: { subscription: { unsubscribe() {} } } };
      },
      async getSession() {
        return { data: { session: null }, error: null };
      },
      async getUser() {
        return current
          ? { data: { user: current }, error: null }
          : { data: { user: null }, error: { code: "no_session" } };
      },
      async signInWithPassword(values) {
        calls.push(["signin", values.email]);
        current = {
          id: values.email.startsWith("second")
            ? "second-account"
            : "first-account",
          email: values.email,
        };
        return { data: { session: { user: current } }, error: null };
      },
      async signUp(values) {
        calls.push(["signup", values.email]);
        return {
          data: { session: null, user: { id: "confirmation-pending" } },
          error: null,
        };
      },
      async resetPasswordForEmail(email) {
        calls.push(["reset", email]);
        return { data: {}, error: null };
      },
      async resend(values) {
        calls.push(["resend", values.email]);
        return { data: {}, error: null };
      },
      async updateUser() {
        calls.push(["update-password"]);
        return { data: { user: current }, error: null };
      },
      async signOut() {
        calls.push(["signout"]);
        current = null;
        return { error: null };
      },
    },
    from(table) {
      calls.push(["table", table]);
      let operation = "read",
        payload,
        revision;
      const q = {
        select() {
          return q;
        },
        eq(key, value) {
          if (key === "revision") revision = value;
          return q;
        },
        insert(value) {
          operation = "insert";
          payload = value;
          return q;
        },
        update(value) {
          operation = "update";
          payload = value;
          return q;
        },
        async maybeSingle() {
          if (operation === "read") return { data: row, error: null };
          if (operation === "update" && revision !== row?.revision)
            return { data: null, error: null };
          row = { ...row, ...payload, revision: (row?.revision || 0) + 1 };
          return { data: { revision: row.revision }, error: null };
        },
      };
      return q;
    },
    async rpc(name) {
      calls.push(["rpc", name]);
      row = null;
      return { error: null };
    },
    functions: {
      async invoke(name) {
        calls.push(["function", name]);
        return { data: { deleted: true }, error: null };
      },
    },
    getRow: () => row,
  };
  return sdk;
}
async function settle(a) {
  for (let i = 0; i < 200; i++) {
    await new Promise((resolve) => setTimeout(resolve, 10));
    if (!a.w.__accountTest.isBusy()) return;
  }
  throw Error("Account request did not settle");
}
async function signIn(a, email = "first@example.invalid") {
  a.w.eval("go('login')");
  a.doc.querySelector("#auth-email").value = email;
  a.doc.querySelector("#auth-password").value = "long account password";
  a.doc
    .querySelector("#account-form")
    .dispatchEvent(
      new a.w.Event("submit", { bubbles: true, cancelable: true }),
    );
  await settle(a);
}
test("login is optional; signup uses confirmation and password fields are cleared", async () => {
  const sdk = fakeSupabase(),
    a = app(undefined, sdk);
  a.click("login");
  a.click("account-guest");
  assert.equal(a.doc.querySelector(".app-shell").dataset.page, "welcome");
  a.click("signup");
  a.doc.querySelector("#auth-email").value = "owner@example.invalid";
  a.doc.querySelector("#auth-password").value = "long account password";
  a.doc.querySelector("#auth-consent").checked = true;
  a.click("show-password");
  assert.equal(a.doc.querySelector("#auth-password").type, "text");
  a.doc
    .querySelector("#account-form")
    .dispatchEvent(
      new a.w.Event("submit", { bubbles: true, cancelable: true }),
    );
  await settle(a);
  assert.equal(sdk.calls[0][0], "signup");
  assert.match(
    a.doc.querySelector("#account-status").textContent,
    /Check your email/,
  );
  assert.equal(a.doc.querySelector("#auth-password").value, "");
  assert.equal(sdk.getRow(), null);
  a.click("panic");
  assert.ok(a.doc.querySelector('[data-action="breath"]'));
  a.close();
});
test("accounts have isolated notebooks; guest import and cloud backup require explicit actions", async () => {
  const guest = {
      consent: true,
      lang: "en",
      entries: [{ date: "2026-11-07", text: "Guest writing" }],
    },
    sdk = fakeSupabase(),
    a = app(guest, sdk);
  await signIn(a);
  assert.equal(a.doc.querySelector(".app-shell").dataset.page, "account");
  assert.equal(a.w.__notebookTest().entries.length, 0);
  assert.equal(
    sdk.calls.some((x) => x[0] === "table"),
    false,
  );
  assert.equal(
    JSON.parse(a.w.localStorage.getItem("saath-prototype-v1")).entries[0].text,
    "Guest writing",
  );
  a.click("import-guest");
  assert.equal(a.w.__notebookTest().entries[0].text, "Guest writing");
  assert.equal(sdk.getRow(), null);
  a.click("cloud");
  a.doc.querySelector("#vault-password").value = "separate backup passphrase";
  const form = a.doc.querySelector("#account-form"),
    submit = a.doc.querySelector('button[value="upload"]');
  form.dispatchEvent(
    new a.w.SubmitEvent("submit", {
      bubbles: true,
      cancelable: true,
      submitter: submit,
    }),
  );
  await settle(a);
  assert.equal(sdk.getRow(), null);
  a.doc.querySelector("#cloud-consent").checked = true;
  form.dispatchEvent(
    new a.w.SubmitEvent("submit", {
      bubbles: true,
      cancelable: true,
      submitter: submit,
    }),
  );
  await settle(a);
  assert.ok(sdk.getRow()?.ciphertext);
  assert.equal(sdk.getRow().ciphertext.includes("Guest writing"), false);
  assert.equal(a.doc.querySelector("#vault-password").value, "");
  a.click("back");
  a.click("signout");
  await settle(a);
  assert.equal(a.w.__notebookTest().entries[0].text, "Guest writing");
  await signIn(a, "second@example.invalid");
  assert.equal(a.w.__notebookTest().entries.length, 0);
  a.close();
});
test("forgot password has neutral feedback; signed-in data deletion removes cloud data first", async () => {
  const sdk = fakeSupabase(),
    a = app({ consent: true, lang: "en", entries: [] }, sdk);
  a.w.eval("go('forgot-password')");
  a.doc.querySelector("#auth-email").value = "first@example.invalid";
  a.doc
    .querySelector("#account-form")
    .dispatchEvent(
      new a.w.Event("submit", { bubbles: true, cancelable: true }),
    );
  await settle(a);
  assert.match(
    a.doc.querySelector("#account-status").textContent,
    /If recovery is available/,
  );
  await signIn(a);
  a.click("account-guest");
  a.click("consent");
  a.click("settings");
  a.click("delete");
  await settle(a);
  assert.ok(
    sdk.calls.some((x) => x[0] === "rpc" && x[1] === "saath_delete_my_data"),
  );
  assert.equal(a.doc.querySelector(".app-shell").dataset.page, "welcome");
  a.close();
});

test("a late sign-in response cannot reopen an account after sign-out", async () => {
  const sdk = fakeSupabase(),
    a = app({ consent: true, lang: "en", entries: [] }, sdk);
  let resolveUser;
  sdk.auth.getUser = () =>
    new Promise((resolve) => {
      resolveUser = resolve;
    });
  const late = a.w.__accountTest.receive(
    { user: { id: "first-account" } },
    "SIGNED_IN",
  );
  await a.w.__accountTest.receive(null, "SIGNED_OUT");
  resolveUser({
    data: { user: { id: "first-account", email: "first@example.invalid" } },
    error: null,
  });
  await late;
  assert.equal(a.w.__accountTest.getUser(), null);
  a.close();
});
test("failed remote data deletion keeps the local notebook and reports failure", async () => {
  const sdk = fakeSupabase(),
    a = app(
      {
        consent: true,
        lang: "en",
        entries: [{ date: "2026-11-07", text: "Keep this" }],
      },
      sdk,
    );
  await signIn(a);
  a.click("import-guest");
  a.click("account-guest");
  a.click("settings");
  sdk.rpc = async () => ({ error: { code: "network_error" } });
  a.click("delete");
  await settle(a);
  assert.equal(a.w.__notebookTest().entries[0].text, "Keep this");
  assert.match(
    a.doc.querySelector("#global-status").textContent,
    /Could not complete/,
  );
  a.close();
});

test("Google sign-in appears on login/signup, requires separate consent and never uploads notebooks", async () => {
  const sdk = fakeSupabase(),
    a = app({ consent: true, lang: "en", entries: [] }, sdk);
  a.click("settings");
  a.click("login");
  a.click("google-signin");
  await settle(a);
  assert.equal(a.w.__googleCalls, undefined);
  assert.match(
    a.doc.querySelector("#account-status").textContent,
    /confirm the Google/,
  );
  a.doc.querySelector("#google-consent").checked = true;
  a.click("google-signin");
  await settle(a);
  assert.equal(a.w.__googleCalls, 1);
  a.w.__googleError = { code: "google_provider_disabled" };
  a.click("google-signin");
  await settle(a);
  assert.match(
    a.doc.querySelector("#account-status").textContent,
    /project owner must configure Google OAuth/,
  );
  assert.equal(
    sdk.calls.some((x) => x[0] === "table"),
    false,
  );
  a.click("signup");
  assert.ok(a.doc.querySelector("[data-action=google-signin]"));
  assert.equal(a.doc.querySelector("#google-consent").checked, false);
  a.click("language");
  assert.match(
    a.doc.querySelector("[data-action=google-signin]").textContent,
    /Google से/,
  );
  a.close();
});
