# Saath — Product Requirements Document

**Working name:** Saath  
**Version:** 0.1 — draft for review  
**Date:** 7 November 2026  
**Source:** `Saath_Idea_Summary.pdf` (user-provided idea summary, November 2026)  
**Status:** Proposed requirements; not a clinical, legal, or financial approval.

> Saath is a gentle self-reflection and wellness app, not a diagnostic tool, therapy service, or substitute for professional or emergency care.

## 1. Product overview

Saath helps people who feel alone or want to understand their thoughts begin with a quiet, non-judgemental reflection experience. The initial product combines a seven-day journal, a private weekly reflection, and immediate access to panic-support and crisis resources. Later experiences let users begin through stories, songs, and poems.

The experience should reflect possible emotional themes in the user's own words, offer small psychologist-reviewed, CBT-informed exercises, and encourage professional help when appropriate. Users can disagree with any reflection.

### Problem

Some people find it difficult to describe their feelings directly, are not ready for therapy, or do not know where to begin. They need a low-pressure way to reflect, notice patterns, and access support when overwhelmed, without being labelled or diagnosed.

### Value proposition

A gentle first step toward understanding yourself: private journaling, tentative and understandable reflections, and support tools that remain easy to reach.

### Differentiation hypothesis

The longer-term differentiation is the combination of indirect entry points (story, song, poem), thoughtful content, Indian context, and trustworthy safety practices—not Hindi support alone. This is a hypothesis to test, not a validated competitive advantage.

## 2. Source facts, assumptions, and decisions

The source proposes an Android-first MVP consisting of a seven-day journal, weekly reflection, panic button, crisis screen, and clear disclaimer. It describes an existing clickable prototype, but no working app. The repository currently contains no implementation to validate that prototype against.

The following are **proposed product decisions**, added to make the MVP buildable and requiring owner approval:

- Initial pilot serves adults aged 18+ in India. Supporting minors requires separate safeguarding, consent, and legal review.
- English and Hindi are supported for the pilot, with equivalent safety content and native-speaker review.
- Local-first storage and guest use remain the default. Scope amendment (7 Nov 2026): optional Supabase email/password accounts and explicit, separately encrypted manual cloud backup/restore are implemented; this is not automatic sync. Calm/crisis remain ungated. See [deployment and remaining release gates](docs/SUPABASE.md), including custom SMTP, secure device storage and real-device/email tests.
- Seven days means seven completed entries on separate local calendar dates; missed days do not reset progress.
- Daily reminders are optional and off until explicitly enabled.
- Core journaling, panic tools, crisis resources, and deletion remain free during the pilot.
- AI generation is conditional on safety, privacy, and clinical approval. Reviewed templates are the fallback and may be the initial implementation.

Unresolved decisions are listed in Section 16. No market statistic, helpline, or competitor claim in the source is treated as independently verified here.

## 3. Target users and needs

| User segment | Need | Product response |
| --- | --- | --- |
| Adults feeling lonely, low, or anxious | A non-judgemental place to start | Short, optional journal prompts and gentle language |
| People who struggle to describe feelings directly | An easier entry into reflection | Story, song, and poem experiences after the MVP |
| People curious about patterns over time | A manageable way to reflect over a week | Seven-day journey and private weekly summary |
| People feeling panicked or overwhelmed | Immediate, low-effort support | One-tap panic tools, trusted-contact action, crisis resources |

Saath must not present itself as suitable treatment for severe symptoms, trauma, self-harm, or medical emergencies. Referral and emergency-resource pathways are necessary, but do not constitute a monitored crisis service.

## 4. Goals and non-goals

### MVP goals

1. Help users complete a low-pressure seven-day reflection journey.
2. Provide a useful, non-diagnostic weekly reflection grounded in user-authored entries.
3. Make panic support available without sign-in or payment.
4. Prioritise crisis guidance over normal reflection when risk signals are detected.
5. Establish trust through understandable consent, minimal collection, and reliable deletion.
6. Learn from a 20–50-person pilot whether the experience is helpful, comfortable, and worth returning to.

### Non-goals

