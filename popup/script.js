const PLATFORM_STORAGE_KEY = "selectedPlatform";
const AUTO_PLATFORM_VALUE = "universal";

const platformSelect = document.getElementById("platformSelect");
const table = document.getElementById("versionTbl");
const tableHeaderRows = 1;

let selectedPlatform = AUTO_PLATFORM_VALUE;
let extensionMeta = null;
let releaseRows = [];

function detectPlatform() {
    const userAgent = navigator.userAgent || "";
    const userAgentData = navigator.userAgentData;
    const platform = (userAgentData && userAgentData.platform) || navigator.platform || "";
    const arch = (userAgentData && userAgentData.architecture) || "";

    if (/mac/i.test(platform) || /mac os x/i.test(userAgent)) {
        if (/arm|aarch64/i.test(arch) || /arm64|aarch64/i.test(userAgent)) {
            return "darwin-arm64";
        }
        return "darwin-x64";
    }

    if (/win/i.test(platform) || /windows/i.test(userAgent)) {
        if (/arm|aarch64/i.test(arch) || /arm64|aarch64/i.test(userAgent)) {
            return "win32-arm64";
        }
        return "win32-x64";
    }

    if (/linux/i.test(platform) || /linux/i.test(userAgent)) {
        if (/arm|aarch64/i.test(arch) || /arm64|aarch64/i.test(userAgent)) {
            return "linux-arm64";
        }
        return "linux-x64";
    }

    return AUTO_PLATFORM_VALUE;
}

function resolvedPlatform() {
    return selectedPlatform === AUTO_PLATFORM_VALUE ? detectPlatform() : selectedPlatform;
}

function buildDownloadUrl(author, packageName, version) {
    const downloadUrl = new URL(
        `https://marketplace.visualstudio.com/_apis/public/gallery/publishers/${author}/vsextensions/${packageName}/${version}/vspackage`
    );
    const platform = resolvedPlatform();
    if (platform !== AUTO_PLATFORM_VALUE) {
        downloadUrl.searchParams.set("targetPlatform", platform);
    }
    return downloadUrl.toString();
}

function clearVersionRows() {
    while (table.rows.length > tableHeaderRows) {
        table.deleteRow(tableHeaderRows);
    }
}

function renderVersionTable() {
    if (!extensionMeta) {
        return;
    }

    clearVersionRows();
    const uniqueVersions = new Set();
    const { author, packageName } = extensionMeta;

    for (const release of releaseRows) {
        const version = release.version;
        if (uniqueVersions.has(version)) {
            continue;
        }

        uniqueVersions.add(version);

        const row = document.createElement("tr");
        const versionCell = document.createElement("td");
        const link = document.createElement("a");
        link.href = buildDownloadUrl(author, packageName, version);
        link.textContent = version;
        versionCell.append(link);
        row.append(versionCell);

        const dateCell = document.createElement("td");
        const date = new Date(release.lastUpdated);
        dateCell.textContent = date.toISOString().substring(0, 10);
        row.append(dateCell);
        table.append(row);
    }
}

async function loadSavedPlatform() {
    const storage = await browser.storage.local.get(PLATFORM_STORAGE_KEY);
    const storedPlatform = storage[PLATFORM_STORAGE_KEY];
    if (!storedPlatform) {
        return AUTO_PLATFORM_VALUE;
    }
    return storedPlatform;
}

async function setupPlatformPicker() {
    selectedPlatform = await loadSavedPlatform();
    if (![...platformSelect.options].some((option) => option.value === selectedPlatform)) {
        selectedPlatform = AUTO_PLATFORM_VALUE;
    }
    platformSelect.value = selectedPlatform;

    platformSelect.addEventListener("change", async (event) => {
        selectedPlatform = event.target.value;
        await browser.storage.local.set({ [PLATFORM_STORAGE_KEY]: selectedPlatform });
        renderVersionTable();
    });
}

async function loadVersions() {
    const tabs = await browser.tabs.query({ active: true, lastFocusedWindow: true });
    const tab = tabs[0];
    const url = new URL(tab.url);
    const path = url.hostname + url.pathname;

    // Check for valid URL - though it should be filtered by manifest anyway.
    if (path !== "marketplace.visualstudio.com/items") {
        return;
    }

    const params = url.searchParams;
    if (!params.has("itemName")) {
        return;
    }

    const [author, packageName] = params.get("itemName").split(".");
    extensionMeta = { author, packageName };

    const versionRequest = await fetch(
        "https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery?api-version=3.0-preview.1",
        {
            method: "POST",
            body: JSON.stringify({
                filters: [
                    {
                        pageNumber: 1,
                        pageSize: 1,
                        criteria: [
                            {
                                filterType: 7, // Filter by name.
                                value: `${author}.${packageName}`
                            }
                        ]
                    }
                ],
                assetTypes: [],
                flags: 1
            }),
            headers: {
                "Content-Type": "application/json"
            }
        }
    );

    if (!versionRequest.ok) {
        return;
    }

    const requestJson = await versionRequest.json();
    releaseRows = requestJson.results[0].extensions[0].versions || [];
    renderVersionTable();
}

async function init() {
    await setupPlatformPicker();
    await loadVersions();
}

init();