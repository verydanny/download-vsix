import UserAgent from "lightua"

declare const browser: {
    storage: {
        local: {
            get: (key: string) => Promise<Record<string, string>>
            set: (data: Record<string, string>) => Promise<void>
        }
    }
    tabs: { query: (q: object) => Promise<{ url?: string }[]> }
}

const PLATFORM_STORAGE_KEY = "selectedPlatform"
const AUTO_PLATFORM_VALUE = "universal"
const PAGE_SIZE = 20

type ReleaseRow = {
    version: string
    lastUpdated: string
    targetPlatform?: string
}

const PLATFORM_LABELS: Record<string, string> = {
    "darwin-x64": "macOS (Intel)",
    "darwin-arm64": "macOS (Apple Silicon)",
    "linux-x64": "Linux (x64)",
    "linux-arm64": "Linux (ARM64)",
    "win32-x64": "Windows (x64)",
    "win32-arm64": "Windows (ARM64)",
}

const platformPicker = document.getElementById(
    "platformPicker",
) as HTMLDivElement
const platformSelect = document.getElementById(
    "platformSelect",
) as HTMLSelectElement
const table = document.getElementById("versionTbl") as HTMLTableElement
const tableHeaderRows = 1

let selectedPlatform = AUTO_PLATFORM_VALUE
let extensionMeta: { author: string; packageName: string } | null = null
let releaseRows: ReleaseRow[] = []
let availablePlatforms: string[] = []
let hasPlatformSpecificBuilds = false
let displayedCount = 0

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
}

function detectArch(osPrefix: string): "arm64" | "x64" {
    const uad = (navigator as any).userAgentData
    if (uad?.architecture) {
        return /arm/i.test(uad.architecture) ? "arm64" : "x64"
    }

    const ua = navigator.userAgent
    if (/aarch64|arm64/i.test(ua)) return "arm64"
    if (/WOW64|Win64|x86_64|x86-64|x64/i.test(ua)) return "x64"

    if (osPrefix === "darwin") {
        try {
            const canvas = document.createElement("canvas")
            const gl = canvas.getContext("webgl")
            if (gl) {
                const dbg = gl.getExtension("WEBGL_debug_renderer_info")
                if (dbg) {
                    const renderer = gl.getParameter(
                        dbg.UNMASKED_RENDERER_WEBGL,
                    ) as string
                    if (/Apple M\d|Apple GPU/i.test(renderer)) return "arm64"
                }
            }
        } catch {}
    }

    return "x64"
}

function detectPlatform(): string {
    const ua = UserAgent.parse(navigator.userAgent)
    const prefix = OS_PREFIX_MAP[ua.os.name]
    if (!prefix) return AUTO_PLATFORM_VALUE

    const suffix = detectArch(prefix)
    return `${prefix}-${suffix}`
}

function resolvedPlatform(): string {
    return selectedPlatform === AUTO_PLATFORM_VALUE
        ? detectPlatform()
        : selectedPlatform
}

function buildDownloadUrl(
    author: string,
    packageName: string,
    release: ReleaseRow,
): string {
    const downloadUrl = new URL(
        `https://marketplace.visualstudio.com/_apis/public/gallery/publishers/${author}/vsextensions/${packageName}/${release.version}/vspackage`,
    )

    if (
        hasPlatformSpecificBuilds &&
        release.targetPlatform &&
        availablePlatforms.includes(release.targetPlatform)
    ) {
        const platform = release.targetPlatform
        downloadUrl.searchParams.set("targetPlatform", platform)
    }

    return downloadUrl.toString()
}

function getPlatformValues(versions: ReleaseRow[]): string[] {
    const seen = new Set<string>()
    const values: string[] = []
    for (const version of versions) {
        const platform = version.targetPlatform?.trim()
        if (!platform || seen.has(platform)) continue
        seen.add(platform)
        values.push(platform)
    }
    return values
}

function getVisibleReleaseRows(): ReleaseRow[] {
    if (!hasPlatformSpecificBuilds) return releaseRows
    if (!selectedPlatform || !availablePlatforms.includes(selectedPlatform))
        return []
    return releaseRows.filter(
        (release) => release.targetPlatform === selectedPlatform,
    )
}

function getUniqueVersions(): ReleaseRow[] {
    const seen = new Set<string>()
    const result: ReleaseRow[] = []
    for (const release of getVisibleReleaseRows()) {
        if (!seen.has(release.version)) {
            seen.add(release.version)
            result.push(release)
        }
    }
    return result
}

function removeShowMoreButton() {
    document.getElementById("showMoreBtn")?.remove()
}

