# Shared Astro shells

The reference websites use the exported CSS and trusted header/footer HTML from each Astro design-language site. `docs-app/src/shell/<family>/manifest.json` records the CSS digest. `scripts/sync-astro-shell.mjs` verifies it before replacing a vendored export. Never hand-edit those copies; update the Astro owner and re-export.

`AstroShell.tsx` supplies React state handling for appearance, responsive menus, and dropdowns. The masthead uses each family's shared markup contract. Local links, branding and imported image assets are host content. `react-content.css` owns only React documentation content integration. Reconstructed header/footer styling has been removed. Component packages still own application controls; the source website shell is not imposed on every consumer application.

The checkbox/radio package rules explicitly own their foreground so source page label colors cannot leak into them. Package release versioning remains independent of website deployment.

The source websites were not edited. This is a reference-site adoption, not a migration of jameshoward.us or krigsvold.org.
