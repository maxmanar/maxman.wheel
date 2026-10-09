# Verification

## Typography and mode palettes — 2026-10-10 (Asia/Riyadh)

Replaced the local-only Foda Naskh declaration with self-hosted Tajawal Regular, Medium, and Bold. Font binaries and the SIL Open Font License came from the [Google Fonts Tajawal directory](https://github.com/google/fonts/tree/main/ofl/tajawal). Verified the font weight metadata and Arabic letters/digit coverage with FontTools, and verified references to all three local font files.

Added `site/theme.css`: Normal mode uses ink blue, sea glass accents, and cool white surfaces; Personality mode uses deep plum, lavender, white cards, and muted complementary accents. Updated normal-wheel segment/text colors and personality dimension/group accents to match. Increased several small labels and descriptions and removed negative letter spacing from Arabic headings.

Checked eighteen representative text/background pairs mathematically against 4.5:1 contrast, including secondary text on page backgrounds, button text, light banner labels against the lighter gradient endpoints, and personality accents on card backgrounds. CSS delimiter checks and JavaScript syntax checks passed. Existing six personality model test groups and twelve simulated DOM interaction checks passed after the style update.

Real-browser visual and viewport verification remains unavailable in this session. Contrast calculations and simulated interaction checks do not verify the final rendered layout.

## Personality mode and National Day-only Canva — 2026-10-09

Added an independent Arabic personality questionnaire: 60 original statements, seven response levels, ten pages of six statements, and the requested sixteen types in four groups. Each of five axes has twelve equal-weight items, with six reverse-keyed items. Exact ties remain balanced instead of fabricating a type.

Six built-in Node test groups passed in `tests/personality-model.test.cjs`: all 32 type/identity combinations, direction and response-strength checks, complete-neutral and partial ties, percentage bounds, missing/invalid/inherited answers, and saved-state recovery. Syntax checks passed for all three modified/new application scripts.

Twelve additional checks executed the actual game and personality scripts against a lightweight DOM simulation. They verified:

- Canva loads in National Day and its iframe source is removed in both other modes.
- All sixteen catalog cards open the corresponding descriptions, with four cards per group.
- Incomplete pages cannot advance; every statement has seven named native radio inputs and no default answer.
- Forward/back navigation, checked answers, progress, mode switching, and reload preserve test progress.
- A completed 60-answer journey displays a type, A/T suffix, and five result bars.
- Reviewing answers updates percentages; restarting requires confirmation and preserves wheel participants.
- Neutral answers display balanced dimensions and all compatible candidates.
- Denied storage keeps the test usable for the session and shows an accurate message.
- Corrupt saved completion flags cannot bypass missing answers on earlier pages.
- Personality mode cannot interrupt an active spin; cancellation preserves entries, and a subsequent wheel selection still works.
- Prior normal-mode saved state remains normal and never loads Canva.

These are calculation, source, and simulated DOM interaction checks, not browser rendering checks. Browser preview was unavailable in this session, so visual layout, native keyboard interaction, and clipboard permission behavior were not tested in a real browser. The responsive CSS includes 1100, 820, 540, and 360 px breakpoints and reduced-motion handling; this pass does not claim viewport screenshots or real-device verification.

## Canva embed — 2026-09-13

The user-provided Canva embed URL was inserted above the competition, with its 16:9 container, lazy loading, an accessible iframe title, fullscreen permission, and a separate viewing link. Introductory copy and the three-step journey were aligned with watching the presentation and starting the competition. A native details control collapses or expands the presentation without altering competition data.

Checked in Chromium 153 at 320×740, 390×844, 768×1024, 1024×768, 1440×1000, and 844×390. Containers and headings had no horizontal overflow, and frame dimensions retained the intended aspect ratio. Desktop and phone screenshots were inspected. Mouse collapse, keyboard expansion, the competition anchor and focus target, mode switching, participant selection, manual question preparation and four-choice grading were exercised successfully. No page JavaScript errors were observed.

The Canva server returned `net::ERR_EMPTY_RESPONSE` from the preview environment. The actual Canva slide content and fullscreen playback could not be verified there. The exact supplied embed address and fullscreen attributes were retained; this limitation did not prevent checking the surrounding layout and game interactions. The separate viewing link remains available below the frame.

## Previous game checks — 2026-09-12

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

