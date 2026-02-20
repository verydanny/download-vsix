# Download .vsix

Simple browser extension that adds a page action to download `.vsix` files from the Visual Studio Marketplace, including older versions.

The `activeTab` permission is required to parse the URL for generating correct download links.

## Additions over upstream

- **Platform selector** — dropdown above the versions list lets you pick a specific `targetPlatform` (e.g. `darwin-arm64` vs `darwin-x64`) instead of relying on Marketplace defaults. Auto-detects from browser OS/arch, persists your last selection.

## Development

Requires [Bun](https://bun.sh) and Firefox.

```sh
bun run run     # launch Firefox with the extension loaded
bun run lint    # validate manifest and extension structure
bun run build   # create distributable zip in web-ext-artifacts/
```

If this stops working for any reason, please make an issue!