- Diagnosing, predicting, or treating mental-health conditions.
- Replacing a clinician, emergency service, or human crisis responder.
- Guaranteed detection of self-harm risk or continuous monitoring.
- Medication advice, exposure therapy, trauma processing, DBT treatment, or psychodynamic therapy.
- Open-ended AI companionship, therapist chat, social feeds, or community moderation in the MVP.
- PHQ-9/GAD-7 screening, payments, employer dashboards, or institutional access to personal entries in the MVP.

## 5. Scope and priorities

**P0:** required before pilot release. **P1:** post-pilot enhancement. **P2:** later exploration.

| Capability | Priority | Scope |
| --- | --- | --- |
| Welcome, age eligibility, disclaimer, consent | P0 | Explain purpose, limitations, storage, and any external processing |
| English/Hindi language choice | P0 | Full core flow, including errors and safety content |
| Seven-day journal | P0 | Reviewed prompts, local drafts, saved entries, progress, missed-day recovery |
| Weekly reflection | P0 | Themes, positive moments when supported, optional reviewed exercise |
| Panic support | P0 | Breathing, grounding, back-counting, trusted contact, crisis access |
| Crisis screen and routing | P0 | Interrupt ordinary reflection when risk is detected; always manually accessible |
| Local-first storage and delete-all | P0 | Minimise stored data; erase app-owned sensitive data reliably |
| Optional reminders | P1 | Generic notification copy; explicit permission; easy opt-out |
| Story entry | P1 | Neutral reviewed story, open questions, tentative reflection |
| Song entry | P1 | Song reference and user's explanation; analyse their words, not lyrics |
| Poem entry | P1 | Reviewed poem or missing-line prompt and gentle reflection |
| Additional journal cycles/history views | P1 | Define after testing the first journey |
| PHQ-9 and GAD-7 | P2 | Optional, instrument-faithful implementation with clinical approval |
| Voice journaling, premium reports, B2B pilots | P2 | Separate privacy, accessibility, safety, and commercial requirements |

## 6. Core user journeys

### 6.1 First use

1. Choose English or Hindi.
2. Read a short explanation of wellness purpose and limitations.
3. Confirm adult eligibility and review privacy information.
4. Consent to required local processing; separately choose any optional remote AI processing or analytics.
5. Land on Home with journal progress, a start/continue action, and persistent panic/help access.

Declining optional processing must not block panic tools or crisis resources. Emergency resources should remain accessible even before onboarding is complete.

### 6.2 Daily journaling

1. Open today's reviewed prompt, such as “How was your day?”, “What felt heavy?”, or “What did you do for yourself?”
2. Write freely; skip a prompt or leave without guilt-based messaging.
3. Save an entry. Safety routing takes precedence over any normal reflection output.
4. See progress and an invitation to return, without diagnosis, scoring, or promises of improvement.
5. Continue on another day. A missed day does not erase entries or reset progress.

### 6.3 Weekly reflection

1. After seven completed days, choose to view a weekly reflection.
2. Review tentative themes linked to the user's actual words, and positive moments only when supported by entries.
3. Accept, reject, or skip suggested themes without penalty.
4. Optionally try one reviewed, low-risk CBT-informed exercise.
5. See a gentle invitation to seek qualified professional support when helpful.

### 6.4 Panic support

1. Tap the persistent panic button.
2. Immediately see brief medical-emergency guidance and a choice of breathing, grounding, or back-counting.
3. Switch or stop an exercise at any time.
4. Optionally call a trusted person or open crisis resources.

### 6.5 Crisis routing

1. A supported risk signal is detected, or the user opens crisis help manually.
2. Pause ordinary generated reflection; do not show a routine weekly interpretation or exercise as the main response.
3. Show calm, reviewed safety copy, emergency/crisis resources, and trusted-contact actions.
4. Explain that Saath is not monitored and cannot dispatch help.
5. Let the user retry a failed call or choose another resource. Never claim that someone has been notified unless a separately consented, verified action actually occurred.

## 7. Functional requirements and acceptance criteria

### FR-01 — Onboarding and consent

- Present plain-language wellness limitations and privacy information before storing journal content.
- Keep optional AI transmission and analytics consent distinct from essential local processing.
- Record the applicable consent version locally; allow users to revisit preferences.
- **Acceptance:** declining optional consent still permits local journaling and all safety tools; a new user can access emergency resources without completing onboarding.

