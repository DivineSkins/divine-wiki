# Vendored packages

`divineskins-ui-*.tgz` is `@divineskins/ui`, the Divine Skins design system. Its
source lives in the private [divine-skins](https://github.com/DivineSkins/divine-skins)
repo (`packages/ui`) and it publishes to GitHub Packages, which needs a token even
to read. This repo is public and takes contributions from forks, so the build is
committed here instead: `npm install` works for everyone, with no token.

The suffix is the `divine-skins` commit it was built from.

## Updating it

You need access to `divine-skins`. From a clean checkout of the commit you want:

```bash
cd packages/ui
npm ci
npm pack   # builds dist/ first, writes divineskins-ui-<version>.tgz
```

Then, in this repo:

```bash
rm vendor/divineskins-ui-*.tgz
cp <path>/divineskins-ui-<version>.tgz vendor/divineskins-ui-<version>-<short-sha>.tgz
npm install ./vendor/divineskins-ui-<version>-<short-sha>.tgz
```

Check the package's changes against the mode adapters in `src/app/global.css`
(search for `@divineskins/ui`). The package is dark-only, so a new token needs
values for `.light`, `.minimal.dark` and `.minimal.light`, and a new white-tint
class may need an adapter.

Everything in the `.tgz` is public once committed, so look at it first
(`tar -tzf`).
