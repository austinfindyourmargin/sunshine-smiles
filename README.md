# Sunshine Smiles Academy

Website for Sunshine Smiles Academy, a family-owned childcare and early learning center in North Durham, NC.

The approved Claude design is in the root HTML files, with Sunshine Smiles photography in `images/`. This is a static site with a small template runtime, not a Vite or Next.js application.

- Preview: https://findyourmargin.com/sunshinesmiles/
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
- `documents/` - 14 original PDF resources
- `site.css`, `site.js` - Shared accessibility, navigation, and email form behavior
- `support.js` - Runtime used by the Claude design templates
- `vendor/` - Pinned React 18.3.1 libraries and license
- `claudedesign/`, `claudedesign.zip` - Archived original designs, not deployment source
- `sunshine-smiles-site-tour.mp4` - 27-second captioned site showcase

## Preview

From the repository root, run:

```sh
python3 -m http.server 4173
```

Then visit `http://127.0.0.1:4173/index.html`.

Node.js 20+ and Python 3 are needed for build/QA/deployment tooling, not by the public site. Install tooling with `npm ci`. Run `npm run build` to create the release in `dist/`, then `npm run preview` to serve that release. Stop any other server on port 4173 first.

## Verification

Install Chromium once with `npx playwright install chromium`, then run `npm run qa` while the local server is running. Alternatively, set `CHROME_PATH` to an installed Chrome executable. `QA_URL` can point at the deployed URL. `QA_WIDTHS` overrides the default 320, 390, 768, 1024, and 1440 widths. Screenshots and the detailed JSON report default to `/tmp/sunshine-qa`.

The check covers all 11 pages, images, internal links, PDF signatures, mobile menus, classroom selection, FAQs, form validation, and automated WCAG A/AA checks. It does not send email or real tour requests.

## Publish To Margin

`npm run build` produces only public pages, media, documents, and runtime assets. It adds content-hashed query versions to shared CSS and JavaScript URLs so the hosting cache cannot serve an earlier release, plus preview-specific canonical/share URLs and `noindex` metadata. The Margin preview is public by link but is not intended to compete with the academy's primary domain in search.

Install the SFTP dependency in an isolated Python environment using `scripts/requirements-deploy.txt`. Set `SS_SFTP_HOST`, `SS_SFTP_USER`, and `SS_SFTP_PASSWORD` securely outside Git, then run `python scripts/deploy.py` from that environment. The server host key must already be trusted in your SSH known-hosts file. SSH key authentication is also supported.

The deployment script is restricted to `public_html/sunshinesmiles`. It uploads outside the public web root, verifies every file's SHA-256 hash, sets public read permissions, and promotes the finished folder. An existing recognized Sunshine Smiles release is retained as a private backup. Never run another project's root deployment script for this site.

## Inquiry Forms

Forms validate the parent's name and email, then prepare a draft addressed to the existing tour contact, `erika.byrd3@gmail.com`. The visitor must send it in their email app. No message is sent or stored by the website, and the interface says so. Reliable direct website submissions require a separately configured and verified backend or form provider. The business policies and enrollment questions also list the general academy email; that original content is preserved.
