# Download .vsix
Simple browser extension adding a page action to download .vsix files from the Visual Studio Marketplace. The `activeTab` permission is required to parse the URL, for generating a correct download link.

Now with support for downloading older versions!

## Platform selector
The popup now has a platform dropdown above the versions list. Download links include `targetPlatform=<selected platform>`, so you can force the correct package (for example `darwin-arm64` vs `darwin-x64`) instead of relying on Marketplace defaults.

Selection behavior:
- Auto-detect default from browser OS/arch.
- Manual override via dropdown.
- Last selected value is persisted in extension local storage.

## Local development and testing (Firefox)
Prerequisites:
- Node.js + npm
- Firefox

Commands:
- `npm run run` - launch Firefox with the extension loaded.
- `npm run lint` - validate manifest and extension structure.
- `npm run build` - create distributable zip in `web-ext-artifacts/`.

## Publish to AMO (listed)
1. Create AMO API credentials:
   - https://addons.mozilla.org/developers/addon/api/key/
2. Put credentials in `.env`:
   - `AMO_API_KEY=your-jwt-issuer`
   - `AMO_API_SECRET=your-jwt-secret`
3. Ensure `amo-metadata.json` contains at least:
   - `version.license` (currently set to `MIT` in this repo)
4. Sign and submit listed:
   - `npm run sign:listed`

Notes for this fork:
- Listed submission should use your own add-on ownership/account in AMO.
- This repo sets `browser_specific_settings.gecko.id` to `download-vsix@danii.local`; change it if you want a different permanent add-on ID.
- `browser_specific_settings.gecko.data_collection_permissions.required` is set to `["none"]` to satisfy current AMO metadata requirements.

If this stops working for any reason, please make an issue! I won't use this too often myself, and others will certainly find errors before I do.
