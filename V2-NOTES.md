# Ribocentre V2 visual update

The first V2 revision applies FoldBridge's header layout, pill navigation, rounded panels, gradient surfaces, typography and spacing. Ribocentre retains its original blue (`#0874c4`).

Scientific text, figures, sequences, structures, reference records, downloads and existing links are preserved. The header includes all original navigation and search controls. Mobile navigation has keyboard focus styles and expanded-state labels.

## Implementation

- `_layouts/default.html`: shared header/content wrappers.
- `_includes/head.html`: load local base styles and V2 styles.
- `css/foldbridge-v2.css`: shared visual system.
- `css/foldbridge-blue.css`: original blue identity.
- `js/foldbridge-v2.js`: active-page indication and responsive header menus.

## Local preview

Use the existing Gemfile with Ruby 3.2:

```sh
bundle install
bundle exec jekyll serve --host 127.0.0.1
```

This revision was also built with Ruby 3.2.2 and Jekyll 4.2.2 using `JEKYLL_NO_BUNDLER_REQUIRE=true jekyll build`.

V2 is a separate repository. Publishing it does not update the original production site automatically. The original CNAME and absolute production links are retained; review deployment configuration before enabling hosting under a new address.

## Existing dependencies

Google custom search and some scripts/embeds require third-party services. The original source has duplicate output paths for two legacy table posts and application pages, and Liquid warnings for RNA dot-bracket strings. These are unchanged by this visual revision.

GitHub Pages preview: https://linyan-hu.github.io/RibocentreV2/ . This is a separate V2 repository; publishing it does not update the original production site.
