# Verification

Validated in Chromium 153 with Playwright on 2026-09-12.

28 groups of checks passed (17 existing interaction groups and 11 checks for choices and full deletion). No JavaScript or console errors occurred during the primary interaction suite.

- Arabic numbers, empty-wheel guards, duplicate prevention
- Participant selection and manual start before a question
- Cancel during spin, before the first frame, and with Escape; no consumed question or stale callback
- Early stop creates exactly one question; answered result survives closing
- Cancel/confirm history deletion, persistence after reload, and early stop after deletion
- Automatic completion, timeout, reveal, answered, unknown, and skipped outcomes
- Pending question restores after reload and closes cleanly
- Question additions, empty wheel, and restoration retain participant results
- Normal mode selection stays independent of question scores
- 20 responsive layouts, narrow question/participant dialogs, and landscape controls
- No JavaScript or console errors during the interaction suite
- History deletion works in an embedded preview without browser modal permission
- Storage denial keeps the game usable and accurately reports session-only deletion
- Reduced-motion completion, immediate cancellation, and repeated stop clicks
- Reset only the current owner; wheel lists and other results persist, dashboard updates and reloads
- Original GitHub data migration and preference for newer saved state
- Maximum 2,000 participants and cancellation remain usable

Responsive checks used 10 viewport sizes in both modes (20 combinations), including 320 px phones, tablets, desktop, and landscape. The source HTML, asset paths, and Vercel configuration were also checked.

## Multiple-choice answers and full deletion

- All 150 questions have four distinct curated choices and exactly one keyed answer
- 300 automatic grades, no double grading, and deadline/reveal/skip/invalid-choice guards
- Four hidden-until-graded choices, stable keyboard focus/order/deadline, correct answer and reload persistence
- Wrong choices record a separate incorrect result, display the correction, and appear in participant information
- Expired and revealed questions reject choices; manual oral-answer grading remains available
- Cancel/Escape/confirm full deletion, every participant/number/name/result/history removed, fresh questions, settings retained and reload stays cleared
- Full deletion stays disabled during a spin, cancelled callbacks cannot resurrect records, and a fresh game starts normally
- Choice controls wrap without horizontal overflow at six phone/tablet/desktop/landscape sizes and retain 44px touch targets
- Saved built-in questions gain choices while historical attempts and participant IDs are preserved
- Blocked browser storage does not break deletion and reports that it applies only to this session
- No browser JavaScript or console errors in the new interaction suite

The choice model was exercised with 300 grades (one correct and one incorrect answer for each of the 150 questions). New choice layouts were checked at 320, 390, 540, 768, 1440, and 844 pixels, including landscape. Saved order and deadlines survive reload; wrong choices cannot be changed into correct answers through the manual controls.

The full-delete confirmation was exercised with Cancel, Escape and Confirm. All name/number pools, participant records, attempts, history and old imported list keys were removed, with unrelated browser storage and game settings retained. The cleared state remained cleared after reload.

## Question wording

Ambiguous prompts were clarified for single-answer grading. For example, the Jeddah flagpole question now asks for the city, and the aseeda question describes its preparation. Selected factual references used in this pass: [Jeddah Flagpole](https://en.wikipedia.org/wiki/Jeddah_Flagpole), [Saudipedia — العصيدة](https://saudipedia.com/العصيدة), and [Saudi Red Crescent — emergency numbers](https://www.srca.gov.sa/). These references support those specific entries; this report does not claim an external fact check of every question.

This is a record of tested scenarios, not a guarantee against every possible browser or device issue. Vercel deployment is performed by the repository owner after import.