### FR-02 — Journal and progress

- Provide a clinically reviewed seven-day prompt set; text responses must be optional.
- Autosave drafts locally and visibly distinguish a draft from a completed entry.
- Count at most one completion per local calendar date; allow users to edit an entry without increasing progress.
- Preserve progress across restarts, missed days, and interrupted sessions. Define timezone changes without duplicating completions.
- **Acceptance:** reopening after termination restores the last saved draft; an empty submission does not count; seven valid completed dates unlock the weekly reflection; missing a day does not reset the journey.

### FR-03 — Weekly reflection

- Use only the user's completed entries as evidence. Do not invent experiences, infer diagnoses, or equate writing style with a condition.
- Use tentative phrases such as “One possible theme…” and let the user mark a theme as not fitting.
- Include possible themes, supported positive moments, and one optional reviewed exercise. Do not force a positive interpretation.
- Require consent before any external processing; handle offline or provider failure with reviewed fallback copy rather than speculative output.
- Run safety checks before presenting generated output and suppress unsafe output.
- **Acceptance:** the summary is unavailable before seven completed days; rejected themes are not presented as facts; insufficient evidence produces an honest limitation; network or generation failure preserves all entries and exposes a safe retry/fallback.

### FR-04 — Panic tools

- Provide reviewed slow-breathing guidance, 5-4-3-2-1 grounding, and back-counting with no login, payment, or mandatory questionnaire.
- Offer alternatives if breath focus feels uncomfortable; never require breath-holding or imply an exercise will stop an attack.
- Show a clear note to seek emergency medical help for chest pain, severe breathing difficulty, or other suspected medical emergencies.
- Allow manual entry of an optional trusted contact without requiring address-book access; open the device dialler on explicit user action.
- **Acceptance:** all exercises work offline, are stoppable, and have readable text alternatives to animation; no call is initiated automatically; absent contacts or unavailable calling capability produce clear instructions.

### FR-05 — Crisis screen and safety routing

- Use clinician-reviewed rules for supported text inputs, including Hindi, English, and common mixed-language expressions.
- Run applicable safety checks before ordinary reflection. Retain a manually accessible help route because detection is fallible.
- Do not promise confidentiality beyond actual policy, guaranteed detection, guaranteed safety, or live monitoring.
- Maintain a versioned resource directory with locale, verification date, reviewer, and review schedule.
- The source mentions **Tele-MANAS 14416** and **112** as candidate Indian resources. These are **unverified in this PRD** and must be confirmed for purpose, availability, and geographic coverage before inclusion in a release.
- **Acceptance:** every clinician-defined release-blocking risk case routes to the approved safety flow; blocked/offline detection never displays a claim that the user is safe; crisis content and verified numbers remain readable offline, with calling subject to device/network availability.

### FR-06 — Privacy controls

- Store journal content locally by default using platform-supported encryption and secure key storage.
- Do not place entries, generated reflections, phone numbers, or risk text in logs, crash reports, notifications, or analytics.
- Explain device backup behaviour; exclude sensitive data from automatic backups unless explicitly designed, consented, and legally reviewed.
- Offer “Delete all my data” with confirmation, covering entries, drafts, reflections, contacts, consent records, caches, and app-owned analytics identifiers. Explain any legally required exceptions or external deletion limitations before launch.
- **Acceptance:** after confirmed deletion and app restart, no prior sensitive content appears or can be retrieved through app functionality; no pending queued transmission restores or uploads deleted content.

### FR-07 — Language and accessibility

- Support English/Hindi switching without losing entered text or changing the user's original words.
- Use native-speaker review for Hindi and clinician approval for translated safety copy.
- Support screen readers, scalable text, sufficient contrast, large touch targets, reduced motion, and plain-language navigation; target applicable WCAG 2.2 AA criteria.
- **Acceptance:** a user can complete onboarding, journal saving, deletion, and crisis access with a screen reader; no critical action relies on colour, sound, or animation alone; missing translations never expose raw translation keys.

## 8. Clinical and AI safety policy

### Allowed content