function appendVersionRows(versions: ReleaseRow[]) {
    if (!extensionMeta) return
    const { author, packageName } = extensionMeta

    for (const release of versions) {
        const row = document.createElement("tr")

        const versionCell = document.createElement("td")
        const link = document.createElement("a")
        link.href = buildDownloadUrl(author, packageName, release)
        link.textContent = release.version
        versionCell.append(link)
        row.append(versionCell)

        const dateCell = document.createElement("td")
        const date = new Date(release.lastUpdated)
        dateCell.textContent = date.toISOString().substring(0, 10)
        row.append(dateCell)

        table.append(row)
    }
}

function renderVersionTable() {
    if (!extensionMeta) return

    while (table.rows.length > tableHeaderRows) {
        table.deleteRow(tableHeaderRows)
    }
    removeShowMoreButton()

    const unique = getUniqueVersions()
    const page = unique.slice(0, PAGE_SIZE)
    displayedCount = page.length
    appendVersionRows(page)

    if (unique.length > displayedCount) {
        addShowMoreButton(unique)
    }
}

function addShowMoreButton(allVersions: ReleaseRow[]) {
    removeShowMoreButton()

    const btn = document.createElement("button")
    btn.id = "showMoreBtn"
    btn.textContent = `Show more (${allVersions.length - displayedCount} remaining)`
    btn.addEventListener("click", () => {
        const next = allVersions.slice(
            displayedCount,
            displayedCount + PAGE_SIZE,
        )
        displayedCount += next.length
        appendVersionRows(next)

        if (displayedCount >= allVersions.length) {
            removeShowMoreButton()
        } else {
            btn.textContent = `Show more (${allVersions.length - displayedCount} remaining)`
        }
    })

    table.insertAdjacentElement("afterend", btn)
}

async function loadSavedPlatform(): Promise<string> {
    const storage = await browser.storage.local.get(PLATFORM_STORAGE_KEY)
    return storage[PLATFORM_STORAGE_KEY] || ""
}

function formatPlatformLabel(platform: string): string {
    const friendly = PLATFORM_LABELS[platform]
    return friendly ? `${friendly} - ${platform}` : platform
}

function syncPlatformPickerVisibility() {
    platformPicker.hidden = !hasPlatformSpecificBuilds
}

function populatePlatformPickerOptions() {
    platformSelect.replaceChildren()
    for (const platform of availablePlatforms) {
        const option = document.createElement("option")
        option.value = platform
        option.textContent = formatPlatformLabel(platform)
        platformSelect.append(option)
    }
}

async function syncPlatformSelection() {
    if (!hasPlatformSpecificBuilds || availablePlatforms.length === 0) return

    const stored = await loadSavedPlatform()
    const detected = resolvedPlatform()

    if (stored && availablePlatforms.includes(stored)) {
        selectedPlatform = stored
    } else if (availablePlatforms.includes(detected)) {
        selectedPlatform = detected
    } else {
        selectedPlatform = availablePlatforms[0] || AUTO_PLATFORM_VALUE
    }
    platformSelect.value = selectedPlatform
}

async function setupPlatformPicker() {
    hasPlatformSpecificBuilds = releaseRows.some((release) =>
        Boolean(release.targetPlatform),
    )
    availablePlatforms = hasPlatformSpecificBuilds
        ? getPlatformValues(releaseRows)
        : []
    syncPlatformPickerVisibility()

    if (!hasPlatformSpecificBuilds) {
        selectedPlatform = AUTO_PLATFORM_VALUE
        return
    }

    populatePlatformPickerOptions()
    await syncPlatformSelection()
}

function bindPlatformPicker() {
    platformSelect.addEventListener("change", async (event) => {
        const nextPlatform = (event.target as HTMLSelectElement).value
        if (!availablePlatforms.includes(nextPlatform)) return
        selectedPlatform = nextPlatform
        await browser.storage.local.set({
            [PLATFORM_STORAGE_KEY]: selectedPlatform,
        })
        renderVersionTable()
    })
}

async function loadVersions() {
    const tabs = await browser.tabs.query({
        active: true,
        lastFocusedWindow: true,
    })
    const tab = tabs[0]
    if (!tab?.url) return

    const url = new URL(tab.url)
    const path = url.hostname + url.pathname

    if (path !== "marketplace.visualstudio.com/items") return

    const itemName = url.searchParams.get("itemName")
    if (!itemName) return

    const parts = itemName.split(".")
    const author = parts[0]
    const packageName = parts[1]
    if (!author || !packageName) return

    extensionMeta = { author, packageName }

    const response = await fetch(
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
                                filterType: 7,
                                value: `${author}.${packageName}`,
                            },
                        ],
                    },
                ],
                assetTypes: [],
                flags: 0x1,
            }),
            headers: { "Content-Type": "application/json" },
        },
    )

    if (!response.ok) return

    const json = await response.json()
    releaseRows = json.results[0].extensions[0].versions || []
    await setupPlatformPicker()
    renderVersionTable()
}

async function init() {
    bindPlatformPicker()
    await loadVersions()
}

init()
