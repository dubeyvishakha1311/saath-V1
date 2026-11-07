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
  );

function app(saved) {
  const dom = new JSDOM('<div id="app"></div>', {
    url: "https://saath.test",
    runScripts: "outside-only",
  });
  const w = dom.window;
  w.__features = features;
  w.scrollTo = () => {};
  w.confirm = () => true;
  if (saved)
    w.localStorage.setItem("saath-prototype-v1", JSON.stringify(saved));
  w.eval(source);
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

test('Calm is the prominent middle tab and opens the panic tools', () => {
  const a = app({consent:true,lang:'en',entries:[]});
  const tabs = [...a.doc.querySelectorAll('nav .tab')];
  assert.deepEqual(tabs.map(el=>el.dataset.action), ['home','explore','panic','journal','settings']);
  assert.equal(tabs[2].classList.contains('calm-tab'), true);
  tabs[2].click();
  assert.equal(a.doc.querySelector('.app-shell').dataset.page, 'panic');
  assert.equal(a.doc.querySelector('nav .calm-tab').getAttribute('aria-current'), 'page');
  assert.ok(a.doc.querySelector('[data-action="breath"]'));
  a.click('language');
  assert.match(a.doc.querySelector('nav .calm-tab').textContent, /सुकून/);
  a.close();
});
