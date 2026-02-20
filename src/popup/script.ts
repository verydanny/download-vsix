import UserAgent from "lightua";

declare const browser: {
    storage: { local: { get: (key: string) => Promise<Record<string, string>>; set: (data: Record<string, string>) => Promise<void> } };
    tabs: { query: (q: object) => Promise<{ url?: string }[]> };
};

const PLATFORM_STORAGE_KEY = "selectedPlatform";
const AUTO_PLATFORM_VALUE = "universal";
const PAGE_SIZE = 20;

const platformSelect = document.getElementById("platformSelect") as HTMLSelectElement;
const table = document.getElementById("versionTbl") as HTMLTableElement;
const tableHeaderRows = 1;

let selectedPlatform = AUTO_PLATFORM_VALUE;
let extensionMeta: { author: string; packageName: string } | null = null;
let releaseRows: { version: string; lastUpdated: string }[] = [];
let displayedCount = 0;

const OS_PREFIX_MAP: Record<string, string> = {
    macOS: "darwin",
    iOS: "darwin",
    Windows: "win32",
    Linux: "linux",
    Ubuntu: "linux",
    Debian: "linux",
    Fedora: "linux",
    Arch: "linux",
    Manjaro: "linux",
    openSUSE: "linux",
    SUSE: "linux",
    CentOS: "linux",
    "Red Hat": "linux",
    "Linux Mint": "linux",
    "elementary OS": "linux",
    "Pop!_OS": "linux",
    "Kali Linux": "linux",
    "Zorin OS": "linux",
    Deepin: "linux",
    Gentoo: "linux",
    EndeavourOS: "linux",
    ChromeOS: "linux",
};

function detectPlatform(): string {
    const ua = UserAgent.parse(navigator.userAgent);
    const prefix = OS_PREFIX_MAP[ua.os.name];
    if (!prefix) return AUTO_PLATFORM_VALUE;

    const uad = (navigator as any).userAgentData;
    const arch = uad?.architecture || "";
    const suffix = /arm/i.test(arch) ? "arm64" : "x64";

    return `${prefix}-${suffix}`;
}

function resolvedPlatform(): string {
    return selectedPlatform === AUTO_PLATFORM_VALUE ? detectPlatform() : selectedPlatform;
}

function buildDownloadUrl(author: string, packageName: string, version: string): string {
    const downloadUrl = new URL(
        `https://marketplace.visualstudio.com/_apis/public/gallery/publishers/${author}/vsextensions/${packageName}/${version}/vspackage`
    );
    const platform = resolvedPlatform();
    if (platform !== AUTO_PLATFORM_VALUE) {
        downloadUrl.searchParams.set("targetPlatform", platform);
    }
    return downloadUrl.toString();
}

function getUniqueVersions(): { version: string; lastUpdated: string }[] {
    const seen = new Set<string>();
    const result: { version: string; lastUpdated: string }[] = [];
    for (const release of releaseRows) {
        if (!seen.has(release.version)) {
            seen.add(release.version);
            result.push(release);
        }
    }
    return result;
}

function removeShowMoreButton() {
    document.getElementById("showMoreBtn")?.remove();
}

function appendVersionRows(versions: { version: string; lastUpdated: string }[]) {
    if (!extensionMeta) return;
    const { author, packageName } = extensionMeta;

    for (const release of versions) {
        const row = document.createElement("tr");

        const versionCell = document.createElement("td");
        const link = document.createElement("a");
        link.href = buildDownloadUrl(author, packageName, release.version);
        link.textContent = release.version;
        versionCell.append(link);
        row.append(versionCell);

        const dateCell = document.createElement("td");
        const date = new Date(release.lastUpdated);
        dateCell.textContent = date.toISOString().substring(0, 10);
        row.append(dateCell);

        table.append(row);
    }
}

function renderVersionTable() {
    if (!extensionMeta) return;

    while (table.rows.length > tableHeaderRows) {
        table.deleteRow(tableHeaderRows);
    }
    removeShowMoreButton();

    const unique = getUniqueVersions();
    const page = unique.slice(0, PAGE_SIZE);
    displayedCount = page.length;
    appendVersionRows(page);

    if (unique.length > displayedCount) {
        addShowMoreButton(unique);
    }
}

function addShowMoreButton(allVersions: { version: string; lastUpdated: string }[]) {
    removeShowMoreButton();

    const btn = document.createElement("button");
    btn.id = "showMoreBtn";
    btn.textContent = `Show more (${allVersions.length - displayedCount} remaining)`;
    btn.addEventListener("click", () => {
        const next = allVersions.slice(displayedCount, displayedCount + PAGE_SIZE);
        displayedCount += next.length;
        appendVersionRows(next);

        if (displayedCount >= allVersions.length) {
            removeShowMoreButton();
        } else {
            btn.textContent = `Show more (${allVersions.length - displayedCount} remaining)`;
        }
    });

    table.insertAdjacentElement("afterend", btn);
}

async function loadSavedPlatform(): Promise<string> {
    const storage = await browser.storage.local.get(PLATFORM_STORAGE_KEY);
    return storage[PLATFORM_STORAGE_KEY] || "";
}

async function setupPlatformPicker() {
    const stored = await loadSavedPlatform();

    if (stored && [...platformSelect.options].some((o) => o.value === stored)) {
        selectedPlatform = stored;
    } else {
        selectedPlatform = detectPlatform();
    }

    platformSelect.value = selectedPlatform;

    platformSelect.addEventListener("change", async (event) => {
        selectedPlatform = (event.target as HTMLSelectElement).value;
        await browser.storage.local.set({ [PLATFORM_STORAGE_KEY]: selectedPlatform });
        renderVersionTable();
    });
}

async function loadVersions() {
    const tabs = await browser.tabs.query({ active: true, lastFocusedWindow: true });
    const tab = tabs[0];
    if (!tab?.url) return;

    const url = new URL(tab.url);
    const path = url.hostname + url.pathname;

    if (path !== "marketplace.visualstudio.com/items") return;

    const itemName = url.searchParams.get("itemName");
    if (!itemName) return;

    const parts = itemName.split(".");
    const author = parts[0];
    const packageName = parts[1];
    if (!author || !packageName) return;

    extensionMeta = { author, packageName };

    const response = await fetch(
        "https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery?api-version=3.0-preview.1",
        {
            method: "POST",
            body: JSON.stringify({
                filters: [
                    {
                        pageNumber: 1,
                        pageSize: 1,
                        criteria: [{ filterType: 7, value: `${author}.${packageName}` }],
                    },
                ],
                assetTypes: [],
                flags: 0x1,
            }),
            headers: { "Content-Type": "application/json" },
        }
    );

    if (!response.ok) return;

    const json = await response.json();
    releaseRows = json.results[0].extensions[0].versions || [];
    renderVersionTable();
}

async function init() {
    await setupPlatformPicker();
    await loadVersions();
}

init();
