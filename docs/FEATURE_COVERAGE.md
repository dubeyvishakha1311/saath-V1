# PDF feature coverage · Saath 0.5.0

Source: user-provided `Saath_Idea_Summary.pdf` (November 2026). This is a prototype implementation map, **not** a claim that clinical or legal approval has been obtained.

| PDF requirement | Implementation | Remaining limitations / release gate |
| --- | --- | --- |
| Story + open questions | Original neutral bench story; character/needs prompts; saved answers and gentle reflection | One story; psychologist and native-speaker review pending |
| Song + user's own words | Optional title/artist/link; explanation field; only explanation is analysed | No audio, playback or lyrics retrieval; rules do not infer meaning from title/artist |
| Poem / missing line | Original bilingual poem and open completion/response | One poem; content review pending |
| Emotional themes | Local English/Hindi keyword rules, word evidence, tentative language, theme rejection | **Not AI or semantic understanding.** Negations and context may be misread; no clinical claims |
| Seven-day journal | One completion per local date; draft recovery; optional prompts; no missed-day penalty | One cycle; device date affects progress |
| Weekly reflection | Themes across entries, original entries, user-chosen positive-day excerpts, optional exercise | No invented positive moments or causal interpretations; risk matches suppress ordinary reflection |
| Panic button | Persistent Calm tab; offline breathing, grounding and back-counting | Device testing and clinical review pending; no guarantee of relief |
| Medical emergency warning | Chest pain/severe breathing guidance; emergency call action | Do not label medical symptoms “just panic” |
| Trusted person | Optional manually entered number and explicit dialler action | No automatic calling, location sharing or notifications |
| Crisis help | Persistent Get help; India 112 and Tele-MANAS 14416; non-monitoring notice | Official listings checked 7 Nov 2026, not call-tested; not worldwide |
| Free-text crisis-first routing | Rule checks submitted journal, story, song explanation, poem and exercise notes; unsafe saved/weekly content suppresses normal reflection | Incomplete and unvalidated; false positives and negatives possible; not continuous monitoring. Safety routing still happens if persistence fails |
| PHQ-9 / GAD-7 (PDF: later) | Optional question-by-question English instruments; faithful 0–3 scoring; missing/invalid answers rejected; self-report limits; functional-impact question; discard/delete | Internal testing only; no diagnosis, no severity-based diagnostic labels, no validated Hindi translation; clinical implementation review pending |
| PHQ-9 item 9 above zero | Immediate crisis screen, regardless of total; ordinary result suppressed | No automated human response; no indication that another person has been contacted |
| CBT-informed reflection | Optional balanced-perspective prompt and evidence question | Inspired-by wellness copy, not treatment; psychologist review pending |
| Behavioural activation | One manageable daily action | No prescribed treatment plan |
| Mindfulness | Brief noticing exercise | Optional and stoppable; review pending |
| Self-compassion | Kind writing prompt with optional saved note | Review pending |
| Expressive / narrative writing | Ordinary-moment writing exercise | No trauma processing; stop-if-uncomfortable copy |
| ACT-style values | Values and small-step prompt | Not ACT therapy |
| Referral-only interventions | Professional-support information for severe symptoms, trauma/exposure, DBT, psychodynamic or medication questions | No therapist directory or booking; no provider credentials fabricated |
| Wellness positioning | 18+ consent, non-diagnostic copy, no promises or mind-reading claims | Clinical/legal approval required for public use |
| Hindi / English | Main UI, stories, poems, rule-based reflection and exercise copy | Native-speaker review pending; screening items remain English with an explicit warning |
| Device-first privacy | Optional Supabase Auth; separate guest/account notebooks; explicit passphrase-encrypted cloud backup; no automatic upload, ads or analytics | Local notebook/session storage is **not app-level encrypted**; custom SMTP and security/retention review remain required; see [Supabase notes](SUPABASE.md) |
| Delete all data | Deletes current guest notebook locally, or signed-in account notebook plus cloud backup; separate verified account-deletion endpoint | Other offline devices/provider/OS copies are not remotely wiped; physical-device/retention review pending |

## Not represented as completed software features

- **Remote AI reflections:** no provider/backend configured. Current offline rules are explicitly labelled. Enabling a model requires provider/privacy consent, contractual review, clinical safety evaluation, secure backend credentials and safe fallback design.
- **Voice journaling / premium reports / subscriptions:** optional monetisation examples, not defined core requirements. No fake paywall or payment collection is included.
- **Paid therapist referrals:** requires a verified directory, user choice, commercial disclosure, and separate privacy requirements. Current screen gives professional-care guidance and public support access only.
- **B2B pilots, funding, market research and investor readiness:** business/operational work, not app screens. No institution can view user entries or screening results.
- **School/minor users:** excluded from the adult pilot pending safeguarding and consent review.
- **Clinical advisor, DPDP/legal review, call-testing, a 20–50-person pilot and retention/payment validation:** human release gates; cannot be satisfied by code generation.

## Resource record

**Locale:** India. **Web listing check:** 7 November 2026. **Call-test status:** not performed. **Operational owner:** unassigned; must be appointed before pilot. Re-check sources and test the intended calling flow before any public release, then set a documented review cadence. Outside India, use the local emergency service.

- Tele-MANAS 14416: Directorate General of Health Services, Ministry of Health & Family Welfare — https://dghs.mohfw.gov.in/national-mental-health-programme.php
- Emergency 112: Government of India Emergency Response Support System — https://112.gov.in/about
- English PHQ-9 / GAD-7 questionnaire wording source: Florida State University University Health Services — https://uhs.fsu.edu/sites/g/files/upcbnu1651/files/docs/PHQ-9%20and%20GAD-7%20Form_a.pdf
- Additional English wording cross-check: East London NHS Foundation Trust — https://www.elft.nhs.uk/sites/default/files/2024-08/2.%20PHQ9%20GAD7%20etc.pdf

PHQ/GAD instruments were developed by Spitzer, Williams, Kroenke and colleagues. No claim of validation of this app or its Hindi UI follows from reproducing English instruments. Functional difficulty is not included in the summed score. PHQ-9 item 9 > 0 is a safety routing rule from the PDF, not a diagnosis.

## Release blockers

Clinical approval of all content, instrument implementation and safety rules; Hindi/native-speaker review; secure storage/key-lifecycle design and audit; DPDP and vendor/legal review; device/accessibility QA; verified resource ownership and calling checks; incident-response process; controlled adult pilot and retention/helpfulness evaluation. Passing automated fixtures is not evidence of guaranteed crisis detection or therapeutic benefit.
