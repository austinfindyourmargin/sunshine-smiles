# Design System

## Theme

Sunshine Smiles Academy uses the Claude visual direction as the active site design: a warm parchment base, generous photography, hand-finished curves, sunshine yellow, coral action moments, fresh green reassurance, and soft sky-blue learning cues. The mood is "a bright daycare hallway on a sunny morning: clean, personal, safe, and full of little milestones."

## Color

- Background: warm off-white/parchment for a sunny, calm parent-facing tone.
- Ink: deep warm charcoal for readable copy.
- Primary action: coral and deep charcoal for tour and contact CTAs.
- Sunshine: warm yellow for badges, highlights, and joyful accents.
- Sky: soft blue for reassurance, learning, and calm.
- Leaf: fresh green for growth, outdoor play, and developmental progress.
- Soft section surfaces: sunshine, sky, mint, and coral tints used sparingly to keep the site bright without becoming visually noisy.

## Typography

- Display and headings: Spectral, chosen for a warm, human, family-owned voice.
- Body: Mulish, chosen for clean readability and approachable rhythm.
- Scale: large, balanced homepage display type; compact headings in cards and forms; readable body text with generous line height.

## Buttons

- Primary: filled coral pill with white text for Schedule a Tour.
- Secondary: white or pale sky button with ink text for Explore Programs and Contact paths.
- Text links: high-contrast underline or arrow treatment, never vague "click here" copy.
- Touch target: minimum 44px height.

## Cards

Cards use soft radius, structured spacing, and warm shadow treatment inherited from the Claude design. Cards are reserved for repeated program, promise, confidence, and staff items.

## Image Treatment

Use authentic local images first. Crop intentionally with `object-fit: cover`, soft rounded corners, occasional asymmetrical layouts, and clear alt text. Avoid heavy filters. Use overlays only where needed for readable text.

## Navigation

Sticky header with visible phone number and Schedule a Tour button on desktop. Mobile uses a simple menu button with large tap targets, a click-to-call link, and no confusing dropdown overload.

## Responsive Behavior

The site is mobile-first. Layouts collapse to single column under 860px, forms stay full-width, hero text remains readable, footer columns stack, and images preserve stable aspect ratios to avoid layout shift.

## Conversion Strategy

Primary CTA: Schedule a Tour. Secondary CTAs: Explore Programs, Meet Our Staff, Start Enrollment, Call Today. The CTA appears in the hero, sticky navigation, program sections, staff page, enrollment page, and footer.

## Developer Notes

- Staff cards use real names/images where the asset mapping is clear, with conservative classroom labels instead of unverified joined years.
- The static tour forms open the configured email address; replace with a backend form handler before production if submissions should be captured reliably.
- Keep local SEO copy natural: Durham daycare, North Durham childcare, childcare in Durham NC, preschool in Durham NC, infant care in Durham, toddler care in Durham, and pre-kindergarten in Durham.
