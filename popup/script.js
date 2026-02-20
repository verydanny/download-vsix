(() => {
  // node_modules/lightua/dist/index.js
  var f = (e) => {
    let i = e.length ? Number.parseInt(e, 10) : NaN;
    return Number.isNaN(i) ? 0 : i;
  };
  var c = (e) => e ? e.replace(/_/g, ".") : "";
  var a = (e, i) => e.indexOf(i) !== -1;
  var u = (e) => {
    switch (e) {
      case "10.0":
        return "10";
      case "6.3":
        return "8.1";
      case "6.2":
        return "8";
      case "6.1":
        return "7";
      case "6.0":
        return "Vista";
      case "5.1":
        return "XP";
      default:
        return e;
    }
  };
  var t = { chrome: /\bChrome\/(\d[\d.]+)/, edgeChromium: /\bEdg\/(\d[\d.]+)/, firefox: /\bFirefox\/(\d[\d.]+)/, safari: /\bVersion\/(\d[\d.]+)\s+Safari\//, iosSafari: /\bCPU.*OS\s(\d[_\d]*)\s.*AppleWebKit\/.*Safari\//, opera: /\bOPR\/(\d[\d.]+)/, samsung: /\bSamsungBrowser\/(\d[\d.]+)/, androidBrowser: /\bVersion\/(\d[\d.]+)\s+Chrome\/\d.*\bwv\b|\bVersion\/(\d[\d.]+)\s+Mobile Safari\/\d/, iosWebView: /\bAppleWebKit\/(\d[\d.]+)\b(?!.*Safari\/)/, chromium: /\bChromium\/(\d[\d.]+)/, appleWebKit: /\bAppleWebKit\/(\d[\d.]+)/, gecko: /\bGecko\/\d{8,}\b.*\bFirefox\/(\d[\d.]+)/, blinkHint: /\bChrome\/|Chromium\/|Edg\/|OPR\/|SamsungBrowser\//, windows: /\bWindows NT (\d[\d.]*)/, macos: /\bMac OS X (\d[_\d]*)/, ios: /\b(?:iPhone|iPad|iPod).*OS (\d[_\d]*)/, android: /\bAndroid (\d[\d.]*)/, chromeOS: /\bCrOS [a-zA-Z0-9_]+ (\d[\d.]*)/, ipad: /\biPad\b/, iphone: /\biPhone\b/, androidTablet: /\bAndroid\b(?!.*Mobile)/, androidMobile: /\bAndroid.*\bMobile\b/, samsungBrand: /\bSM-([A-Z0-9-]+)/, huaweiBrand: /\b(HUAWEI|HONOR)[ -]?([A-Z0-9-]+)/, xiaomiBrand: /\b(MI |Redmi |POCO )([A-Z0-9-]+)/, botHint: /\b(bot|spider|crawler|fetch|slurp|scrape|httpclient|monitoring)\b/i, botVendors: /\b(googlebot|bingbot|duckduckbot|baiduspider|yandexbot|applebot|facebookexternalhit|twitterbot|linkedinbot|discordbot|slackbot|ahrefsbot|semrushbot|mj12bot|datadog|newrelic|uptime|gtmetrix)\b/i };
  function p(e, i) {
    let r;
    if (r = t.edgeChromium.exec(e))
      return s("Edge", r?.[1] ?? "", d(e));
    if (r = t.opera.exec(e))
      return s("Opera", r?.[1] ?? "", d(e));
    if (r = t.samsung.exec(e))
      return s("Samsung Internet", r?.[1] ?? "", d(e));
    if (r = t.firefox.exec(e))
      return s("Firefox", r?.[1] ?? "", d(e));
    if (i === "iOS") {
      if (t.iosWebView.test(e) && !a(e, "Safari/")) {
        let b = t.appleWebKit.exec(e)?.[1] ?? "";
        return s("iOS WebView", b, { engine: "WebKit", engineVersion: b });
      }
      let n = t.safari.exec(e) || t.iosSafari.exec(e);
      if (n)
        return s("Safari", n[1] ? c(n[1]) : "", d(e));
    }
    if (r = t.chrome.exec(e)) {
      if (i === "Android" && /; wv\)/.test(e)) {
        let n = t.androidBrowser.exec(e);
        return s("Android Browser", n?.[1] ?? n?.[2] ?? "", d(e));
      }
      return s("Chrome", r?.[1] ?? "", d(e));
    }
    return (r = t.chromium.exec(e)) ? s("Chromium", r?.[1] ?? "", d(e)) : (r = t.safari.exec(e)) ? s("Safari", r?.[1] ?? "", d(e)) : s("Unknown", "", d(e));
  }
  function d(e) {
    let i;
    if (i = t.gecko.exec(e))
      return { engine: "Gecko", engineVersion: i?.[1] ?? "" };
    if (i = t.appleWebKit.exec(e)) {
      let r = i?.[1] ?? "";
      return t.blinkHint.test(e) ? { engine: "Blink", engineVersion: r } : { engine: "WebKit", engineVersion: r };
    }
    return a(e, "Edge/") || a(e, "Trident/") || a(e, "MSIE ") ? { engine: "EdgeHTML", engineVersion: "" } : { engine: "Unknown", engineVersion: "" };
  }
  function g(e) {
    let i, r = /\b(?:x86_64|x64|Win64|WOW64|amd64|arm64|aarch64)\b/i.test(e);
    if (i = t.windows.exec(e))
      return { name: "Windows", version: u(c(i[1])), is64Bit: r };
    if (i = t.ios.exec(e))
      return { name: "iOS", version: c(i[1]), is64Bit: r };
    if (i = t.macos.exec(e))
      return { name: "macOS", version: c(i[1]), is64Bit: r };
    if (i = t.android.exec(e))
      return { name: "Android", version: c(i[1]), is64Bit: r };
    if (i = t.chromeOS.exec(e))
      return { name: "ChromeOS", version: c(i[1]), is64Bit: r };
    let n = e.toLowerCase(), o = n.includes("ubuntu") && "Ubuntu" || (n.includes("pop!_os") || n.includes("popos") ? "Pop!_OS" : null) || n.includes("linux mint") && "Linux Mint" || n.includes("fedora") && "Fedora" || n.includes("debian") && "Debian" || n.includes("arch") && "Arch" || n.includes("manjaro") && "Manjaro" || (n.includes("opensuse") || n.includes("open suse")) && "openSUSE" || n.includes("suse") && "SUSE" || n.includes("centos") && "CentOS" || (n.includes("red hat") || n.includes("redhat") || n.includes("rhel") ? "Red Hat" : null) || n.includes("elementary") && "elementary OS" || n.includes("kali") && "Kali Linux" || n.includes("zorin") && "Zorin OS" || n.includes("deepin") && "Deepin" || n.includes("gentoo") && "Gentoo" || n.includes("endeavouros") && "EndeavourOS" || null;
    return n.includes("linux") || o ? { name: o ?? "Linux", version: "", is64Bit: r } : { name: "Unknown", version: "", is64Bit: r };
  }
  function h(e, i) {
    return t.botHint.test(e) || t.botVendors.test(e) || a(e, "HeadlessChrome") ? { type: "bot" } : t.ipad.test(e) ? { type: "tablet", brand: "Apple", model: "iPad" } : t.iphone.test(e) ? { type: "mobile", brand: "Apple", model: "iPhone" } : i === "Android" ? t.androidTablet.test(e) ? m({ type: "tablet" }, e) : t.androidMobile.test(e) ? m({ type: "mobile" }, e) : m({ type: "mobile" }, e) : i === "ChromeOS" ? { type: "desktop", brand: "Google", model: "Chromebook" } : { type: "desktop" };
  }
  function x(e) {
    return t.botHint.test(e) || t.botVendors.test(e) || a(e, "HeadlessChrome") || a(e, "Google-HTTP-Java-Client");
  }
  function m(e, i) {
    let r;
    if (r = t.samsungBrand.exec(i)) {
      let n = r?.[1];
      return n ? { ...e, brand: "Samsung", model: n } : { ...e, brand: "Samsung" };
    }
    if (r = t.huaweiBrand.exec(i)) {
      let n = r?.[1] === "HUAWEI" ? "Huawei" : "Honor", o = r?.[2];
      return o ? { ...e, brand: n, model: o } : { ...e, brand: n };
    }
    if (r = t.xiaomiBrand.exec(i)) {
      let n = r?.[1], o = n ? n.trim().replace(/\s+/, "") : undefined, b = r?.[2];
      return o && b ? { ...e, brand: o, model: b } : o ? { ...e, brand: o } : e;
    }
    return e;
  }
  function s(e, i, r) {
    let n = c(i), o = n ? f(n.split(".")[0]) : 0;
    return { name: e, version: n, major: o, engine: r.engine, engineVersion: r.engineVersion };
  }
  var l = class e {
    constructor(i) {
      this.source = i;
    }
    get os() {
      return this._os || (this._os = g(this.source)), this._os;
    }
    get isBot() {
      return this._isBot === undefined && (this._isBot = x(this.source)), this._isBot;
    }
    get device() {
      return this._device ? this._device : this.isBot ? this._device = { type: "bot" } : this._device = h(this.source, this.os.name);
    }
    get browser() {
      return this._browser || (this._browser = p(this.source, this.os.name)), this._browser;
    }
    get isMobile() {
      return this.device.type === "mobile";
    }
    get isTablet() {
      return this.device.type === "tablet";
    }
    get isDesktop() {
      return this.device.type === "desktop";
    }
    static parse(i = "") {
      return new e(i);
    }
  };

  // src/popup/script.ts
  var PLATFORM_STORAGE_KEY = "selectedPlatform";
  var AUTO_PLATFORM_VALUE = "universal";
  var PAGE_SIZE = 20;
  var platformSelect = document.getElementById("platformSelect");
  var table = document.getElementById("versionTbl");
  var tableHeaderRows = 1;
  var selectedPlatform = AUTO_PLATFORM_VALUE;
  var extensionMeta = null;
  var releaseRows = [];
  var displayedCount = 0;
  var OS_PREFIX_MAP = {
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
    ChromeOS: "linux"
  };
  function detectArch(osPrefix) {
    const uad = navigator.userAgentData;
    if (uad?.architecture) {
      return /arm/i.test(uad.architecture) ? "arm64" : "x64";
    }
    const ua = navigator.userAgent;
    if (/aarch64|arm64/i.test(ua))
      return "arm64";
    if (/WOW64|Win64|x86_64|x86-64|x64/i.test(ua))
      return "x64";
    if (osPrefix === "darwin") {
      try {
        const canvas = document.createElement("canvas");
        const gl = canvas.getContext("webgl");
        if (gl) {
          const dbg = gl.getExtension("WEBGL_debug_renderer_info");
          if (dbg) {
            const renderer = gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL);
            if (/Apple M\d|Apple GPU/i.test(renderer))
              return "arm64";
          }
        }
      } catch {}
    }
    return "x64";
  }
  function detectPlatform() {
    const ua = l.parse(navigator.userAgent);
    const prefix = OS_PREFIX_MAP[ua.os.name];
    if (!prefix)
      return AUTO_PLATFORM_VALUE;
    const suffix = detectArch(prefix);
    return `${prefix}-${suffix}`;
  }
  function resolvedPlatform() {
    return selectedPlatform === AUTO_PLATFORM_VALUE ? detectPlatform() : selectedPlatform;
  }
  function buildDownloadUrl(author, packageName, version) {
    const downloadUrl = new URL(`https://marketplace.visualstudio.com/_apis/public/gallery/publishers/${author}/vsextensions/${packageName}/${version}/vspackage`);
    const platform = resolvedPlatform();
    if (platform !== AUTO_PLATFORM_VALUE) {
      downloadUrl.searchParams.set("targetPlatform", platform);
    }
    return downloadUrl.toString();
  }
  function getUniqueVersions() {
    const seen = new Set;
    const result = [];
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
  function appendVersionRows(versions) {
    if (!extensionMeta)
      return;
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
    if (!extensionMeta)
      return;
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
  function addShowMoreButton(allVersions) {
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
  async function loadSavedPlatform() {
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
      selectedPlatform = event.target.value;
      await browser.storage.local.set({ [PLATFORM_STORAGE_KEY]: selectedPlatform });
      renderVersionTable();
    });
  }
  async function loadVersions() {
    const tabs = await browser.tabs.query({ active: true, lastFocusedWindow: true });
    const tab = tabs[0];
    if (!tab?.url)
      return;
    const url = new URL(tab.url);
    const path = url.hostname + url.pathname;
    if (path !== "marketplace.visualstudio.com/items")
      return;
    const itemName = url.searchParams.get("itemName");
    if (!itemName)
      return;
    const parts = itemName.split(".");
    const author = parts[0];
    const packageName = parts[1];
    if (!author || !packageName)
      return;
    extensionMeta = { author, packageName };
    const response = await fetch("https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery?api-version=3.0-preview.1", {
      method: "POST",
      body: JSON.stringify({
        filters: [
          {
            pageNumber: 1,
            pageSize: 1,
            criteria: [{ filterType: 7, value: `${author}.${packageName}` }]
          }
        ],
        assetTypes: [],
        flags: 1
      }),
      headers: { "Content-Type": "application/json" }
    });
    if (!response.ok)
      return;
    const json = await response.json();
    releaseRows = json.results[0].extensions[0].versions || [];
    renderVersionTable();
  }
  async function init() {
    await setupPlatformPicker();
    await loadVersions();
  }
  init();
})();
