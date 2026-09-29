# Release Review - September 29, 2026

The approved design is preserved, including the real logo, family photo treatment, founder portraits, classroom interactions, and all 11 pages / 14 PDF resources.

## Corrections

- Email forms now use native required-name and email validation, explain that an email draft must be sent by the visitor, preserve entered values, and never claim a message was received.
- Mobile menus expose expanded state, reference their controlled panel, close with Escape, and restore focus to the toggle.
- Every page has an English language declaration, a main landmark, skip navigation, and a JavaScript-disabled contact fallback.
- Navigation uses the compact menu through 1200px, avoiding the crowded tablet header.
- Long email addresses wrap at 320px; mobile inputs use 16px text; fixed actions respect the device safe area.
- Tuition tables fit their containers on narrow screens, with rate units on a second line. A dedicated check catches table clipping even when the page itself does not overflow.
- Small text, accent labels, buttons, and footer links have stronger contrast and clear link affordances.
- React 18.3.1 and React DOM are hosted locally with their license.
- The build creates an isolated Margin preview with noindex metadata, share metadata, a file-hash manifest, and no source archives or credentials.
- Shared CSS and JavaScript URLs include content hashes so the host's long-lived static asset cache cannot retain styling from an earlier release.

## Local Verification

`npm run qa` against the local site passed:

- 11 pages at 320, 390, 768, 1024, and 1440px: 55 render checks.
- 66 internal link targets, including PDF signature checks and page anchors.
- No broken images, missing headings, template errors, or horizontal overflow.
- Zero page exceptions or local HTTP asset failures.
- Menu open/close, Escape, six classroom choices, FAQ expansion, invalid/valid form states, draft feedback, and input preservation.
- Zero automated axe WCAG 2 A/AA and WCAG 2.1 AA violations at 320px. Automated checks do not replace manual assistive-technology testing.
- Desktop/mobile screenshot review, `npm run build`, and `git diff --check`.
- After the tuition-table correction: all 11 pages passed again at 320px and 390px, including the new table-clipping check and automated accessibility audit.

## Known Boundaries

The inquiry forms open the visitor's email app. No backend delivery or inbox receipt is claimed or tested. The original business facts and 2026 PDFs are preserved; this release review is not a new verification of current tuition, staffing, or availability.

The SFTP release script verifies each uploaded file before making the directory public. After publishing, run `QA_URL=https://findyourmargin.com/sunshinesmiles/ npm run qa` and confirm the actual served Sunshine content, noindex metadata, runtime hashes, and downloadable documents.