Psychologist-reviewed CBT-informed reflection, small behavioural activation actions, basic mindfulness, grounding, self-compassion writing, expressive writing, and ACT-style values prompts. Present these as wellness exercises inspired by these approaches, not treatment protocols.

### Prohibited behaviour

- Statements such as “You have depression/anxiety” or claims to read the user's mind.
- Medication recommendations, trauma processing, exposure instructions, or prescriptive treatment plans.
- Validating self-harm, providing harmful instructions, or treating a screening score as a diagnosis.
- Dependence-building language, shame about missed days, or claims that the app is a human companion.

### Required safeguards

- Appointed clinical reviewer approves prompt content, safety routing, crisis copy, exercises, and English/Hindi output rules before pilot release.
- If AI is used, treat user text as untrusted input; embedded instructions must not override safety or privacy rules.
- Evaluate input and output safeguards with clinician-authored normal, ambiguous, high-risk, adversarial, and mixed-language cases. Document known limitations and false positives/negatives.
- Do not send content to a third party until the provider's retention, training-use policy, security, deletion support, and contractual terms have been approved and disclosed.
- Use a reviewed static fallback if a model fails, times out, returns prohibited content, or is disabled.
- Provide a minimal feedback/reporting channel. Sending journal content with feedback must require explicit consent and must not be presented as an emergency channel.
- Any critical safety failure blocks release; incidents trigger feature suspension or rollback and clinical review.

**Future screening gate:** PHQ-9/GAD-7 requires separate clinical and legal approval, faithful validated wording/scoring, and explicit self-report limitations. If PHQ-9 is introduced, an item 9 response above zero must trigger the approved crisis flow regardless of total score, as specified in the source. Never reinterpret validated scores solely as conversational themes.

## 9. Information architecture and key screens

1. Welcome / language selection.
2. Eligibility, wellness disclaimer, privacy and consent.
3. Home: current journal day, continue/start action, panic/help access.
4. Daily journal: prompt, editor, draft/saved state, progress.
5. Weekly reflection: tentative themes, evidence, feedback, optional exercise.
6. Panic support: medical safety note, breathing, grounding, counting.
7. Crisis help: verified resources, trusted-contact action, non-monitoring notice.
8. Settings: language, privacy, consent preferences, optional contact, delete-all, support information.

Panic/help must be available from all core screens without navigating through settings. Crisis screens must not contain upsells or retention prompts.

## 10. Data and technical requirements

Technology selection remains open; these requirements apply regardless of framework.

| Entity | Minimum fields / purpose | Handling |
| --- | --- | --- |
| Preferences | Language, eligibility confirmation, optional contact | Local; collect no full birth date unless justified |
| Consent | Policy version, choice, timestamp | Local audit of user choices; no unnecessary identity |
| Journal entry | Local ID, day/date/timezone, prompt ID, text, draft/completed state | Encrypted local storage |
| Weekly reflection | Entry references, content, generation/content version, optional user feedback | Same sensitivity as journal text |
| Safety resources | Locale, verified contact details, review date, content version | Bundled offline; controlled update process |
| Optional analytics | Consented coarse product events | No text, contact details, diagnostic labels, or risk classifications |

### Non-functional requirements

- **Reliability:** transactional writes; no loss of acknowledged saved entries on restart; deletion clears pending jobs and caches.
- **Offline:** journaling, progress, panic exercises, crisis-resource viewing, and deletion work without connectivity. Remote generation may be unavailable, with a clear fallback.
- **Performance targets (proposed):** panic screen interactive within 1 second of tapping from an open app; local save acknowledgement within 500 ms on agreed representative low/mid-range Android test devices. Benchmark conditions must be recorded.
- **Security:** transport encryption for any network operation, secure key handling, least permissions, dependency review, and no provider secrets embedded in a client. Remote AI requires an approved backend rather than client-side credentials.
- **Resilience:** no blank screen or data loss on network failure, invalid model response, denied permissions, interrupted calls, or low storage; display actionable errors.
- **Operations:** version content and safety rules; permit disabling unsafe generation without disabling offline panic/crisis tools. Define incident owner and escalation route before pilot.
- **Legal:** obtain qualified advice on applicable Indian privacy law, including the DPDP framework, consent, retention, vendors, eligibility, and wellness claims. This PRD does not assert legal compliance.

