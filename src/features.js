// All reflection logic runs locally. These rules are not a clinical assessment.
export function riskSignal(text = "") {
  return /suicid|self[ -]?harm|kill\s+(myself|me)|hurt(ing)?\s+myself|end\s+my\s+life|better\s+off\s+dead|want\s+to\s+die|don't\s+want\s+to\s+live|do not\s+want\s+to\s+live|आत्महत्या|खुदकुशी|ख़ुदकुशी|खुद\s*को\s*(मार|नुकसान)|ख़ुद\s*को\s*(मार|नुकसान)|मरना\s*चाह|जीना\s*नहीं|jaan\s*den|marna\s*chaht|khud\s*ko\s*(maar|nuksan)/iu.test(
    text,
  );
}
const themes = [
  {
    id: "connection",
    en: "Connection or loneliness",
    hi: "जुड़ाव या अकेलापन",
    words:
      /\b(lonely|alone|isolated|connection|friend|miss|missing)\b|अकेल|दोस्त|याद/iu,
  },
  {
    id: "loss",
    en: "Loss or change",
    hi: "खोना या बदलाव",
    words:
      /\b(loss|lost|grief|goodbye|change|leaving)\b|खोया|बिछड़|बदलाव|विदा/iu,
  },
  {
    id: "tired",
    en: "Tiredness or pressure",
    hi: "थकान या दबाव",
    words:
      /\b(tired|exhausted|heavy|pressure|overwhelmed|stress)\b|थक|भारी|दबाव|तनाव/iu,
  },
  {
    id: "worry",
    en: "Uncertainty or worry",
    hi: "अनिश्चितता या चिंता",
    words: /\b(worried|worry|afraid|uncertain|anxious|fear)\b|चिंता|डर|घबरा/iu,
  },
  {
    id: "hope",
    en: "Hope or small comforts",
    hi: "उम्मीद या छोटा सुकून",
    words:
      /\b(hope|hopeful|comfort|grateful|happy|peace|proud|calm|enjoy)\b|उम्मीद|सुकून|खुश|शांति|आभार/iu,
  },
];
export function reflect(text = "") {
  if (riskSignal(text)) return { risk: true, themes: [] };
  return {
    risk: false,
    themes: themes
      .filter((x) => x.words.test(text))
      .map(({ id, en, hi, words }) => ({
        id,
        en,
        hi,
        evidence: text.match(words)?.[0] || "",
      })),
  };
}
export const instruments = {
  phq9: {
    name: "PHQ-9",
    max: 27,
    items: [
      "Little interest or pleasure in doing things",
      "Feeling down, depressed, or hopeless",
      "Trouble falling or staying asleep, or sleeping too much",
      "Feeling tired or having little energy",
      "Poor appetite or overeating",
      "Feeling bad about yourself — or that you are a failure or have let yourself or your family down",
      "Trouble concentrating on things, such as reading the newspaper or watching television",
      "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual",
      "Thoughts that you would be better off dead or of hurting yourself in some way",
    ],
  },
  gad7: {
    name: "GAD-7",
    max: 21,
    items: [
      "Feeling nervous, anxious, or on edge",
      "Not being able to stop or control worrying",
      "Worrying too much about different things",
      "Trouble relaxing",
      "Being so restless that it is hard to sit still",
      "Becoming easily annoyed or irritable",
      "Feeling afraid as if something awful might happen",
    ],
  },
};
export function scoreScreening(kind, answers) {
  const scale = instruments[kind];
  if (
    !scale ||
    !Array.isArray(answers) ||
    answers.length !== scale.items.length ||
    Array.from(answers).some((x) => !Number.isInteger(x) || x < 0 || x > 3)
  )
    return null;
  return {
    score: answers.reduce((a, b) => a + b, 0),
    max: scale.max,
    risk: kind === "phq9" && answers[8] > 0,
  };
}
export const extraPages = [
  "explore",
  "story",
  "song",
  "poem",
  "experience",
  "library",
  "exercise",
  "screening",
  "questionnaire",
  "screen-result",
  "history",
  "professional",
];
export const exercises = [
  {
    id: "thought",
    en: "A kinder perspective",
    hi: "एक दयालु नज़रिया",
    category: "CBT-informed",
    steps: [
      [
        "Name a situation, and the thought that came with it.",
        "एक परिस्थिति और उससे जुड़ा विचार पहचानें।",
      ],
      [
        "What supports that thought? What might you be overlooking?",
        "इस विचार का क्या आधार है? क्या कुछ छूट रहा है?",
      ],
      [
        "What would be a more balanced, kind way to describe it? You do not have to force a positive thought.",
        "इसे संतुलित, दयालु तरीके से कैसे कहेंगे? सकारात्मक सोचना मजबूरी नहीं है।",
      ],
    ],
  },
  {
    id: "action",
    en: "One manageable action",
    hi: "एक आसान कदम",
    category: "Behavioural activation–inspired",
    steps: [
      [
        "Choose one small action that feels manageable, such as drinking water or opening a window.",
        "एक आसान कदम चुनें, जैसे पानी पीना या खिड़की खोलना।",
      ],
      [
        "Make it smaller if needed. There is no deadline or streak to protect.",
        "ज़रूरत हो तो कदम छोटा करें। कोई समय-सीमा या स्ट्रीक नहीं है।",
      ],
      [
        "Notice how you feel afterwards, without judging the result.",
        "बाद में कैसा महसूस होता है, बिना निर्णय किए देखें।",
      ],
    ],
  },
  {
    id: "mindful",
    en: "A moment of noticing",
    hi: "ध्यान देने का एक पल",
    category: "Mindfulness-inspired",
    steps: [
      [
        "Keep your eyes open if that is more comfortable. Notice your feet touching the floor.",
        "सहज लगे तो आँखें खुली रखें। पैरों का ज़मीन से संपर्क महसूस करें।",
      ],
      [
        "Notice a sound, a colour, and a physical sensation around you.",
        "एक आवाज़, एक रंग और शरीर की एक अनुभूति पर ध्यान दें।",
      ],
      [
        "When thoughts wander, gently return to what is around you. Stop whenever you wish.",
        "मन भटके तो धीरे से आसपास लौटें। जब चाहें रुकें।",
      ],
    ],
  },
  {
    id: "kindness",
    en: "Write to yourself kindly",
    hi: "खुद को दयालु शब्द लिखें",
    category: "Self-compassion writing",
    steps: [
      [
        "Imagine a friend experiencing a day like yours. What kind words would you offer?",
        "कल्पना करें कि किसी दोस्त का दिन आपके जैसा है। आप क्या दयालु शब्द कहेंगे?",
      ],
      [
        "Try offering yourself the same words. It is okay if this feels unfamiliar.",
        "वही शब्द खुद को कहने की कोशिश करें। अनजान लगे तो भी ठीक है।",
      ],
      [
        "You may write a sentence below, or simply leave it here.",
        "नीचे एक वाक्य लिख सकते हैं, या यहीं छोड़ सकते हैं।",
      ],
    ],
  },
  {
    id: "values",
    en: "What matters to you?",
    hi: "आपके लिए क्या मायने रखता है?",
    category: "ACT-style values reflection",
    steps: [
      [
        "Choose a value that matters to you: care, learning, honesty, rest, or something else.",
        "एक मूल्य चुनें: देखभाल, सीखना, ईमानदारी, आराम या कुछ और।",
      ],
      [
        "What might one tiny action aligned with that value look like today?",
        "आज उस मूल्य से जुड़ा एक छोटा कदम क्या हो सकता है?",
      ],
      [
        "A value is a direction, not a test you can fail. You can skip this.",
        "मूल्य एक दिशा है, परीक्षा नहीं। आप इसे छोड़ सकते हैं।",
      ],
    ],
  },
  {
    id: "narrative",
    en: "Another page of your story",
    hi: "आपकी कहानी का एक और पन्ना",
    category: "Expressive writing",
    steps: [
      [
        "Write about an ordinary moment from today, without needing to explain why it matters.",
        "आज के एक सामान्य पल के बारे में लिखें, बिना उसका महत्व समझाए।",
      ],
      [
        "If you want, write what you needed in that moment. Avoid revisiting painful experiences if it feels overwhelming.",
        "चाहें तो लिखें उस पल आपको क्या चाहिए था। भारी लगे तो दर्दनाक अनुभवों में न जाएँ।",
      ],
      [
        "Pause, look around, and return to something familiar. Stop if uncomfortable.",
        "रुकें, आसपास देखें और किसी परिचित चीज़ पर लौटें। असहज लगे तो रोकें।",
      ],
    ],
  },
];
function title(c, en, hi) {
  return c.t(en, hi);
}
function warning(c) {
  return `<p class="notice">${c.t("Prototype content, not clinically reviewed. Reflections are simple local word matches, not AI, diagnosis, or an assessment. They can be wrong. You may reject them.", "प्रोटोटाइप सामग्री; क्लिनिकल समीक्षा नहीं हुई। चिंतन केवल स्थानीय शब्द-मिलान है, AI, निदान या मूल्यांकन नहीं। यह गलत हो सकता है। आप इसे अस्वीकार कर सकते हैं।")}</p>`;
}
function draft(c, key, placeholder = "") {
  return `<label for="response">${c.t("Your words", "आपके शब्द")}</label><textarea id="response" maxlength="12000" data-feature-draft="${key}" placeholder="${c.escape(placeholder)}">${c.escape(c.state.featureDrafts?.[key] || "")}</textarea><p id="feature-status" class="status" role="status">${c.state.featureDrafts?.[key] ? c.t("Draft saved on this device.", "ड्राफ़्ट इस डिवाइस पर सेव है।") : c.t("Only saved on this device.", "केवल इस डिवाइस पर सेव होगा।")}</p>`;
}
function safetyCard(c) {
  return `<div class="card"><h2>${c.t("Let’s put support first", "पहले सहायता पर ध्यान दें")}</h2><p>${c.t("Some words may relate to safety. This may be a mistaken match; normal reflection is paused. Saath is not monitored and cannot determine whether you are safe.", "कुछ शब्द सुरक्षा से जुड़े हो सकते हैं। मिलान गलत हो सकता है; सामान्य चिंतन रोक दिया गया है। साथ की निगरानी नहीं होती और यह आपकी सुरक्षा तय नहीं कर सकता।")}</p>${c.button(c.t("Open support now", "अभी सहायता खोलें"), "crisis", "help")}</div>`;
}
export function weeklyThemes(c) {
  const text = c.state.entries.map((x) => x.text).join("\n");
  if (riskSignal(text)) return safetyCard(c);
  return (
    reflectionCard(c, text, "week") +
    `<div class="card"><h2>${c.t("Positive moments, in your own words", "आपके अपने शब्दों में अच्छे पल")}</h2><p>${c.t("Read your entries below and choose a moment that felt comforting, if there was one. No positive moment is assumed or invented.", "नीचे अपने पन्ने पढ़ें और कोई सुकून का पल चुनें, अगर था। किसी अच्छे पल की कल्पना नहीं की जाती।")}</p>${c.state.entries.map((entry, index) => `<div class="positive-choice">${c.button(c.t("Day ", "दिन ") + (index + 1) + (c.state.positiveDays?.includes(index) ? " ✓" : ""), `positive:${index}`, c.state.positiveDays?.includes(index) ? "primary" : "quiet")}${c.state.positiveDays?.includes(index) ? `<p style="white-space:pre-wrap">${c.escape(entry.text)}</p>` : ""}</div>`).join("")}</div>`
  );
}
function reflectionCard(c, text, key) {
  const result = reflect(text);
  if (result.risk) return safetyCard(c);
  const rejected = c.state.rejectedThemes?.[key] || [];
  const active = result.themes.filter((x) => !rejected.includes(x.id));
  return `<div class="card"><h2>${c.t("Possible emotional themes", "संभावित भावनात्मक विषय")}</h2>${warning(c)}${active.length ? active.map((x) => `<div class="theme-chip"><span>${c.t(x.en, x.hi)}<small>${c.t("Word noticed: ", "मिला शब्द: ")}${c.escape(x.evidence)}</small></span>${c.button(c.t("Doesn’t fit", "मेल नहीं खाता"), `reject:${key}:${x.id}`, "quiet")}</div>`).join("") : `<p>${c.t("No clear word matches, or you rejected the suggestions. Your experience does not need a label.", "कोई स्पष्ट शब्द-मिलान नहीं मिला, या आपने सुझाव अस्वीकार किए। अनुभव को नाम देना ज़रूरी नहीं।")}</p>`}<p>${c.t("Which part fits, if any? What is another way to understand what you wrote?", "कौन सा हिस्सा सही लगता है, अगर कोई हो? आपकी बात को समझने का दूसरा तरीका क्या हो सकता है?")}</p>${c.button(c.t("Try a small exercise", "एक छोटा अभ्यास आज़माएँ"), "exercise:thought", "primary")}</div>`;
}
export function renderExtra(page, c) {
  const { state: s, t, escape: e, button: b } = c;
  if (page === "professional")
    return `<h1>${t("Support beyond this app", "इस ऐप से आगे की सहायता")}</h1><p>${t("If feelings persist, affect daily life, or feel difficult to manage, consider a qualified clinical psychologist, psychiatrist, or other appropriate professional. Saath does not provide diagnosis, treatment, or medication advice.", "अगर भावनाएँ बनी रहें, रोज़मर्रा पर असर डालें या संभालना मुश्किल हो, योग्य क्लिनिकल मनोवैज्ञानिक, मनोचिकित्सक या उपयुक्त पेशेवर से बात करें। साथ निदान, उपचार या दवा की सलाह नहीं देता।")}</p><div class="card"><h2>${t("Your choice, no referral fee", "आपकी पसंद, कोई रेफ़रल शुल्क नहीं")}</h2><p>${t("This prototype has no therapist booking service or verified provider directory. Ask about credentials, confidentiality, fees and emergency arrangements before choosing care. No journal entries or screening answers are shared by this app.", "इस प्रोटोटाइप में थेरेपिस्ट बुकिंग या सत्यापित पेशेवर सूची नहीं है। सहायता चुनने से पहले योग्यता, गोपनीयता, शुल्क और आपात व्यवस्था पूछें। यह ऐप डायरी या स्क्रीनिंग उत्तर साझा नहीं करता।")}</p><a class="primary call-button" href="tel:14416">${t("India · Tele-MANAS · 14416", "भारत · टेली-मानस · 14416")}</a><small>${t("Government mental-health support contact. Official listing checked 7 Nov 2026; not call-tested.", "सरकारी मानसिक स्वास्थ्य सहायता संपर्क। आधिकारिक सूची 7 नवम्बर 2026 को जाँची; कॉल-परीक्षण नहीं।")}</small></div>${b(t("Urgent help", "तुरंत सहायता"), "crisis", "help")}`;
  if (page === "explore")
    return `<h1>${t("Find a starting point.", "शुरू करने का तरीका चुनें।")}</h1><p class="muted">${t("You don’t have to start by talking about yourself.", "शुरुआत अपने बारे में बताने से करना ज़रूरी नहीं।")}</p><div class="feature-grid">${[
      [
        "story",
        "Story",
        "कहानी",
        "See yourself in an ordinary moment.",
        "एक सामान्य पल से जुड़ें।",
      ],
      [
        "song",
        "Song",
        "गीत",
        "What is it about that song?",
        "उस गीत में क्या बात है?",
      ],
      [
        "poem",
        "Poem",
        "कविता",
        "Find your own next line.",
        "अपनी अगली पंक्ति लिखें।",
      ],
      [
        "journal",
        "7-day journal",
        "7 दिन की डायरी",
        "One gentle prompt each day.",
        "रोज़ एक आसान प्रश्न।",
      ],
      [
        "library",
        "Small exercises",
        "छोटे अभ्यास",
        "A little room to reset.",
        "थोड़ा विराम लें।",
      ],
      [
        "screening",
        "Optional screening",
        "वैकल्पिक स्क्रीनिंग",
        "PHQ-9 & GAD-7 · English",
        "PHQ-9 और GAD-7 · अंग्रेज़ी",
      ],
    ]
      .map(
        ([id, en, hi, desc, dh], index) =>
          `<button class="feature-tile" data-action="${id}"><span class="feature-icon">${c.icon(id)}</span><span class="feature-copy"><span class="feature-number">${String(index + 1).padStart(2, "0")}</span><strong>${t(en, hi)}</strong><small>${t(desc, dh)}</small></span><span class="feature-arrow">${c.icon("arrow")}</span></button>`,
      )
      .join(
        "",
      )}</div>${b(t("My saved reflections", "मेरे सेव किए चिंतन"), "history", "quiet wide")}${warning(c)}`;
  if (["story", "song", "poem"].includes(page)) {
    let intro = "";
    if (page === "story")
      intro = `<h1>${t("The evening bench", "शाम की बेंच")}</h1><div class="card story-copy"><p>${t("On the way home, Asha paused at a park bench. Ravi was sketching the trees; Meera was watching people pass. Asha wanted to sit, but wasn’t sure whether to speak. Meera moved her bag to make room. For a while, the three shared the quiet.", "घर जाते हुए आशा पार्क की बेंच पर रुकी। रवि पेड़ों की तस्वीर बना रहा था; मीरा आते-जाते लोगों को देख रही थी। आशा बैठना चाहती थी, पर बोलने को लेकर अनिश्चित थी। मीरा ने जगह बनाने के लिए अपना बैग हटा लिया। कुछ देर तीनों ने चुप्पी साझा की।")}</p><small>${t("Original Saath story · fictional, no hidden meaning", "साथ की मौलिक कहानी · काल्पनिक, कोई छिपा अर्थ नहीं")}</small></div><p>${t("Which character felt closest to you, and why? What might they have needed? You may answer either question.", "कौन सा पात्र आपको करीब लगा और क्यों? उसे क्या चाहिए होगा? किसी भी प्रश्न का उत्तर दे सकते हैं।")}</p>`;
    if (page === "song")
      intro = `<h1>${t("A song that stays with you", "एक गीत जो साथ रहता है")}</h1><p>${t("Add a song title, artist, or link. No playback or lyrics are fetched. Reflection uses only your explanation—not the song, its lyrics, title, or artist.", "गीत का नाम, कलाकार या लिंक जोड़ें। गीत बजाया या बोल डाउनलोड नहीं किए जाते। चिंतन केवल आपकी व्याख्या पर है—गीत, बोल, नाम या कलाकार पर नहीं।")}</p><label for="song-title">${t("Song title or artist (optional)", "गीत या कलाकार (वैकल्पिक)")}</label><input id="song-title" maxlength="200" data-feature-meta="songTitle" value="${e(s.featureMeta?.songTitle || "")}"><label for="song-link">${t("Song link (optional, not opened automatically)", "गीत लिंक (वैकल्पिक; अपने आप नहीं खुलेगा)")}</label><input id="song-link" type="url" maxlength="1000" data-feature-meta="songLink" value="${e(s.featureMeta?.songLink || "")}"><p>${t("Why do you listen to it? What do you relate to in your own life? Please use your own words, not copied lyrics.", "आप इसे क्यों सुनते हैं? अपने जीवन की किस बात से जुड़ते हैं? गीत के बोल की जगह अपने शब्द लिखें।")}</p>`;
    if (page === "poem")
      intro = `<h1>${t("Leave room for a line", "एक पंक्ति के लिए जगह")}</h1><div class="card story-copy"><p>${t("The window holds a little light.<br>The evening takes its time.<br>I leave a space upon this page,<br>and fill it with ________.", "खिड़की में थोड़ी रोशनी है।<br>शाम अपनी गति से चलती है।<br>इस पन्ने पर थोड़ी जगह छोड़ता हूँ,<br>और उसमें भरता हूँ ________।")}</p><small>${t("Original Saath poem", "साथ की मौलिक कविता")}</small></div><p>${t("Complete the last line, or write what the poem brings up for you. What made you choose those words?", "आखिरी पंक्ति पूरी करें या कविता से जो मन में आए, लिखें। आपने ये शब्द क्यों चुने?")}</p>`;
    return (
      intro +
      draft(
        c,
        page,
        t(
          "Write only what you want to share with yourself…",
          "बस वही लिखें जो खुद से साझा करना चाहें…",
        ),
      ) +
      `<div class="row">${b(t("Save & reflect", "सेव करें और चिंतन देखें"), `reflect:${page}`, "primary")}${b(t("Not right now", "अभी नहीं"), "explore", "quiet")}</div>` +
      warning(c)
    );
  }
  if (page === "experience") {
    const x = (s.experiences || []).find((x) => x.id === s.selectedExperience);
    if (!x)
      return `<h1>${t("Choose a saved reflection", "सेव किया चिंतन चुनें")}</h1>${b(t("View saved reflections", "सेव किए चिंतन देखें"), "history", "primary")}`;
    if (riskSignal(x.text)) return safetyCard(c);
    return `<h1>${t("Your words, reflected gently", "आपके शब्दों पर हल्का चिंतन")}</h1><small>${e(x.type)} · ${e(x.date)}</small>${x.type === "song" ? `<p>${e(x.songTitle || "")}</p>` : ""}<div class="card"><p style="white-space:pre-wrap">${e(x.text)}</p></div>${reflectionCard(c, x.text, x.id)}${b(t("Explore something else", "कुछ और आज़माएँ"), "explore", "quiet")}`;
  }
  if (page === "history")
    return `<h1>${t("Your reflection shelf", "आपके चिंतन")}</h1><p>${t("Saved on this device only.", "केवल इस डिवाइस पर सेव है।")}</p>${
      (s.experiences || []).length
        ? (s.experiences || [])
            .slice()
            .reverse()
            .map(
              (x) =>
                `<button class="history-item" data-action="open:${e(x.id)}"><strong>${e(x.type === "exercise" ? t("Exercise", "अभ्यास") : x.type)}</strong><span>${e(x.date)}</span><small>${e(x.text.slice(0, 90))}</small></button>`,
            )
            .join("")
        : `<div class="card">${t("Nothing saved yet. Begin wherever feels easiest.", "अभी कुछ सेव नहीं है। जहाँ आसान लगे, शुरू करें।")}</div>`
    }${b(t("Explore", "आज़माएँ"), "explore", "primary")}`;
  if (page === "library")
    return `<h1>${t("Small steps, your choice.", "छोटे कदम, आपकी पसंद।")}</h1><p>${t("Wellness prompts inspired by established approaches, not therapy protocols. Skip or stop any exercise. Content awaits psychologist review.", "स्थापित तरीकों से प्रेरित वेलनेस प्रश्न, थेरेपी नहीं। किसी भी अभ्यास को छोड़ें या रोकें। मनोवैज्ञानिक समीक्षा बाकी है।")}</p>${exercises.map((x) => `<button class="history-item" data-action="exercise:${x.id}"><strong>${t(x.en, x.hi)}</strong><small>${e(x.category)}</small></button>`).join("")}<p class="notice">${t("Trauma processing, exposure therapy, DBT treatment, psychodynamic therapy and medication questions need a trained professional. These are not provided here.", "ट्रॉमा प्रोसेसिंग, एक्सपोज़र थेरेपी, DBT उपचार, साइकोडायनैमिक थेरेपी और दवा के सवालों के लिए प्रशिक्षित पेशेवर चाहिए। ये यहाँ उपलब्ध नहीं हैं।")}</p>`;
  if (page === "exercise") {
    const x =
      exercises.find((x) => x.id === s.selectedExercise) || exercises[0];
    return `<div class="eyebrow">${e(x.category)}</div><h1>${t(x.en, x.hi)}</h1><ol class="exercise-steps">${x.steps.map(([en, hi]) => `<li>${t(en, hi)}</li>`).join("")}</ol>${draft(c, "exercise:" + x.id)}<div class="row">${b(t("Save my note", "मेरा नोट सेव करें"), "reflect:exercise", "primary")}${b(t("Done / stop", "पूरा / रोकें"), "library", "quiet")}</div><p class="notice">${t("Optional, not treatment. If uncomfortable, stop and return to your surroundings.", "वैकल्पिक, उपचार नहीं। असहज हो तो रुकें और आसपास ध्यान दें।")}</p>`;
  }
  if (page === "screening")
    return `<h1>${t("An optional check-in", "एक वैकल्पिक जाँच")}</h1><p>${t("PHQ-9 and GAD-7 ask about the last two weeks. Self-report scores can be subjective or inaccurate; they cannot diagnose a condition. A qualified professional can interpret results in context.", "PHQ-9 और GAD-7 पिछले दो हफ़्तों के बारे में पूछते हैं। स्व-रिपोर्ट स्कोर व्यक्तिपरक या गलत हो सकते हैं; वे निदान नहीं हैं। योग्य पेशेवर संदर्भ के साथ परिणाम समझा सकता है।")}</p><div class="notice">${t("Internal-testing screening implementation, not clinically approved. Standard questionnaire items remain in English; no validated Hindi translation is bundled. Only continue if you understand English. No response is sent to a clinician. Any PHQ-9 item 9 answer above zero opens crisis support immediately.", "आंतरिक परीक्षण की स्क्रीनिंग; क्लिनिकल मंज़ूरी नहीं है। प्रश्न अंग्रेज़ी में हैं; प्रमाणित हिंदी अनुवाद शामिल नहीं है। अंग्रेज़ी समझते हों तभी जारी रखें। किसी चिकित्सक को जवाब नहीं भेजे जाते। PHQ-9 प्रश्न 9 का शून्य से अधिक उत्तर तुरंत संकट सहायता खोलेगा।")}</div><div class="card"><h2>${t("Choose, or skip", "चुनें, या छोड़ें")}</h2>${b("PHQ-9 · 9 questions", "start:phq9", "primary wide")}<br>${b("GAD-7 · 7 questions", "start:gad7", "quiet wide")}<br>${b(t("Skip for now", "अभी छोड़ें"), "explore", "quiet wide")}</div><p><a href="https://uhs.fsu.edu/sites/g/files/upcbnu1651/files/docs/PHQ-9%20and%20GAD-7%20Form_a.pdf" target="_blank" rel="noopener noreferrer">English questionnaire source · Florida State University</a><small>PHQ / GAD instruments: Spitzer, Williams, Kroenke and colleagues. English wording source checked 7 Nov 2026. No validated Hindi version is bundled.</small></p><p>${t("Starting stores your answers and score on this device. You can discard a questionnaire or delete all data in Settings.", "शुरू करने पर उत्तर और स्कोर इसी डिवाइस पर सेव होते हैं। प्रश्नावली रद्द करें या सेटिंग्स से सारा डेटा मिटाएँ।")}</p>`;
  if (page === "questionnaire") {
    const q = s.screeningDraft,
      scale = instruments[q?.kind];
    if (!scale)
      return b(
        t("Choose a questionnaire", "प्रश्नावली चुनें"),
        "screening",
        "primary",
      );
    const index = q.index || 0;
    if (q.kind === "phq9" && q.answers[8] > 0) return safetyCard(c);
    if (index >= scale.items.length)
      return b(t("View result", "परिणाम देखें"), "screen-result", "primary");
    const answers = [
      "Not at all",
      "Several days",
      "More than half the days",
      "Nearly every day",
    ];
    return `<div class="eyebrow">${scale.name} · ${index + 1} / ${scale.items.length}</div><progress max="${scale.items.length}" value="${index}"></progress><div lang="en"><p>Over the last 2 weeks, how often have you been bothered by ${q.kind === "phq9" ? "any of the following problems?" : "the following problems?"}</p><h1 class="question-text">${e(scale.items[index])}</h1><div class="answer-list">${answers.map((x, n) => `<button data-action="answer:${n}" ${q.answers[index] === n ? 'aria-pressed="true"' : ""}><span>${n}</span>${x}</button>`).join("")}</div></div><div class="row">${index ? b(t("Previous question", "पिछला प्रश्न"), "previous-question", "quiet") : ""}${b(t("Discard questionnaire", "प्रश्नावली रद्द करें"), "discard-screening", "quiet")}</div><p class="notice">${t("Not monitored. Use Get help if you need support now.", "निगरानी नहीं होती। अभी सहायता चाहिए तो मदद खोलें।")}</p>`;
  }
  if (page === "screen-result") {
    const q = s.screeningDraft,
      result = scoreScreening(q?.kind, q?.answers);
    if (!result)
      return `<h1>${t("Not enough answers", "उत्तर अधूरे हैं")}</h1>${b(t("Choose a questionnaire", "प्रश्नावली चुनें"), "screening", "primary")}`;
    if (result.risk) return safetyCard(c);
    return `<h1>${instruments[q.kind].name}</h1><div class="card"><div class="score-number">${result.score}<small> / ${result.max}</small></div><h2>${t("A self-report score, not a diagnosis", "स्व-रिपोर्ट स्कोर, निदान नहीं")}</h2><p>${t("A higher score means more symptoms were reported in these answers. This app does not assign a diagnosis or determine safety from a low score. Speak with a qualified professional if symptoms concern you, persist, or affect daily life—at any score.", "अधिक स्कोर का अर्थ इन उत्तरों में अधिक लक्षण रिपोर्ट होना है। ऐप निदान नहीं देता या कम स्कोर से सुरक्षा तय नहीं करता। लक्षण परेशान करें, बने रहें या रोज़मर्रा पर असर डालें तो किसी भी स्कोर पर योग्य पेशेवर से बात करें।")}</p><p>${t("Self-report can be affected by subjectivity, misunderstanding, or inaccurate answers. No clinician has reviewed this result.", "स्व-रिपोर्ट व्यक्तिपरकता, गलत समझ या गलत उत्तर से प्रभावित हो सकती है। किसी चिकित्सक ने यह परिणाम नहीं देखा है।")}</p></div><label for="difficulty">If you checked off any problems, how difficult have these made it for you to do your work, take care of things at home, or get along with other people?</label><select id="difficulty" data-screen-difficulty><option value="">Optional — choose</option>${["Not difficult at all", "Somewhat difficult", "Very difficult", "Extremely difficult"].map((x) => `<option ${q.difficulty === x ? "selected" : ""}>${x}</option>`).join("")}</select><p><small>Not included in the numerical score.</small></p>${b(t("Discuss with a professional", "पेशेवर सहायता के बारे में"), "professional", "primary")}${b(t("Choose another check-in", "दूसरी जाँच चुनें"), "screening", "quiet")}${b(t("Delete these answers", "ये उत्तर मिटाएँ"), "discard-screening", "quiet")}`;
  }
  return null;
}
export function bindExtra(root, c) {
  root.querySelectorAll("[data-feature-draft]").forEach((el) =>
    el.addEventListener("input", () => {
      c.state.featureDrafts ||= {};
      c.state.featureDrafts[el.dataset.featureDraft] = el.value;
      const ok = c.persist();
      const status = root.querySelector("#feature-status");
      if (status)
        status.textContent = ok
          ? c.t("Draft saved on this device.", "ड्राफ़्ट इस डिवाइस पर सेव है।")
          : c.t(
              "Could not save. Free some storage and retry.",
              "सेव नहीं हुआ। जगह खाली करके फिर कोशिश करें।",
            );
    }),
  );
  root.querySelectorAll("[data-feature-meta]").forEach((el) =>
    el.addEventListener("input", () => {
      c.state.featureMeta ||= {};
      c.state.featureMeta[el.dataset.featureMeta] = el.value;
      if (!c.persist())
        root.querySelector("#feature-status").textContent = c.t(
          "Could not save song details.",
          "गीत की जानकारी सेव नहीं हुई।",
        );
    }),
  );
  root
    .querySelector("[data-screen-difficulty]")
    ?.addEventListener("change", (event) => {
      c.state.screeningDraft.difficulty = event.target.value;
      if (!c.persist())
        c.alert(c.t("Could not save this answer.", "यह उत्तर सेव नहीं हुआ।"));
    });
}
export function handleExtra(action, c) {
  const { state: s, t } = c;
  if (action.startsWith("positive:")) {
    const index = Number(action.slice(9));
    if (!Number.isInteger(index) || !s.entries[index]) return true;
    const old = s.positiveDays || [];
    s.positiveDays = old.includes(index)
      ? old.filter((x) => x !== index)
      : [...old, index];
    if (!c.persist()) {
      s.positiveDays = old;
      c.alert(t("Could not save your choice.", "चुनाव सेव नहीं हुआ।"));
    }
    c.render();
    return true;
  }
  if (extraPages.includes(action)) {
    c.go(action);
    return true;
  }
  if (action.startsWith("reflect:")) {
    const type = action.split(":")[1],
      key = type === "exercise" ? "exercise:" + s.selectedExercise : type;
    const text = c.root.querySelector("#response")?.value.trim() || "";
    if (!text) {
      c.root.querySelector("#feature-status").textContent = t(
        "Write a few words first, or skip this.",
        "पहले कुछ शब्द लिखें, या छोड़ें।",
      );
      return true;
    }
    const previous = JSON.stringify(s);
    const id =
      globalThis.crypto?.randomUUID?.() ||
      `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const entry = {
      id,
      type,
      date: new Date().toLocaleDateString("en-CA"),
      text,
    };
    if (type === "song")
      Object.assign(entry, {
        songTitle: s.featureMeta?.songTitle || "",
        songLink: s.featureMeta?.songLink || "",
      });
    if (type === "exercise") entry.exercise = s.selectedExercise;
    s.experiences ||= [];
    s.experiences.push(entry);
    s.selectedExperience = id;
    if (s.featureDrafts) delete s.featureDrafts[key];
    if (type === "song") delete s.featureMeta;
    s.selectedExperience = id;
    if (!c.persist()) {
      Object.keys(s).forEach((k) => delete s[k]);
      Object.assign(s, JSON.parse(previous));
      c.root.querySelector("#feature-status").textContent = t(
        "Save failed. Free device storage and retry.",
        "सेव नहीं हुआ। जगह खाली करके फिर कोशिश करें।",
      );
      if (riskSignal(text)) c.go("crisis");
      return true;
    }
    c.go(riskSignal(text) ? "crisis" : "experience");
    return true;
  }
  if (action.startsWith("reject:")) {
    const [, key, id] = action.split(":");
    s.rejectedThemes ||= {};
    const old = s.rejectedThemes[key] || [];
    s.rejectedThemes[key] = [...new Set([...old, id])];
    if (!c.persist()) {
      s.rejectedThemes[key] = old;
      c.alert(t("Could not save your preference.", "पसंद सेव नहीं हुई।"));
    }
    c.render();
    return true;
  }
  if (action.startsWith("open:")) {
    s.selectedExperience = action.slice(5);
    c.go("experience");
    return true;
  }
  if (action.startsWith("exercise:")) {
    s.selectedExercise = action.slice(9);
    c.go("exercise");
    return true;
  }
  if (action.startsWith("start:")) {
    const kind = action.slice(6);
    if (!instruments[kind]) return true;
    s.screeningDraft = { kind, index: 0, answers: [] };
    if (!c.persist()) {
      delete s.screeningDraft;
      c.alert(
        t(
          "Could not start: storage unavailable.",
          "स्टोरेज उपलब्ध नहीं; शुरू नहीं हुआ।",
        ),
      );
      return true;
    }
    c.go("questionnaire");
    return true;
  }
  if (action === "previous-question") {
    if (s.screeningDraft)
      s.screeningDraft.index = Math.max(0, s.screeningDraft.index - 1);
    c.persist();
    c.render();
    return true;
  }
  if (action === "discard-screening") {
    const previous = s.screeningDraft;
    delete s.screeningDraft;
    if (!c.persist()) {
      s.screeningDraft = previous;
      c.alert(
        t(
          "Could not discard. Clear all data in Settings if needed.",
          "रद्द नहीं हुआ। ज़रूरत हो तो सेटिंग्स में सारा डेटा मिटाएँ।",
        ),
      );
    }
    c.go("screening");
    return true;
  }
  if (action.startsWith("answer:")) {
    const q = s.screeningDraft,
      scale = instruments[q?.kind],
      n = Number(action.slice(7));
    if (
      !scale ||
      !Number.isInteger(n) ||
      n < 0 ||
      n > 3 ||
      q.index >= scale.items.length
    )
      return true;
    const before = JSON.stringify(q);
    q.answers[q.index] = n;
    const risk = q.kind === "phq9" && q.index === 8 && n > 0;
    q.index++;
    const ok = c.persist();
    if (!ok) {
      s.screeningDraft = JSON.parse(before);
      c.alert(
        t(
          "Answer could not be saved. Please retry.",
          "उत्तर सेव नहीं हुआ। फिर कोशिश करें।",
        ),
      );
    }
    // Safety routing must not depend on storage succeeding.
    if (risk) c.go("crisis");
    else if (ok && q.index === scale.items.length) c.go("screen-result");
    else c.render();
    return true;
  }
  return false;
}
