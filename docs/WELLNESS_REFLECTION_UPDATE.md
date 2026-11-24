# Wellness introduction and choice-based conclusions

## Requested interface changes

- Removed the welcome screen's “Before we begin” section and old adult-only start button.
- Added the intended **15+** wellness audience and “The first step toward wellness for students and adults as well.” in English, with Hindi copy.
- Used accurate non-clinical positioning instead of “not just a therapy and diagnosis app,” which could incorrectly imply that Saath provides those services. The welcome now describes everyday reflection, creativity and small steps and explicitly says Saath does **not** provide therapy or diagnosis.
- Retained a collapsible device-storage privacy disclosure and explicit local-storage choice. Urgent support and Calm remain accessible before storage consent.

## Age and safeguarding boundary

The intended age label is a design request, not evidence of clinical validation, a legally sufficient minor-consent process, or approval to recruit teenagers. The UI notes that youth safeguarding, consent and privacy review remain outstanding and suggests involving a trusted adult when safe/appropriate. Existing optional account/Google identity-sharing consent remains adult-only pending that review; local reflection does not require an account. The adult simulated dataset is unchanged and is not evidence for adolescent safety or efficacy. The existing PRD's adult-only pilot is not expanded by this copy change. Clinical, legal, guardian-consent (where applicable), privacy and school/institutional approvals are needed before any real under-18 pilot.

## Reflection behaviour

Story, Song and Poem now show a labelled closing thought immediately after choices and on the saved reflection. Feedback explicitly repeats the user's selected labels and offers optional, modest next steps for supported choices. “None / unsure” is accepted without interpretation. Text-only reflections still use the existing tentative keyword reflection, not remote AI. No personality inference, diagnosis, scores, treatment recommendation or claim of hidden meaning is introduced. Safety text still routes to support rather than ordinary saved-feedback content.

Every journal day retains its original prompt and selection rules (Day 1 single choice; Days 2–7 multi-choice). Three additional optional multi-choice prompts cover thoughts, perspective-taking and a manageable step. Exclusive skip/unsure choices clear other choices within their own question. Each extra question is independently optional; an extra answer alone can save a day without typing or a primary choice. The daily conclusion summarizes selected choices, not an inferred mental-health state. After saving, today's conclusion appears on Home; after seven days a distinct conclusion lists next steps selected across the week and clearly states participation is not proof of improvement. Safety-related weekly entries suppress ordinary conclusions as before.

## Storage compatibility

Saved entries and per-day `journalChoices` drafts may contain optional `followUps` keyed by `thought`, `perspective` and `step`, with arrays of stable option IDs. No new top-level notebook field is added. Old notebooks without these fields continue to render and validate. Drafts survive reload and language switching, and saving/removing primary choices does not remove follow-up selections. The backup validator checks keys, array type, allowed IDs, duplicates and exclusive choices. Encrypted backup/restore tests cover both saved records and drafts. No database migration or real-user record edits are needed because the encrypted vault envelope is unchanged.

The separate faculty PDF and simulated fixtures remain the previously delivered adult demonstration pack, not an updated transcription of these new app-only follow-up questions. They are not youth validation material. Existing downloaded APKs are unchanged; no OTA release or main-branch merge is implied by this source update.

## Validation and remaining checks

Automated coverage includes bilingual onboarding, live and saved creative feedback, three daily follow-ups, exclusive toggling, reload recovery, language switching, optional writing, follow-up-only saves, storage-error rollback, legacy weekly fallback, multi-day conclusions, encrypted roundtrip and malformed-data rejection. Existing crisis tests cover immediate Day 5 support independently of storage, including Hindi and failure paths. Physical Android, reader/device accessibility, psychologist/native-speaker and youth safeguarding review remain outstanding.