## 11. Success metrics and measurement

Targets below are **pilot hypotheses**, not evidence-backed benchmarks. Review after the first cohort; small samples are directional, not statistically conclusive.

| Metric | Definition | Proposed pilot criterion |
| --- | --- | --- |
| Activation | Participants saving their first entry / consented pilot participants | At least 60% |
| Day-7 retention | Activated users opening the app on calendar day 7 after activation / activated users | At least 30%; report separately from journey completion |
| Journey completion | Activated users completing seven valid entry dates within 14 days / activated users with a full observation window | At least 25% |
| Reflection helpfulness | Respondents choosing helpful/very helpful / reflection feedback respondents | At least 70%; include respondent count |
| Comfort and trust | Qualitative interviews about judgement, privacy, clarity, or discomfort | Review every concern; resolve critical issues before expansion |
| Safety readiness | Clinician-defined release-blocking cases and critical defects | All required cases pass; zero unresolved critical safety/privacy defects |
| Day-30 retention | Activated users returning on day 30 / users with a full observation window | Observe before setting a target |

Where optional analytics consent exists, use events such as `onboarding_completed`, `journal_entry_saved`, `weekly_reflection_viewed`, and `reflection_feedback_submitted` without free text or sensitive payloads. Do not track crisis/panic use in the initial pilot unless a separate necessity, consent, and clinical/privacy review approves it. Use voluntary interviews to assess safety-tool usability. Never delay help to record an event.

## 12. Validation and release plan

### Phase 1 — Scope and prototype validation

**Indicative effort:** 1–2 weeks, dependent on staffing.

- Confirm assumptions, adult audience, build route, budget, clinical reviewer, and data architecture.
- Test the existing prototype with approximately 5 people; observe hesitation and comprehension.
- Validate that users understand the difference between reflection, therapy, and emergency support.

### Phase 2 — Safety foundation and MVP implementation

**Indicative effort:** estimate after choosing the build route; content review may take 2–3 weeks and run in parallel.

- Build offline crisis/panic access, consent, secure local storage, and deletion first.
- Implement journaling and reviewed weekly reflection, followed by approved AI only if necessary.
- Complete Hindi/native-speaker, clinical, accessibility, security, and privacy reviews.

### Phase 3 — Controlled pilot

**Indicative observation period:** 2–4 weeks with 20–50 consenting adults.

- Recruit with clear wellness limitations; define incident handling and non-emergency feedback routes.
- Evaluate retention, completion, helpfulness, discomfort, and failure states.
- Do not use unsupervised crisis simulations with vulnerable participants; validate dangerous scenarios using reviewer-authored test fixtures.

### Phase 4 — Expansion decision

- Review safety, user feedback, delivery cost, and retention before expanding.
- Explore one college or NGO pilot, limited initially to adults; do not share individual journal or risk data with the institution.
- Add story/song/poem experiences only after the core journey is useful and safe.
- Assess payment interest separately from wellness outcomes; do not introduce access barriers to safety tools.

All timelines are estimates, not delivery commitments. School pilots involving minors are excluded pending separate review.

## 13. Release gates and QA checklist

- [ ] Product owner signs off scope and open decisions.
- [ ] Clinical reviewer approves prompts, exercises, reflection rules, and crisis/panic content.
- [ ] Release-blocking safety test suite passes in English, Hindi, and relevant mixed-language cases.
- [ ] Each displayed helpline is verified, documented, and assigned a review owner/schedule.
- [ ] Legal/privacy review covers consent, vendors, retention, deletion, backup behaviour, and claims.
- [ ] Delete-all, draft recovery, interrupted writes, reinstall/backup behaviour, and pending-job cancellation are tested.
- [ ] Offline journeys and network/provider failures have safe fallbacks.
- [ ] Accessibility and target-device performance checks pass.
- [ ] No sensitive data appears in logs, telemetry, crash reports, or notifications.
- [ ] Pilot recruitment, consent materials, feedback process, and incident owner are ready.
- [ ] A rollback/AI-disable procedure is tested without removing offline support resources.

