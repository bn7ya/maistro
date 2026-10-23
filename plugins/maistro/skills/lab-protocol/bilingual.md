# Bilingual output rules (W04, W05)

The lab works in English. English is the source of truth. Arabic versions are produced from frozen
English text, and Arabic is never fed back into English drafts.

## What gets translated, and when
- **Stage reports:** `stage-reports/<stage>.en.md` becomes `stage-reports/<stage>.ar.md`. Each report
  is translated by W04 during the following stage. The manuscript report and the final sign-off are
  translated in the Arabic stage.
- **Paper:** `manuscript/sections/NN-<id>.en.md` becomes `manuscript/sections/NN-<id>.ar.md`, one
  translator call per section, only after the claim audit has frozen the English.
- **Glossary:** `glossary.md`. During stages 2–6, the W04 call that translates the report is its only
  writer. In the Arabic stage, section translators return `new_terms` and W05 merges them.

## Translation standard
- Modern Standard Arabic, formal academic register, as in Arabic peer-reviewed journals.
- Use the established Arabic term where one exists (Arab academies, UNESCO terminology and standard
  textbooks). When the field normally keeps the English term, give the Arabic followed by the English
  in parentheses at first use, e.g. «التحليل البعدي (meta-analysis)».
- Keep these unchanged, exactly as in the English: citation keys (`[SRC-0012]`, `[EXP-02]`), figure
  and table numbers, equations and LaTeX, code, variable names, numbers and units, URLs, DOIs.
- Use Western digits (0–9) in numbers, equations and tables so they match the English exactly. Use
  Arabic punctuation (، ؛ ؟) in running text.
- Write headings and sections in the same order and the same count as the English.
- Don't add, soften or strengthen claims. Translate the hedging exactly: "may" ≠ "will".
- Mark untranslatable nuance with a translator's note: `[ملاحظة المترجم: …]`.

## Glossary format
```
| English | العربية | Note |
|---|---|---|
| effect size | حجم الأثر | |
```
One row per term, sorted alphabetically by the English. Never change an existing Arabic rendering
without W05 recording why in the Note column.

## Checks the audit runs
For each section pair, the multiset of citation keys, the figure/table references and the count of
equations must be identical between `.en.md` and `.ar.md`.
