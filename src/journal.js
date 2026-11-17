// Choice wording and the explicit Day 5 safety rule await psychologist and
// native-speaker review. These are reflection prompts, not a validated scale.
const option = (id, en, hi, exclusive = false) => ({ id, en, hi, exclusive });
export const dailyQuestions = [
  {
    en: "How was your day?",
    hi: "आज आपका दिन कैसा रहा?",
    single: true,
    options: [
      option("good", "Good", "अच्छा"),
      option("okay", "Okay", "ठीक"),
      option("mixed", "Mixed", "मिला-जुला"),
      option("hard", "Hard", "कठिन"),
      option("very-hard", "Very hard", "बहुत कठिन"),
    ],
  },
  {
    en: "What felt heavy today?",
    hi: "आज क्या भारी लगा?",
    options: [
      option("work", "Work or studies", "काम या पढ़ाई"),
      option("relationships", "Family or relationships", "परिवार या रिश्ते"),
      option("health", "Health", "स्वास्थ्य"),
      option("money", "Money or responsibilities", "पैसे या ज़िम्मेदारियाँ"),
      option("lonely", "Feeling alone", "अकेलापन"),
      option("other", "Something else", "कुछ और"),
      option("nothing", "Nothing felt heavy", "कुछ भारी नहीं लगा", true),
    ],
  },
  {
    en: "What brought you a little comfort?",
    hi: "आज किस बात से थोड़ा सुकून मिला?",
    options: [
      option("connection", "Talking to someone", "किसी से बात करना"),
      option("rest", "Rest or quiet time", "आराम या शांत समय"),
      option("music", "Music", "संगीत"),
      option("outside", "Being outside", "बाहर समय बिताना"),
      option("small-moment", "A small everyday moment", "रोज़मर्रा का छोटा पल"),
      option("other", "Something else", "कुछ और"),
      option("nothing", "Nothing yet", "अभी कुछ नहीं", true),
    ],
  },
  {
    en: "What did you do for yourself?",
    hi: "आज आपने अपने लिए क्या किया?",
    options: [
      option("rest", "Made time to rest", "आराम का समय निकाला"),
      option("food", "Ate or drank something", "कुछ खाया या पिया"),
      option("move", "Moved a little", "थोड़ा चले-फिरे"),
      option("task", "Did one small task", "एक छोटा काम किया"),
      option("boundary", "Set a boundary", "अपनी सीमा तय की"),
      option("other", "Something else", "कुछ और"),
      option("nothing", "Not sure / not yet", "पता नहीं / अभी नहीं", true),
    ],
  },
  {
    en: "Is there something you wish you could say?",
    hi: "क्या कुछ है जो आप कहना चाहते हैं?",
    options: [
      option("help", "I could use some help", "मुझे थोड़ी मदद चाहिए"),
      option("rest", "I need a break", "मुझे विराम चाहिए"),
      option("miss", "I miss someone", "मुझे किसी की याद आती है"),
      option(
        "disappear",
        "I wish I could disappear",
        "काश मैं गायब हो पाता/पाती",
      ),
      option("other", "Something else", "कुछ और"),
      option(
        "not-ready",
        "I am not ready to say",
        "अभी कहना नहीं चाहता/चाहती",
        true,
      ),
    ],
  },
  {
    en: "What matters to you right now?",
    hi: "इस समय आपके लिए क्या ज़रूरी है?",
    options: [
      option("rest", "Rest", "आराम"),
      option("connection", "Connection", "जुड़ाव"),
      option("health", "Health", "स्वास्थ्य"),
      option("security", "Stability or security", "स्थिरता या सुरक्षा"),
      option("small-step", "One manageable step", "एक छोटा, आसान कदम"),
      option("other", "Something else", "कुछ और"),
      option("unsure", "Not sure yet", "अभी पता नहीं", true),
    ],
  },
  {
    en: "What would you like to carry into next week?",
    hi: "अगले हफ़्ते आप क्या साथ ले जाना चाहते हैं?",
    options: [
      option("kindness", "Being kinder to myself", "अपने प्रति दयालु होना"),
      option("pace", "A gentler pace", "थोड़ी धीमी गति"),
      option("connection", "Keeping in touch", "संपर्क बनाए रखना"),
      option("boundary", "A helpful boundary", "एक उपयोगी सीमा"),
      option("curiosity", "Curiosity", "जिज्ञासा"),
      option("other", "Something else", "कुछ और"),
      option("unsure", "Not sure yet", "अभी पता नहीं", true),
    ],
  },
];
export const creativeOptions = {
  story: [
    option("asha", "Asha — joining in", "आशा — शामिल होना"),
    option("ravi", "Ravi — doing something of my own", "रवि — अपना कुछ करना"),
    option(
      "meera",
      "Meera — making space for someone",
      "मीरा — किसी को जगह देना",
    ),
    option("unsure", "None / not sure", "कोई नहीं / पता नहीं", true),
  ],
  song: [
    option(
      "calm",
      "I like the feeling of calm",
      "शांत महसूस करना अच्छा लगता है",
    ),
    option("energy", "I like its energy", "इसकी ऊर्जा अच्छी लगती है"),
    option("memories", "It brings up memories", "इससे यादें आती हैं"),
    option("understood", "I relate to it", "इससे जुड़ाव महसूस होता है"),
    option("other", "Another reason", "कोई और वजह"),
    option("unsure", "Not sure", "पता नहीं", true),
  ],
  poem: [
    option("hope", "Hope", "उम्मीद"),
    option("quiet", "Quiet", "शांति"),
    option("connection", "Connection", "जुड़ाव"),
    option("uncertainty", "Uncertainty", "अनिश्चितता"),
    option("other", "Something else", "कुछ और"),
    option("unsure", "Not sure", "पता नहीं", true),
  ],
};
export function validOptionIds(ids, options, single = false) {
  return (
    Array.isArray(options) &&
    Array.isArray(ids) &&
    ids.length <= (single ? 1 : options.length) &&
    new Set(ids).size === ids.length &&
    ids.every((id) => options.some((o) => o.id === id)) &&
    !(
      ids.length > 1 &&
      ids.some((id) => options.find((o) => o.id === id)?.exclusive)
    )
  );
}
export function toggleOption(ids, id, options, single = false) {
  const choice = options.find((o) => o.id === id);
  if (!choice) return ids;
  if (ids.includes(id)) return ids.filter((x) => x !== id);
  return single || choice.exclusive
    ? [id]
    : [...ids.filter((x) => !options.find((o) => o.id === x)?.exclusive), id];
}
export function journalDay(state, date) {
  const i = state.entries.findIndex((e) => e.date === date);
  return i < 0 ? Math.min(state.entries.length, 6) : i;
}
export function journalSelection(state, index, entry) {
  return state.journalChoices?.day === index + 1
    ? state.journalChoices.optionIds
    : entry?.optionIds || [];
}
export function hasJournalSafetyChoice(entry) {
  return entry?.day === 5 && entry.optionIds?.includes("disappear");
}
export function labelsFor(ids, options, lang = "en") {
  return (ids || [])
    .map(
      (id) => options.find((o) => o.id === id)?.[lang === "hi" ? "hi" : "en"],
    )
    .filter(Boolean);
}
export function journalSummary(entry, index, lang = "en") {
  return [
    ...labelsFor(
      entry.optionIds,
      dailyQuestions[(entry.day || index + 1) - 1]?.options || [],
      lang,
    ),
    entry.text || "",
  ]
    .filter(Boolean)
    .join("\n");
}
export function choiceButtons(ids, options, context, prefix, single = false) {
  return `<div class="tap-options" role="group" aria-label="${context.escape(context.t(single ? "Pick one" : "Pick all that fit", single ? "एक चुनें" : "जो लागू हों, सब चुनें"))}">${options.map((o) => `<button type="button" class="tap-option ${ids.includes(o.id) ? "selected" : ""}" data-action="${prefix}:${o.id}" aria-pressed="${ids.includes(o.id)}"><span class="choice-mark" aria-hidden="true">${ids.includes(o.id) ? "✓" : single ? "○" : "□"}</span><span>${context.escape(context.t(o.en, o.hi))}</span></button>`).join("")}</div>`;
}