## 14. Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Harmful or overconfident AI reflection | Tentative language, evidence grounding, clinical evaluation, output checks, static fallback, disable switch |
| Missed or falsely detected crisis signal | Explicit limitations, manual crisis access, bilingual testing, clinician-reviewed routing; never promise complete detection |
| Medical emergency mistaken for panic | Prominent medical safety note; no reassurance that symptoms are “just panic” |
| Exposure of highly sensitive writing | Local-first encryption, minimal permissions, no text telemetry, backup controls, deletion tests |
| Poor Hindi or culturally inappropriate wording | Native-speaker and clinical review; test with intended users |
| Low engagement or guilt | Short optional prompts, no streak punishment, qualitative testing |
| Low paid conversion / high generation cost | Free core, small pilot, measure actual cost, validate institutional interest before scaling |
| Easy imitation | Invest in quality, trust, safety, and content rather than feature count |
| Regulatory or misleading claims | Wellness positioning, legal review, no diagnosis/treatment claims |
| Institution misuses participant information | No individual-level sharing; separate agreement and privacy review for any future aggregate reporting |

## 15. Commercial considerations

The source suggests free core access, optional low-cost premium features, institutional pilots, and user-initiated referrals to verified professionals. These are future hypotheses, not MVP dependencies.

Do not include ads, sell sensitive data, gate crisis resources behind payment, or remove core safety functionality to drive conversion. Therapist referrals, if added, need provider verification, commercial disclosure, and informed user choice.

Market sizes, competitor pricing, company revenue, and revenue scenarios in the idea summary are unverified context—not forecasts or release requirements. Validate them separately before fundraising or pricing decisions.

## 16. Open questions and ownership

Roles below must be assigned to named people before pilot release.

| Decision | Proposed owner | Needed by |
| --- | --- | --- |
| Confirm adults-only India pilot and English/Hindi launch scope | Product + legal | Scope sign-off |
| Choose native/cross-platform/no-code build and supported Android versions | Engineering + product | Build planning |
| Choose templates vs AI; approve provider, backend, retention, and cost | Product + clinical + engineering + privacy | Reflection implementation |
| Define exact weekly prompt set and clinically approved exercises | Clinical + content | Content freeze |
| Define risk signals, ambiguous-case handling, and safe failure behaviour | Clinical + engineering | Safety implementation |
| Verify emergency/crisis resources and review cadence | Safety/operations | Before pilot |
| Confirm encryption, key lifecycle, backup and deletion semantics | Engineering + privacy | Storage implementation |
| Confirm analytics consent, retention period, and pilot evaluation method | Product + privacy | Before recruitment |
| Decide edits after summary generation and subsequent journal cycles | Product | Before journey QA |
| Set feedback response times and incident escalation procedure | Operations + clinical | Before pilot |
| Decide funding, budget, accountable delivery owners, and institutional partner | Product/founder | Pilot planning |

## 17. Definition of MVP done

An eligible adult can understand Saath's limits, choose English or Hindi, journal privately across seven days, view an evidence-grounded non-diagnostic reflection, use offline panic tools, reach verified crisis resources, and delete all app-owned sensitive data. All safety, privacy, accessibility, and operational release gates pass, and the controlled pilot has an approved evaluation plan.

---

**Source note:** This PRD translates the attached idea summary into proposed delivery requirements. The summary's market research, competitor descriptions, prototype availability, and contact numbers were not independently verified. Added defaults, metrics, technical requirements, and release gates are proposals for review, not claims that these capabilities already exist.

## Implementation amendment · 7 November 2026 · v0.6.0

The journal is tap-first: Day 1 single choice; Days 2–7 multiple choices; optional notes. Story/Song/Poem cards open sourced participation research before tap-first activities. Statistics must retain their source population, year and measure, must not be ranked as comparable preferences, and must never imply anxiety/depression treatment. Day 5 “I wish I could disappear” selection immediately opens crisis guidance even if storage fails. This rule and all option wording require psychologist/native-speaker review before a pilot; no review is claimed. Structured answers and drafts are covered by the existing explicit, separately encrypted Supabase backup, not silent plaintext collection. See [review and data map](docs/RESEARCH_AND_CHOICES.md).
