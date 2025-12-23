## 2025-12-23 - [Regex Overhead in Loop]
**Learning:** `HtmlUtils.stripHtml()` uses multiple regex operations. Calling this 13,000+ times inside a nested loop (Students * Questions * Options) causes significant overhead when generating print reports for large classes.
**Action:** Pre-process and cache static text (question text, answer text) before iterating over students. This changes O(N*M) regex ops to O(M).
