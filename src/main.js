import { createNativeUpdater } from "./native-updates.js";
import "./style.css";
import "./native-navigation.js";
import {
  extraPages,
  renderExtra,
  bindExtra,
  handleExtra,
  riskSignal,
  weeklyThemes,
} from "./features.js";
import { createAccountController, accountPages } from "./account.js";
import {
  supabase,
  authRedirectURL,
  listenForNativeAuth,
  startGoogleSignIn,
  authCallbackFailed,
} from "./supabase.js";
import {
  dailyQuestions,
  journalFollowUps,
  renderConclusion,
  journalDay,
  journalSelection,
  hasJournalSafetyChoice,
  journalSummary,
  choiceButtons,
  toggleOption,
} from "./journal.js";
const root = document.querySelector("#app");
const GUEST_KEY = "saath-prototype-v1";
let KEY = GUEST_KEY;
let notebookOwner = null;
let state;
try {
  state = JSON.parse(localStorage.getItem(KEY)) || {};
} catch {
  state = {};
}
state.entries ||= [];
state.lang ||= "en";
let page = state.consent ? "home" : "welcome",
  tool = "",
  timer;
const hi = () => state.lang === "hi";
const t = (a, b) => (hi() ? b : a);
const escape = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const date = () => new Date().toLocaleDateString("en-CA");
const persist = () => {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
};
const prompts = dailyQuestions.map((q) => [q.en, q.hi]);
const today = () => state.entries.find((e) => e.date === date());
const navigationStack = [];
let contactDraft;
let updates;
function navigate(p, nextTool = "", { replace = false } = {}) {
  if (
    !state.consent &&
    !["welcome", "panic", "crisis", "professional", ...accountPages].includes(p)
  )
    p = "welcome";
  if (page === p && tool === nextTool) return;
  if (!replace) navigationStack.push({ page, tool, scroll: window.scrollY });
  page = p;
  tool = nextTool;
  render();
  window.scrollTo(0, 0);
}
function go(p) {
  navigate(p);
}
function goBack() {
  const previous = navigationStack.pop();
  if (!previous) return;
  page = previous.page;
  tool = previous.tool;
  if (
    !state.consent &&
    !["welcome", "panic", "crisis", "professional", ...accountPages].includes(
      page,
    )
  ) {
    page = "welcome";
    tool = "";
  }
  render();
  window.scrollTo(0, previous.scroll);
}
window.addEventListener("saath:back", goBack);
function screenControls() {
  return `<div class="screen-controls" role="group" aria-label="${t("Screen navigation", "स्क्रीन नेविगेशन")}"><button class="back-button" data-action="back" ${navigationStack.length ? "" : "disabled"}>${icon("back")}<span>${t("Back", "वापस")}</span></button><span class="screen-title">${t({ home: "TODAY", welcome: "WELCOME", journal: "JOURNAL", panic: tool ? "EXERCISE" : "CALM SPACE", settings: "MY SPACE", reflection: "MY WEEK", crisis: "SUPPORT", explore: "EXPLORE", story: "STORY", song: "SONG", poem: "POEM", experience: "REFLECTION", library: "EXERCISES", exercise: "SMALL STEP", screening: "CHECK-IN", questionnaire: "CHECK-IN", "screen-result": "CHECK-IN", history: "SAVED", professional: "PROFESSIONAL HELP", "research-story": "RESEARCH", "research-song": "RESEARCH", "research-poem": "RESEARCH", login: "SIGN IN", signup: "CREATE ACCOUNT", "forgot-password": "PASSWORD HELP", "reset-password": "NEW PASSWORD", account: "ACCOUNT", cloud: "CLOUD BACKUP" }[page], { home: "आज", welcome: "स्वागत", journal: "डायरी", panic: tool ? "अभ्यास" : "सुकून", settings: "मेरी जगह", reflection: "मेरा सप्ताह", crisis: "सहायता", explore: "आज़माएँ", story: "कहानी", song: "गीत", poem: "कविता", experience: "चिंतन", library: "अभ्यास", exercise: "छोटा कदम", screening: "जाँच", questionnaire: "जाँच", "screen-result": "जाँच", history: "सेव किया", professional: "पेशेवर सहायता", "research-story": "शोध", "research-song": "शोध", "research-poem": "शोध", login: "साइन इन", signup: "खाता बनाएँ", "forgot-password": "पासवर्ड सहायता", "reset-password": "नया पासवर्ड", account: "खाता", cloud: "क्लाउड बैकअप" }[page])}</span>${button(icon("home") + `<span>${t("Home", "होम")}</span>`, "home-root", "home-button")}</div>`;
}
function button(label, action, cls = "") {
  return `<button class="${cls}" data-action="${action}">${label}</button>`;
}
const paths = {
  explore: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M16 8l-3 5-5 3 3-5Z",
  song: "M9 18V5l11-2v13 M9 8l11-2 M9 18c0 3-6 4-6 1s6-4 6-1 M20 16c0 3-6 4-6 1s6-4 6-1",
  poem: "M9 7H4v6h5V7 M4 13v4 M20 7h-5v6h5V7 M15 13v4",
  story:
    "M12 6C8 3 4 4 2 5v15c4-2 7-2 10 0 3-2 6-2 10 0V5c-2-1-6-2-10 1Z M12 6v14",
  library: "M5 3v18 M9 5h4v16H9Z M15 6l4-1 4 15-4 1Z",
  screening: "M8 4h8v3H8Z M8 5H5v16h14V5h-3 M9 12h6 M9 16h6",

  home: "M3 10 12 3l9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z",
  journal: "M5 3h14v18H5z M8 7h8 M8 11h8 M8 15h5",
  panic: "M3 12h3l3-7 5 14 3-7h4",
  settings:
    "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M12 2v3 M12 19v3 M2 12h3 M19 12h3 M5 5l2 2 M17 17l2 2 M5 19l2-2 M17 7l2-2",
  arrow: "M5 12h14 M13 6l6 6-6 6",
  leaf: "M20 4C7 2 2 9 6 16s16 5 14-12Z M5 21 16 10",
  heart: "M12 21 3 12C-2 5 7 0 12 7c5-7 14-2 9 5Z",
  back: "M15 5l-7 7 7 7",
  phone: "M6 3H3v3c0 8 7 15 15 15h3v-4l-5-2-2 2c-3-1-6-4-7-7l2-2-2-5Z",
  sun: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M12 2v2 M12 20v2 M2 12h2 M20 12h2 M5 5l1 1 M18 18l1 1 M5 19l1-1 M18 6l1-1",
};
function icon(name) {
  return `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${(
    paths[name] || paths.leaf
  )
    .split(" M")
    .map((d, i) => `<path d="${i ? "M" : ""}${d}"/>`)
    .join("")}</svg>`;
}
function greeting() {
  const hour = new Date().getHours();
  return hour < 12
    ? t("Good morning", "सुप्रभात")
    : hour < 17
      ? t("Good afternoon", "शुभ दोपहर")
      : t("Good evening", "शुभ संध्या");
}
function featureContext() {
  return {
    state,
    t,
    escape,
    button,
    icon,
    root,
    go,
    render,
    persist,
    alert: (message) => window.alert(message),
  };
}
function render() {
  const focusedAction = document.activeElement?.dataset?.action;
  const previousPage = root.querySelector(".app-shell")?.dataset.page;
  const previousHeading = root.querySelector("main h1")?.textContent;
  clearInterval(timer);
  document.documentElement.lang = state.lang;
  root.innerHTML = `<div class="app-shell" data-page="${page}"><header class="app-bar"><div class="app-identity"><span class="brand">saath<span>.</span></span><span class="brand-caption">${t("a personal notebook", "आपकी अपनी डायरी")}</span></div><div class="header-actions">${button(hi() ? "English" : "हिन्दी", "language", "language-button")}${button(icon("heart") + `<span>${t("Get help", "मदद")}</span>`, "crisis", "help")}</div></header><main class="wrap" id="screen">${screenControls()}<p id="global-status" role="status" class="global-status"></p>${content()}</main>${
    state.consent
      ? `<nav aria-label="${t("Main navigation", "मुख्य नेविगेशन")}">${[
          ["home", t("Today", "आज")],
          ["explore", t("Explore", "आज़माएँ")],
          ["panic", t("Calm", "सुकून")],
          ["journal", t("Journal", "डायरी")],
          ["settings", t("My space", "मेरी जगह")],
        ]
          .map(
            ([p, label]) =>
              `<button data-action="${p}" ${page === p ? 'aria-current="page"' : ""} class="tab ${p === "panic" ? "calm-tab" : ""} ${page === p ? "active" : ""}"><span class="tab-icon">${icon(p)}</span><span>${label}</span></button>`,
          )
          .join("")}</nav>`
      : ""
  }</div>`;
  if (
    previousPage &&
    previousPage !== page &&
    !["crisis", "panic"].includes(page)
  )
    root.querySelector("#screen").classList.add("route-enter");
  root
    .querySelectorAll("[data-action]")
    .forEach((el) => (el.onclick = () => act(el.dataset.action)));
  // Preserve keyboard position when a local selection redraws the screen.
  const headingChanged =
    root.querySelector("main h1")?.textContent !== previousHeading;
  if (
    focusedAction &&
    previousPage === page &&
    (!headingChanged || focusedAction === "language")
  ) {
    [...root.querySelectorAll("[data-action]")]
      .find((el) => el.dataset.action === focusedAction)
      ?.focus({ preventScroll: true });
  } else if (previousPage && (previousPage !== page || headingChanged)) {
    const heading = root.querySelector("main h1");
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
  }
  account.bind();
  bindExtra(root, featureContext());
  if (page === "settings") {
    updateContactDraftUI();
    root.querySelector("#phone")?.addEventListener("input", (event) => {
      contactDraft = event.target.value;
      updateContactDraftUI();
    });
  }
  if (page === "journal") {
    const field = root.querySelector("textarea");
    field?.addEventListener("input", () => {
      state.draft = field.value;
      const ok = persist();
      root.querySelector("#status").textContent = ok
        ? t("Draft saved on this device", "ड्राफ़्ट इस डिवाइस पर सेव है")
        : t(
            "Storage full. Your draft could not be saved.",
            "स्टोरेज भर गया है। ड्राफ़्ट सेव नहीं हुआ।",
          );
    });
  }
  if (tool === "breath") {
    let n = 0;
    timer = setInterval(() => {
      n = (n + 1) % 9;
      const el = document.querySelector("#phase");
      if (el)
        el.textContent =
          n < 4
            ? t("Breathe in gently", "धीरे साँस लें")
            : t("Breathe out slowly", "धीरे साँस छोड़ें");
    }, 1000);
  }
}
function journalFollowUpSelection(index, entry) {
  return state.journalChoices?.day === index + 1
    ? state.journalChoices.followUps || {}
    : entry?.followUps || {};
}
function journalWeekConclusion() {
  const question = journalFollowUps.find((q) => q.id === "step");
  const steps = [
    ...new Set(state.entries.flatMap((entry) => entry.followUps?.step || [])),
  ];
  return `<section class="card choice-conclusion"><h2>${t("Your seven-day conclusion", "आपके सात दिनों का निष्कर्ष")}</h2><p>${t("You made time for seven reflections. That records your participation, not proof of improvement or a diagnosis.", "आपने सात बार चिंतन के लिए समय निकाला। यह आपकी भागीदारी है, सुधार का प्रमाण या निदान नहीं।")}</p>${
    steps.length
      ? `<p>${t("Next steps you chose during the week: ", "सप्ताह के दौरान आपके चुने अगले कदम: ")}${escape(
          question.options
            .filter((o) => steps.includes(o.id))
            .map((o) => t(o.en, o.hi))
            .join(" · "),
        )}</p>`
      : `<p>${t("You can revisit the choices below and decide what, if anything, to carry forward.", "नीचे के चुनाव फिर देखें और तय करें कि क्या आगे साथ रखना है, अगर कुछ रखना चाहें।")}</p>`
  }<p>${t("Keep one manageable action if it fits, change it, or pause. No score or personality label is assigned. If difficulties persist, consider qualified support.", "सही लगे तो एक आसान कदम रखें, बदलें या विराम लें। कोई स्कोर या व्यक्तित्व लेबल नहीं दिया जाता। कठिनाई बनी रहे तो योग्य सहायता पर विचार करें।")}</p></section>`;
}
function journalExtraQuestions(index, entry, ids) {
  const selected = journalFollowUpSelection(index, entry);
  return `<section><h2>${t("A few more ways to reflect", "चिंतन के कुछ और तरीके")}</h2><p>${t("All optional. Pick any that fit; tap again to clear. No writing needed.", "सब वैकल्पिक। जो सही लगे चुनें; हटाने के लिए फिर दबाएँ। लिखना ज़रूरी नहीं।")}</p>${journalFollowUps.map((q) => `<div class="card"><h3>${t(q.en, q.hi)}</h3>${choiceButtons(selected[q.id] || [], q.options, featureContext(), `journal-followup:${q.id}`)}</div>`).join("")}</section>${riskSignal(state.draft ?? entry?.text ?? "") ? "" : renderConclusion("journal", ids, featureContext(), dailyQuestions[index].options, selected)}`;
}
function renderHome() {
  const completed = state.entries.length;
  const day = Math.min(completed + (today() ? 0 : 1), 7);
  const checkedIn = state.mood?.date === date();
  return `<section class="daily-greeting"><div class="date-label">${new Date().toLocaleDateString(hi() ? "hi-IN" : "en-IN", { weekday: "long", day: "numeric", month: "long" })}</div><h1>${greeting()}${hi() ? "।" : "."}</h1><p>${t("Where are you at today?", "आज आपका मन कैसा है?")}</p></section>
  <section class="mood-section" aria-labelledby="mood-heading"><div class="section-title"><h2 id="mood-heading">${t("How are you feeling?", "आप कैसा महसूस कर रहे हैं?")}</h2><span>${t("Optional", "वैकल्पिक")}</span></div><div class="mood-list" role="group" aria-label="${t("Today’s mood", "आज का मन")}">${[
    ["low", "Low", "उदास"],
    ["heavy", "Heavy", "भारी"],
    ["okay", "Okay", "ठीक"],
    ["good", "Good", "अच्छा"],
    ["bright", "Bright", "खुश"],
  ]
    .map(
      ([id, en, hn]) =>
        `<button data-action="mood-${id}" class="mood ${checkedIn && state.mood.value === id ? "selected" : ""}" aria-pressed="${checkedIn && state.mood.value === id}"><span class="mood-face"><svg aria-hidden="true" viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" stroke-width="1.25"/><circle cx="14" cy="16" r="1.3" fill="currentColor"/><circle cx="26" cy="16" r="1.3" fill="currentColor"/><path d="${id === "low" ? "M14 27Q20 21 26 27" : id === "heavy" ? "M14 25Q17 23 20 25T26 25" : id === "okay" ? "M14 25H26" : id === "good" ? "M14 24Q20 30 26 24" : "M12 23Q20 35 28 23"}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></span><span>${t(en, hn)}</span></button>`,
    )
    .join(
      "",
    )}</div><p class="mood-note" role="status">${checkedIn ? t("Saved for today. Tap the same feeling to clear it.", "आज के लिए सेव है। हटाने के लिए उसी भावना पर फिर टैप करें।") : t("No right or wrong way to feel. You can skip this.", "महसूस करने का कोई सही या गलत तरीका नहीं। इसे छोड़ सकते हैं।")}</p></section>
  <section class="journal-tile"><div class="tile-top"><span class="eyebrow">${t("YOUR SEVEN-DAY JOURNAL", "आपकी सात दिन की डायरी")}</span><span class="journal-day">${String(day).padStart(2, "0")}<small>/ 07</small></span></div><h2>${completed >= 7 ? t("A week,<br>in your own words.", "एक सप्ताह,<br>आपके अपने शब्दों में।") : t("A few taps<br>about today.", "आज के बारे में<br>कुछ चुनाव।")}</h2><p>${completed >= 7 ? t("Revisit what you wrote. See what stands out.", "अपनी लिखी बातें फिर पढ़ें। देखें क्या अलग लगता है।") : escape(prompts[Math.min(day - 1, 6)][hi() ? 1 : 0])}</p>${button(`<span>${completed >= 7 ? t("Read my week", "मेरा सप्ताह पढ़ें") : t(today() ? "Review today" : "Open my journal", today() ? "आज के जवाब देखें" : "मेरी डायरी खोलें")}</span>${icon("arrow")}`, completed >= 7 ? "reflection" : "journal", "primary wide")}<div class="journal-bottom"><div class="dots" aria-label="${t(`${completed} of 7 days completed`, `7 में से ${completed} दिन पूरे`)}">${Array.from({ length: 7 }, (_, i) => `<span class="dot ${i < completed ? "done" : ""}">${i < completed ? "✓" : i + 1}</span>`).join("")}</div><span>${completed}/7 ${t("completed", "दिन पूरे")}</span></div><small>${t("Missed days don’t reset your progress.", "छूटे दिनों से आपकी प्रगति नहीं मिटती।")}</small></section>
  ${today() && !riskSignal(today().text) ? renderConclusion("journal", today().optionIds || [], featureContext(), dailyQuestions[(today().day || 1) - 1]?.options || [], today().followUps || {}) : ""}
  <section class="quick-section"><div class="section-title"><h2>${t("Need a moment?", "थोड़ा रुकना चाहेंगे?")}</h2><span>${t("No writing needed", "लिखना ज़रूरी नहीं")}</span></div><div class="quick-tools"><button class="quick-tile" data-action="quick-breath"><span class="tool-symbol">${icon("panic")}</span><span><strong>${t("Slow breathing", "धीरे साँस लें")}</strong><small>${t("Follow a comfortable rhythm", "आरामदायक लय में साँस लें")}</small></span><span class="tile-arrow">${icon("arrow")}</span></button><button class="quick-tile" data-action="quick-ground"><span class="tool-symbol">${icon("sun")}</span><span><strong>${t("Notice what’s around you", "अपने आसपास ध्यान दें")}</strong><small>${t("5–4–3–2–1 grounding", "5–4–3–2–1 ग्राउंडिंग")}</small></span><span class="tile-arrow">${icon("arrow")}</span></button></div></section>
  <button class="explore-entry" data-action="explore"><span><strong>${t("Start somewhere else", "कहीं और से शुरू करें")}</strong><small>${t("A story, a song or an unfinished poem.", "एक कहानी, एक गीत या अधूरी कविता।")}</small></span>${icon("arrow")}</button><p class="prototype-label">${t("Self-reflection, not treatment. Internal testing prototype.", "आत्म-चिंतन, उपचार नहीं। आंतरिक परीक्षण प्रोटोटाइप।")}</p>`;
}
function content() {
  if (accountPages.includes(page)) return account.renderPage(page);
  if (extraPages.includes(page)) return renderExtra(page, featureContext());
  if (
    page === "reflection" &&
    state.entries.length >= 7 &&
    (riskSignal(state.entries.map((e) => e.text).join("\n")) ||
      state.entries.some(hasJournalSafetyChoice))
  )
    return weeklyThemes(featureContext());
  switch (page) {
    case "welcome":
      return `<div class="welcome-art" aria-hidden="true"><span class="notebook-mark">${icon("journal")}</span><span class="edition-label">SAATH / 01</span></div><div class="eyebrow">${t("YOUR PERSONAL NOTEBOOK", "आपकी अपनी डायरी")}</div><h1>${t("Start with<br>a small check-in.", "शुरुआत करें<br>एक छोटे चेक-इन से।")}</h1><p>${t("Pick what fits, or add a note if you want. You can also try a story, song or poem.", "जो लागू हो चुनें, या चाहें तो एक नोट जोड़ें। कहानी, गीत या कविता भी आज़मा सकते हैं।")}</p><p class="eyebrow">${t("WELLNESS REFLECTION · 15+", "वेलनेस चिंतन · 15+")}</p><p>${t("The first step toward wellness for students and adults as well.", "विद्यार्थियों और वयस्कों के लिए भी बेहतर महसूस करने की ओर पहला कदम।")}</p><p>${t("More than labels: a space for everyday reflection, creativity and small steps. Saath does not provide therapy or diagnosis, and is not a monitored crisis service.", "लेबल से आगे: रोज़मर्रा के चिंतन, रचनात्मकता और छोटे कदमों की जगह। साथ थेरेपी या निदान नहीं देता और निगरानी वाली संकट सेवा नहीं है।")}</p><p class="notice">${t("15+ is the intended audience, not clinical approval for teenagers. If you are under 18, involve a trusted adult where safe and appropriate. Youth safeguarding, consent and privacy review are still required before a real-world pilot.", "15+ इच्छित आयु है, किशोरों के लिए क्लिनिकल मंज़ूरी नहीं। 18 से कम उम्र हो तो सुरक्षित और उचित होने पर भरोसेमंद वयस्क को शामिल करें। वास्तविक पायलट से पहले किशोर सुरक्षा, सहमति और गोपनीयता समीक्षा ज़रूरी है।")}</p><details class="optional-note"><summary>${t("Privacy on this device", "इस डिवाइस पर गोपनीयता")}</summary><p>${t("Writing is stored on this device without app-level encryption. Anyone with device access may read it. Avoid sensitive details on shared devices. No ads or analytics. Optional accounts use Supabase; only explicit encrypted backups upload notebooks. Uninstalling or clearing data can erase writing.", "लिखावट इस डिवाइस पर ऐप-स्तर एन्क्रिप्शन के बिना रहती है। डिवाइस तक पहुँच वाला व्यक्ति इसे पढ़ सकता है। साझा डिवाइस पर संवेदनशील बातें न लिखें। विज्ञापन या एनालिटिक्स नहीं। वैकल्पिक खाते Supabase उपयोग करते हैं; डायरी केवल स्पष्ट एन्क्रिप्टेड बैकअप से अपलोड होती है। ऐप हटाने या डेटा मिटाने से लिखावट मिट सकती है।")}</p></details>${button(t("Start · agree to local storage", "शुरू करें · स्थानीय स्टोरेज से सहमत"), "consent", "primary wide")}${account.intro()}`;
    case "home":
      return renderHome();
    case "journal": {
      const entry = today();
      if (state.entries.length >= 7 && !entry)
        return `<h1>${t("Your seven days are here.", "आपके सात दिन पूरे हो गए।")}</h1><p>${t("Take a moment to revisit your week. A new journal cycle is not yet available in this prototype.", "अपने सप्ताह को फिर से देखें। इस प्रोटोटाइप में नया चक्र अभी उपलब्ध नहीं है।")}</p>${button(t("View reflection", "चिंतन देखें"), "reflection", "primary")}`;
      const index = journalDay(state, date());
      const question = dailyQuestions[index],
        ids = journalSelection(state, index, entry);
      return `<div class="eyebrow">${t("Day", "दिन")} ${index + 1} / 7</div><h1>${prompts[index][hi() ? 1 : 0]}</h1><p class="muted">${t(question.single ? "Pick one. Tap it again to clear. Typing is optional." : "Pick all that fit. Tap again to clear. Typing is optional.", question.single ? "एक चुनें। हटाने के लिए फिर दबाएँ। लिखना वैकल्पिक है।" : "जो लागू हों, सब चुनें। हटाने के लिए फिर दबाएँ। लिखना वैकल्पिक है।")}</p>${choiceButtons(ids, question.options, featureContext(), "journal-choice", question.single)}${journalExtraQuestions(index, entry, ids)}<details class="optional-note" ${(state.draft ?? entry?.text) ? "open" : ""}><summary>${t("Add a note (optional)", "एक नोट जोड़ें (वैकल्पिक)")}</summary><label for="entry">${t("Anything to add? (optional)", "कुछ जोड़ना चाहेंगे? (वैकल्पिक)")}</label><textarea id="entry" maxlength="12000" placeholder="${t("Start wherever you are…", "जहाँ हैं, वहीं से शुरू करें…")}">${escape(state.draft ?? entry?.text ?? "")}</textarea></details><div id="status" class="status" role="status">${state.draft ? t("Draft saved on this device", "ड्राफ़्ट इस डिवाइस पर सेव है") : t("Local notebook. Cloud backup is a separate action.", "स्थानीय डायरी। क्लाउड बैकअप के लिए अलग कार्रवाई करनी होगी।")}</div><div class="row">${button(t("Save today’s entry", "आज का पन्ना सेव करें"), "save", "primary")}${button(t("Not right now", "अभी नहीं"), "home", "quiet")}</div><p class="notice">${t("Choices and notes stay on this device until you explicitly create an encrypted cloud backup from Account & backup. The Day 5 support rule awaits psychologist review. Your words are not monitored. Limited local safety-word matching can miss or misread signals. If you need urgent support, open Get help.", "खाता और बैकअप से एन्क्रिप्टेड क्लाउड बैकअप बनाने तक चुनाव और नोट इसी डिवाइस पर रहते हैं। दिन 5 के सहायता नियम की मनोवैज्ञानिक समीक्षा बाकी है। आपके शब्दों की निगरानी नहीं होती। सीमित स्थानीय सुरक्षा शब्द-मिलान संकेत चूक या गलत समझ सकता है। तुरंत सहायता चाहिए तो मदद खोलें।")}</p>${button(account.getUser() ? t("Account & cloud backup", "खाता और क्लाउड बैकअप") : t("Sign in for cloud backup", "क्लाउड बैकअप के लिए साइन इन"), account.getUser() ? "account" : "login", "quiet wide")}`;
    }
    case "reflection":
      return state.entries.length < 7
        ? `<h1>${t("A little more time", "थोड़ा और समय")}</h1><p>${t("Your reflection opens after seven completed days.", "सात दिन पूरे होने पर चिंतन खुलेगा।")}</p>`
        : `<div class="eyebrow">${t("Your week, in your words", "आपका सप्ताह, आपके शब्दों में")}</div><h1>${t("You made space<br>for yourself.", "आपने अपने लिए<br>जगह बनाई।")}</h1><p>${t("A private review with simple, tentative word-match themes—not AI analysis or a clinical assessment. Only you decide what fits.", "यह निजी समीक्षा और साधारण संभावित शब्द-मिलान विषय हैं—AI विश्लेषण या क्लिनिकल मूल्यांकन नहीं। क्या सही लगता है, आप तय करें।")}</p>${journalWeekConclusion()}${weeklyThemes(featureContext())}${state.entries.map((e, i) => `<details class="card"><summary>${t("Day", "दिन")} ${i + 1} · ${escape(e.date)}</summary><p style="white-space:pre-wrap">${escape(journalSummary(e, i, state.lang))}</p></details>`).join("")}<div class="card hero"><h2>${t("What do you notice?", "आप क्या देख पा रहे हैं?")}</h2><p>${t("Was there a feeling or situation that returned? Was there one moment of comfort? It is okay if nothing stands out.", "क्या कोई भावना या परिस्थिति बार-बार आई? क्या कोई सुकून का पल था? कुछ अलग न दिखे तो भी ठीक है।")}</p><h2>${t("An optional small step", "एक वैकल्पिक छोटा कदम")}</h2><p>${t("If it feels comfortable, name one kind, manageable action for tomorrow. You can skip this. These prompts have not yet had clinical review.", "सहज लगे तो कल के लिए एक छोटा, दयालु कदम सोचें। इसे छोड़ सकते हैं। इन प्रश्नों की अभी क्लिनिकल समीक्षा नहीं हुई है।")}</p></div><p>${t("If things feel persistently difficult, consider speaking with a qualified mental-health professional.", "अगर कठिनाई बनी हुई है, योग्य मानसिक स्वास्थ्य पेशेवर से बात करने पर विचार करें।")}</p>`;
    case "panic":
      return `<div class="eyebrow">${t("One moment at a time", "एक बार में एक पल")}</div><h1>${t("One thing<br>at a time.", "एक बार में<br>एक चीज़।")}</h1><p class="notice">${t("Chest pain, severe breathing difficulty, or a possible medical emergency? Seek emergency medical care now. Do not assume it is panic.", "सीने में दर्द, साँस लेने में गंभीर परेशानी या संभावित चिकित्सा आपातस्थिति? तुरंत आपात चिकित्सा सहायता लें। इसे केवल घबराहट न मानें।")}</p>${tool ? exercise() : `<div class="card"><h2>${t("Choose what feels okay", "जो सहज लगे, चुनें")}</h2><div class="calm-options">${button(icon("panic") + `<span>${t("Slow breathing", "धीरे साँस")}</span>` + icon("arrow"), "breath")}${button(icon("sun") + `<span>${t("5–4–3–2–1 grounding", "5–4–3–2–1 ग्राउंडिंग")}</span>` + icon("arrow"), "ground")}${button(icon("journal") + `<span>${t("Count backwards", "उलटी गिनती")}</span>` + icon("arrow"), "count")}</div><p>${t("These optional exercises are not treatment. Stop if uncomfortable.", "ये वैकल्पिक अभ्यास उपचार नहीं हैं। असहज लगे तो रोक दें।")}</p></div>`}<div class="card"><h2>${t("You can reach out", "आप बात कर सकते हैं")}</h2>${contactLink()}${button(t("Crisis & emergency help", "संकट और आपात मदद"), "crisis", "help")}</div>`;
    case "crisis":
      return `<div class="eyebrow">${t("Support right now", "अभी सहायता")}</div><h1>${t("Your safety matters.", "आपकी सुरक्षा ज़रूरी है।")}</h1><p>${t("If you may hurt yourself, someone else, or cannot stay safe, contact local emergency services or go to the nearest emergency department. If possible, move near someone you trust and away from things you could use to harm yourself.", "अगर आप खुद को या किसी और को नुकसान पहुँचा सकते हैं, या सुरक्षित नहीं रह सकते, स्थानीय आपात सेवा से संपर्क करें या नज़दीकी आपात विभाग जाएँ। संभव हो तो किसी भरोसेमंद व्यक्ति के पास जाएँ और नुकसान पहुँचाने वाली चीज़ों से दूर रहें।")}</p><div class="card"><h2>${t("Ask someone to stay with you", "किसी को अपने साथ रहने को कहें")}</h2>${contactLink()}<p>${t("In India: 112 for emergency assistance; Tele-MANAS 14416 for mental-health support. Outside India, use your local emergency service. Calls require phone service and are never placed automatically.", "भारत में: आपात सहायता के लिए 112; मानसिक स्वास्थ्य सहायता के लिए टेली-मानस 14416। भारत के बाहर स्थानीय आपात सेवा का उपयोग करें। कॉल के लिए फ़ोन सेवा चाहिए; कॉल अपने आप नहीं लगती।")}</p><div class="resource-links"><a class="danger call-button" href="tel:112">${t("Call emergency · 112", "आपात कॉल · 112")}</a><a class="primary call-button" href="tel:14416">${t("Call Tele-MANAS · 14416", "टेली-मानस · 14416")}</a></div><small>${t("India · official web listings checked 7 Nov 2026, not call-tested. Availability may vary.", "भारत · आधिकारिक वेब सूची 7 नवम्बर 2026 को जाँची; कॉल-परीक्षण नहीं। उपलब्धता बदल सकती है।")}</small><p><a href="https://112.gov.in/about" target="_blank" rel="noopener noreferrer">112 · official source</a> · <a href="https://dghs.mohfw.gov.in/national-mental-health-programme.php" target="_blank" rel="noopener noreferrer">Tele-MANAS · official source</a></p></div><p class="notice">${t("Saath is not monitored, cannot contact responders, and cannot reliably detect crises. Local word matching can miss signals or get them wrong. Nobody has been notified. Do not wait for a reply from this app.", "साथ की निगरानी नहीं होती, यह सहायता सेवाओं से संपर्क या भरोसेमंद संकट पहचान नहीं कर सकता। स्थानीय शब्द-मिलान संकेत चूक या गलत समझ सकता है। किसी को सूचित नहीं किया गया है। इस ऐप के जवाब का इंतज़ार न करें।")}</p>${button(t("Back to calming tools", "शांत होने के अभ्यास"), "panic", "quiet")}`;
    case "settings":
      return `<h1>${t("Make yourself<br>at home.", "अपनी जगह,<br>अपने तरीके से।")}</h1>${account.settingsCard()}${updates?.renderCard() || ""}<div class="card"><h2>${t("Faculty demo & worksheets", "फ़ैकल्टी डेमो और वर्कशीट")}</h2><p>${t("Explore 50 fictional profiles and 500 simulated daily records in a separate sandbox. Download CSV/JSON or a fillable PDF. Your notebook is not changed.", "अलग डेमो में 50 काल्पनिक प्रोफ़ाइल और 500 सिमुलेटेड रिकॉर्ड देखें। CSV/JSON या भरने योग्य PDF लें। आपकी डायरी नहीं बदलेगी।")}</p><a class="primary" href="./faculty/index.html">${t("Open simulated demo", "सिमुलेटेड डेमो खोलें")}</a><p><small>${t("Synthetic testing only — not real participants or clinical evidence.", "केवल कृत्रिम परीक्षण — वास्तविक प्रतिभागी या क्लिनिकल प्रमाण नहीं।")}</small></p></div>${trustedContactCard()}<div class="card"><h2>${t("Privacy & prototype limits", "गोपनीयता और सीमाएँ")}</h2><p>${t("Writing is stored locally without app-level encryption. Accounts use Supabase Auth and this device stores a sign-in session. Optional cloud backups are encrypted with your separate passphrase before upload. No ads, analytics or remote AI. Android app backup is disabled.", "लिखावट स्थानीय है, ऐप-स्तर एन्क्रिप्शन के बिना। खाते Supabase Auth उपयोग करते हैं और डिवाइस साइन-इन सत्र रखता है। वैकल्पिक क्लाउड बैकअप अपलोड से पहले आपकी अलग पासफ़्रेज़ से एन्क्रिप्ट होते हैं। विज्ञापन, एनालिटिक्स या रिमोट AI नहीं। Android ऐप बैकअप बंद है।")}</p><p>${t("Not clinically reviewed. Local safety word matching is incomplete, and optional English screening is not a diagnosis. No automatic cloud sync, remote AI, or new journal cycles. Do not rely on this prototype for urgent support.", "क्लिनिकल समीक्षा नहीं हुई है। स्थानीय सुरक्षा शब्द-मिलान अधूरा है; वैकल्पिक अंग्रेज़ी स्क्रीनिंग निदान नहीं है। अपने आप क्लाउड सिंक, रिमोट AI या नए डायरी चक्र नहीं हैं। तुरंत सहायता के लिए इस प्रोटोटाइप पर निर्भर न रहें।")}</p>${button(account.getUser() ? t("Delete notebook & cloud backup", "डायरी और क्लाउड बैकअप मिटाएँ") : t("Delete all my data", "मेरा सारा डेटा मिटाएँ"), "delete", "danger")}</div><small>Saath ${escape(updates?.versionLabel() || "0.7.3")} · ${t("Internal testing prototype · 15+", "आंतरिक परीक्षण प्रोटोटाइप · 15+")}</small>`;
  }
}
function normalizedContact(value) {
  const raw = String(value ?? "").trim();
  if (!raw || !/^\+?[\d ()-]+$/.test(raw)) return null;
  const normalized = raw.replace(/[ ()-]/g, "");
  return /^\+?\d{7,15}$/.test(normalized) ? normalized : null;
}
function contactDirty() {
  return (
    contactDraft !== undefined &&
    contactDraft.trim() !== String(state.phone ?? "").trim()
  );
}
function updateContactDraftUI() {
  const dirty = contactDirty(),
    saved = normalizedContact(state.phone);
  const badge = root.querySelector(".contact-badge");
  const label = dirty
    ? t("Unsaved changes", "बदलाव सेव नहीं हैं")
    : saved
      ? t("Saved", "सेव है")
      : t("Optional", "वैकल्पिक");
  if (badge && badge.textContent !== label) badge.textContent = label;
  root
    .querySelector(".trusted-contact")
    ?.classList.toggle("has-unsaved-changes", dirty);
  const status = root.querySelector("#status");
  const note = dirty
    ? t(
        "Changes are not saved yet. Tap Save, or cancel to keep the saved number.",
        "बदलाव अभी सेव नहीं हैं। सेव करें, या पुराना नंबर रखने के लिए रद्द करें।",
      )
    : "";
  if (status && status.textContent !== note) status.textContent = note;
  if (normalizedContact(contactDraft))
    root.querySelector("#phone")?.removeAttribute("aria-invalid");
}
function trustedContactCard() {
  const saved = normalizedContact(state.phone);
  return `<section class="card trusted-contact" aria-labelledby="contact-heading"><div class="section-title"><h2 id="contact-heading">${t("Your trusted person", "आपका भरोसेमंद व्यक्ति")}</h2><span class="contact-badge">${saved ? t("Saved", "सेव है") : t("Optional", "वैकल्पिक")}</span></div><p>${t("Keep someone you can reach out to close by. No access to your address book, and no automatic calls or messages.", "किसी भरोसेमंद व्यक्ति का नंबर पास रखें। कॉन्टैक्ट सूची तक पहुँच नहीं, कोई अपने आप कॉल या संदेश नहीं।")}</p>${saved ? `<div class="saved-contact"><span><small>${t("Saved on this device", "इस डिवाइस पर सेव है")}</small><strong dir="ltr">${escape(saved)}</strong></span><a class="quiet contact-call" href="tel:${escape(saved)}">${icon("phone")}${t("Call", "कॉल")}</a></div>` : ""}<label for="phone">${t("Phone number", "फ़ोन नंबर")}</label><input id="phone" type="tel" inputmode="tel" maxlength="32" dir="ltr" aria-describedby="contact-hint status" value="${escape(contactDraft ?? state.phone ?? "")}" autocomplete="off" placeholder="+91 …"><small id="contact-hint">${t("Use 7–15 digits; add the country code for international numbers. Saving does not verify that the number is reachable.", "7–15 अंक लिखें; अंतरराष्ट्रीय नंबर में देश कोड जोड़ें। सेव करना नंबर उपलब्ध होने की पुष्टि नहीं है।")}</small><div class="row contact-actions">${button(saved ? t("Save changes", "बदलाव सेव करें") : t("Save number", "नंबर सेव करें"), "contact", "primary")}${button(t("Cancel changes", "बदलाव रद्द करें"), "cancel-contact", "quiet")}</div>${saved ? button(t("Remove saved number", "सेव नंबर हटाएँ"), "remove-contact", "text-button") : ""}<p id="status" role="status" aria-live="polite"></p><small>${t("Local to this notebook. Included only when you explicitly make an encrypted cloud backup; never sent to the update service.", "इस डायरी में स्थानीय। केवल आपके एन्क्रिप्टेड क्लाउड बैकअप बनाने पर शामिल; अपडेट सेवा को कभी नहीं भेजा जाता।")}</small></section>`;
}
function contactLink() {
  const number = normalizedContact(state.phone);
  return number
    ? `<a href="tel:${escape(number)}">${t("Call your trusted person", "भरोसेमंद व्यक्ति को कॉल करें")}</a><br>`
    : `<p>${t("No trusted contact saved. You can call someone you trust from your phone, or add their number in Settings.", "भरोसेमंद नंबर सेव नहीं है। फ़ोन से किसी भरोसेमंद व्यक्ति को कॉल करें या सेटिंग्स में नंबर जोड़ें।")}</p>`;
}
function exercise() {
  return `<div class="card">${tool === "breath" ? `<div class="circle breathe"><span id="phase">${t("Breathe gently", "धीरे साँस लें")}</span></div><p>${t("Let your breath stay comfortable. No need to hold it or breathe deeply. If focusing on breathing feels worse, stop and try grounding.", "आराम से साँस लें। साँस रोकने या गहरी साँस की ज़रूरत नहीं। असहज लगे तो रोकें और ग्राउंडिंग चुनें।")}</p>` : tool === "ground" ? `<h2>${t("Notice your surroundings", "अपने आसपास ध्यान दें")}</h2><ul>${[t("5 things you can see", "5 चीज़ें जो दिखती हैं"), t("4 things you can feel", "4 चीज़ें जिन्हें महसूस कर सकते हैं"), t("3 things you can hear", "3 आवाज़ें जो सुनाई देती हैं"), t("2 things you can smell", "2 चीज़ें जिनकी खुशबू महसूस हो"), t("1 thing you can taste, or one neutral detail nearby", "1 स्वाद, या आसपास की कोई सामान्य चीज़")].map((x) => `<li>${x}</li>`).join("")}</ul>` : `<h2>${t("Count slowly, at your pace", "अपनी गति से धीरे गिनें")}</h2><div class="circle" id="number">20</div>${button(t("Next number", "अगली संख्या"), "next")}<p>${t("Start at 20 and count down. There is no right speed. Stop or restart whenever you want.", "20 से उलटी गिनती करें। कोई सही गति नहीं है। जब चाहें रुकें या फिर शुरू करें।")}</p>`}${button(t("Stop / choose another tool", "रोकें / दूसरा अभ्यास चुनें"), "stop", "quiet")}</div>`;
}
function act(a) {
  if (updates?.handle(a)) return;
  if (account.handle(a)) return;
  if (handleExtra(a, featureContext())) return;
  if (a === "back") return goBack();
  if (a === "home-root") {
    navigationStack.length = 0;
    page = state.consent ? "home" : "welcome";
    tool = "";
    render();
    window.scrollTo(0, 0);
    return;
  }
  if (a === "cancel-contact") {
    contactDraft = undefined;
    render();
    return;
  }
  if (a.startsWith("mood-")) {
    const old = state.mood;
    const value = a.slice(5);
    if (old?.date === date() && old.value === value) {
      delete state.mood;
    } else {
      state.mood = { date: date(), value };
    }
    if (!persist()) {
      state.mood = old;
      alert(t("Could not save your check-in.", "मन की बात सेव नहीं हुई।"));
    }
    render();
    return;
  }
  if (a.startsWith("quick-")) {
    navigate("panic", a.slice(6));
    return;
  }
  if (
    [
      "welcome",
      "home",
      "journal",
      "reflection",
      "panic",
      "settings",
      "crisis",
    ].includes(a)
  )
    return go(a);
  if (a === "language") {
    state.lang = hi() ? "en" : "hi";
    persist();
    render();
  }
  if (a === "consent") {
    state.consent = true;
    if (!persist()) {
      state.consent = false;
      return alert("Storage unavailable. Please enable app storage.");
    }
    navigationStack.length = 0;
    page = "home";
    tool = "";
    render();
    window.scrollTo(0, 0);
  }
  if (a.startsWith("journal-followup:")) {
    if (page !== "journal") return;
    const [, key, id] = a.split(":"),
      question = journalFollowUps.find((q) => q.id === key);
    if (!question?.options.some((o) => o.id === id)) return;
    const index = journalDay(state, date()),
      entry = today(),
      previous = JSON.stringify(state);
    const followUps = JSON.parse(
      JSON.stringify(journalFollowUpSelection(index, entry)),
    );
    followUps[key] = toggleOption(followUps[key] || [], id, question.options);
    state.draft = root.querySelector("#entry").value;
    state.journalChoices = {
      day: index + 1,
      optionIds: [...journalSelection(state, index, entry)],
      followUps,
    };
    if (!persist()) {
      state = JSON.parse(previous);
      alert(t("Could not save your choice.", "चुनाव सेव नहीं हुआ।"));
    }
    render();
    return;
  }
  if (a.startsWith("journal-choice:")) {
    if (page !== "journal") return;
    const index = journalDay(state, date()),
      question = dailyQuestions[index],
      id = a.slice(15);
    if (!question.options.some((o) => o.id === id)) return;
    const previous = JSON.stringify(state);
    const ids = toggleOption(
      journalSelection(state, index, today()),
      id,
      question.options,
      question.single,
    );
    state.draft = root.querySelector("#entry").value;
    state.journalChoices = {
      day: index + 1,
      optionIds: ids,
      followUps: JSON.parse(
        JSON.stringify(journalFollowUpSelection(index, today())),
      ),
    };
    const safety = index === 4 && ids.includes("disappear");
    const ok = persist();
    if (!ok) state = JSON.parse(previous);
    if (safety) {
      go("crisis");
      return;
    }
    render();
    root.querySelector("#status").textContent = ok
      ? t(
          "Choice saved on this device. Save today to finish this day.",
          "चुनाव इस डिवाइस पर सेव है। दिन पूरा करने के लिए आज का पन्ना सेव करें।",
        )
      : t(
          "Could not save your choice. Free device space and retry.",
          "चुनाव सेव नहीं हुआ। डिवाइस में जगह खाली करके फिर कोशिश करें।",
        );
    return;
  }
  if (a === "save") {
    const value = root.querySelector("textarea").value.trim();
    const index = journalDay(state, date()),
      ids = journalSelection(state, index, today());
    if (
      !value &&
      !ids.length &&
      !Object.values(journalFollowUpSelection(index, today())).some(
        (ids) => ids.length,
      )
    )
      return (root.querySelector("#status").textContent = t(
        "Pick an option or add a few words first, or return later.",
        "पहले कोई विकल्प चुनें या कुछ शब्द जोड़ें, या बाद में आएँ।",
      ));
    const previous = JSON.stringify(state);
    const e = today();
    const saved = {
      date: date(),
      text: value,
      day: index + 1,
      optionIds: [...ids],
      questionVersion: 1,
      followUps: JSON.parse(
        JSON.stringify(journalFollowUpSelection(index, today())),
      ),
    };
    if (e) Object.assign(e, saved);
    else if (state.entries.length < 7) state.entries.push(saved);
    const safety = hasJournalSafetyChoice(saved) || riskSignal(value);
    delete state.draft;
    delete state.journalChoices;
    if (!persist()) {
      state = JSON.parse(previous);
      root.querySelector("#status").textContent = t(
        "Could not save. Free some device space and retry.",
        "सेव नहीं हुआ। जगह खाली करके फिर कोशिश करें।",
      );
      if (safety) go("crisis");
      return;
    }
    go(safety ? "crisis" : "home");
  }
  if (["breath", "ground", "count"].includes(a)) {
    navigate("panic", a);
  }
  if (a === "stop") {
    if (
      navigationStack.at(-1)?.page === "panic" &&
      !navigationStack.at(-1)?.tool
    )
      goBack();
    else navigate("panic", "", { replace: true });
  }
  if (a === "next") {
    const n = root.querySelector("#number");
    n.textContent = Number(n.textContent) > 0 ? Number(n.textContent) - 1 : 20;
  }
  if (a === "contact" || a === "remove-contact") {
    const removing = a === "remove-contact";
    if (
      removing &&
      !window.confirm(
        t(
          "Remove this saved number? You can add it again later.",
          "सेव नंबर हटाएँ? इसे बाद में फिर जोड़ सकते हैं।",
        ),
      )
    )
      return;
    const field = root.querySelector("#phone");
    const number = removing ? "" : normalizedContact(field.value);
    if (number === null) {
      field.setAttribute("aria-invalid", "true");
      root.querySelector("#status").textContent = t(
        "Enter a valid phone number with 7–15 digits. Use Remove saved number to delete it.",
        "7–15 अंकों का सही फ़ोन नंबर लिखें। मिटाने के लिए सेव नंबर हटाएँ चुनें।",
      );
      field.focus();
      return;
    }
    const previous = state.phone;
    state.phone = number;
    if (!persist()) {
      if (previous === undefined) delete state.phone;
      else state.phone = previous;
      root.querySelector("#status").textContent = t(
        "Could not save. The previous number is unchanged. Please retry when device storage is available.",
        "सेव नहीं हुआ। पिछला नंबर नहीं बदला। डिवाइस में जगह होने पर फिर कोशिश करें।",
      );
      return;
    }
    contactDraft = undefined;
    render();
    root.querySelector("#status").textContent = removing
      ? t(
          "Saved number removed from this notebook. Existing cloud backups change only after you back up again.",
          "सेव नंबर इस डायरी से हटा। पुराना क्लाउड बैकअप दोबारा बैकअप बनाने पर ही बदलेगा।",
        )
      : t(
          "Saved on this device. Your trusted person is available from Calm and Get help.",
          "इस डिवाइस पर सेव है। भरोसेमंद व्यक्ति सुकून और मदद में उपलब्ध है।",
        );
    return;
  }
  if (
    a === "delete" &&
    confirm(
      t(
        "Permanently delete all journal entries, drafts, contact and preferences? This cannot be undone.",
        "सभी पन्ने, ड्राफ़्ट, नंबर और सेटिंग्स हमेशा के लिए मिटाएँ? यह वापस नहीं होगा।",
      ),
    )
  ) {
    try {
      clearNotebook();
    } catch {
      alert(
        t(
          "Deletion failed. Clear app storage in Android Settings.",
          "डेटा नहीं मिटा। Android सेटिंग्स में ऐप स्टोरेज साफ़ करें।",
        ),
      );
    }
  }
}
function readNotebook(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    if (
      value &&
      Array.isArray(value.entries) &&
      ["en", "hi"].includes(value.lang)
    )
      return value;
  } catch {}
  return { entries: [], lang: state.lang || "en" };
}
function clearNotebook() {
  localStorage.removeItem(KEY);
  state = { entries: [], lang: "en" };
  contactDraft = undefined;
  navigationStack.length = 0;
  page = "welcome";
  tool = "";
  render();
  window.scrollTo(0, 0);
}
const account = createAccountController({
  client: supabase,
  root,
  t,
  escape,
  button,
  go,
  render,
  getPage: () => page,
  getNotebook: () => state,
  getGuestNotebook: () => readNotebook(GUEST_KEY),
  redirectURL: authRedirectURL,
  startGoogleSignIn,
  confirm: (message) => window.confirm(message),
  switchNotebook(owner) {
    if (owner === notebookOwner) return;
    notebookOwner = owner;
    KEY = owner ? `${GUEST_KEY}:account:${owner}` : GUEST_KEY;
    state = readNotebook(KEY);
    navigationStack.length = 0;
    contactDraft = undefined;
    if (!["panic", "crisis"].includes(page)) {
      page = state.consent ? "home" : "welcome";
      tool = "";
    }
    render();
  },
  applyNotebook(notebook) {
    const copy = JSON.parse(JSON.stringify(notebook));
    localStorage.setItem(KEY, JSON.stringify(copy));
    state = copy;
    navigationStack.length = 0;
    if (page === "cloud")
      navigationStack.push({ page: "account", tool: "", scroll: 0 });
    contactDraft = undefined;
    render();
  },
  clearNotebook,
});
updates = createNativeUpdater({
  t,
  escape,
  getPage: () => page,
  render,
  confirm: (message) => window.confirm(message),
  accountBusy: () => account.isBusy(),
});
render();
updates.boot().catch(() => {});
if (authCallbackFailed()) {
  account.handle("login");
  account.notify(
    t(
      "Sign-in was cancelled or could not be completed. Please try again.",
      "साइन-इन रद्द हुआ या पूरा नहीं हुआ। फिर कोशिश करें।",
    ),
    true,
  );
}
account.boot();
listenForNativeAuth(() => {
  account.notify(
    t(
      "Sign-in could not be completed. Try again from the account screen.",
      "साइन इन पूरा नहीं हुआ। खाता स्क्रीन से फिर कोशिश करें।",
    ),
    true,
  );
}).catch(() =>
  account.notify(
    t(
      "App-link handling is unavailable. Try signing in with email and password.",
      "ऐप लिंक उपलब्ध नहीं। ईमेल और पासवर्ड से साइन इन करें।",
    ),
    true,
  ),
);
