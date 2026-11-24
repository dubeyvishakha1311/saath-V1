// Local, transparent reflection prompts. No inference, scoring or clinical advice.
const o = (id, en, hi, exclusive = false) => ({ id, en, hi, exclusive });
export const journalFollowUps = [
  {
    id: "thought",
    en: "Which thoughts showed up today?",
    hi: "आज कौन से विचार आए?",
    options: [
      o(
        "must",
        "I felt I had to get everything right",
        "मुझे लगा सब सही करना ज़रूरी है",
      ),
      o(
        "predict",
        "I expected something to go wrong",
        "मुझे कुछ गलत होने की आशंका थी",
      ),
      o(
        "compare",
        "I compared myself with someone",
        "मैंने खुद की तुलना किसी से की",
      ),
      o(
        "balanced",
        "I could see more than one possibility",
        "मुझे एक से ज़्यादा संभावनाएँ दिखीं",
      ),
      o("unsure", "None / not sure", "कोई नहीं / पता नहीं", true),
    ],
  },
  {
    id: "perspective",
    en: "What could help you see another perspective?",
    hi: "दूसरा नज़रिया देखने में क्या मदद कर सकता है?",
    options: [
      o(
        "facts",
        "Separate what happened from what I assumed",
        "जो हुआ और जो मैंने माना, उनमें फ़र्क करना",
      ),
      o(
        "exception",
        "Remember a time things went differently",
        "जब कुछ अलग हुआ था, वह समय याद करना",
      ),
      o(
        "friend",
        "Think about what I would say to a friend",
        "सोचना कि मैं किसी दोस्त से क्या कहता/कहती",
      ),
      o(
        "unknown",
        "Allow myself not to know yet",
        "खुद को अभी न जानने की अनुमति देना",
      ),
      o("unsure", "Not sure / skip for now", "पता नहीं / अभी छोड़ें", true),
    ],
  },
  {
    id: "step",
    en: "What feels like a manageable next step?",
    hi: "अगला कौन सा कदम आसान लग रहा है?",
    options: [
      o("pause", "Take a short pause", "थोड़ा विराम लेना"),
      o("task", "Try one small task", "एक छोटा काम आज़माना"),
      o(
        "connect",
        "Talk to someone I trust",
        "किसी भरोसेमंद व्यक्ति से बात करना",
      ),
      o(
        "care",
        "Make room for food, water or rest",
        "भोजन, पानी या आराम के लिए समय निकालना",
      ),
      o("skip", "No action right now", "अभी कोई कदम नहीं", true),
    ],
  },
];
export function validFollowUps(value, validOptionIds) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.entries(value).every(([key, ids]) => {
      const q = journalFollowUps.find((q) => q.id === key);
      return !!q && validOptionIds(ids, q.options);
    })
  );
}
export function renderConclusion(kind, ids, c, options, followUps = {}) {
  if (kind === "journal" && ids?.includes("disappear")) return "";

  const known = options.filter((o) => ids?.includes(o.id));
  const selected = journalFollowUps.flatMap((q) =>
    q.options
      .filter((o) => followUps[q.id]?.includes(o.id))
      .map((o) => c.t(o.en, o.hi)),
  );
  if (!known.length && !selected.length) return "";
  const title =
    kind === "journal"
      ? c.t("Your reflection & next step", "आपका चिंतन और अगला कदम")
      : c.t("A closing thought", "एक आख़िरी विचार");
  const summaries = {
    story: [
      "A story can make room for different ways of joining in, creating, or offering company. You do not have to be like a character in every situation.",
      "कहानी जुड़ने, कुछ बनाने या साथ देने के अलग तरीके दिखा सकती है। हर परिस्थिति में किसी पात्र जैसा होना ज़रूरी नहीं।",
    ],
    song: [
      "Notice what you value in this listening moment. You could make time for that feeling again, if it feels helpful; the app has not analysed the song or its lyrics.",
      "इस गीत के बारे में आपको क्या पसंद आया, उस पर ध्यान दें। मददगार लगे तो उस अनुभव के लिए फिर समय निकालें; ऐप ने गीत या बोलों का विश्लेषण नहीं किया है।",
    ],
    poem: [
      "Your chosen words can be a starting point, not a hidden meaning or a fixed description of you. You can choose a different word tomorrow.",
      "आपके चुने शब्द शुरुआत हो सकते हैं, कोई छिपा अर्थ या आपकी स्थायी पहचान नहीं। कल आप दूसरा शब्द चुन सकते हैं।",
    ],
    journal: [
      "A thought is one way of understanding a moment, not automatically a fact. Your choices are a starting point for noticing, not a conclusion about your mental health.",
      "विचार किसी पल को समझने का एक तरीका है, अपने आप तथ्य नहीं। आपके चुनाव ध्यान देने की शुरुआत हैं, मानसिक स्वास्थ्य का निष्कर्ष नहीं।",
    ],
  };
  const suggestions = {
    story: {
      asha: [
        "If joining in appealed to you, a brief hello could be enough; there is no need to force a conversation.",
        "जुड़ना अच्छा लगा हो तो एक छोटा नमस्ते काफ़ी हो सकता है; बातचीत का दबाव नहीं।",
      ],
      ravi: [
        "If creating something appealed to you, try a few minutes of an activity you enjoy without judging the result.",
        "कुछ बनाना पसंद आया हो तो बिना नतीजे को आँके अपनी पसंद की गतिविधि कुछ मिनट आज़माएँ।",
      ],
      meera: [
        "If making room for someone appealed to you, consider a small kind gesture while respecting your own boundaries.",
        "किसी के लिए जगह बनाना अच्छा लगा हो तो अपनी सीमाओं का ध्यान रखते हुए छोटा दयालु काम सोचें।",
      ],
    },
    song: {
      calm: [
        "If calm is what you chose, notice whether a quiet listening break feels comfortable today.",
        "शांति चुनी हो तो देखें क्या थोड़ी देर शांति से सुनना आज सहज लगता है।",
      ],
      energy: [
        "If energy appealed to you, you could pair listening with one comfortable everyday task.",
        "ऊर्जा पसंद आई हो तो सुनते समय रोज़मर्रा का एक सहज काम कर सकते हैं।",
      ],
      memories: [
        "Memories can feel mixed. Keep or pause this listening moment according to what feels comfortable.",
        "यादें मिली-जुली लग सकती हैं। सहज लगे तो सुनें, नहीं तो विराम लें।",
      ],
      understood: [
        "If you relate to the song, you might name the part of your own experience you want to acknowledge.",
        "गीत से जुड़ाव हो तो अपने अनुभव के उस हिस्से को पहचान सकते हैं जिसे जगह देना चाहते हैं।",
      ],
    },
    poem: {
      hope: [
        "Hope can be a small possibility rather than a promise. What is one possibility you want to leave open?",
        "उम्मीद वादा नहीं, एक छोटी संभावना भी हो सकती है। कौन सी संभावना खुली रखना चाहेंगे?",
      ],
      quiet: [
        "If quiet fits, a brief pause may be enough; you do not need to fill every space.",
        "शांति सही लगे तो छोटा विराम काफ़ी हो सकता है; हर खाली जगह भरना ज़रूरी नहीं।",
      ],
      connection: [
        "If connection fits, consider one safe, low-pressure way to be in touch.",
        "जुड़ाव सही लगे तो संपर्क का कोई सुरक्षित, बिना दबाव वाला तरीका सोचें।",
      ],
      uncertainty: [
        "Uncertainty does not need an immediate answer. You can leave the line unfinished.",
        "अनिश्चितता का तुरंत उत्तर ज़रूरी नहीं। पंक्ति अधूरी छोड़ सकते हैं।",
      ],
    },
  };
  const advice = known.flatMap((o) =>
    suggestions[kind]?.[o.id] ? [c.t(...suggestions[kind][o.id])] : [],
  );
  const lines = summaries[kind];
  if (!lines) return "";
  const unsure =
    known.length && !selected.length && known.every((o) => o.exclusive);
  return `<section class="card choice-conclusion" aria-label="${c.escape(title)}"><h2>${title}</h2>${known.length ? `<p><strong>${c.t("You chose: ", "आपने चुना: ")}</strong>${c.escape(known.map((o) => c.t(o.en, o.hi)).join(" · "))}</p>` : ""}${selected.length ? `<p>${c.escape(selected.join(" · "))}</p>` : ""}${advice.length ? `<ul>${advice.map((line) => `<li>${c.escape(line)}</li>`).join("")}</ul>` : ""}<p>${unsure ? c.t("It is okay not to know or to skip. There is no correct response and no label is assigned.", "पता न होना या छोड़ना ठीक है। कोई सही जवाब नहीं और कोई लेबल नहीं दिया जाता।") : c.t(...lines)}</p><p>${c.t("Optional: pause here, or try one small, comfortable action. You decide what fits. This is choice-based feedback, not AI analysis, diagnosis or treatment.", "वैकल्पिक: यहीं रुकें या एक छोटा, सहज कदम आज़माएँ। क्या सही है, आप तय करें। यह चुनाव-आधारित प्रतिक्रिया है, AI विश्लेषण, निदान या उपचार नहीं।")}</p></section>`;
}
