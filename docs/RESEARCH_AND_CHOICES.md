# Tap-first journal, participation research and review record · 0.6.0

## User flow

Day 1 is single-select: Good / Okay / Mixed / Hard / Very hard. Days 2–7 accept multiple selections. Tap a selected option again to clear it; “nothing / not sure / not ready” options are mutually exclusive with specific answers. Selecting a specific answer clears that exclusive option. Text is optional behind **Add a note**. A choice-only answer completes a day when Save is pressed; tapping alone saves a draft and does not advance progress. Same-day editing does not add another completed day. Day numbering follows completed entries, not a required consecutive calendar streak.

Story, Song and Poem cards open their research screen first, then Continue opens the existing activity. Each offers tap options with optional notes. Song title/link are optional; no music/lyrics are fetched or analyzed. Saved selections display as chosen, not as an inferred mental-health condition. Only optional user-authored notes feed the pre-existing local keyword reflections.

## Research source record

Sources checked **7 November 2026**. These are selected published reports, not live/current prevalence estimates, not Saath analytics and not Indian population estimates.

| Bar | Exact measure | Population / period | Primary source |
| --- | --- | --- | --- |
| 73% | Said they listen through **licensed audio streaming services**, subscription or ad-supported; not all music listening or preference for music over reading | IFPI, 43,000+ respondents aged 16–64 across 26 countries; fieldwork August–October 2023 | [IFPI, Engaging with Music 2023 release and methodology](https://www.ifpi.org/ifpis-global-study-finds-were-listening-to-more-music-in-more-ways-than-ever/) |
| 37.6% | Read **novels or short stories** in the preceding 12 months; not short stories alone | U.S. adults, 2022 SPPA; July 2021–July 2022 period | [NEA, Arts Participation Patterns in 2022](https://www.arts.gov/sites/default/files/2022-SPPA-final.pdf), reading table / Finding 5 |
| 9.2% | Read **poetry** in the preceding 12 months; not poetry listening | U.S. adults, 2022 SPPA; July 2021–July 2022 period | [Same NEA report](https://www.arts.gov/sites/default/files/2022-SPPA-final.pdf), reading table / Finding 5 |

NEA context / cross-check: [18 October 2023 primary release](https://www.arts.gov/news/press-releases/2023/new-data-reveal-how-adults-participated-arts-during-covid-19). IFPI is a recording-industry body, not a clinical trial provider. The NEA survey period includes pandemic conditions. The samples, ages, questions and dates differ; respondents can do multiple activities. **Do not add the bars to 100%, rank them as head-to-head preferences, generalize them to India, or interpret them as anxiety/depression treatment outcomes.** No efficacy claim is made. No higher percentage determines which activity the app recommends.

Each screen shows all three independent bars, with the selected card's activity emphasized, the measured activity/population/year, a link under each number, and a visible commonness-not-treatment notice. Source contents open only on user action. Core numbers/text are bundled for offline display; links need internet. To update a statistic, change `src/research.js`, verify the primary report and denominator, update this record/date, and run UI/tests. Do not substitute unsupported “people prefer X” percentages.

## Central data map / saving

| Record | Local notebook | Optional Supabase backup |
| --- | --- | --- |
| Saved daily answer | `entries[]`: local date, logical `day`, stable `optionIds`, `questionVersion:1`, optional typed `text` | Included inside the existing encrypted `saath_vaults.ciphertext` |
| In-progress daily selection | `journalChoices`: day and option IDs; optional note remains `draft` | Included in that same encrypted snapshot |
| Saved creative answer | `experiences[]`: type, ID, date, optional typed text, option IDs and question version; existing optional song metadata | Included in that same encrypted snapshot |
| Creative choice / note draft | `featureChoices`, `featureDrafts` and optional song metadata | Included in that same encrypted snapshot |
| Mood, screening, trusted contact and preferences | Existing notebook fields | Included as before |
| Research source data | Bundled editorial module, no user tracking or research-view logs | Not personal response data; no aggregate counters |

All these personal fields stay together in a per-account encrypted notebook snapshot; no plaintext answers/clinical flags/public metrics table was added. The existing forced RLS, verified account ownership, revision checks and deletion controls are unchanged. IDs and cardinality are validated; unknown IDs, duplicate choices and incompatible exclusive/single choices are rejected by backup validation. Legacy text-only entries remain supported. Labels are rendered from stable IDs in the current UI language rather than storing translated text as an answer. Update all devices to this release before new backups; older app versions do not know about the new top-level draft fields.

**Device save is immediate; cloud backup is not automatic.** Guest data is local-only until the user signs in, explicitly copies their guest notebook into their account and uploads an encrypted backup with consent and a separate passphrase. New changes need another upload. Do not tell users every tap has reached Supabase. The passphrase is never saved, so silent/background backup has not been added. Local/session storage remains unencrypted at app level, with the existing prototype limitations in [SUPABASE.md](SUPABASE.md).

## Day 5 safety rule and human review gate

**Status: NOT CLINICALLY REVIEWED. Psychologist owner: unassigned. Approval date: none.** Automated tests and this document are not a substitute for review. The choice wording is a prototype prompt, not part of a validated PHQ/GAD instrument and not a diagnosis.

Rule version: Day 5 `disappear` in `src/journal.js`; question version 1. Selecting “I wish I could disappear” immediately opens the existing crisis screen, before the Save button or a network operation. It must route even if device persistence fails, and in English/Hindi. Crisis shows Tele-MANAS **14416**, emergency **112**, non-monitoring/medical-emergency guidance and optional trusted contact. Calls are user-initiated; no clinician, contact or responder is notified automatically. The match is treated as a precautionary support signal, not proof of intent or imminent danger.

If saved with that choice, the structured ID prevents ordinary weekly reflection even when optional text is empty. Back/restore/review must not turn it into reassuring ordinary analysis. Users may correct their own choices; no covert immutable clinical record is created. Device-storage failures can prevent recovery of a draft, but must never prevent immediate support navigation. Existing free-text and PHQ-9 safety checks remain in place; no promise of complete risk detection is made.

### Psychologist / native-speaker review checklist before any public pilot

- Review all seven questions/options and exclusive-option behavior for bias, distress, missing alternatives and appropriate adult scope.
- Review Day 5 wording and whether/how it should trigger crisis/support guidance, including ambiguity, mistaken taps, false positives and missed signals.
- Approve English/Hindi wording, tone, resource presentation and what returning/editing a safety choice should do. A clinician must decide whether any further triage is appropriate; none is invented here.
- Review omission/skip behavior, storage/offline failure, restored drafts, same-day changes and weekly suppression.
- Reconfirm India helpline availability and physically test dialler links/device navigation; earlier official web checks were not call tests.
- Record reviewer credentials, decision, rule/copy version, date, limitations and follow-up owner. Obtain separate clinical/legal/privacy approval before pilot use.

## Verification

52 automated tests include all seven day modes, no-typing saves, multi/deselection/exclusive choices, draft recovery, editing, Hindi, immediate Day 5 routing with failed storage, saved safety suppression, research links/bars/caveats, creative tap-only saves, encrypted round trip and controller upload/restore of the new fields. Prior auth/crypto/navigation/safety tests remain passing.

Mobile Chromium smoke checks covered 84 screen combinations across 320/390/768px and English/Hindi: all seven journal days, all research/activity screens and the Day 5 crisis screen. Tap-only save/reflect paths worked; optional notes began collapsed; no horizontal overflow or uncaught page errors. Network responses were blocked/mocked; this is not physical Android or real email/Google/account end-to-end validation.
