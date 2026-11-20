# Saath faculty demonstration pack

**SIMULATED SOFTWARE TESTING DATA ONLY. Not human participant records, a clinical trial, or evidence of effectiveness.**

## Contents and access

In Saath, open **My space → Faculty demo & worksheets → Open simulated demo**. This independent viewer uses bundled assets and does not read or write personal notebook storage or call Supabase. It works without internet in a newly bundled Android build. A browser preview needs its local server. PDF opening/saving and download links depend on the device's browser/PDF reader; desktop preparation is recommended. These source changes are not yet a newly distributed APK or an activated OTA release.

- `simulation.json`: versioned dataset, 50 profiles, 500 daily records, and 50 notebook fixtures.
- `profiles.csv`, `daily-records.csv`: UTF-8 CSVs readable in Excel; array values use `|` separators. IDs join the tables. Every row has `simulated` and a warning label. Open through Excel's UTF-8 CSV import if automatic encoding detection fails.
- `saath-fillable-questionnaire.pdf`: English, 11-page standard AcroForm (instructions plus ten daily pages); 126 fields including text, multiline text, radio and checkbox controls. Not a reproduction of the full app.
- `questionnaire.json`: exact bilingual seven-day journal prompt/options source used for generation.

## Cohort design and method

Fifty fictional adults aged 18–45: 25 male and 25 female, matching the requested balance. This restricted test specification is not an inclusive recruitment policy or a representative sample. No identifying names, accounts, emails, telephone numbers or health diagnoses are generated. Contexts span students, workers, caregivers and job seekers; no demographic group is assigned a diagnosis or expected clinical outcome.

The deterministic generator combines ten life contexts with five reflection styles and individual age, routine, protective-factor and baseline-stress variations. A fixed pseudo-random seed (48721) gives reproducible tap selections, sleep/meal observations and stress fluctuations. Narratives connect a situation, automatic thought, evidence, balanced alternative and small action. Outcomes include worsening, no change and improvement by construction. These are rule/template-generated synthetic fixtures authored with coding assistance, **not a validated psychological simulator**. Repeated wording is expected; this is insufficient to evaluate natural-language models, diagnostic accuracy, population validity or efficacy. Language preferences vary but generated narratives are English; this does not validate Hindi comprehension.

## Actual application compatibility

The existing app has a **seven-day journal limit** and its encrypted backup validator rejects notebooks with more than seven entries. Each `notebooks[]` wrapper contains a `profileId`, simulation warning and a `notebook` value accepted by `notebookSnapshot()` in `src/vault.js`. Entries retain real `date`, `text`, `day`, `questionVersion: 1` and valid `optionIds`. `lang` and `consent:false` are supplied; no real consent is inferred. The generator and automated tests validate all 50 snapshots against that actual validator.

The full 10-day cohort is an external test format, **not a cloud-backup upload envelope**. Days 8–10 are follow-up observations, not app days 8–10; `appJournalDay` is null and the viewer labels them separately. Their reflection choices reuse Day 7 vocabulary. CBT worksheet, meals, sleep and numerical stress fields are simulation extensions, not existing app screens or validated scales. Do not reset or extend the journal silently to import them. The demo does not import anything into a real account. For automated tests consume `dataset.notebooks[n].notebook` through the normal notebook validator; do not paste JSON into localStorage or a real user's backup.

The general cohort excludes the Day 5 `disappear` choice to avoid confusing simulated content with urgent participant reports. Existing separate app safety tests exercise immediate crisis routing. Crisis wording and screening need psychologist review; synthetic success is not a safety validation.

## Fillable PDF: use and limitations

The PDF uses conventional AcroForms without JavaScript or external connections. Use an AcroForm-capable desktop reader, ideally Adobe Acrobat Reader. Complete a copy, choose **Save As**, close, reopen, and verify every field before sharing. Browser, mobile and desktop reader behavior varies: compatibility has not been manually verified across readers. Checkboxes cannot enforce exclusive options without reader-dependent scripting, so choose an exclusive answer alone. All fields are optional. Text boxes have finite capacity; keep responses short enough to remain visible when printed.

This worksheet cannot reproduce authentication, encrypted backup, adaptive navigation, media playback, automatic checks, notifications or crisis routing. It is plaintext, not encrypted; saving/sharing exposes responses to anyone with access. It does not score or diagnose. Do not collect passwords or backup secrets. Tele-MANAS 14416 / emergency 112 guidance is printed on every page; the PDF is not monitored. It is English only and is not a validated translation or questionnaire instrument. The app or a secure offline form remains preferable when dynamic behaviour and privacy controls matter.

## Reproduce and verify

1. `npm ci` then `npm run demo:generate` (no network requests, no credentials).
2. `python3 -m venv .venv`, install `scripts/pdf-requirements.txt` into that venv.
3. `.venv/bin/python scripts/generate-questionnaire.py` creates and structurally checks the PDF.
4. `npm test` and `npm run build` validate app integration and bundled assets.

The generated pack is intentionally versioned, about a few MB; no private data or signing keys are included. Regeneration replaces only the named demo assets. Native sync and a newly built APK (or a properly configured signed OTA release) are needed to distribute this update. Existing APK downloads do not acquire it automatically.

## Faculty presentation status

The editable 2–3 slide screenshot deck is **pending the user's ten actual stage screenshots**. User Name / Stress / Meal / Sleep stage claims must be reconciled against the supplied screenshots and the current app; these are not all current first-class screens. Do not invent screenshots or label mockups as development evidence. Once supplied: embed originals, preserve aspect ratio, arrange stages 1–4 and 5–8 in 2×2 grids and stages 9–10 with an overview; use a larger slide/deck if text is illegible. No external image links; test offline in PowerPoint/LibreOffice.

## Recommendation for an actual pilot

Seek supervisor/institutional ethics approval and qualified psychologist review before recruitment. Define a narrow usability/feasibility question, eligibility, recruitment strategy, informed consent, voluntary withdrawal, distress escalation and adverse-event plan, support availability, data minimisation, access controls, retention and deletion policy. Include gender-diverse people in a justified recruitment plan; do not infer representativeness from a small convenience sample. Use approved validated measures in the appropriate language, separately from optional daily reflection, and avoid daily PHQ/GAD administration without an approved protocol. Decide sample size with the supervisor/statistician rather than treating 30–50 as sufficient to show efficacy.

For an initial adult usability pilot, measure task completion, errors, reader/device compatibility, acceptability and interview feedback. Separate synthetic QA from real data physically and analytically; never combine them in outcome tables. Verify secure backups and restores, local storage exposure, account isolation, crisis paths, offline use and accessibility on actual devices first. Predefine missing-data handling and analyses. Report consented real observations with limitations; efficacy claims require a suitably designed, ethically approved study, not this simulation or a few favorable charts.
