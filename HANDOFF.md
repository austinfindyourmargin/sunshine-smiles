# Sunshine Smiles Handoff

## Open The Site

Preview: https://findyourmargin.com/sunshinesmiles/

Source: https://github.com/austinfindyourmargin/sunshine-smiles

The repository is public. Jeremy can view it, download a ZIP, or clone it without an invitation. To let him push changes, the owner should open the repository's Settings > Collaborators > Add people and invite Jeremy's GitHub account. Viewing the preview needs no GitHub account.

## Get Everything On Another Computer

Run this in the folder where you keep projects, on Jeremy's computer or the remote development machine:

```sh
git clone https://github.com/austinfindyourmargin/sunshine-smiles.git
cd sunshine-smiles
npm ci
npm run build
npm run preview
```

Open http://127.0.0.1:4173/ on that machine. A remote server's localhost belongs to that server; use an SSH port forward to view it from your own browser if needed.

The clone includes the current pages, original images, PDF forms, brand notes, archived Claude design, site-tour video, release scripts, and project history. `dist/` and installed dependencies are generated locally. Hosting passwords, local app settings, and this conversation are not included in Git.

## Open A Remote Project In Codex

1. Clone the repository on the remote development computer as above.
2. Make sure you can SSH to that computer and Codex is installed and authenticated there.
3. In the desktop app, open Settings > Connections and add or enable that SSH host.
4. Select the cloned `sunshine-smiles` folder as the remote project.
5. Start a chat there and ask it to read README.md, HANDOFF.md, PRODUCT.md, and DESIGN.md.

To move an existing chat between your own connected machines, first save the matching repository as a project on the destination. Then use the chat's run-location control and choose the destination host and Hand off. Cloning the repository shares project files; it does not share your chat or account access with Jeremy.

Reference: https://learn.chatgpt.com/docs/remote-connections

Jeremy can also clone the project locally and add that folder in his own Codex app. A remote machine is optional for collaborating through GitHub. Use separate branches and pull requests when both people edit the site.

## What To Preserve

- The approved Spectral/Mulish design, real logo, authentic images, and classroom names.
- The full family photograph on mobile and the founder portrait framing.
- The classroom selector, FAQ behavior, reduced-motion support, and interactive waves.
- All rates, fees, handbook, enrollment resources, and legal pages.
- The retired red-wall classroom group image must not be reintroduced.
- The Margin preview's noindex setting. Review domain, canonical URLs, indexing, and form delivery before any future launch on the academy's primary domain.

## Release And Maintenance

Run the QA described in README.md before publishing. The SFTP deployment script uploads only the generated `dist/` to the Sunshine Smiles subfolder. Hosting access must be granted separately; no credentials are committed.

Tour forms currently create email drafts and do not confirm delivery. Treat the academy's linked original PDFs as the source for business policies, and reconfirm time-sensitive rates, staffing, and availability with the academy before changing those facts.
