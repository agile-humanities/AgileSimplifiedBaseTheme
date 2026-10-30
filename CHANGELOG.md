# Changelog

All notable changes to the Simplified Agile Base Theme are recorded here. The theme is generated from the Advanced
Agile Base Theme by its `tools/build-simplified.js`; the two carry the same version number. Licence: CeCILL v2.1.

## [2.0.0] — 2026-10-30

First public release, generated from the Advanced Agile Base Theme 2.0.0.

- Plain CSS compiled with CSS variables: colours and fonts from the theme settings, derived colours recomputed in
  PHP (`agile-colour.php`), no build step and no module required.
- Core Omeka pages and blocks in the Advanced theme's layout; the Advanced theme's templates for Agile Theme
  Tools' pages, blocks and cards ride along and are used when that module is active; Advanced Search's templates
  forward to the Agile search page when the module is present and fall back to Advanced Search's own otherwise.
- Item page regions "Above Main" and "Main", with core blocks as the defaults.
- `custom.css` and `custom.js` for the site's own rules (never overwritten by the generator);
  `asset/css/theme-variables.css` lists every variable.
- `theme.jpg` and `screenshots/`.
