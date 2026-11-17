// Editorial reference data, not Saath-user analytics or treatment evidence.
// Primary sources checked 7 November 2026. Different surveys are NOT a ranking.
export const activityResearch = [
  {
    id: "song",
    percent: 73,
    en: "Music via licensed audio streaming",
    hi: "लाइसेंस वाली ऑडियो स्ट्रीमिंग से संगीत",
    detailEn:
      "Respondents who said they listen through subscription or ad-supported licensed audio streaming. This is not the percentage who listen to any music.",
    detailHi:
      "जिन उत्तरदाताओं ने सदस्यता या विज्ञापन वाली लाइसेंस ऑडियो स्ट्रीमिंग से सुनना बताया। यह किसी भी तरह संगीत सुनने वालों का प्रतिशत नहीं है।",
    populationEn:
      "IFPI 2023 · 43,000+ respondents aged 16–64, across 26 countries · fieldwork August–October 2023",
    populationHi:
      "IFPI 2023 · 26 देशों के 16–64 वर्ष के 43,000+ उत्तरदाता · सर्वेक्षण अगस्त–अक्टूबर 2023",
    source: "IFPI · Engaging with Music 2023",
    url: "https://www.ifpi.org/ifpis-global-study-finds-were-listening-to-more-music-in-more-ways-than-ever/",
  },
  {
    id: "story",
    percent: 37.6,
    en: "Reading novels or short stories",
    hi: "उपन्यास या लघु कहानियाँ पढ़ना",
    detailEn:
      "U.S. adults who reported reading novels or short stories in the previous 12 months. The category includes novels, not just short stories.",
    detailHi:
      "पिछले 12 महीनों में उपन्यास या लघु कहानियाँ पढ़ने की जानकारी देने वाले अमेरिकी वयस्क। इस श्रेणी में उपन्यास भी हैं, केवल छोटी कहानियाँ नहीं।",
    populationEn:
      "NEA / U.S. Census Bureau · 2022 Survey of Public Participation in the Arts · U.S. adults · July 2021–July 2022 period",
    populationHi:
      "NEA / अमेरिकी जनगणना ब्यूरो · 2022 कला भागीदारी सर्वेक्षण · अमेरिकी वयस्क · जुलाई 2021–जुलाई 2022 अवधि",
    source: "NEA · Arts Participation Patterns in 2022",
    url: "https://www.arts.gov/sites/default/files/2022-SPPA-final.pdf",
  },
  {
    id: "poem",
    percent: 9.2,
    en: "Reading poetry",
    hi: "कविता पढ़ना",
    detailEn:
      "U.S. adults who reported reading poetry in the previous 12 months. This figure is for reading, not listening to poetry.",
    detailHi:
      "पिछले 12 महीनों में कविता पढ़ने की जानकारी देने वाले अमेरिकी वयस्क। यह कविता पढ़ने का आँकड़ा है, सुनने का नहीं।",
    populationEn:
      "NEA / U.S. Census Bureau · 2022 Survey of Public Participation in the Arts · U.S. adults · July 2021–July 2022 period",
    populationHi:
      "NEA / अमेरिकी जनगणना ब्यूरो · 2022 कला भागीदारी सर्वेक्षण · अमेरिकी वयस्क · जुलाई 2021–जुलाई 2022 अवधि",
    source: "NEA · Arts Participation Patterns in 2022",
    url: "https://www.arts.gov/sites/default/files/2022-SPPA-final.pdf",
  },
];
export function renderResearch(activity, c) {
  const { t, escape: e, button: b } = c;
  const names = {
    story: t("story", "कहानी"),
    song: t("song", "गीत"),
    poem: t("poem", "कविता"),
  };
  return `<div class="eyebrow">${t("RESEARCH / EVERYDAY ACTIVITIES", "शोध / रोज़मर्रा की गतिविधियाँ")}</div><h1>${t("Different ways to spend a moment.", "कुछ पल बिताने के अलग तरीके।")}</h1><p>${t("Before your " + names[activity] + ", a little context about participation—not a recommendation to choose the most popular activity.", "अपनी गतिविधि से पहले, भागीदारी के बारे में कुछ जानकारी—सबसे लोकप्रिय गतिविधि चुनने की सलाह नहीं।")}</p><div class="notice"><strong>${t("Common does not mean treatment.", "आम होने का अर्थ उपचार नहीं।")}</strong> ${t("These numbers describe how common each activity was in the surveyed groups. They do not show that songs, stories or poems treat anxiety or depression. Different populations, measures and years mean the bars cannot rank preferences, are not India-specific estimates, and do not add up to 100%.", "ये आँकड़े बताते हैं कि सर्वेक्षण समूहों में गतिविधियाँ कितनी आम थीं। ये नहीं बताते कि गीत, कहानी या कविता चिंता या अवसाद का उपचार करते हैं। अलग आबादी, माप और वर्ष होने से इन्हें पसंद की रैंकिंग या भारत के आँकड़े न मानें। इनका जोड़ 100% नहीं होता।")}</div>${activityResearch.map((r) => `<section class="research-stat ${r.id === activity ? "research-focus" : ""}" data-research-activity="${r.id}"><h2>${t(r.en, r.hi)}</h2><strong class="research-number">${r.percent}%</strong><meter min="0" max="100" value="${r.percent}" aria-label="${e(t(r.en, r.hi))}">${r.percent}%</meter><p>${t(r.detailEn, r.detailHi)}</p><small>${t(r.populationEn, r.populationHi)}</small><a class="research-source" href="${r.url}" target="_blank" rel="noopener noreferrer">${t("Source: ", "स्रोत: ")}${e(r.source)}</a></section>`).join("")}<p class="muted">${t("Selected published reports; not live statistics or a survey of Saath users. Sources checked 7 November 2026. Activities can overlap. Choose what interests you, or skip.", "चुनी हुई प्रकाशित रिपोर्ट; लाइव आँकड़े या साथ उपयोगकर्ताओं का सर्वेक्षण नहीं। स्रोत 7 नवम्बर 2026 को जाँचे। गतिविधियाँ एक-दूसरे से जुड़ सकती हैं। जो रुचिकर लगे, चुनें या छोड़ें।")}</p>${b(t("Continue to " + names[activity], "गतिविधि पर आगे बढ़ें"), activity, "primary wide")}${b(t("Back to Explore", "आज़माएँ पर वापस"), "explore", "quiet wide")}`;
}
