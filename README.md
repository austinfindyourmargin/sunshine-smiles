# Sunshine Smiles Academy

Website for Sunshine Smiles Academy, a family-owned childcare and early learning center in North Durham, NC.

The approved Claude design is in the root HTML files, with Sunshine Smiles photography in `images/`. This is a static site with a small template runtime, not a Vite or Next.js application.

- Cloudways preview: https://phpstack-1564285-6705359.cloudwaysapps.com/
- Legacy preview: https://findyourmargin.com/sunshinesmiles/
- Repository: https://github.com/austinfindyourmargin/sunshine-smiles
- Handoff and remote setup: [HANDOFF.md](HANDOFF.md)
- Brand and product context: [DESIGN.md](DESIGN.md), [PRODUCT.md](PRODUCT.md)

## Pages

- `index.html` - Homepage
- `staff.html` - Staff page
- `programs.html` - Programs page
- `enrollment.html` - Enrollment page
- `contact.html` - Contact and tour request page
- `rates-fees.html` - Tuition, fees, and payment policies
- `forms.html` - Forms, handbook, and holiday downloads
- `curriculum.html` - Learning and classroom routines
- `testimonials.html` - Parent stories
- `privacy-policy.html`, `terms-conditions.html` - Original business policies
- `documents/` - Original PDF resources; releases include only the four approved family documents
- `site.css`, `site.js` - Shared accessibility, navigation, and embedded form styling
- `support.js` - Runtime used by the Claude design templates
- `vendor/` - Pinned React 18.3.1 libraries and license
- `claudedesign/`, `claudedesign.zip` - Archived original designs, not deployment source
- `sunshine-smiles-site-tour.mp4` - 27-second captioned site showcase

## Preview

From the repository root, run:

```sh
python3 -m http.server 4173
```

Then visit `http://127.0.0.1:4173/index.html`. Playground permits iframe embedding only from HTTPS pages, so the embedded form is blocked in a plain HTTP local preview. Verify the embedded form on an HTTPS preview before publishing.

Node.js 20+ and Python 3 are needed for build/QA/deployment tooling, not by the public site. Install tooling with `npm ci`. Run `npm run build` to create the release in `dist/`, then `npm run preview` to serve that release. Stop any other server on port 4173 first.

## Verification

Install Chromium once with `npx playwright install chromium`, then run `npm run qa` while the local server is running. Alternatively, set `CHROME_PATH` to an installed Chrome executable. `QA_URL` can point at the deployed URL. `QA_WIDTHS` overrides the default 320, 390, 768, 1024, and 1440 widths. Screenshots and the detailed JSON report default to `/tmp/sunshine-qa`.

The check covers all 11 pages, images, internal links, PDF signatures, mobile menus, classroom selection, FAQs, form validation, and automated WCAG A/AA checks. It checks the Playground embed, tour destinations, staff roster, and four approved downloads. It does not submit real inquiries.

## Publish To Cloudways

Build with `SS_SITE_URL=https://phpstack-1564285-6705359.cloudwaysapps.com/ npm run build` so canonical and share URLs match the preview. Set `SS_SFTP_PASSWORD` securely outside Git and run `python scripts/deploy-cloudways.py` using the deployment Python environment. The script is restricted to the Sunshine Smiles application and requires its matching release URL. It verifies every staged file, promotes assets before pages, and keeps the previous release in `private_html` with rollback if promotion fails. The server host key must already be trusted in your SSH known-hosts file.

## Publish To Margin

`npm run build` produces only public pages, media, documents, and runtime assets. It adds content-hashed query versions to shared CSS and JavaScript URLs so the hosting cache cannot serve an earlier release, plus preview-specific canonical/share URLs and `noindex` metadata. The Margin preview is public by link but is not intended to compete with the academy's primary domain in search.

Install the SFTP dependency in an isolated Python environment using `scripts/requirements-deploy.txt`. Set `SS_SFTP_HOST`, `SS_SFTP_USER`, and `SS_SFTP_PASSWORD` securely outside Git, then run `python scripts/deploy.py` from that environment. The server host key must already be trusted in your SSH known-hosts file. SSH key authentication is also supported.

The deployment script is restricted to `public_html/sunshinesmiles`. It uploads outside the public web root, verifies every file's SHA-256 hash, sets public read permissions, and promotes the finished folder. An existing recognized Sunshine Smiles release is retained as a private backup. Never run another project's root deployment script for this site.

## Inquiry Forms

The contact, homepage, and enrollment pages embed the academy's [Playground inquiry form](https://app.tryplayground.com/form/LQAItkOwPffVVntPiWNd/Y2r5YYAuvUPxoPi2drqF). All tour links lead directly to `contact.html#tour`. Application paperwork is completed in Playground; the website publishes only the 2026 parent handbook, NC laws summary, 2026 holiday closings, and rates/fees.

The unused `contact.php` handler is retained from the previous inquiry flow. The PHP handler validates fields, rejects header injection, applies a honeypot and hourly request limits, and uses Cloudways' server-level PHP mail transport. Bind that transport to Elastic Email and verify a sender domain before activation. The parent's email is the Reply-To address; notifications go to the configured recipient, initially `erika.byrd3@gmail.com`.

Copy `scripts/sunshine-mail.example.php` to the Cloudways application's `private_html/sunshine-mail.php`. Set `from_email` to an address on a domain verified with Elastic Email. Leave `enabled` false until the server SMTP configuration has been tested and a test email is received. Then set it true and test an actual form submission. The configuration belongs outside `public_html`; it is excluded from public release packages. Missing or disabled configuration returns an honest error instead of showing success. PHP acceptance queues email for delivery; it does not prove inbox receipt.

Sender verification can happen at the existing DNS provider before a hosting migration. A verified agency domain can also be used temporarily, then changed in the private configuration after the academy's domain becomes available. This handler targets the Cloudways application's root `public_html`; the legacy Margin preview deployment script remains specific to its original preview subfolder.

The website stores only rate-limit counters in `private_html/sunshine-form-limits`, not copies of inquiry content. Providers and recipient mailboxes process the emails. The automated browser QA checks that each inquiry section embeds the same Playground form and that the previous website forms are absent. It does not submit inquiries to Playground.

## Staff roster

The staff page reflects the October 13, 2026 roster corrections: Tara Mangum is a Waddler Teacher; Ana Andrade, Abigail Rodriguez, and Susan Mahoney are Floaters; and Carleigh Franks is Assistant Director. Tara, Ana, and Susan use their original staff-page portraits. Abigail uses an initials card until a photo is available. Each tour form panel contains only the Playground inquiry embed. The public contact email is `sunshinesmilesacademy2611@gmail.com`.
