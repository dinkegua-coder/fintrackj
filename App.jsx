import { useState, useEffect, useRef, useMemo, createContext, useContext } from "react";
import {
  Plus, X, Settings2, ChevronRight, ChevronLeft, Trash2, Wallet, PieChart as PieIcon,
  LineChart as LineIcon, RefreshCw, TrendingUp, TrendingDown, MoreHorizontal,
  History as HistoryIcon, Search as SearchIcon, DollarSign, Share2, Download,
  Repeat, Check, Pause, Play, Smartphone, CreditCard, PiggyBank, BarChart3,
  Bitcoin, Gem, Sprout, Building2, Car, Lock, Users, Landmark, ReceiptText,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, Cell, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";

// ---- design tokens -----------------------------------------------------
const COLORS = {
  bg: "#EEF1F4",
  surface: "#FFFFFF",
  ink: "#12213D",
  inkSoft: "#5B6B82",
  rule: "#D9DEE5",
  sage: "#4C7A62",
  slate: "#3E5C8A",
  amber: "#C98A3B",
  stone: "#8B8478",
  clay: "#B0574F",
};

// ---- i18n ----------------------------------------------------------------
// Every value here is either a plain string or a function(...args) => string
// for lines that need to interpolate a number/amount. t(key, ...args) below
// calls it if it's a function, else returns the string as-is — so callers
// never need to know which.
const STRINGS = {
  en: {
    appTagline: "Net Worth Tracker",
    tabAssets: "Assets", tabMix: "Mix", tabPnl: "P & L", tabTrend: "Trend",
    netWorth: "Net Worth",
    catName_cash: "Cash Equivalents", catName_invest: "Investment", catName_property: "Property",
    catName_receivable: "MPF", catName_liability: "Liability",
    subtype_cash_cash: "Cash", subtype_cash_digitalWallet: "Digital Wallet", subtype_cash_debitCard: "Debit Card", subtype_cash_dividends: "Dividends", subtype_cash_otherCash: "Others",
    subtype_invest_stock: "Stocks", subtype_invest_treasury: "Treasuries",
    subtype_property_house: "House", subtype_property_car: "Car", subtype_property_otherProperty: "Other Property",
    subtype_receivable_commonReceivable: "MPF Account",
    subtype_liability_creditCard: "Credit Card", subtype_liability_loan: "Loan", subtype_liability_payable: "Payable", subtype_liability_otherLiability: "Other Liability",
    accounts: (n) => `${n} account${n !== 1 ? "s" : ""}`, updated: (d) => `updated ${d}`,
    addAccount: "Add account", addStocks: "Add Stocks", addTreasuries: "Add Treasuries",
    removeCategory: (name) => `Remove ${name}`,
    hiddenCategoriesNote: (n) => `${n} categor${n !== 1 ? "ies" : "y"} hidden · manage in Settings`,
    autoTxIcon: (n) => `${n} auto transaction${n !== 1 ? "s" : ""}`,
    liveFrom: (src) => `Live from ${src}`, manualPrice: "Manual price", simulatedPrice: "Simulated price",
    units: (n) => `${n} units`,
    editAccount: "Edit account", addAccountTitle: "Add account",
    category: "Category", type: "Type", accountName: "Account name", accountNamePh: "e.g. Everyday checking",
    note: "Note (optional)", notePh: "e.g. Bank of America", value: (cur) => `Value (${cur})`,
    trackingStock: "Tracking a stock or ETF instead?", useHoldingForm: "Use the holding form →",
    autoTransaction: "Auto Transaction", addRecurrence: "+ Add recurrence",
    incomeLabel: "Income", expenseLabel: "Expense", recurrencePh: "e.g. Salary, Rent", amountPh: "Amount",
    weekly: "Weekly", monthly: "Monthly", everyWeekday: (w) => `Every ${w}`, dayOfMonthPh: "Day of month (1-28)",
    firstRun: "First run", cancel: "Cancel", add: "Add",
    saveAccount: "Save account", saveHolding: "Save holding",
    weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    cadence_weekly: "Every week", cadence_monthly: "Every month", nextRun: (d) => `next ${d}`,
    addStockHolding: "Add stock holding", editHolding: "Edit holding",
    marketSlashCurrency: (label, cur) => `${label} Market / ${cur}`,
    ticker: "Ticker", tag: "Tag (optional)", unitsLabel: "Units",
    broker: "Broker / Platform (optional)", unassignedBroker: "Unassigned",
    avgCost: (cur) => `Average cost per unit (optional, ${cur})`,
    willSyncAs: (s) => `Will sync as ${s}`,
    priceSource: "Price source", autoSync: "Auto-sync", manual: "Manual",
    manualPriceHint: (cur) => `Price you type here in ${cur} — sync will leave it alone until you switch back to Auto-sync.`,
    currentPricePrefix: (price) => `Current Price: ${price} · Market Value `,
    lastSyncAttempt: (at) => `Last sync attempt (${at})`,
    allFailedHint: "Every source failed, so this holding is currently on a simulated price. If you'd rather set it yourself, switch Price source to Manual above.",
    delete: "Delete", close: "Close",
    settings: "Settings", themeColor: "Theme color", language: "Language",
    hiddenCategories: "Hidden categories", show: "Show",
    finnhubKey: "Finnhub API key (optional)", finnhubPh: "Paste your key from finnhub.io",
    usingSharedKey: "Automatically using this app's shared key — no setup needed.",
    remove: "Remove", save: "Save", saveFinnhub: "Save Finnhub key",
    alltickToken: "AllTick token (optional)", alltickPh: "Paste your token from alltick.co", saveAlltick: "Save AllTick token",
    settingsCopy: "No setup needed by default: US holdings sync via Finnhub (this app already includes a shared key), HK holdings sync via Yahoo Finance's public feed — both work automatically for everyone, no key required. Behind the scenes there are 4 sources total (Finnhub, AllTick, Yahoo, Stooq), tried in the order most likely to work for that market, stopping at the first one that returns a price, so a block or outage on any single source doesn't stop live prices. AllTick (free token at alltick.co) and your own Finnhub key are both optional extras if you want a second/faster source — your own key always takes priority over the shared one. Hong Kong tickers are auto-formatted per source. A holding only shows simulated if every source returns nothing — tap into a holding to see its \"Last sync attempt\" panel for the exact reason, right there in the app.",
    done: "Done",
    chooseTheme: "Choose Theme Color",
    dontUseThemeIcon: "Don't Use Theme Color for Icon",
    dontUseThemeIconHint: "Controls the little \"%\" mark next to the app name at the top of the screen — themed follows your palette, off keeps it neutral gray.",
    addAccountHeader: "Add Account",
    shareTitle: "Share", saveImage: "Save image", preparing: "Preparing…",
    myInvestment: "My Investment", myLiquidity: "My Liquidity", myNetWorth: "My Net Worth", myAssetGrowth: "My Asset Growth",
    accountChangeLabel: "Account Change", openPnlLabel: "Open P&L", netWorthLabel: "Net Worth", changeLabel: "Change",
    totalAccountChange: (amt) => `Total account change is ${amt} ,`,
    openPnlOnlyStocks: "Open P&L only applies to stock holdings.",
    openPnlNoChange: "Open P&L has no change.",
    openPnlChanged: (dir, amt, pct) => `Open P&L has ${dir} by ${amt}${pct}.`,
    increased: "increased", decreased: "decreased",
    recordChart: "Record a couple of snapshots (Trend tab) to see period-over-period change here.",
    netWorthLine: (dir, amt, pct) => `Net worth has ${dir} by ${amt}, ${pct}%`,
    assetLine: (dir, name, amt, pct) => `My ${name} has ${dir} by ${amt}, ${pct}%`,
    record: "Record",
    grossAssetsShare: "Share of gross assets",
    liabilitiesOffset: "Liabilities Offset Gross Assets by",
    menuRefresh: "Refresh all", menuHistory: "History", menuSearch: "Search accounts", menuShare: "Share", menuSettings: "Settings",
    historyTitle: "History", noActivity: "Nothing recorded yet — activity like edits and syncs will show up here.",
    searchTitle: "Search accounts", searchPh: "Search accounts or tickers", noResultsFor: (q) => `No accounts match "${q}".`,
    syncPrices: "Sync Prices", syncing: "Syncing", synced: (t) => `Synced ${t}`,
    netWorthCurrently: (v) => `Net worth is currently ${v}.`,
  },
  zh: {
    appTagline: "資產追蹤器",
    tabAssets: "資產", tabMix: "配置", tabPnl: "損益", tabTrend: "趨勢",
    netWorth: "淨資產",
    catName_cash: "現金及等價物", catName_invest: "投資", catName_property: "物業",
    catName_receivable: "強積金", catName_liability: "負債",
    subtype_cash_cash: "現金", subtype_cash_digitalWallet: "電子錢包", subtype_cash_debitCard: "扣賬卡", subtype_cash_dividends: "股息", subtype_cash_otherCash: "其他",
    subtype_invest_stock: "股票", subtype_invest_treasury: "國債",
    subtype_property_house: "房屋", subtype_property_car: "汽車", subtype_property_otherProperty: "其他物業",
    subtype_receivable_commonReceivable: "強積金戶口",
    subtype_liability_creditCard: "信用卡", subtype_liability_loan: "貸款", subtype_liability_payable: "應付款項", subtype_liability_otherLiability: "其他負債",
    accounts: (n) => `${n} 個帳戶`, updated: (d) => `更新於 ${d}`,
    addAccount: "新增帳戶", addStocks: "新增股票", addTreasuries: "新增國債",
    removeCategory: (name) => `移除「${name}」`,
    hiddenCategoriesNote: (n) => `已隱藏 ${n} 個類別 · 於設定管理`,
    autoTxIcon: (n) => `${n} 個自動交易`,
    liveFrom: (src) => `即時報價來自 ${src}`, manualPrice: "手動價格", simulatedPrice: "模擬價格",
    units: (n) => `${n} 股`,
    editAccount: "編輯帳戶", addAccountTitle: "新增帳戶",
    category: "類別", type: "類型", accountName: "帳戶名稱", accountNamePh: "例如：日常戶口",
    note: "備註（可選）", notePh: "例如：滙豐銀行", value: (cur) => `金額（${cur}）`,
    trackingStock: "想新增股票或ETF？", useHoldingForm: "使用持股表單 →",
    autoTransaction: "自動交易", addRecurrence: "+ 新增定期項目",
    incomeLabel: "收入", expenseLabel: "支出", recurrencePh: "例如：薪金、租金", amountPh: "金額",
    weekly: "每週", monthly: "每月", everyWeekday: (w) => `每星期${w}`, dayOfMonthPh: "每月第幾日（1-28）",
    firstRun: "首次執行日期", cancel: "取消", add: "新增",
    saveAccount: "儲存帳戶", saveHolding: "儲存持股",
    weekdays: ["日", "一", "二", "三", "四", "五", "六"],
    cadence_weekly: "每週", cadence_monthly: "每月", nextRun: (d) => `下次 ${d}`,
    addStockHolding: "新增股票持倉", editHolding: "編輯持股",
    marketSlashCurrency: (label, cur) => `${label}市場 / ${cur}`,
    ticker: "股票代號", tag: "標籤（可選）", unitsLabel: "股數",
    broker: "券商 / 平台（可選）", unassignedBroker: "未分配",
    avgCost: (cur) => `平均成本（可選，${cur}）`,
    willSyncAs: (s) => `將以 ${s} 同步`,
    priceSource: "價格來源", autoSync: "自動同步", manual: "手動",
    manualPriceHint: (cur) => `在此輸入以 ${cur} 計價的價格 — 除非你切換回自動同步，否則同步時不會更改。`,
    currentPricePrefix: (price) => `現價：${price} · 市值 `,
    lastSyncAttempt: (at) => `上次同步嘗試（${at}）`,
    allFailedHint: "所有來源均未能取得報價，此持股目前顯示模擬價格。如想自行設定，請於上方將價格來源切換為「手動」。",
    delete: "刪除", close: "關閉",
    settings: "設定", themeColor: "主題顏色", language: "語言",
    hiddenCategories: "已隱藏的類別", show: "顯示",
    finnhubKey: "Finnhub API 金鑰（可選）", finnhubPh: "貼上你於 finnhub.io 取得的金鑰",
    usingSharedKey: "已自動使用本應用程式的共用金鑰 — 無需自行設定。",
    remove: "移除", save: "儲存", saveFinnhub: "儲存 Finnhub 金鑰",
    alltickToken: "AllTick 權杖（可選）", alltickPh: "貼上你於 alltick.co 取得的權杖", saveAlltick: "儲存 AllTick 權杖",
    settingsCopy: "預設無需任何設定：美股持倉透過 Finnhub 同步（本應用程式已內建共用金鑰），港股持倉透過 Yahoo Finance 公開報價同步 — 兩者對所有人自動生效，無需金鑰。背後其實有 4 個來源（Finnhub、AllTick、Yahoo、Stooq），會依該市場最可能成功的順序嘗試，一取得報價即停止，確保單一來源被封鎖或故障時仍能取得即時報價。AllTick（可於 alltick.co 免費取得權杖）及你自己的 Finnhub 金鑰皆為可選的額外來源，若已設定，你自己的金鑰會優先於共用金鑰使用。港股代號會依各來源自動調整格式。只有全部來源均無回應時才會顯示模擬價格 — 點入個別持股可查看「上次同步嘗試」，了解確實原因。",
    done: "完成",
    chooseTheme: "選擇主題顏色",
    dontUseThemeIcon: "圖示不使用主題顏色",
    dontUseThemeIconHint: "控制畫面頂部應用程式名稱旁的小「%」圖示 — 開啟會跟隨主題色彩，關閉則保持中性灰色。",
    addAccountHeader: "新增帳戶",
    shareTitle: "分享", saveImage: "儲存圖片", preparing: "準備中…",
    myInvestment: "我的投資", myLiquidity: "我的流動資金", myNetWorth: "我的淨資產", myAssetGrowth: "我的資產增長",
    accountChangeLabel: "帳戶變動", openPnlLabel: "未平倉損益", netWorthLabel: "淨資產", changeLabel: "變動",
    totalAccountChange: (amt) => `帳戶總變動為 ${amt}，`,
    openPnlOnlyStocks: "未平倉損益只適用於股票持股。",
    openPnlNoChange: "未平倉損益沒有變動。",
    openPnlChanged: (dir, amt, pct) => `未平倉損益${dir} ${amt}${pct}。`,
    increased: "增加了", decreased: "減少了",
    recordChart: "記錄多幾個時點的資產快照（趨勢分頁），即可在此查看期間變動。",
    netWorthLine: (dir, amt, pct) => `淨資產${dir} ${amt}，${pct}%`,
    assetLine: (dir, name, amt, pct) => `我的${name}${dir} ${amt}，${pct}%`,
    record: "記錄",
    grossAssetsShare: "資產總額佔比",
    liabilitiesOffset: "負債抵銷資產總額",
    menuRefresh: "全部重新整理", menuHistory: "歷史紀錄", menuSearch: "搜尋帳戶", menuShare: "分享", menuSettings: "設定",
    historyTitle: "歷史紀錄", noActivity: "尚未有任何紀錄 — 修改及同步等活動將顯示於此。",
    searchTitle: "搜尋帳戶", searchPh: "搜尋帳戶名稱或股票代號", noResultsFor: (q) => `找不到符合「${q}」的帳戶。`,
    syncPrices: "股價同步", syncing: "同步中", synced: (t) => `已於 ${t} 同步`,
    netWorthCurrently: (v) => `目前淨資產為 ${v}。`,
  },
};
const DEFAULT_LANG = "en";
const LangContext = createContext({ lang: DEFAULT_LANG, t: (k) => k, setLang: () => {} });
function useLang() { return useContext(LangContext); }
function makeT(lang) {
  return (key, ...args) => {
    const entry = STRINGS[lang]?.[key] ?? STRINGS.en[key] ?? key;
    return typeof entry === "function" ? entry(...args) : entry;
  };
}
// category display name — id-based so it stays correct across languages
// even though category.name is persisted in storage
function catLabel(category, t) { return t(`catName_${category.id}`) || category.name; }

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');`;

// share-card brand colors (distinct from in-app category colors, matches export style)
const SHARE_BRAND = {
  invest: "#6C63E0",
  cash: "#3FAE6B",
  networth: "#3FAE6B",
  assets: "#3FAE6B",
};
const APP_NAME = "Ledger";
const APP_TAGLINE = "Net Worth Tracker";

// ---- account subtypes (mirrors the reference app's "Add Account" list) ---
const SUBTYPES = {
  cash: [
    { id: "cash", label: "Cash", icon: Wallet },
    { id: "debitCard", label: "Debit Card", icon: CreditCard },
    { id: "digitalWallet", label: "Digital Wallet", icon: Smartphone },
    { id: "dividends", label: "Dividends", icon: DollarSign },
    { id: "otherCash", label: "Others", icon: MoreHorizontal },
  ],
  invest: [
    { id: "stock", label: "Stocks", icon: BarChart3 },
    { id: "treasury", label: "Treasuries", icon: Landmark },
  ],
  property: [
    { id: "house", label: "House", icon: Building2 },
    { id: "car", label: "Car", icon: Car },
    { id: "otherProperty", label: "Other Property", icon: Lock },
  ],
  receivable: [
    { id: "commonReceivable", label: "Common Receivable", icon: Users },
  ],
  liability: [
    { id: "creditCard", label: "Credit Card", icon: CreditCard },
    { id: "loan", label: "Loan", icon: Landmark },
    { id: "payable", label: "Payable", icon: ReceiptText },
    { id: "otherLiability", label: "Other Liability", icon: CreditCard },
  ],
};
function subtypeInfo(categoryId, subtypeId) {
  const list = SUBTYPES[categoryId] || [];
  return list.find((s) => s.id === subtypeId) || list[0];
}
function subtypeLabel(categoryId, subtypeId, t) {
  return t(`subtype_${categoryId}_${subtypeId}`) || subtypeInfo(categoryId, subtypeId)?.label;
}
// default subtype for the generic account form — skips "stock" since that
// always routes to the dedicated ticker/units holding form instead
function defaultSubtype(categoryId) {
  const list = SUBTYPES[categoryId] || [];
  return (list.find((s) => s.id !== "stock") || list[0])?.id;
}
// currency preset: Investments default to USD, every other category to HKD
function presetCurrency(categoryId) { return categoryId === "invest" ? "USD" : "HKD"; }

// ---- color themes ----------------------------------------------------
// each theme supplies 3 accents used for the cash / invest / property
// category colors. Receivables get a blended 4th hue derived from the
// theme so every asset box stays colorful; liabilities stay a fixed
// warning red regardless of theme, on purpose — debt should always read
// as "debt" even if you switch palettes.
const THEMES = [
  { id: "matisse2", name: "Matisse 2", colors: ["#AEB8F5", "#5B4FE0", "#4CAF6D"] },
  { id: "matisse", name: "Matisse", colors: ["#C6A6DE", "#F0935B", "#3FC0BE"] },
  { id: "pissarro", name: "Pissarro", colors: ["#9FAE7C", "#6FA23E", "#A9D66B"] },
  { id: "miro", name: "Miro", colors: ["#2D6FB0", "#2FA6A0", "#E3C349"] },
  { id: "mondrian", name: "Mondrian", colors: ["#E68F2A", "#D9483C", "#3457C4"] },
  { id: "macke", name: "Macke", colors: ["#E6C89A", "#E36A5C", "#2B2E6B"] },
];
const DEFAULT_THEME_ID = "matisse2";
function themeById(id) { return THEMES.find((t) => t.id === id) || THEMES[0]; }
function mixHex(hex1, hex2, t = 0.5) {
  const a = parseInt(hex1.slice(1), 16), b = parseInt(hex2.slice(1), 16);
  const ar = (a >> 16) & 255, ag = (a >> 8) & 255, ab = a & 255;
  const br = (b >> 16) & 255, bg = (b >> 8) & 255, bb = b & 255;
  const r = Math.round(ar + (br - ar) * t), g = Math.round(ag + (bg - ag) * t), bl = Math.round(ab + (bb - ab) * t);
  return `#${[r, g, bl].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}
// theme-aware color for a category — cash/invest/property map directly
// to the theme, receivable is a blend of two theme colors, and liability
// stays neutral/fixed (see note above)
function categoryColor(category, theme) {
  if (category.id === "cash") return theme.colors[0];
  if (category.id === "invest") return theme.colors[1];
  if (category.id === "property") return theme.colors[2];
  if (category.id === "receivable") return mixHex(theme.colors[0], theme.colors[2], 0.5);
  return category.color;
}
const CATEGORY_ICON = { cash: Wallet, invest: TrendingUp, property: Building2, receivable: PiggyBank, liability: CreditCard };

// gives each stock tag its own shade of the same base color (e.g. the
// Investment category accent), so tags are visually distinct at a glance
// but still read as one consistent color family rather than random hues.
// Same tag always maps to the same shade.
function tagColor(tag, baseHex) {
  if (!tag) return baseHex;
  const shades = [
    mixHex(baseHex, "#000000", 0.4),
    mixHex(baseHex, "#000000", 0.18),
    baseHex,
    mixHex(baseHex, "#ffffff", 0.35),
    mixHex(baseHex, "#ffffff", 0.6),
  ];
  let h = 0;
  for (let i = 0; i < tag.length; i++) h = (h * 31 + tag.charCodeAt(i)) >>> 0;
  return shades[h % shades.length];
}

// ---- auto transactions (recurring income / expense) -----------------
function advanceDate(iso, recurrence) {
  const d = new Date(iso + "T00:00:00");
  if (recurrence.cadence === "weekly") d.setDate(d.getDate() + 7);
  else d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}
// applies every due recurrence (catching up if the app wasn't opened for a
// while), returns the updated categories plus a summary of what ran
function applyDueRecurrences(categories) {
  const today = todayISO();
  const summary = []; // { accountName, count, netAmount }
  const nextCategories = categories.map((c) => ({
    ...c,
    accounts: c.accounts.map((a) => {
      if (a.isStock || !a.recurrences || a.recurrences.length === 0) return a;
      let value = a.value;
      const recurrences = a.recurrences.map((r) => {
        if (r.paused) return r;
        let nextRun = r.nextRun;
        let count = 0, net = 0;
        let guard = 0;
        while (nextRun <= today && guard < 500) {
          const signed = r.type === "expense" ? -r.amount : r.amount;
          value += signed;
          net += signed;
          count += 1;
          nextRun = advanceDate(nextRun, r);
          guard += 1;
        }
        if (count > 0) summary.push({ accountName: a.name, label: r.label, count, net });
        return count > 0 ? { ...r, nextRun } : r;
      });
      return { ...a, value, recurrences, updatedAt: value !== a.value ? today : a.updatedAt };
    }),
  }));
  return { categories: nextCategories, summary };
}

// ---- period range helpers -------------------------------------------------
// Every range resolves to a concrete [startDate, endDate] pair so P&L / Trend
// can both filter snapshots and label the card the same way.
function resolveRange(rangeId, custom) {
  const end = new Date();
  const start = new Date();
  switch (rangeId) {
    case "5w": start.setDate(start.getDate() - 35); break;
    case "1m": start.setMonth(start.getMonth() - 1); break;
    case "6m": start.setMonth(start.getMonth() - 6); break;
    case "1y": start.setFullYear(start.getFullYear() - 1); break;
    case "4y": start.setFullYear(start.getFullYear() - 4); break;
    case "ytd": start.setMonth(0, 1); break;
    case "custom":
      return {
        start: custom?.start ? new Date(custom.start + "T00:00:00") : start,
        end: custom?.end ? new Date(custom.end + "T00:00:00") : end,
      };
    default: start.setFullYear(2000); break; // "all"
  }
  return { start, end };
}
function fmtMonthYear(d) {
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}
function rangeLabel(rangeId, custom) {
  const { start, end } = resolveRange(rangeId, custom);
  const sameYear = start.getFullYear() === end.getFullYear();
  const startLabel = start.toLocaleDateString("en-US", { month: "short", ...(sameYear ? {} : { year: "numeric" }) });
  const endLabel = fmtMonthYear(end);
  return `${startLabel} \u2013 ${endLabel}`;
}

const uid = () => Math.random().toString(36).slice(2, 10);
const todayISO = () => new Date().toISOString().slice(0, 10);
const nowLabel = () => new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
const fmtMoney = (n) => n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const fmtDateShort = (iso) => {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};
const fmtDateTime = (iso) => {
  const d = new Date(iso);
  return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
};

// ---- markets, seed quotes, currency -------------------------------------
// NOTE: prices here are a simulated feed (random-walked from a seed value)
// unless a Finnhub key is set in Settings — see fetchFinnhubQuote below.
const MARKETS = {
  US: { currency: "USD", label: "US", color: "#3457C4" },
  HK: { currency: "HKD", label: "HK", color: "#C9483C" },
};

// HK tickers are conventionally 4-digit, zero-padded (e.g. "941" -> "0941").
// This always returns the BARE ticker (no market suffix) — every quote
// source appends its own suffix format on top of this, so if the suffix
// were left in here (e.g. someone typing "0941.HK"), it would get doubled
// into "0941.HK.HK" and silently break every sync source at once.
function normalizeTicker(ticker, market) {
  let clean = ticker.trim().toUpperCase();
  if (market === "HK") {
    clean = clean.replace(/\.(HK|HKG)$/i, "");
    if (/^\d+$/.test(clean)) clean = clean.padStart(4, "0");
  }
  return clean;
}

const SEED_PRICES = {
  TSLA: 370.0,
  AAPL: 195.4,
  MSFT: 428.1,
  NVDA: 118.3,
  VOO: 683.0, // approx close, Jul 20 2026 — a one-time lookup, not a live feed
  "0700": 382.0, // Tencent
  "0005": 64.8, // HSBC
  "9988": 92.5, // Alibaba HK
};

const FALLBACK_RATES = { USD: 1, HKD: 7.82 }; // HKD per 1 USD

// ---- shared price-sync key ------------------------------------------------
// Fill this in with ONE free Finnhub API key (finnhub.io -> sign up, no card
// needed -> Dashboard -> copy your key) so EVERY visitor gets live US quotes
// automatically, with nobody needing to open Settings. Leave it blank and
// the app still works fine — US quotes just fall back to Yahoo/Stooq like HK
// already does. Anyone can still add their own personal key in Settings,
// which always takes priority over this shared one.
const SHARED_FINNHUB_KEY = "";
const CURRENCY_SYMBOL = { USD: "$", HKD: "HK$" };

function seedPriceFor(ticker) {
  return SEED_PRICES[ticker.toUpperCase()] ?? 100;
}

function finnhubSymbol(ticker, market) {
  return market === "HK" ? `${normalizeTicker(ticker, market)}.HK` : ticker;
}

// Every quote fetcher below returns { price, detail } — price is null on
// failure, detail is a short human-readable reason shown in-app (Settings →
// "why is this holding simulated?"), since DevTools console isn't practical
// on mobile/iPhone where most people run this.
async function fetchFinnhubQuote(ticker, market, apiKey) {
  const symbol = finnhubSymbol(ticker, market);
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 6000);
  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`,
      { signal: ctrl.signal }
    );
    clearTimeout(t);
    if (!res.ok) return { price: null, detail: `HTTP ${res.status}` };
    const data = await res.json();
    if (typeof data.c === "number" && data.c > 0) return { price: data.c, detail: "OK" };
    return { price: null, detail: "no quote for this symbol on your plan" };
  } catch (e) {
    clearTimeout(t);
    return { price: null, detail: e?.name === "AbortError" ? "timed out" : "network/CORS error" };
  }
}

// no-key-required fallback — Yahoo's public chart endpoint covers HKEX
// tickers (e.g. 0941.HK) more consistently than Finnhub's free tier, so
// this is tried whenever Finnhub doesn't return a price (or no key is set).
async function fetchYahooQuote(ticker, market) {
  const symbol = market === "HK" ? `${normalizeTicker(ticker, market)}.HK` : ticker;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 6000);
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`,
      { signal: ctrl.signal }
    );
    clearTimeout(t);
    if (!res.ok) return { price: null, detail: `HTTP ${res.status}` };
    const data = await res.json();
    const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
    if (typeof price === "number" && price > 0) return { price, detail: "OK" };
    return { price: null, detail: "no price in response" };
  } catch (e) {
    clearTimeout(t);
    return { price: null, detail: e?.name === "AbortError" ? "timed out" : "blocked/CORS/network error" };
  }
}

// second no-key fallback — Stooq is a separate provider with its own CORS
// behavior, so it succeeds in some environments where Yahoo doesn't (or
// vice versa). Stooq's HK symbols drop the leading zeros (e.g. "941.hk").
async function fetchStooqQuote(ticker, market) {
  const bare = normalizeTicker(ticker, market).replace(/^0+/, "") || "0";
  const symbol = market === "HK" ? `${bare}.hk` : `${ticker.trim().toLowerCase()}.us`;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 6000);
  try {
    const res = await fetch(`https://stooq.com/q/l/?s=${encodeURIComponent(symbol)}&f=sd2t2ohlcv&h&e=csv`, { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return { price: null, detail: `HTTP ${res.status}` };
    const csv = (await res.text()).trim();
    const cols = csv.split("\n")[1]?.split(",");
    const close = cols ? Number(cols[6]) : NaN;
    if (Number.isFinite(close) && close > 0) return { price: close, detail: "OK" };
    return { price: null, detail: cols ? "symbol not recognized (N/D)" : "no data returned" };
  } catch (e) {
    clearTimeout(t);
    return { price: null, detail: e?.name === "AbortError" ? "timed out" : "blocked/CORS/network error" };
  }
}

// optional 4th source — AllTick covers US/HK/A-shares specifically (a free
// token from alltick.co is required). Uses their documented /kline endpoint
// with kline_type=8 (daily) + query_kline_num=1, which per their docs
// returns the last traded price during trading hours or the official close
// otherwise — the same "current price" semantics as the other sources.
// Note: their free plan is rate-limited to ~1 request/10s across your whole
// account, so with several holdings only some will get an AllTick price per
// sync — the rest fall through to Yahoo/Stooq automatically, same as always.
async function fetchAllTickQuote(ticker, market, token) {
  if (!token) return { price: null, detail: "no token set" };
  const bare = normalizeTicker(ticker, market).replace(/^0+/, "") || "0";
  const code = market === "HK" ? `${bare}.HK` : `${ticker.trim().toUpperCase()}.US`;
  const query = { trace: uid(), data: { code, kline_type: 8, kline_timestamp_end: 0, query_kline_num: 1, adjust_type: 0 } };
  const url = `https://quote.alltick.co/quote-stock-b-api/kline?token=${encodeURIComponent(token)}&query=${encodeURIComponent(JSON.stringify(query))}`;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 6000);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return { price: null, detail: `HTTP ${res.status}` };
    const data = await res.json();
    if (data?.ret !== 200) return { price: null, detail: `error ${data?.ret}: ${data?.msg || "unknown"}` };
    const close = Number(data?.data?.kline_list?.[0]?.close_price);
    if (Number.isFinite(close) && close > 0) return { price: close, detail: "OK" };
    return { price: null, detail: "no kline data for this symbol" };
  } catch (e) {
    clearTimeout(t);
    return { price: null, detail: e?.name === "AbortError" ? "timed out" : "blocked/CORS/network error" };
  }
}

async function fetchLiveQuote(ticker, market, apiKey, allTickToken) {
  const attempts = [];
  const tryFinnhub = async () => {
    if (!apiKey) { attempts.push({ source: "Finnhub", detail: "no key set — skipped" }); return null; }
    const r = await fetchFinnhubQuote(ticker, market, apiKey);
    attempts.push({ source: "Finnhub", detail: r.detail });
    return r.price;
  };
  const tryYahoo = async () => {
    const r = await fetchYahooQuote(ticker, market);
    attempts.push({ source: "Yahoo", detail: r.detail });
    return r.price;
  };
  const tryAllTick = async () => {
    if (!allTickToken) { attempts.push({ source: "AllTick", detail: "no token set — skipped" }); return null; }
    const r = await fetchAllTickQuote(ticker, market, allTickToken);
    attempts.push({ source: "AllTick", detail: r.detail });
    return r.price;
  };
  const tryStooq = async () => {
    const r = await fetchStooqQuote(ticker, market);
    attempts.push({ source: "Stooq", detail: r.detail });
    return r.price;
  };

  // US: Finnhub is genuinely reliable here, so try it first (shared or your
  // own key). HK/China: Finnhub's free tier rarely covers these exchanges,
  // so skip straight to Yahoo, which does.
  const order = market === "US" ? [tryFinnhub, tryYahoo, tryAllTick, tryStooq] : [tryYahoo, tryFinnhub, tryAllTick, tryStooq];
  for (const attempt of order) {
    const price = await attempt();
    if (price != null) {
      const last = attempts[attempts.length - 1];
      return { price, source: last.source, attempts };
    }
  }
  return { price: null, source: null, attempts };
}

// value stored on stock accounts is always the USD-equivalent, so net worth
// math elsewhere in the app doesn't need to know currencies exist.
function nativeToUsd(nativeAmount, currency, rates) {
  if (currency === "USD") return nativeAmount;
  const rate = rates[currency] || FALLBACK_RATES[currency] || 1;
  return nativeAmount / rate;
}
function stockUsdValue(nativePrice, units, currency, rates) {
  return nativeToUsd(nativePrice * units, currency, rates);
}

// ---- category math helpers -----------------------------------------------
function categoryTotals(categories) {
  const totals = {};
  categories.forEach((c) => {
    totals[c.id] = c.accounts.reduce((s, a) => s + a.value, 0);
  });
  return totals;
}
function netWorthFromTotals(categories, totals) {
  return categories.reduce((sum, c) => (c.type === "liability" ? sum - totals[c.id] : sum + totals[c.id]), 0);
}

// ---- seed data (original, not copied from any reference app) ----------
const seedCategories = () => [
  {
    id: "cash",
    name: "Cash Equivalents",
    color: COLORS.sage,
    type: "asset",
    accounts: [
      { id: uid(), name: "Everyday checking", note: "High-yield savings", value: 42300, updatedAt: todayISO() },
    ],
  },
  {
    id: "invest",
    name: "Investments",
    color: COLORS.slate,
    type: "asset",
    accounts: [
      { id: uid(), name: "Index fund sleeve", note: "Broad-market fund", value: 92450, updatedAt: todayISO() },
      {
        id: uid(),
        isStock: true,
        ticker: "AAPL",
        market: "US",
        currency: "USD",
        units: 25,
        avgCost: 150,
        nativePrice: SEED_PRICES.AAPL,
        value: stockUsdValue(SEED_PRICES.AAPL, 25, "USD", FALLBACK_RATES),
        updatedAt: todayISO(),
      },
    ],
  },
  {
    id: "property",
    name: "Property",
    color: COLORS.amber,
    type: "asset",
    accounts: [
      { id: uid(), name: "Home & vehicle", note: "Primary residence, car", value: 610000, updatedAt: todayISO() },
    ],
  },
  {
    id: "receivable",
    name: "Receivables",
    color: COLORS.stone,
    type: "asset",
    accounts: [
      { id: uid(), name: "Owed to you", note: "Personal loan out", value: 8200, updatedAt: todayISO() },
    ],
  },
  {
    id: "liability",
    name: "Liabilities",
    color: COLORS.clay,
    type: "liability",
    accounts: [
      { id: uid(), name: "Mortgage & cards", note: "Mortgage balance, credit cards", value: 265000, updatedAt: todayISO() },
    ],
  },
];

// builds a plausible 6-month back-history ending exactly at the categories'
// current totals, so Trend / P&L have something to show on first load.
const seedSnapshots = (categories) => {
  const totals = categoryTotals(categories);
  const now = new Date();
  const MONTHS = 6;
  const points = [];
  for (let i = MONTHS; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const progress = (MONTHS - i) / MONTHS;
    const byCategory = {};
    Object.entries(totals).forEach(([key, end]) => {
      let start;
      if (key === "invest") start = end * 0.55;
      else if (key === "cash") start = end * 0.72;
      else start = end * 0.94;
      byCategory[key] = start + (end - start) * progress;
    });
    const value = netWorthFromTotals(categories, byCategory);
    points.push({ date: d.toISOString().slice(0, 10), value, byCategory });
  }
  points[points.length - 1] = { date: todayISO(), value: netWorthFromTotals(categories, totals), byCategory: totals };
  return points;
};

// blank starter state — used for real first-time visitors so nobody sees
// demo holdings (TSLA, HSBC, etc). Keeps the same 5 category shells so the
// rest of the app (tabs, colors, add-account flows) works immediately, just
// with zero accounts in each.
const emptyCategories = () => [
  { id: "cash", name: "Cash Equivalents", color: COLORS.sage, type: "asset", accounts: [] },
  { id: "invest", name: "Investments", color: COLORS.slate, type: "asset", accounts: [] },
  { id: "property", name: "Property", color: COLORS.amber, type: "asset", accounts: [] },
  { id: "receivable", name: "Receivables", color: COLORS.stone, type: "asset", accounts: [] },
  { id: "liability", name: "Liabilities", color: COLORS.clay, type: "liability", accounts: [] },
];
const emptySnapshots = () => [{ date: todayISO(), value: 0, byCategory: { cash: 0, invest: 0, property: 0, receivable: 0, liability: 0 } }];

// ---- storage helpers -----------------------------------------------------
async function loadState() {
  let categories, snapshots, apiKey, activities, themeId, hiddenCategoryIds;
  try {
    const r = await window.storage.get("ledger:categories");
    categories = r ? JSON.parse(r.value) : null;
  } catch {
    categories = null;
  }
  try {
    const r = await window.storage.get("ledger:snapshots");
    snapshots = r ? JSON.parse(r.value) : null;
  } catch {
    snapshots = null;
  }
  try {
    const r = await window.storage.get("ledger:finnhubKey");
    apiKey = r && r.value ? r.value : "";
  } catch {
    apiKey = "";
  }
  try {
    const r = await window.storage.get("ledger:activities");
    activities = r ? JSON.parse(r.value) : null;
  } catch {
    activities = null;
  }
  try {
    const r = await window.storage.get("ledger:theme");
    themeId = r ? r.value : DEFAULT_THEME_ID;
  } catch {
    themeId = DEFAULT_THEME_ID;
  }
  try {
    const r = await window.storage.get("ledger:hiddenCategories");
    hiddenCategoryIds = r ? JSON.parse(r.value) : [];
  } catch {
    hiddenCategoryIds = [];
  }
  let iconThemed;
  try {
    const r = await window.storage.get("ledger:iconThemed");
    iconThemed = r ? r.value === "true" : true;
  } catch {
    iconThemed = true;
  }
  let allTickToken;
  try {
    const r = await window.storage.get("ledger:allTickToken");
    allTickToken = r ? r.value : "";
  } catch {
    allTickToken = "";
  }
  let lang;
  try {
    const r = await window.storage.get("ledger:lang");
    lang = r ? r.value : DEFAULT_LANG;
  } catch {
    lang = DEFAULT_LANG;
  }

  const cats = categories || emptyCategories();
  const snaps = snapshots || (categories ? seedSnapshots(cats) : emptySnapshots());
  return { categories: cats, snapshots: snaps, apiKey: apiKey || "", activities: activities || [], themeId: themeId || DEFAULT_THEME_ID, hiddenCategoryIds: hiddenCategoryIds || [], iconThemed, allTickToken: allTickToken || "", lang: lang || DEFAULT_LANG };
}

async function saveLang(l) {
  try {
    await window.storage.set("ledger:lang", l);
  } catch (e) {
    console.error("save lang failed", e);
  }
}

async function saveAllTickToken(token) {
  try {
    await window.storage.set("ledger:allTickToken", token);
  } catch (e) {
    console.error("save alltick token failed", e);
  }
}

async function saveIconThemed(v) {
  try {
    await window.storage.set("ledger:iconThemed", String(v));
  } catch (e) {
    console.error("save icon themed failed", e);
  }
}

async function saveHiddenCategories(ids) {
  try {
    await window.storage.set("ledger:hiddenCategories", JSON.stringify(ids));
  } catch (e) {
    console.error("save hidden categories failed", e);
  }
}

async function saveTheme(id) {
  try {
    await window.storage.set("ledger:theme", id);
  } catch (e) {
    console.error("save theme failed", e);
  }
}

async function saveApiKey(key) {
  try {
    await window.storage.set("ledger:finnhubKey", key);
  } catch (e) {
    console.error("save api key failed", e);
  }
}
async function saveCategories(categories) {
  try {
    await window.storage.set("ledger:categories", JSON.stringify(categories));
  } catch (e) {
    console.error("save categories failed", e);
  }
}
async function saveSnapshots(snapshots) {
  try {
    await window.storage.set("ledger:snapshots", JSON.stringify(snapshots));
  } catch (e) {
    console.error("save snapshots failed", e);
  }
}
async function saveActivities(activities) {
  try {
    await window.storage.set("ledger:activities", JSON.stringify(activities));
  } catch (e) {
    console.error("save activities failed", e);
  }
}

// ---- signature element: hand-drawn ledger underline ---------------------
function SketchUnderline({ color = COLORS.sage, width = 220 }) {
  return (
    <svg width={width} height="14" viewBox={`0 0 ${width} 14`} fill="none" style={{ display: "block" }}>
      <path
        d={`M2 9 C ${width * 0.25} 3, ${width * 0.6} 12, ${width - 2} 6`}
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        style={{ strokeDasharray: 400, strokeDashoffset: 400, animation: "draw 900ms 300ms ease-out forwards" }}
      />
    </svg>
  );
}

// ---- generic (cash-like) account modal ------------------------------------
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function recurrenceSummary(r, t) {
  const wd = t("weekdays")[r.weekday];
  const when = r.cadence === "weekly" ? t("everyWeekday", wd) : `${r.dayOfMonth}${["th", "st", "nd", "rd"][(r.dayOfMonth % 10 > 3 || [11, 12, 13].includes(r.dayOfMonth % 100)) ? 0 : r.dayOfMonth % 10]}`;
  const cadence = t(r.cadence === "weekly" ? "cadence_weekly" : "cadence_monthly");
  return `${cadence} ${when} · ${t("nextRun", fmtDateShort(r.nextRun))}`;
}

// ---- add-account type sheet (category-grouped subtype picker) ------------
function AccountTypeSheet({ open, onClose, categories, theme, onPick }) {
  const { t } = useLang();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50" style={{ background: COLORS.bg, overflowY: "auto" }} onClick={onClose}>
      <div className="w-full mx-auto" style={{ maxWidth: 430 }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center px-4 pt-8 pb-4" style={{ position: "sticky", top: 0, background: COLORS.bg }}>
          <button onClick={onClose} aria-label="Back" className="flex items-center justify-center rounded-full"
            style={{ width: 34, height: 34, background: COLORS.surface }}>
            <ChevronLeft size={18} color={COLORS.ink} />
          </button>
          <span className="flex-1 text-center" style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 17, color: COLORS.ink, marginRight: 34 }}>{t("addAccountHeader")}</span>
        </div>

        <div className="px-4 pb-10">
          {categories.map((c) => {
            const list = SUBTYPES[c.id] || [];
            const color = categoryColor(c, theme);
            return (
              <div key={c.id} className="mb-1">
                <div className="rounded-xl px-4 py-2.5 mb-1.5" style={{ background: color }}>
                  <span style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 13.5, color: "#fff" }}>{catLabel(c, t)}</span>
                </div>
                <div className="mb-3">
                  {list.map((s) => {
                    const Icon = s.icon;
                    return (
                      <button key={s.id} onClick={() => onPick(c.id, s.id)} className="w-full flex items-center gap-3 rounded-xl px-4 py-3.5 mb-1.5 text-left"
                        style={{ background: COLORS.surface, border: `1px solid ${COLORS.rule}` }}>
                        <span className="flex items-center justify-center rounded-full" style={{ width: 30, height: 30, background: color + "22" }}>
                          <Icon size={15} color={color} />
                        </span>
                        <span style={{ fontFamily: "Inter", fontSize: 14, color: COLORS.ink }}>{subtypeLabel(c.id, s.id, t)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AccountModal({ open, onClose, onSave, onDelete, categories, initial, rates, presetSubtype, onAddStockInstead, existingBrokers }) {
  const [categoryId, setCategoryId] = useState(initial?.categoryId || categories[0]?.id);
  const [subtype, setSubtype] = useState(initial?.subtype || presetSubtype || defaultSubtype(initial?.categoryId || categories[0]?.id));
  const [name, setName] = useState(initial?.name || "");
  const [note, setNote] = useState(initial?.note || "");
  const [broker, setBroker] = useState(initial?.broker || "");
  const [currency, setCurrency] = useState(initial?.currency || presetCurrency(initial?.categoryId || categories[0]?.id));
  const [nativeValue, setNativeValue] = useState(
    initial?.nativeValue != null ? String(Math.round(initial.nativeValue)) : initial?.value != null ? String(Math.round(initial.value)) : ""
  );
  const [recurrences, setRecurrences] = useState(initial?.recurrences || []);
  const [addingRecurrence, setAddingRecurrence] = useState(false);
  const [rLabel, setRLabel] = useState("");
  const [rType, setRType] = useState("income");
  const [rAmount, setRAmount] = useState("");
  const [rCadence, setRCadence] = useState("monthly");
  const [rWeekday, setRWeekday] = useState(1);
  const [rDayOfMonth, setRDayOfMonth] = useState("1");
  const [rFirstRun, setRFirstRun] = useState(todayISO());
  const { t } = useLang();

  useEffect(() => {
    if (open) {
      const cid = initial?.categoryId || categories[0]?.id;
      setCategoryId(cid);
      setSubtype(initial?.subtype || presetSubtype || defaultSubtype(cid));
      setName(initial?.name || "");
      setNote(initial?.note || "");
      setBroker(initial?.broker || "");
      setCurrency(initial?.currency || presetCurrency(cid));
      setNativeValue(initial?.nativeValue != null ? String(Math.round(initial.nativeValue)) : initial?.value != null ? String(Math.round(initial.value)) : "");
      setRecurrences(initial?.recurrences || []);
      setAddingRecurrence(false);
    }
  }, [open, initial, categories, presetSubtype]);

  if (!open) return null;

  const canSave = name.trim().length > 0 && nativeValue.trim().length > 0 && !isNaN(Number(nativeValue));
  const canSaveRecurrence = rLabel.trim().length > 0 && rAmount.trim().length > 0 && !isNaN(Number(rAmount)) && Number(rAmount) > 0;
  const subtypeList = (SUBTYPES[categoryId] || []).filter((s) => s.id !== "stock");

  const handleCategoryChange = (cid) => {
    setCategoryId(cid);
    if (!initial) {
      setSubtype(defaultSubtype(cid));
      setCurrency(presetCurrency(cid));
    }
  };

  const resetRecurrenceDraft = () => {
    setRLabel(""); setRType("income"); setRAmount(""); setRCadence("monthly");
    setRWeekday(1); setRDayOfMonth("1"); setRFirstRun(todayISO());
  };
  const addRecurrence = () => {
    const rec = {
      id: uid(), label: rLabel.trim(), type: rType, amount: Number(rAmount), cadence: rCadence,
      weekday: rCadence === "weekly" ? Number(rWeekday) : undefined,
      dayOfMonth: rCadence === "monthly" ? Number(rDayOfMonth) : undefined,
      nextRun: rFirstRun, paused: false,
    };
    setRecurrences((prev) => [...prev, rec]);
    resetRecurrenceDraft();
    setAddingRecurrence(false);
  };
  const togglePause = (id) => setRecurrences((prev) => prev.map((r) => (r.id === id ? { ...r, paused: !r.paused } : r)));
  const removeRecurrence = (id) => setRecurrences((prev) => prev.filter((r) => r.id !== id));

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(18,33,61,0.35)" }} onClick={onClose}>
      <div className="w-full max-w-md rounded-t-2xl p-5 pb-6" style={{ background: COLORS.surface, maxHeight: "88vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <span style={{ fontFamily: "Fraunces, serif", fontSize: 19, color: COLORS.ink }}>{initial ? t("editAccount") : t("addAccountTitle")}</span>
          <button onClick={onClose} aria-label="Close"><X size={20} color={COLORS.inkSoft} /></button>
        </div>

        <label style={{ fontFamily: "Inter", fontSize: 12, color: COLORS.inkSoft }}>{t("category")}</label>
        <select value={categoryId} onChange={(e) => handleCategoryChange(e.target.value)} className="w-full mt-1 mb-3 px-3 py-2 rounded-lg"
          style={{ fontFamily: "Inter", fontSize: 14, border: `1px solid ${COLORS.rule}`, color: COLORS.ink, background: COLORS.bg }}>
          {categories.map((c) => <option key={c.id} value={c.id}>{catLabel(c, t)}</option>)}
        </select>

        <label style={{ fontFamily: "Inter", fontSize: 12, color: COLORS.inkSoft }}>{t("type")}</label>
        <div className="flex gap-1.5 flex-wrap mt-1 mb-3">
          {subtypeList.map((s) => {
            const Icon = s.icon;
            const active = subtype === s.id;
            return (
              <button key={s.id} onClick={() => setSubtype(s.id)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
                style={{ fontFamily: "Inter", fontSize: 12, fontWeight: 500, border: `1px solid ${active ? COLORS.ink : COLORS.rule}`, background: active ? COLORS.ink : "transparent", color: active ? "#fff" : COLORS.ink }}>
                <Icon size={12} /> {subtypeLabel(categoryId, s.id, t)}
              </button>
            );
          })}
        </div>

        {categoryId === "invest" && onAddStockInstead && !initial && (
          <button onClick={() => onAddStockInstead(categoryId)} className="w-full flex items-center justify-between px-3 py-2 rounded-lg mb-3"
            style={{ background: COLORS.bg }}>
            <span style={{ fontFamily: "Inter", fontSize: 12, color: COLORS.inkSoft }}>{t("trackingStock")}</span>
            <span style={{ fontFamily: "Inter", fontSize: 12, fontWeight: 600, color: COLORS.slate }}>{t("useHoldingForm")}</span>
          </button>
        )}

        <label style={{ fontFamily: "Inter", fontSize: 12, color: COLORS.inkSoft }}>{t("accountName")}</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("accountNamePh")} className="w-full mt-1 mb-3 px-3 py-2 rounded-lg"
          style={{ fontFamily: "Inter", fontSize: 14, border: `1px solid ${COLORS.rule}`, color: COLORS.ink }} />

        <label style={{ fontFamily: "Inter", fontSize: 12, color: COLORS.inkSoft }}>{t("note")}</label>
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("notePh")} className="w-full mt-1 mb-3 px-3 py-2 rounded-lg"
          style={{ fontFamily: "Inter", fontSize: 14, border: `1px solid ${COLORS.rule}`, color: COLORS.ink }} />

        {categoryId === "invest" && (
          <>
            <label style={{ fontFamily: "Inter", fontSize: 12, color: COLORS.inkSoft }}>{t("broker")}</label>
            <input value={broker} onChange={(e) => setBroker(e.target.value)}
              className="w-full mt-1 mb-2 px-3 py-2 rounded-lg" style={{ fontFamily: "Inter", fontSize: 14, border: `1px solid ${COLORS.rule}`, color: COLORS.ink }} />
            {Array.from(new Set([...SUGGESTED_BROKERS, ...(existingBrokers || [])])).length > 0 && (
              <div className="flex gap-1.5 flex-wrap mb-3">
                {Array.from(new Set([...SUGGESTED_BROKERS, ...(existingBrokers || [])])).map((bk) => (
                  <button key={bk} onClick={() => setBroker(bk === broker ? "" : bk)} className="px-2.5 py-1 rounded-full"
                    style={{ fontFamily: "Inter", fontSize: 11.5, fontWeight: 500, border: `1px solid ${broker === bk ? COLORS.ink : COLORS.rule}`, background: broker === bk ? COLORS.ink : "transparent", color: broker === bk ? "#fff" : COLORS.ink }}>
                    {bk}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        <div className="flex items-center justify-between mb-1 mt-1">
          <label style={{ fontFamily: "Inter", fontSize: 12, color: COLORS.inkSoft }}>{t("value", currency)}</label>
          <div className="flex rounded-full overflow-hidden" style={{ border: `1px solid ${COLORS.rule}` }}>
            {["USD", "HKD"].map((cur) => (
              <button key={cur} onClick={() => setCurrency(cur)} className="px-2.5 py-0.5"
                style={{ fontFamily: "Inter", fontSize: 11, fontWeight: 600, background: currency === cur ? COLORS.ink : "transparent", color: currency === cur ? "#fff" : COLORS.inkSoft }}>
                {cur}
              </button>
            ))}
          </div>
        </div>
        <input value={nativeValue} onChange={(e) => setNativeValue(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="0" inputMode="decimal"
          className="w-full mt-1 mb-5 px-3 py-2 rounded-lg" style={{ fontFamily: "IBM Plex Mono", fontSize: 15, border: `1px solid ${COLORS.rule}`, color: COLORS.ink }} />

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Repeat size={13} color={COLORS.inkSoft} />
            <span style={{ fontFamily: "Inter", fontSize: 12.5, fontWeight: 600, color: COLORS.ink }}>{t("autoTransaction")}</span>
          </div>
          {!addingRecurrence && (
            <button onClick={() => setAddingRecurrence(true)} style={{ fontFamily: "Inter", fontSize: 12, color: COLORS.slate }}>{t("addRecurrence")}</button>
          )}
        </div>

        {recurrences.length > 0 && (
          <div className="rounded-lg overflow-hidden mb-3" style={{ border: `1px solid ${COLORS.rule}` }}>
            {recurrences.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-3 py-2.5" style={{ borderBottom: `1px solid ${COLORS.rule}`, opacity: r.paused ? 0.5 : 1 }}>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span style={{ fontFamily: "Inter", fontSize: 11, fontWeight: 600, padding: "1px 6px", borderRadius: 4, background: r.type === "income" ? COLORS.sage : COLORS.bg, color: r.type === "income" ? "#fff" : COLORS.inkSoft }}>
                      {r.type === "income" ? t("incomeLabel") : t("expenseLabel")}
                    </span>
                    <span style={{ fontFamily: "Inter", fontSize: 13, color: COLORS.ink }}>{r.label}</span>
                  </div>
                  <div style={{ fontFamily: "Inter", fontSize: 11, color: COLORS.inkSoft, marginTop: 2 }}>{recurrenceSummary(r, t)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ fontFamily: "IBM Plex Mono", fontSize: 13, color: r.type === "income" ? COLORS.sage : COLORS.clay }}>
                    {r.type === "income" ? "+" : "\u2212"}{fmtMoney(r.amount)}
                  </span>
                  <button onClick={() => togglePause(r.id)} aria-label={r.paused ? "Resume" : "Pause"}>
                    {r.paused ? <Play size={14} color={COLORS.inkSoft} /> : <Pause size={14} color={COLORS.inkSoft} />}
                  </button>
                  <button onClick={() => removeRecurrence(r.id)} aria-label="Remove"><Trash2 size={14} color={COLORS.clay} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {addingRecurrence && (
          <div className="rounded-lg p-3 mb-4" style={{ background: COLORS.bg, border: `1px solid ${COLORS.rule}` }}>
            <input value={rLabel} onChange={(e) => setRLabel(e.target.value)} placeholder={t("recurrencePh")}
              className="w-full mb-2 px-3 py-2 rounded-lg" style={{ fontFamily: "Inter", fontSize: 13.5, border: `1px solid ${COLORS.rule}`, color: COLORS.ink, background: COLORS.surface }} />

            <div className="flex gap-2 mb-2">
              {["income", "expense"].map((ty) => (
                <button key={ty} onClick={() => setRType(ty)} className="flex-1 py-1.5 rounded-lg"
                  style={{ fontFamily: "Inter", fontSize: 12.5, fontWeight: 600, border: `1px solid ${rType === ty ? COLORS.ink : COLORS.rule}`, background: rType === ty ? COLORS.ink : COLORS.surface, color: rType === ty ? "#fff" : COLORS.ink }}>
                  {ty === "income" ? t("incomeLabel") : t("expenseLabel")}
                </button>
              ))}
            </div>

            <input value={rAmount} onChange={(e) => setRAmount(e.target.value.replace(/[^0-9.]/g, ""))} placeholder={t("amountPh")} inputMode="decimal"
              className="w-full mb-2 px-3 py-2 rounded-lg" style={{ fontFamily: "IBM Plex Mono", fontSize: 13.5, border: `1px solid ${COLORS.rule}`, color: COLORS.ink, background: COLORS.surface }} />

            <div className="flex gap-2 mb-2">
              {["weekly", "monthly"].map((c) => (
                <button key={c} onClick={() => setRCadence(c)} className="flex-1 py-1.5 rounded-lg"
                  style={{ fontFamily: "Inter", fontSize: 12.5, fontWeight: 600, border: `1px solid ${rCadence === c ? COLORS.ink : COLORS.rule}`, background: rCadence === c ? COLORS.ink : COLORS.surface, color: rCadence === c ? "#fff" : COLORS.ink }}>
                  {c === "weekly" ? t("weekly") : t("monthly")}
                </button>
              ))}
            </div>

            {rCadence === "weekly" ? (
              <select value={rWeekday} onChange={(e) => setRWeekday(e.target.value)} className="w-full mb-2 px-3 py-2 rounded-lg"
                style={{ fontFamily: "Inter", fontSize: 13, border: `1px solid ${COLORS.rule}`, color: COLORS.ink, background: COLORS.surface }}>
                {t("weekdays").map((w, i) => <option key={w} value={i}>{t("everyWeekday", w)}</option>)}
              </select>
            ) : (
              <input value={rDayOfMonth} onChange={(e) => setRDayOfMonth(e.target.value.replace(/[^0-9]/g, "").slice(0, 2))} placeholder={t("dayOfMonthPh")}
                className="w-full mb-2 px-3 py-2 rounded-lg" style={{ fontFamily: "Inter", fontSize: 13, border: `1px solid ${COLORS.rule}`, color: COLORS.ink, background: COLORS.surface }} />
            )}

            <label style={{ fontFamily: "Inter", fontSize: 11, color: COLORS.inkSoft }}>{t("firstRun")}</label>
            <input type="date" value={rFirstRun} onChange={(e) => setRFirstRun(e.target.value)} className="w-full mt-1 mb-3 px-3 py-2 rounded-lg"
              style={{ fontFamily: "IBM Plex Mono", fontSize: 12.5, border: `1px solid ${COLORS.rule}`, color: COLORS.ink, background: COLORS.surface }} />

            <div className="flex gap-2">
              <button onClick={() => { setAddingRecurrence(false); resetRecurrenceDraft(); }} className="flex-1 py-2 rounded-lg"
                style={{ fontFamily: "Inter", fontSize: 12.5, color: COLORS.inkSoft, border: `1px solid ${COLORS.rule}` }}>{t("cancel")}</button>
              <button disabled={!canSaveRecurrence} onClick={addRecurrence} className="flex-1 py-2 rounded-lg"
                style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 12.5, color: "#fff", background: canSaveRecurrence ? COLORS.ink : COLORS.rule }}>{t("add")}</button>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {initial && (
            <button onClick={() => onDelete(initial.categoryId, initial.id)} className="flex items-center justify-center rounded-lg px-4 py-2.5"
              style={{ border: `1px solid ${COLORS.rule}`, color: COLORS.clay }}>
              <Trash2 size={16} />
            </button>
          )}
          <button disabled={!canSave} onClick={() => onSave({
            id: initial?.id || uid(), categoryId, subtype, name: name.trim(), note: note.trim(), broker: broker.trim() || undefined,
            currency, nativeValue: Number(nativeValue), value: nativeToUsd(Number(nativeValue), currency, rates || FALLBACK_RATES),
            recurrences, updatedAt: todayISO(),
          })}
            className="flex-1 rounded-lg py-2.5" style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 14, color: "#fff", background: canSave ? COLORS.ink : COLORS.rule }}>
            {t("saveAccount")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- stock holding modal ------------------------------------------------
const SUGGESTED_STOCK_TAGS = ["Major ETF", "Mag-7", "High Div", "Crypto", "Metals", "Others"];
const SUGGESTED_BROKERS = ["IBKR", "Futubull", "Tiger", "First Trade", "Others"];

function StockModal({ open, onClose, onSave, onDelete, categoryId, rates, initial, existingTags, existingBrokers, diagnostics }) {
  const [ticker, setTicker] = useState(initial?.ticker || "");
  const [market, setMarket] = useState(initial?.market || "US");
  const [units, setUnits] = useState(initial?.units != null ? String(initial.units) : "");
  const [avgCost, setAvgCost] = useState(initial?.avgCost != null ? String(initial.avgCost) : "");
  const [tag, setTag] = useState(initial?.tag || "");
  const [broker, setBroker] = useState(initial?.broker || "");
  const [manualMode, setManualMode] = useState(initial?.priceSource === "manual");
  const [manualPrice, setManualPrice] = useState(initial?.priceSource === "manual" && initial?.nativePrice != null ? String(initial.nativePrice) : "");
  const { t } = useLang();

  useEffect(() => {
    if (open) {
      setTicker(initial?.ticker || "");
      setMarket(initial?.market || "US");
      setUnits(initial?.units != null ? String(initial.units) : "");
      setAvgCost(initial?.avgCost != null ? String(initial.avgCost) : "");
      setTag(initial?.tag || "");
      setBroker(initial?.broker || "");
      setManualMode(initial?.priceSource === "manual");
      setManualPrice(initial?.priceSource === "manual" && initial?.nativePrice != null ? String(initial.nativePrice) : "");
    }
  }, [open, initial]);

  if (!open) return null;

  const cleanTicker = normalizeTicker(ticker, market);
  const canSave = cleanTicker.length > 0 && units.trim().length > 0 && !isNaN(Number(units)) && Number(units) > 0
    && (!manualMode || (manualPrice.trim().length > 0 && !isNaN(Number(manualPrice)) && Number(manualPrice) > 0));
  const currency = MARKETS[market].currency;
  const autoPrice = initial?.ticker === cleanTicker ? initial.nativePrice : seedPriceFor(cleanTicker || "?");
  const previewPrice = manualMode ? (Number(manualPrice) || 0) : autoPrice;
  const tagChips = Array.from(new Set([...SUGGESTED_STOCK_TAGS, ...(existingTags || [])]));
  const brokerChips = Array.from(new Set([...SUGGESTED_BROKERS, ...(existingBrokers || [])]));

  const handleSave = () => {
    const nativePrice = manualMode
      ? Number(manualPrice)
      : (initial?.ticker === cleanTicker && initial?.nativePrice ? initial.nativePrice : seedPriceFor(cleanTicker));
    onSave({
      id: initial?.id || uid(),
      categoryId,
      isStock: true,
      ticker: cleanTicker,
      market,
      currency,
      units: Number(units),
      avgCost: avgCost.trim() ? Number(avgCost) : undefined,
      tag: tag.trim() || undefined,
      broker: broker.trim() || undefined,
      nativePrice,
      priceSource: manualMode ? "manual" : initial?.priceSource,
      value: stockUsdValue(nativePrice, Number(units), currency, rates),
      updatedAt: todayISO(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(18,33,61,0.35)" }} onClick={onClose}>
      <div className="w-full max-w-md rounded-t-2xl p-5 pb-6" style={{ background: COLORS.surface, maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <span style={{ fontFamily: "Fraunces, serif", fontSize: 19, color: COLORS.ink }}>{initial ? t("editHolding") : t("addStockHolding")}</span>
          <button onClick={onClose} aria-label="Close"><X size={20} color={COLORS.inkSoft} /></button>
        </div>

        <div className="flex gap-2 mb-3">
          {Object.entries(MARKETS).map(([key, m]) => (
            <button key={key} onClick={() => setMarket(key)} className="flex-1 py-2 rounded-lg"
              style={{ fontFamily: "Inter", fontSize: 13, fontWeight: 600, border: `1px solid ${market === key ? COLORS.ink : COLORS.rule}`, background: market === key ? COLORS.ink : "transparent", color: market === key ? "#fff" : COLORS.ink }}>
              {t("marketSlashCurrency", m.label, m.currency)}
            </button>
          ))}
        </div>

        <label style={{ fontFamily: "Inter", fontSize: 12, color: COLORS.inkSoft }}>
          {t("ticker")}
        </label>
        <input value={ticker} onChange={(e) => setTicker(e.target.value.toUpperCase())} placeholder={market === "US" ? "e.g. TSLA" : "e.g. 0700"}
          className="w-full mt-1 mb-1 px-3 py-2 rounded-lg" style={{ fontFamily: "IBM Plex Mono", fontSize: 14, border: `1px solid ${COLORS.rule}`, color: COLORS.ink }} />
        {market === "HK" && ticker.trim() && (
          <div style={{ fontFamily: "Inter", fontSize: 11, color: COLORS.inkSoft, marginBottom: 12 }}>{t("willSyncAs", `${cleanTicker}.HK`)}</div>
        )}
        {!(market === "HK" && ticker.trim()) && <div style={{ marginBottom: 12 }} />}

        <label style={{ fontFamily: "Inter", fontSize: 12, color: COLORS.inkSoft }}>{t("tag")}</label>
        <input value={tag} onChange={(e) => setTag(e.target.value)}
          className="w-full mt-1 mb-2 px-3 py-2 rounded-lg" style={{ fontFamily: "Inter", fontSize: 13.5, border: `1px solid ${COLORS.rule}`, color: COLORS.ink }} />
        {tagChips.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mb-3">
            {tagChips.map((tg) => (
              <button key={tg} onClick={() => setTag(tg === tag ? "" : tg)} className="px-2.5 py-1 rounded-full"
                style={{ fontFamily: "Inter", fontSize: 11.5, fontWeight: 500, border: `1px solid ${tag === tg ? COLORS.ink : COLORS.rule}`, background: tag === tg ? COLORS.ink : "transparent", color: tag === tg ? "#fff" : COLORS.ink }}>
                {tg}
              </button>
            ))}
          </div>
        )}

        <label style={{ fontFamily: "Inter", fontSize: 12, color: COLORS.inkSoft }}>{t("broker")}</label>
        <input value={broker} onChange={(e) => setBroker(e.target.value)}
          className="w-full mt-1 mb-2 px-3 py-2 rounded-lg" style={{ fontFamily: "Inter", fontSize: 13.5, border: `1px solid ${COLORS.rule}`, color: COLORS.ink }} />
        {brokerChips.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mb-3">
            {brokerChips.map((bk) => (
              <button key={bk} onClick={() => setBroker(bk === broker ? "" : bk)} className="px-2.5 py-1 rounded-full"
                style={{ fontFamily: "Inter", fontSize: 11.5, fontWeight: 500, border: `1px solid ${broker === bk ? COLORS.ink : COLORS.rule}`, background: broker === bk ? COLORS.ink : "transparent", color: broker === bk ? "#fff" : COLORS.ink }}>
                {bk}
              </button>
            ))}
          </div>
        )}

        <label style={{ fontFamily: "Inter", fontSize: 12, color: COLORS.inkSoft }}>{t("unitsLabel")}</label>
        <input value={units} onChange={(e) => setUnits(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="0" inputMode="decimal"
          className="w-full mt-1 mb-3 px-3 py-2 rounded-lg" style={{ fontFamily: "IBM Plex Mono", fontSize: 15, border: `1px solid ${COLORS.rule}`, color: COLORS.ink }} />

        <label style={{ fontFamily: "Inter", fontSize: 12, color: COLORS.inkSoft }}>{t("avgCost", currency)}</label>
        <input value={avgCost} onChange={(e) => setAvgCost(e.target.value.replace(/[^0-9.]/g, ""))} inputMode="decimal"
          className="w-full mt-1 mb-3 px-3 py-2 rounded-lg" style={{ fontFamily: "IBM Plex Mono", fontSize: 14, border: `1px solid ${COLORS.rule}`, color: COLORS.ink }} />

        <div className="flex items-center justify-between mb-2">
          <label style={{ fontFamily: "Inter", fontSize: 12, color: COLORS.inkSoft }}>{t("priceSource")}</label>
          <div className="flex rounded-full overflow-hidden" style={{ border: `1px solid ${COLORS.rule}` }}>
            <button onClick={() => setManualMode(false)} className="px-2.5 py-1"
              style={{ fontFamily: "Inter", fontSize: 11, fontWeight: 600, background: !manualMode ? COLORS.ink : "transparent", color: !manualMode ? "#fff" : COLORS.inkSoft }}>
              {t("autoSync")}
            </button>
            <button onClick={() => setManualMode(true)} className="px-2.5 py-1"
              style={{ fontFamily: "Inter", fontSize: 11, fontWeight: 600, background: manualMode ? COLORS.ink : "transparent", color: manualMode ? "#fff" : COLORS.inkSoft }}>
              {t("manual")}
            </button>
          </div>
        </div>

        {manualMode ? (
          <>
            <input value={manualPrice} onChange={(e) => setManualPrice(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="0" inputMode="decimal"
              className="w-full mt-1 mb-1 px-3 py-2 rounded-lg" style={{ fontFamily: "IBM Plex Mono", fontSize: 15, border: `1px solid ${COLORS.rule}`, color: COLORS.ink }} />
            <div style={{ fontFamily: "Inter", fontSize: 11, color: COLORS.inkSoft, marginBottom: 12 }}>
              {t("manualPriceHint", currency)}
            </div>
          </>
        ) : (
          cleanTicker && (
            <div className="rounded-lg px-3 py-2.5 mb-5" style={{ background: COLORS.bg, fontFamily: "Inter", fontSize: 12.5, color: COLORS.inkSoft }}>
              {t("currentPricePrefix", `${CURRENCY_SYMBOL[currency]}${fmtMoney(previewPrice)}`)}
              <span style={{ fontFamily: "IBM Plex Mono", color: COLORS.ink }}>{CURRENCY_SYMBOL[currency]}{fmtMoney(previewPrice * (Number(units) || 0))}</span>
            </div>
          )
        )}

        {!manualMode && initial && diagnostics && (
          <div className="rounded-lg px-3 py-2.5 mb-5" style={{ border: `1px solid ${COLORS.rule}` }}>
            <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 11.5, color: COLORS.ink, marginBottom: 6 }}>
              {t("lastSyncAttempt", diagnostics.at)}
            </div>
            {diagnostics.attempts.map((a) => (
              <div key={a.source} className="flex items-center justify-between" style={{ padding: "2px 0" }}>
                <span style={{ fontFamily: "Inter", fontSize: 11.5, color: COLORS.inkSoft }}>{a.source}</span>
                <span style={{ fontFamily: "Inter", fontSize: 11.5, color: a.detail === "OK" ? COLORS.sage : COLORS.inkSoft }}>{a.detail}</span>
              </div>
            ))}
            {!diagnostics.attempts.some((a) => a.detail === "OK") && (
              <div style={{ fontFamily: "Inter", fontSize: 11, color: COLORS.inkSoft, marginTop: 6, lineHeight: 1.4 }}>
                {t("allFailedHint")}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          {initial && (
            <button onClick={() => onDelete(categoryId, initial.id)} className="flex items-center justify-center rounded-lg px-4 py-2.5"
              style={{ border: `1px solid ${COLORS.rule}`, color: COLORS.clay }}>
              <Trash2 size={16} />
            </button>
          )}
          <button disabled={!canSave} onClick={handleSave} className="flex-1 rounded-lg py-2.5"
            style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 14, color: "#fff", background: canSave ? COLORS.ink : COLORS.rule }}>
            {t("saveHolding")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- settings modal (Finnhub API key + theme) -----------------------------
function SettingsModal({ open, onClose, apiKey, onSave, allTickToken, onSaveAllTick, themeId, onOpenTheme, categories, hiddenCategoryIds, onUnhide, lang, onSetLang }) {
  const [draft, setDraft] = useState(apiKey || "");
  const [allTickDraft, setAllTickDraft] = useState(allTickToken || "");
  const { t } = useLang();
  useEffect(() => { if (open) { setDraft(apiKey || ""); setAllTickDraft(allTickToken || ""); } }, [open, apiKey, allTickToken]);
  if (!open) return null;
  const theme = themeById(themeId);
  const hidden = (categories || []).filter((c) => hiddenCategoryIds?.includes(c.id));

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(18,33,61,0.35)" }} onClick={onClose}>
      <div className="w-full max-w-md rounded-t-2xl p-5 pb-6" style={{ background: COLORS.surface, maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <span style={{ fontFamily: "Fraunces, serif", fontSize: 19, color: COLORS.ink }}>{t("settings")}</span>
          <button onClick={onClose} aria-label="Close"><X size={20} color={COLORS.inkSoft} /></button>
        </div>

        <div className="flex items-center justify-between px-3 py-2.5 rounded-lg mb-3" style={{ border: `1px solid ${COLORS.rule}` }}>
          <span style={{ fontFamily: "Inter", fontSize: 13.5, color: COLORS.ink }}>{t("language")}</span>
          <div className="flex rounded-full overflow-hidden" style={{ border: `1px solid ${COLORS.rule}` }}>
            <button onClick={() => onSetLang("en")} className="px-2.5 py-1"
              style={{ fontFamily: "Inter", fontSize: 11.5, fontWeight: 600, background: lang === "en" ? COLORS.ink : "transparent", color: lang === "en" ? "#fff" : COLORS.inkSoft }}>
              English
            </button>
            <button onClick={() => onSetLang("zh")} className="px-2.5 py-1"
              style={{ fontFamily: "Inter", fontSize: 11.5, fontWeight: 600, background: lang === "zh" ? COLORS.ink : "transparent", color: lang === "zh" ? "#fff" : COLORS.inkSoft }}>
              繁體中文
            </button>
          </div>
        </div>

        <button onClick={onOpenTheme} className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg mb-4"
          style={{ border: `1px solid ${COLORS.rule}` }}>
          <span style={{ fontFamily: "Inter", fontSize: 13.5, color: COLORS.ink }}>{t("themeColor")}</span>
          <div className="flex items-center gap-2">
            <div className="flex" style={{ borderRadius: 999, overflow: "hidden" }}>
              {theme.colors.map((c, i) => <span key={i} style={{ width: 14, height: 14, background: c, marginLeft: i ? -4 : 0 }} />)}
            </div>
            <span style={{ fontFamily: "Inter", fontSize: 12.5, color: COLORS.inkSoft }}>{theme.name}</span>
            <ChevronRight size={14} color={COLORS.inkSoft} />
          </div>
        </button>

        {hidden.length > 0 && (
          <div className="mb-4">
            <label style={{ fontFamily: "Inter", fontSize: 12, color: COLORS.inkSoft }}>{t("hiddenCategories")}</label>
            <div className="rounded-lg overflow-hidden mt-1" style={{ border: `1px solid ${COLORS.rule}` }}>
              {hidden.map((c) => (
                <div key={c.id} className="flex items-center justify-between px-3 py-2.5" style={{ borderBottom: `1px solid ${COLORS.rule}` }}>
                  <span style={{ fontFamily: "Inter", fontSize: 13, color: COLORS.ink }}>{catLabel(c, t)}</span>
                  <button onClick={() => onUnhide(c.id)} style={{ fontFamily: "Inter", fontSize: 12, fontWeight: 600, color: COLORS.slate }}>{t("show")}</button>
                </div>
              ))}
            </div>
          </div>
        )}

        <label style={{ fontFamily: "Inter", fontSize: 12, color: COLORS.inkSoft }}>{t("finnhubKey")}</label>
        {!apiKey && SHARED_FINNHUB_KEY && (
          <div style={{ fontFamily: "Inter", fontSize: 11, color: COLORS.sage, marginTop: 2, marginBottom: 4 }}>{t("usingSharedKey")}</div>
        )}
        <input value={draft} onChange={(e) => setDraft(e.target.value.trim())} placeholder={t("finnhubPh")}
          className="w-full mt-1 mb-2 px-3 py-2 rounded-lg" style={{ fontFamily: "IBM Plex Mono", fontSize: 13, border: `1px solid ${COLORS.rule}`, color: COLORS.ink }} />
        <div className="flex gap-2 mb-4">
          {apiKey && (
            <button onClick={() => onSave("")} className="flex items-center justify-center rounded-lg px-3 py-2"
              style={{ border: `1px solid ${COLORS.rule}`, color: COLORS.clay, fontFamily: "Inter", fontSize: 12.5 }}>
              {t("remove")}
            </button>
          )}
          <button onClick={() => onSave(draft)} className="flex-1 rounded-lg py-2"
            style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 12.5, color: "#fff", background: COLORS.ink }}>
            {t("saveFinnhub")}
          </button>
        </div>

        <label style={{ fontFamily: "Inter", fontSize: 12, color: COLORS.inkSoft }}>{t("alltickToken")}</label>
        <input value={allTickDraft} onChange={(e) => setAllTickDraft(e.target.value.trim())} placeholder={t("alltickPh")}
          className="w-full mt-1 mb-2 px-3 py-2 rounded-lg" style={{ fontFamily: "IBM Plex Mono", fontSize: 13, border: `1px solid ${COLORS.rule}`, color: COLORS.ink }} />
        <div className="flex gap-2 mb-4">
          {allTickToken && (
            <button onClick={() => onSaveAllTick("")} className="flex items-center justify-center rounded-lg px-3 py-2"
              style={{ border: `1px solid ${COLORS.rule}`, color: COLORS.clay, fontFamily: "Inter", fontSize: 12.5 }}>
              {t("remove")}
            </button>
          )}
          <button onClick={() => onSaveAllTick(allTickDraft)} className="flex-1 rounded-lg py-2"
            style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 12.5, color: "#fff", background: COLORS.ink }}>
            {t("saveAlltick")}
          </button>
        </div>

        <p style={{ fontFamily: "Inter", fontSize: 11.5, color: COLORS.inkSoft, lineHeight: 1.5, marginBottom: 16 }}>
          {t("settingsCopy")}
        </p>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-lg py-2.5"
            style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 14, color: "#fff", background: COLORS.ink }}>
            {t("done")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- theme color picker ---------------------------------------------------
function ThemeModal({ open, onClose, themeId, onSelect, iconThemed, onToggleIcon }) {
  const { t } = useLang();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(18,33,61,0.35)" }} onClick={onClose}>
      <div className="w-full max-w-md rounded-t-2xl p-5 pb-6" style={{ background: COLORS.surface, maxHeight: "80vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <span style={{ fontFamily: "Fraunces, serif", fontSize: 19, color: COLORS.ink }}>{t("chooseTheme")}</span>
          <button onClick={onClose} aria-label="Close"><X size={20} color={COLORS.inkSoft} /></button>
        </div>

        <div className="rounded-xl overflow-hidden mb-4" style={{ border: `1px solid ${COLORS.rule}` }}>
          {THEMES.map((th) => {
            const active = th.id === themeId;
            return (
              <button key={th.id} onClick={() => onSelect(th.id)} className="w-full flex items-center px-3 py-3"
                style={{ borderBottom: `1px solid ${COLORS.rule}`, background: COLORS.bg }}>
                <div className="flex" style={{ marginRight: 14 }}>
                  {th.colors.map((c, i) => (
                    <span key={i} style={{ width: 30, height: 30, borderRadius: 999, background: c, marginLeft: i ? -12 : 0, border: "2px solid " + COLORS.bg }} />
                  ))}
                </div>
                <span style={{ fontFamily: "Inter", fontSize: 14.5, color: COLORS.ink, flex: 1, textAlign: "left" }}>{th.name}</span>
                {active && (
                  <span className="flex items-center justify-center rounded-full" style={{ width: 22, height: 22, background: COLORS.sage }}>
                    <Check size={13} color="#fff" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <button onClick={onToggleIcon} className="w-full flex items-center justify-between px-1">
          <div style={{ textAlign: "left" }}>
            <div style={{ fontFamily: "Inter", fontSize: 13.5, color: COLORS.ink }}>{t("dontUseThemeIcon")}</div>
            <div style={{ fontFamily: "Inter", fontSize: 11, color: COLORS.inkSoft, marginTop: 1, maxWidth: 260 }}>
              {t("dontUseThemeIconHint")}
            </div>
          </div>
          <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
            <div className="flex items-center justify-center rounded-lg" style={{
              width: 34, height: 34,
              background: iconThemed ? `linear-gradient(135deg, ${themeById(themeId).colors[1]}, ${themeById(themeId).colors[0]})` : COLORS.rule,
            }}>
              <span style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 13, color: iconThemed ? "#fff" : COLORS.inkSoft }}>%</span>
            </div>
            <span className="flex items-center justify-center rounded-full" style={{ width: 20, height: 20, border: `1px solid ${COLORS.rule}` }}>
              {!iconThemed && <Check size={12} color={COLORS.ink} />}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}

// ---- share card (renders as one SVG so it can be rasterized to PNG) ------
function pseudoGrid(seed, n = 7) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const cells = [];
  for (let i = 0; i < n * n; i++) {
    h = (h ^ (h << 13)) >>> 0; h = (h ^ (h >>> 17)) >>> 0; h = (h ^ (h << 5)) >>> 0;
    cells.push(h % 3 !== 0);
  }
  return cells;
}

function ShareCardModal({ open, onClose, brandColor, title, periodLabel, narrativeLines, legend, chartData, seriesKeys, currencySymbol }) {
  const { t } = useLang();
  const svgRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  if (!open) return null;

  const W = 900, H = 1300, CARD = { x: 56, y: 170, w: 788, h: 720, r: 36 };
  const chartX = CARD.x + 54, chartW = CARD.w - 108, chartY = CARD.y + 330, chartH = 260;
  const allVals = chartData.flatMap((d) => seriesKeys.map((s) => d[s.key] ?? 0));
  const maxVal = Math.max(1, ...allVals);
  const niceMax = Math.pow(10, Math.floor(Math.log10(maxVal))) * Math.ceil(maxVal / Math.pow(10, Math.floor(Math.log10(maxVal))));
  const yFor = (v) => chartY + chartH - (v / niceMax) * chartH;
  const grid = pseudoGrid(title + periodLabel);

  const handleDownload = () => {
    setDownloading(true);
    const svgEl = svgRef.current;
    const svgStr = new XMLSerializer().serializeToString(svgEl);
    const dataUrl = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgStr)));
    const img = new Image();
    img.onload = () => {
      const scale = 2;
      const canvas = document.createElement("canvas");
      canvas.width = W * scale;
      canvas.height = H * scale;
      const ctx = canvas.getContext("2d");
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0, W, H);
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${title.toLowerCase().replace(/\s+/g, "-")}-share.png`;
        a.click();
        URL.revokeObjectURL(url);
        setDownloading(false);
      });
    };
    img.onerror = () => setDownloading(false);
    img.src = dataUrl;
  };

  const barMode = seriesKeys.length === 1;
  const barW = Math.min(64, (chartW / Math.max(1, chartData.length)) * 0.5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(18,33,61,0.55)" }} onClick={onClose}>
      <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", maxWidth: 380, width: "100%", maxHeight: "92vh", display: "flex", flexDirection: "column" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${COLORS.rule}` }}>
          <span style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 14, color: COLORS.ink }}>{t("shareTitle")}</span>
          <button onClick={onClose} aria-label="Close"><X size={18} color={COLORS.inkSoft} /></button>
        </div>

        <div style={{ overflowY: "auto", padding: 16 }}>
          <svg ref={svgRef} width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", borderRadius: 12, display: "block" }}>
            <rect x="0" y="0" width={W} height={H} fill="#ffffff" />
            <rect x="0" y="0" width={W} height={1150} fill={brandColor} />
            <text x={W / 2} y="100" textAnchor="middle" fontFamily="Georgia, serif" fontSize="46" fill="#1a1a1a">{title}</text>

            <rect x={CARD.x} y={CARD.y} width={CARD.w} height={CARD.h} rx={CARD.r} fill="#ffffff" />
            <text x={CARD.x + 54} y={CARD.y + 66} fontFamily="Arial, sans-serif" fontSize="24" fill="#3a3a3a">{periodLabel}</text>
            {narrativeLines.map((line, i) => (
              <text key={i} x={CARD.x + 54} y={CARD.y + 116 + i * 40} fontFamily="Arial, sans-serif" fontSize="27" fontWeight="600" fill="#141414">{line}</text>
            ))}

            {legend.map((l, i) => (
              <g key={l.label} transform={`translate(${CARD.x + 54 + i * 230}, ${CARD.y + 116 + narrativeLines.length * 40 + 30})`}>
                <rect x="0" y="0" width="20" height="20" rx="4" fill={l.color} />
                <text x="30" y="16" fontFamily="Arial, sans-serif" fontSize="20" fill="#333">{l.label}</text>
              </g>
            ))}

            {[0, 0.25, 0.5, 0.75, 1].map((f) => (
              <g key={f}>
                <line x1={chartX} x2={chartX + chartW} y1={chartY + chartH * (1 - f)} y2={chartY + chartH * (1 - f)} stroke="#e6e6e6" strokeWidth="1" />
                <text x={chartX - 10} y={chartY + chartH * (1 - f) + 5} textAnchor="end" fontFamily="Arial, sans-serif" fontSize="15" fill="#999">
                  {f === 0 ? "0" : `${Math.round((niceMax * f) / 1000)}k`}
                </text>
              </g>
            ))}
            <line x1={chartX} x2={chartX + chartW} y1={chartY + chartH} y2={chartY + chartH} stroke="#1a1a1a" strokeWidth="2" />

            {barMode
              ? chartData.map((d, i) => {
                  const cx = chartX + ((i + 0.5) / chartData.length) * chartW;
                  const v = d[seriesKeys[0].key] ?? 0;
                  const y = yFor(Math.max(0, v));
                  return <rect key={i} x={cx - barW / 2} y={y} width={barW} height={chartY + chartH - y} rx="4" fill={seriesKeys[0].color} />;
                })
              : seriesKeys.map((s) => {
                  const pts = chartData.map((d, i) => `${chartX + ((i + 0.5) / chartData.length) * chartW},${yFor(d[s.key] ?? 0)}`).join(" ");
                  return <polyline key={s.key} points={pts} fill="none" stroke={s.color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />;
                })}

            {chartData.map((d, i) => (
              <text key={i} x={chartX + ((i + 0.5) / chartData.length) * chartW} y={chartY + chartH + 28} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="16" fill="#999">{d.label}</text>
            ))}

            <text x={56} y="1220" fontFamily="Georgia, serif" fontWeight="700" fontSize="34" fill="#141414">{APP_NAME}</text>
            <text x={56} y="1256" fontFamily="Arial, sans-serif" fontSize="20" fill="#666">{APP_TAGLINE}</text>
            <g transform={`translate(${W - 56 - 90}, 1180)`}>
              <rect x="0" y="0" width="90" height="90" rx="8" fill="none" stroke="#ddd" strokeWidth="2" />
              {grid.map((on, i) => {
                const n = 7, cell = 90 / n;
                const gx = i % n, gy = Math.floor(i / n);
                return on ? <rect key={i} x={gx * cell + 2} y={gy * cell + 2} width={cell - 4} height={cell - 4} fill="#141414" /> : null;
              })}
            </g>
          </svg>
        </div>

        <div className="px-4 pb-4 pt-1">
          <button onClick={handleDownload} disabled={downloading} className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5"
            style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 14, color: "#fff", background: COLORS.ink }}>
            <Download size={15} /> {downloading ? t("preparing") : t("saveImage")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- more menu (Refresh all / History / Search / Settings) --------------
function MenuSheet({ open, onClose, onRefreshAll, onHistory, onSearch, onShare, onSettings }) {
  const { t } = useLang();
  if (!open) return null;
  const items = [
    { icon: RefreshCw, label: t("menuRefresh"), onClick: onRefreshAll },
    { icon: HistoryIcon, label: t("menuHistory"), onClick: onHistory },
    { icon: SearchIcon, label: t("menuSearch"), onClick: onSearch },
    { icon: Share2, label: t("menuShare"), onClick: onShare },
    { icon: Settings2, label: t("menuSettings"), onClick: onSettings },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(18,33,61,0.35)" }} onClick={onClose}>
      <div className="w-full max-w-md rounded-t-2xl py-2 pb-6" style={{ background: COLORS.surface }} onClick={(e) => e.stopPropagation()}>
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <button key={it.label} onClick={() => { it.onClick(); onClose(); }} className="w-full flex items-center gap-3 px-5 py-3.5"
              style={{ borderBottom: `1px solid ${COLORS.rule}` }}>
              <Icon size={17} color={COLORS.inkSoft} />
              <span style={{ fontFamily: "Inter", fontSize: 14.5, color: COLORS.ink }}>{it.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---- history modal (activity log) ----------------------------------------
function HistoryModal({ open, onClose, activities }) {
  const { t } = useLang();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(18,33,61,0.35)" }} onClick={onClose}>
      <div className="w-full max-w-md rounded-t-2xl p-5 pb-6" style={{ background: COLORS.surface, maxHeight: "70vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <span style={{ fontFamily: "Fraunces, serif", fontSize: 19, color: COLORS.ink }}>{t("historyTitle")}</span>
          <button onClick={onClose} aria-label="Close"><X size={20} color={COLORS.inkSoft} /></button>
        </div>
        {activities.length === 0 ? (
          <p style={{ fontFamily: "Inter", fontSize: 13, color: COLORS.inkSoft }}>{t("noActivity")}</p>
        ) : (
          <div>
            {activities.map((a) => (
              <div key={a.id} className="flex items-start justify-between py-2.5" style={{ borderBottom: `1px solid ${COLORS.rule}` }}>
                <span style={{ fontFamily: "Inter", fontSize: 13, color: COLORS.ink, paddingRight: 12 }}>{a.text}</span>
                <span style={{ fontFamily: "IBM Plex Mono", fontSize: 10.5, color: COLORS.inkSoft, whiteSpace: "nowrap" }}>{fmtDateTime(a.ts)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---- search modal ---------------------------------------------------------
function SearchModal({ open, onClose, categories, formatDisplay, onSelect }) {
  const [q, setQ] = useState("");
  const { t } = useLang();
  useEffect(() => { if (open) setQ(""); }, [open]);
  if (!open) return null;

  const flat = categories.flatMap((c) => c.accounts.map((a) => ({ ...a, categoryId: c.id, categoryName: catLabel(c, t), categoryColor: c.color })));
  const needle = q.trim().toLowerCase();
  const filtered = needle
    ? flat.filter((a) => (a.isStock ? a.ticker : a.name).toLowerCase().includes(needle) || (a.note || "").toLowerCase().includes(needle))
    : flat;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center" style={{ background: COLORS.bg }} onClick={onClose}>
      <div className="w-full max-w-md p-5" style={{ maxWidth: 430 }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("searchPh")}
            className="flex-1 px-3 py-2.5 rounded-lg"
            style={{ fontFamily: "Inter", fontSize: 14, border: `1px solid ${COLORS.rule}`, color: COLORS.ink, background: COLORS.surface }}
          />
          <button onClick={onClose} style={{ fontFamily: "Inter", fontSize: 13.5, color: COLORS.inkSoft }}>{t("cancel")}</button>
        </div>

        {filtered.length === 0 ? (
          <p style={{ fontFamily: "Inter", fontSize: 13, color: COLORS.inkSoft }}>{t("noResultsFor", q)}</p>
        ) : (
          <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${COLORS.rule}`, background: COLORS.surface }}>
            {filtered.map((a) => (
              <button key={a.id} onClick={() => { onSelect(a); onClose(); }} className="w-full flex items-center justify-between px-4 py-3 text-left"
                style={{ borderBottom: `1px solid ${COLORS.rule}` }}>
                <div>
                  <div style={{ fontFamily: a.isStock ? "IBM Plex Mono" : "Inter", fontSize: 13.5, color: COLORS.ink }}>{a.isStock ? a.ticker : a.name}</div>
                  <div style={{ fontFamily: "Inter", fontSize: 11.5, color: COLORS.inkSoft }}>{a.categoryName}</div>
                </div>
                <span style={{ fontFamily: "IBM Plex Mono", fontSize: 13, color: COLORS.ink }}>{formatDisplay(a.value)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---- category card ---------------------------------------------------
function CategoryCard({ category, theme, formatDisplay, onRowClick, onAdd, onAddStock, onHide }) {
  const [expanded, setExpanded] = useState(false);
  const { t } = useLang();
  const subtotal = category.accounts.reduce((s, a) => s + a.value, 0);
  const lastUpdated = category.accounts.reduce((latest, a) => (a.updatedAt > latest ? a.updatedAt : latest), category.accounts[0]?.updatedAt || todayISO());
  const color = categoryColor(category, theme);
  const isEmpty = category.accounts.length === 0;
  const Icon = CATEGORY_ICON[category.id] || Wallet;
  const name = catLabel(category, t);

  return (
    <div className="rounded-xl overflow-hidden mb-3" style={{ background: COLORS.surface, border: `1px solid ${COLORS.rule}` }}>
      <div className="w-full flex items-stretch text-left" onClick={() => setExpanded((e) => !e)} role="button" tabIndex={0} style={{ background: color + "12" }}>
        <div style={{ width: 4, background: color }} />
        <div className="flex-1 flex items-center gap-3 px-4 py-3.5">
          <span className="flex items-center justify-center rounded-full" style={{ width: 34, height: 34, background: color + "26", flexShrink: 0 }}>
            <Icon size={16} color={color} />
          </span>
          <div className="flex-1 flex items-center justify-between">
            <div>
              <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 14.5, color: COLORS.ink }}>{name}</div>
              <div style={{ fontFamily: "Inter", fontSize: 12, color: COLORS.inkSoft, marginTop: 2 }}>
                {t("accounts", category.accounts.length)} · {t("updated", fmtDateShort(lastUpdated))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isEmpty && onHide && (
                <button onClick={(e) => { e.stopPropagation(); onHide(category.id); }} aria-label={t("removeCategory", name)}
                  className="flex items-center justify-center rounded-full" style={{ width: 22, height: 22, border: `1px solid ${COLORS.rule}`, background: COLORS.surface }}>
                  <X size={12} color={COLORS.inkSoft} />
                </button>
              )}
              <span style={{ fontFamily: "IBM Plex Mono", fontSize: 15.5, color: category.type === "liability" ? COLORS.clay : COLORS.ink }}>
                {category.type === "liability" ? "\u2212" : ""}{formatDisplay(subtotal)}
              </span>
              <ChevronRight size={16} color={COLORS.inkSoft} style={{ transform: expanded ? "rotate(90deg)" : "none", transition: "transform 150ms" }} />
            </div>
          </div>
        </div>
      </div>

      {expanded && (
        <div style={{ borderTop: `1px solid ${COLORS.rule}` }}>
          {(() => {
            const renderRow = (a) => {
              const gainPct = a.isStock && a.avgCost ? ((a.nativePrice - a.avgCost) / a.avgCost) * 100 : null;
              const activeRecurrences = (a.recurrences || []).filter((r) => !r.paused).length;
              return (
                <button key={a.id} onClick={() => onRowClick(category.id, a)} className="w-full flex items-center justify-between px-4 py-3 text-left"
                  style={{ borderBottom: `1px solid ${COLORS.rule}`, borderLeft: a.isStock ? `3px solid ${MARKETS[a.market].color}` : "3px solid transparent" }}>
                  <div>
                    {a.isStock ? (
                      <>
                        <div className="flex items-center gap-1.5" style={{ fontFamily: "IBM Plex Mono", fontWeight: 500, fontSize: 13.5, color: COLORS.ink }}>
                          {a.ticker}
                          <span style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 10.5, color: MARKETS[a.market].color, background: MARKETS[a.market].color + "1A", borderRadius: 4, padding: "1px 5px" }}>
                            {MARKETS[a.market].label}
                          </span>
                          {a.tag && (
                            <span style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 10.5, color: tagColor(a.tag, color), background: tagColor(a.tag, color) + "1A", borderRadius: 4, padding: "1px 5px" }}>
                              {a.tag}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5" style={{ fontFamily: "Inter", fontSize: 11.5, color: COLORS.inkSoft }}>
                          <span title={a.priceSource === "live" ? t("liveFrom", a.priceSourceName || "market feed") : a.priceSource === "manual" ? t("manualPrice") : t("simulatedPrice")}
                            style={{ width: 6, height: 6, borderRadius: 999, display: "inline-block", background: a.priceSource === "live" ? COLORS.sage : a.priceSource === "manual" ? COLORS.amber : COLORS.rule }} />
                          {t("units", a.units)} @ {CURRENCY_SYMBOL[a.currency]}{a.nativePrice.toFixed(2)}
                          {gainPct != null && (
                            <span className="flex items-center gap-0.5" style={{ color: gainPct >= 0 ? COLORS.sage : COLORS.clay, fontFamily: "IBM Plex Mono" }}>
                              {gainPct >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                              {Math.abs(gainPct).toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-1.5" style={{ fontFamily: "Inter", fontSize: 13.5, color: COLORS.ink }}>
                          {(() => { const info = subtypeInfo(category.id, a.subtype); const SIcon = info?.icon; return SIcon ? <SIcon size={12} color={color} /> : null; })()}
                          {a.name}
                          {activeRecurrences > 0 && <Repeat size={11} color={COLORS.inkSoft} title={t("autoTxIcon", activeRecurrences)} />}
                        </div>
                        <div style={{ fontFamily: "Inter", fontSize: 11.5, color: COLORS.inkSoft }}>
                          {a.note}{a.note && a.currency && a.currency !== "USD" ? " · " : ""}
                          {a.currency && a.currency !== "USD" && `${CURRENCY_SYMBOL[a.currency]}${fmtMoney(a.nativeValue ?? a.value)}`}
                        </div>
                      </>
                    )}
                  </div>
                  <span style={{ fontFamily: "IBM Plex Mono", fontSize: 13.5, color: COLORS.ink }}>{formatDisplay(a.value)}</span>
                </button>
              );
            };

            if (category.id !== "invest") return category.accounts.map(renderRow);

            const hasBrokers = category.accounts.some((a) => a.broker);
            if (!hasBrokers) return category.accounts.map(renderRow);

            const groups = new Map();
            category.accounts.forEach((a) => {
              const key = a.broker || t("unassignedBroker");
              if (!groups.has(key)) groups.set(key, []);
              groups.get(key).push(a);
            });
            const unassignedLabel = t("unassignedBroker");
            const orderedBrokers = [...groups.keys()].sort((x, y) => (x === unassignedLabel ? 1 : y === unassignedLabel ? -1 : x.localeCompare(y)));

            return orderedBrokers.map((brokerName) => {
              const rows = groups.get(brokerName);
              const groupSubtotal = rows.reduce((s, a) => s + a.value, 0);
              return (
                <div key={brokerName}>
                  <div className="flex items-center justify-between px-4 py-1.5" style={{ background: COLORS.bg }}>
                    <span style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 11, color: COLORS.inkSoft, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      {brokerName} · {rows.length}
                    </span>
                    <span style={{ fontFamily: "IBM Plex Mono", fontSize: 11.5, color: COLORS.inkSoft }}>{formatDisplay(groupSubtotal)}</span>
                  </div>
                  {rows.map(renderRow)}
                </div>
              );
            });
          })()}
          <div className="flex" style={{ borderTop: `1px solid ${COLORS.rule}` }}>
            {category.id === "invest" ? (
              <>
                <button onClick={() => onAddStock(category.id)} className="flex-1 flex items-center gap-2 px-4 py-3" style={{ fontFamily: "Inter", fontSize: 13, color }}>
                  <TrendingUp size={14} /> {t("addStocks")}
                </button>
                <button onClick={() => onAdd(category.id, "treasury")} className="flex-1 flex items-center gap-2 px-4 py-3"
                  style={{ fontFamily: "Inter", fontSize: 13, color, borderLeft: `1px solid ${COLORS.rule}` }}>
                  <Landmark size={14} /> {t("addTreasuries")}
                </button>
              </>
            ) : (
              <button onClick={() => onAdd(category.id)} className="flex-1 flex items-center gap-2 px-4 py-3" style={{ fontFamily: "Inter", fontSize: 13, color }}>
                <Plus size={14} /> {t("addAccount")}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---- distribution tab ---------------------------------------------------
function DistributionView({ categories, theme }) {
  const { t } = useLang();
  const assetCats = categories.filter((c) => c.type === "asset");
  const totalAssets = assetCats.reduce((s, c) => s + c.accounts.reduce((a, x) => a + x.value, 0), 0) || 1;
  const liabilityCats = categories.filter((c) => c.type === "liability");
  const totalLiability = liabilityCats.reduce((s, c) => s + c.accounts.reduce((a, x) => a + x.value, 0), 0);

  return (
    <div>
      <div style={{ fontFamily: "Inter", fontSize: 12, color: COLORS.inkSoft, marginBottom: 10 }}>{t("grossAssetsShare")}</div>
      <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${COLORS.rule}` }}>
        {assetCats.map((c) => {
          const sub = c.accounts.reduce((a, x) => a + x.value, 0);
          const pct = Math.round((sub / totalAssets) * 100);
          return (
            <div key={c.id} className="flex items-center justify-between px-4" style={{ background: categoryColor(c, theme), color: "#fff", height: Math.max(48, pct * 2.4) }}>
              <span style={{ fontFamily: "Fraunces, serif", fontSize: pct > 10 ? 26 : 16, fontWeight: 600 }}>{pct}%</span>
              <span style={{ fontFamily: "Inter", fontSize: 13 }}>{catLabel(c, t)}</span>
            </div>
          );
        })}
      </div>
      {totalLiability > 0 && (
        <div className="rounded-xl mt-3 px-4 py-3 flex items-center justify-between" style={{ background: COLORS.clay, color: "#fff" }}>
          <span style={{ fontFamily: "Inter", fontSize: 13 }}>{t("liabilitiesOffset")}</span>
          <span style={{ fontFamily: "IBM Plex Mono", fontSize: 14 }}>{fmtMoney(totalLiability)}</span>
        </div>
      )}
    </div>
  );
}

// ---- trend tab: Net Worth vs. Assets-compare, with a period selector ----
const TREND_RANGES = [["1m", "1M"], ["6m", "6M"], ["1y", "1Y"], ["ytd", "YTD"], ["custom", "Custom"]];

function TrendView({ snapshots, categories, theme, onRecord, convert, currencySymbol }) {
  const [viewMode, setViewMode] = useState("networth"); // 'networth' | 'assets'
  const [range, setRange] = useState("6m");
  const [customStart, setCustomStart] = useState(snapshots[0]?.date || todayISO());
  const [customEnd, setCustomEnd] = useState(todayISO());
  const [shareOpen, setShareOpen] = useState(false);
  const { t } = useLang();

  const assetCats = categories.filter((c) => c.type === "asset");
  const { start, end } = resolveRange(range, { start: customStart, end: customEnd });
  const inRange = snapshots.filter((s) => new Date(s.date) >= start && new Date(s.date) <= end);
  const filtered = inRange.length >= 2 ? inRange : snapshots.slice(-2);

  const data = filtered.map((s) => {
    const row = { label: fmtDateShort(s.date), networth: convert(s.value) };
    assetCats.forEach((c) => { row[c.id] = convert(s.byCategory?.[c.id] ?? 0); });
    return row;
  });

  const firstS = filtered[0], lastS = filtered[filtered.length - 1];
  const changeFor = (id) => {
    const first = id === "networth" ? firstS.value : (firstS.byCategory?.[id] ?? 0);
    const last = id === "networth" ? lastS.value : (lastS.byCategory?.[id] ?? 0);
    const pct = first ? (((last - first) / Math.abs(first)) * 100) : (last ? 100 : 0);
    return { first, last, delta: last - first, pct };
  };

  const netChange = changeFor("networth");
  const netLine = t("netWorthLine", netChange.delta >= 0 ? t("increased") : t("decreased"), `${currencySymbol}${fmtMoney(Math.abs(convert(netChange.delta)))}`, `${netChange.pct >= 0 ? "+" : ""}${netChange.pct.toFixed(1)}`);
  const assetLines = assetCats.map((c) => {
    const ch = changeFor(c.id);
    return t("assetLine", ch.delta >= 0 ? t("increased") : t("decreased"), catLabel(c, t), `${currencySymbol}${fmtMoney(Math.abs(convert(ch.delta)))}`, `${ch.pct >= 0 ? "+" : ""}${ch.pct.toFixed(1)}`);
  });

  return (
    <div>
      <div className="flex gap-2 mb-3">
        {[{ id: "networth", label: t("netWorth") }, { id: "assets", label: t("tabAssets") }].map((m) => (
          <button key={m.id} onClick={() => setViewMode(m.id)} className="flex-1 py-2 rounded-lg"
            style={{ fontFamily: "Inter", fontSize: 13, fontWeight: 600, border: `1px solid ${viewMode === m.id ? COLORS.ink : COLORS.rule}`, background: viewMode === m.id ? COLORS.ink : "transparent", color: viewMode === m.id ? "#fff" : COLORS.ink }}>
            {m.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl p-4 mb-3" style={{ background: COLORS.surface, border: `1px solid ${COLORS.rule}` }}>
        <div style={{ fontFamily: "Inter", fontSize: 11.5, color: COLORS.inkSoft, marginBottom: 6 }}>{rangeLabel(range, { start: customStart, end: customEnd })}</div>
        {viewMode === "networth" ? (
          <div style={{ fontFamily: "Inter", fontSize: 12.5, fontWeight: 600, color: COLORS.ink, lineHeight: 1.5 }}>{netLine}</div>
        ) : (
          assetLines.map((l, i) => <div key={i} style={{ fontFamily: "Inter", fontSize: 12.5, fontWeight: 600, color: COLORS.ink, lineHeight: 1.5 }}>{l}</div>)
        )}
      </div>

      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="flex gap-1.5 flex-wrap">
          {TREND_RANGES.map(([id, label]) => (
            <button key={id} onClick={() => setRange(id)} className="px-2.5 py-1 rounded-full"
              style={{ fontFamily: "Inter", fontSize: 11.5, fontWeight: 500, background: range === id ? COLORS.ink : "transparent", color: range === id ? "#fff" : COLORS.inkSoft, border: `1px solid ${range === id ? COLORS.ink : COLORS.rule}` }}>
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5" style={{ flexShrink: 0 }}>
          <button onClick={onRecord} className="flex items-center gap-1 px-2.5 py-1 rounded-full"
            style={{ fontFamily: "Inter", fontSize: 11.5, color: COLORS.ink, border: `1px solid ${COLORS.rule}` }}>
            <Plus size={12} /> {t("record")}
          </button>
          <button onClick={() => setShareOpen(true)} aria-label={t("shareTitle")} className="flex items-center justify-center rounded-full"
            style={{ width: 26, height: 26, border: `1px solid ${COLORS.rule}` }}>
            <Share2 size={12} color={COLORS.inkSoft} />
          </button>
        </div>
      </div>

      {range === "custom" && (
        <div className="flex items-center gap-2 mb-3">
          <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="flex-1 px-2.5 py-1.5 rounded-lg"
            style={{ fontFamily: "IBM Plex Mono", fontSize: 12.5, border: `1px solid ${COLORS.rule}`, color: COLORS.ink }} />
          <span style={{ color: COLORS.inkSoft, fontSize: 12 }}>to</span>
          <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="flex-1 px-2.5 py-1.5 rounded-lg"
            style={{ fontFamily: "IBM Plex Mono", fontSize: 12.5, border: `1px solid ${COLORS.rule}`, color: COLORS.ink }} />
        </div>
      )}

      {viewMode === "assets" && (
        <div className="flex gap-3 flex-wrap mb-2 px-1">
          {assetCats.map((c) => (
            <div key={c.id} className="flex items-center gap-1.5">
              <span style={{ width: 10, height: 10, borderRadius: 3, background: categoryColor(c, theme), display: "inline-block" }} />
              <span style={{ fontFamily: "Inter", fontSize: 11.5, color: COLORS.inkSoft }}>{catLabel(c, t)}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ height: 220, background: COLORS.surface, border: `1px solid ${COLORS.rule}`, borderRadius: 12, padding: "12px 8px 4px" }}>
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === "networth" ? (
            <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="fillMetric" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={SHARE_BRAND.networth} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={SHARE_BRAND.networth} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={COLORS.rule} vertical={false} />
              <XAxis dataKey="label" tick={{ fontFamily: "Inter", fontSize: 10.5, fill: COLORS.inkSoft }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontFamily: "IBM Plex Mono", fontSize: 10, fill: COLORS.inkSoft }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `${Math.round(v / 1000)}k`} width={38} />
              <Tooltip formatter={(v) => [`${currencySymbol}${fmtMoney(v)}`, t("netWorthLabel")]}
                contentStyle={{ fontFamily: "Inter", fontSize: 12, borderRadius: 8, border: `1px solid ${COLORS.rule}` }} />
              <Area type="monotone" dataKey="networth" stroke={SHARE_BRAND.networth} strokeWidth={2} fill="url(#fillMetric)" />
            </AreaChart>
          ) : (
            <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid stroke={COLORS.rule} vertical={false} />
              <XAxis dataKey="label" tick={{ fontFamily: "Inter", fontSize: 10.5, fill: COLORS.inkSoft }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontFamily: "IBM Plex Mono", fontSize: 10, fill: COLORS.inkSoft }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `${Math.round(v / 1000)}k`} width={38} />
              <Tooltip formatter={(v, name) => [`${currencySymbol}${fmtMoney(v)}`, catLabel(categories.find((c) => c.id === name) || { id: name }, t)]}
                contentStyle={{ fontFamily: "Inter", fontSize: 12, borderRadius: 8, border: `1px solid ${COLORS.rule}` }} />
              {assetCats.map((c) => (
                <Line key={c.id} type="monotone" dataKey={c.id} stroke={categoryColor(c, theme)} strokeWidth={2.5} dot={false} />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      <ShareCardModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        brandColor={SHARE_BRAND.networth}
        title={viewMode === "networth" ? t("myNetWorth") : t("myAssetGrowth")}
        periodLabel={rangeLabel(range, { start: customStart, end: customEnd })}
        narrativeLines={viewMode === "networth" ? [netLine] : assetLines}
        legend={viewMode === "networth" ? [{ label: t("netWorthLabel"), color: SHARE_BRAND.networth }] : assetCats.map((c) => ({ label: catLabel(c, t), color: categoryColor(c, theme) }))}
        chartData={data.map((d) => ({ label: d.label, ...d }))}
        seriesKeys={viewMode === "networth" ? [{ key: "networth", color: SHARE_BRAND.networth }] : assetCats.map((c) => ({ key: c.id, color: categoryColor(c, theme) }))}
        currencySymbol={currencySymbol}
      />
    </div>
  );
}

// ---- profit & loss tab ---------------------------------------------------
const PNL_RANGES = [["5w", "5W"], ["6m", "6M"], ["1y", "1Y"], ["ytd", "YTD"], ["4y", "4Y"]];

function ProfitLossView({ categories, snapshots, rates, convert, currencySymbol, theme }) {
  const [mode, setMode] = useState("invest"); // 'invest' | 'cash'
  const [range, setRange] = useState("6m");
  const [shareOpen, setShareOpen] = useState(false);
  const { t } = useLang();

  const modeColor = mode === "invest" ? theme.colors[1] : theme.colors[0];
  const modeCategory = categories.find((c) => c.id === mode);

  const { start, end } = resolveRange(range);
  const filtered = snapshots.filter((s) => new Date(s.date) >= start && new Date(s.date) <= end);
  const effective = filtered.length >= 2 ? filtered : snapshots.slice(-2);

  const series = [];
  for (let i = 1; i < effective.length; i++) {
    const prev = effective[i - 1].byCategory?.[mode] ?? 0;
    const curr = effective[i].byCategory?.[mode] ?? 0;
    series.push({ label: fmtDateShort(effective[i].date), change: curr - prev, display: convert(curr - prev) });
  }
  const totalChangeUsd = series.reduce((s, x) => s + x.change, 0);

  const unrealizedUsd = mode === "invest"
    ? (modeCategory?.accounts || []).filter((a) => a.isStock && a.avgCost).reduce((sum, a) => {
        const gainNative = (a.nativePrice - a.avgCost) * a.units;
        return sum + nativeToUsd(gainNative, a.currency, rates);
      }, 0)
    : null;
  const costBasisUsd = mode === "invest"
    ? (modeCategory?.accounts || []).filter((a) => a.isStock && a.avgCost).reduce((sum, a) => sum + nativeToUsd(a.avgCost * a.units, a.currency, rates), 0)
    : 0;
  const unrealizedPct = unrealizedUsd && costBasisUsd ? (unrealizedUsd / costBasisUsd) * 100 : 0;

  const fmtSigned = (usd) => `${usd >= 0 ? "+" : "\u2212"}${currencySymbol}${fmtMoney(Math.abs(convert(usd)))}`;
  const line1 = t("totalAccountChange", `${totalChangeUsd >= 0 ? "" : "\u2212"}${currencySymbol}${fmtMoney(Math.abs(convert(totalChangeUsd)))}`);
  const line2 = unrealizedUsd == null
    ? t("openPnlOnlyStocks")
    : Math.round(unrealizedUsd) === 0
    ? t("openPnlNoChange")
    : t("openPnlChanged", unrealizedUsd >= 0 ? t("increased") : t("decreased"), fmtSigned(unrealizedUsd), costBasisUsd ? `, ${unrealizedPct >= 0 ? "+" : ""}${unrealizedPct.toFixed(1)}%` : "");

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-2">
        <div className="flex gap-2 flex-1">
          {[{ id: "invest", label: t("myInvestment") }, { id: "cash", label: t("myLiquidity") }].map((m) => (
            <button key={m.id} onClick={() => setMode(m.id)} className="flex-1 py-2 rounded-lg"
              style={{ fontFamily: "Inter", fontSize: 13, fontWeight: 600, border: `1px solid ${mode === m.id ? COLORS.ink : COLORS.rule}`, background: mode === m.id ? COLORS.ink : "transparent", color: mode === m.id ? "#fff" : COLORS.ink }}>
              {m.label}
            </button>
          ))}
        </div>
        <button onClick={() => setShareOpen(true)} aria-label={t("shareTitle")} className="flex items-center justify-center rounded-lg"
          style={{ width: 36, height: 36, border: `1px solid ${COLORS.rule}`, flexShrink: 0 }}>
          <Share2 size={15} color={COLORS.inkSoft} />
        </button>
      </div>

      <div className="rounded-xl p-4 mb-4" style={{ background: COLORS.surface, border: `1px solid ${COLORS.rule}` }}>
        <div style={{ fontFamily: "Inter", fontSize: 11.5, color: COLORS.inkSoft, marginBottom: 6 }}>{rangeLabel(range)}</div>
        <div style={{ fontFamily: "Inter", fontSize: 12.5, fontWeight: 600, color: COLORS.ink, lineHeight: 1.5 }}>{line1}</div>
        <div style={{ fontFamily: "Inter", fontSize: 12.5, fontWeight: 600, color: COLORS.ink, lineHeight: 1.5 }}>{line2}</div>
      </div>

      <div className="flex gap-1.5 mb-3">
        {PNL_RANGES.map(([id, label]) => (
          <button key={id} onClick={() => setRange(id)} className="px-2.5 py-1 rounded-full"
            style={{ fontFamily: "Inter", fontSize: 11.5, fontWeight: 500, background: range === id ? COLORS.ink : "transparent", color: range === id ? "#fff" : COLORS.inkSoft, border: `1px solid ${range === id ? COLORS.ink : COLORS.rule}` }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ height: 200, background: COLORS.surface, border: `1px solid ${COLORS.rule}`, borderRadius: 12, padding: "12px 8px 4px" }}>
        {series.length === 0 ? (
          <div className="h-full flex items-center justify-center" style={{ fontFamily: "Inter", fontSize: 12.5, color: COLORS.inkSoft }}>
            {t("recordChart")}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid stroke={COLORS.rule} vertical={false} />
              <XAxis dataKey="label" tick={{ fontFamily: "Inter", fontSize: 10.5, fill: COLORS.inkSoft }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontFamily: "IBM Plex Mono", fontSize: 10, fill: COLORS.inkSoft }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `${Math.round(v / 1000)}k`} width={38} />
              <Tooltip formatter={(v) => [`${currencySymbol}${fmtMoney(v)}`, t("changeLabel")]}
                contentStyle={{ fontFamily: "Inter", fontSize: 12, borderRadius: 8, border: `1px solid ${COLORS.rule}` }} />
              <Bar dataKey="display" radius={[4, 4, 0, 0]}>
                {series.map((entry, i) => <Cell key={i} fill={entry.change >= 0 ? modeColor : COLORS.clay} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <ShareCardModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        brandColor={modeColor}
        title={mode === "invest" ? t("myInvestment") : t("myLiquidity")}
        periodLabel={rangeLabel(range)}
        narrativeLines={[line1, line2]}
        legend={[{ label: t("accountChangeLabel"), color: modeColor + "99" }, { label: t("openPnlLabel"), color: modeColor }]}
        chartData={series.map((s) => ({ label: s.label, v: convert(s.change) }))}
        seriesKeys={[{ key: "v", color: modeColor + "99" }]}
        currencySymbol={currencySymbol}
      />
    </div>
  );
}

// ---- main app ---------------------------------------------------
export default function App() {
  const [categories, setCategories] = useState(null);
  const [snapshots, setSnapshots] = useState(null);
  const [activities, setActivities] = useState([]);
  const [tab, setTab] = useState("assets");
  const [modal, setModal] = useState({ open: false, initial: null, presetSubtype: null });
  const [typeSheetOpen, setTypeSheetOpen] = useState(false);
  const [stockModal, setStockModal] = useState({ open: false, categoryId: null, initial: null });
  const [displayCurrency, setDisplayCurrency] = useState("USD");
  const [rates, setRates] = useState(FALLBACK_RATES);
  const [fxStatus, setFxStatus] = useState("cached");
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const [apiKey, setApiKey] = useState("");
  const [allTickToken, setAllTickToken] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [themeId, setThemeId] = useState(DEFAULT_THEME_ID);
  const [menuOpen, setMenuOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [autoBanner, setAutoBanner] = useState(null); // summary of just-applied recurrences
  const [hiddenCategoryIds, setHiddenCategoryIds] = useState([]);
  const [iconThemed, setIconThemed] = useState(true);
  const [syncDiagnostics, setSyncDiagnostics] = useState({}); // { [accountId]: { at, attempts } }
  const [lang, setLang] = useState(DEFAULT_LANG);
  const t = makeT(lang);
  const loadedRef = useRef(false);

  useEffect(() => {
    loadState().then(({ categories, snapshots, apiKey, activities, themeId, hiddenCategoryIds, iconThemed, allTickToken, lang }) => {
      const renamed = categories.map((c) => (c.id === "cash" && c.name === "Cash & Equivalents" ? { ...c, name: "Cash Equivalents" } : c));
      const { categories: withRecurrences, summary } = applyDueRecurrences(renamed);
      setCategories(withRecurrences);
      setSnapshots(snapshots);
      setApiKey(apiKey);
      setAllTickToken(allTickToken);
      setActivities(activities);
      setThemeId(themeId);
      setHiddenCategoryIds(hiddenCategoryIds);
      setIconThemed(iconThemed);
      setLang(lang);
      if (summary.length > 0) {
        const total = summary.reduce((s, x) => s + x.count, 0);
        const netTotal = summary.reduce((s, x) => s + x.net, 0);
        setAutoBanner(`Auto added ${total} item${total !== 1 ? "s" : ""} · ${netTotal >= 0 ? "+" : "\u2212"}${fmtMoney(Math.abs(netTotal))}`);
        const newActivities = summary.map((s) => ({ id: uid(), ts: new Date().toISOString(), text: `Auto — "${s.label}" on ${s.accountName} (${s.count}\u00d7, ${s.net >= 0 ? "+" : "\u2212"}${fmtMoney(Math.abs(s.net))})` }));
        setActivities((prev) => [...newActivities, ...activities].slice(0, 30));
      }
      loadedRef.current = true;
    });
  }, []);

  useEffect(() => { if (loadedRef.current && themeId) saveTheme(themeId); }, [themeId]);
  useEffect(() => { if (loadedRef.current) saveHiddenCategories(hiddenCategoryIds); }, [hiddenCategoryIds]);
  useEffect(() => { if (loadedRef.current) saveIconThemed(iconThemed); }, [iconThemed]);
  useEffect(() => { if (loadedRef.current && lang) saveLang(lang); }, [lang]);
  // a category that's gained accounts again is never kept hidden
  useEffect(() => {
    if (!loadedRef.current || !categories) return;
    const stillEmpty = new Set(categories.filter((c) => c.accounts.length === 0).map((c) => c.id));
    setHiddenCategoryIds((prev) => prev.filter((id) => stillEmpty.has(id)));
  }, [categories]);


  useEffect(() => { if (loadedRef.current && categories) saveCategories(categories); }, [categories]);
  useEffect(() => { if (loadedRef.current && snapshots) saveSnapshots(snapshots); }, [snapshots]);
  useEffect(() => { if (loadedRef.current) saveActivities(activities); }, [activities]);

  const addActivity = (text) => {
    setActivities((prev) => [{ id: uid(), ts: new Date().toISOString(), text }, ...prev].slice(0, 30));
  };

  const totals = useMemo(() => (categories ? categoryTotals(categories) : {}), [categories]);
  const netWorth = useMemo(() => (categories ? netWorthFromTotals(categories, totals) : 0), [categories, totals]);
  const visibleCategories = useMemo(
    () => (categories ? categories.filter((c) => c.accounts.length > 0 || !hiddenCategoryIds.includes(c.id)) : []),
    [categories, hiddenCategoryIds]
  );
  const stockTags = useMemo(
    () => (categories ? Array.from(new Set(categories.flatMap((c) => c.accounts.filter((a) => a.isStock && a.tag).map((a) => a.tag)))).sort() : []),
    [categories]
  );
  const investBrokers = useMemo(() => {
    if (!categories) return [];
    const invest = categories.find((c) => c.id === "invest");
    return invest ? Array.from(new Set(invest.accounts.filter((a) => a.broker).map((a) => a.broker))).sort() : [];
  }, [categories]);
  const hideCategory = (categoryId) => {
    const cat = categories.find((c) => c.id === categoryId);
    setHiddenCategoryIds((prev) => (prev.includes(categoryId) ? prev : [...prev, categoryId]));
    if (cat) addActivity(`Removed "${cat.name}" from Assets (empty)`);
  };
  const unhideCategory = (categoryId) => {
    const cat = categories.find((c) => c.id === categoryId);
    setHiddenCategoryIds((prev) => prev.filter((id) => id !== categoryId));
    if (cat) addActivity(`Restored "${cat.name}" to Assets`);
  };

  const convert = (usdValue) => usdValue * (rates[displayCurrency] || 1);
  const formatDisplay = (usdValue) => `${CURRENCY_SYMBOL[displayCurrency]}${fmtMoney(convert(usdValue))}`;

  if (!categories || !snapshots) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: COLORS.bg }}>
        <span style={{ fontFamily: "Inter", color: COLORS.inkSoft, fontSize: 13 }}>Loading your ledger…</span>
      </div>
    );
  }

  const openAdd = (categoryId, subtypeId) => setModal({ open: true, initial: categoryId ? { categoryId } : null, presetSubtype: subtypeId || null });
  const openEdit = (categoryId, account) => {
    if (account.isStock) setStockModal({ open: true, categoryId, initial: account });
    else setModal({ open: true, initial: { ...account, categoryId }, presetSubtype: null });
  };
  const openAddStock = (categoryId) => setStockModal({ open: true, categoryId, initial: null });
  const closeModal = () => setModal({ open: false, initial: null, presetSubtype: null });
  const closeStockModal = () => setStockModal({ open: false, categoryId: null, initial: null });
  const pickAccountType = (categoryId, subtypeId) => {
    setTypeSheetOpen(false);
    if (subtypeId === "stock") openAddStock(categoryId);
    else openAdd(categoryId, subtypeId);
  };

  const handleSaveAccount = (acct) => {
    const isNew = !categories.some((c) => c.accounts.some((a) => a.id === acct.id));
    setCategories((prev) => prev.map((c) => {
      const withoutAcct = { ...c, accounts: c.accounts.filter((a) => a.id !== acct.id) };
      return c.id === acct.categoryId ? { ...withoutAcct, accounts: [...withoutAcct.accounts, acct] } : withoutAcct;
    }));
    addActivity(`${isNew ? "Added" : "Updated"} "${acct.name}"`);
    closeModal();
  };

  const handleSaveStock = (acct) => {
    const isNew = !categories.some((c) => c.accounts.some((a) => a.id === acct.id));
    setCategories((prev) => prev.map((c) => (c.id === acct.categoryId ? { ...c, accounts: [...c.accounts.filter((a) => a.id !== acct.id), acct] } : c)));
    addActivity(`${isNew ? "Added" : "Updated"} ${acct.ticker} holding (${acct.units} units)`);
    closeStockModal();
  };

  const handleDeleteAccount = (categoryId, accountId) => {
    const cat = categories.find((c) => c.id === categoryId);
    const acct = cat?.accounts.find((a) => a.id === accountId);
    setCategories((prev) => prev.map((c) => (c.id === categoryId ? { ...c, accounts: c.accounts.filter((a) => a.id !== accountId) } : c)));
    if (acct) addActivity(`Removed "${acct.isStock ? acct.ticker : acct.name}"`);
    closeModal();
    closeStockModal();
  };

  const recordSnapshot = () => {
    const t = categoryTotals(categories);
    setSnapshots((prev) => {
      const filtered = prev.filter((s) => s.date !== todayISO());
      return [...filtered, { date: todayISO(), value: netWorthFromTotals(categories, t), byCategory: t }];
    });
    addActivity("Recorded a net worth snapshot");
  };

  const syncNow = async () => {
    setSyncing(true);
    setFxStatus("loading");

    let nextRates = rates;
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 4000);
      const res = await fetch("https://api.frankfurter.app/latest?from=USD&to=HKD", { signal: ctrl.signal });
      clearTimeout(t);
      if (res.ok) {
        const data = await res.json();
        if (data?.rates?.HKD) {
          nextRates = { USD: 1, HKD: data.rates.HKD };
          setRates(nextRates);
          setFxStatus("live");
        } else setFxStatus("cached");
      } else setFxStatus("cached");
    } catch {
      setFxStatus("cached");
    }

    const stockAccounts = categories.flatMap((c) => c.accounts.filter((a) => a.isStock).map((a) => ({ ...a, categoryId: c.id })));
    const autoAccounts = stockAccounts.filter((a) => a.priceSource !== "manual");
    const quotes = await Promise.all(autoAccounts.map(async (a) => {
      const { price, source, attempts } = await fetchLiveQuote(a.ticker, a.market, apiKey || SHARED_FINNHUB_KEY, allTickToken);
      return { id: a.id, price, source, attempts };
    }));
    const quoteById = Object.fromEntries(quotes.map((q) => [q.id, q]));
    const liveCount = quotes.filter((q) => q.price != null).length;
    setSyncDiagnostics((prev) => ({ ...prev, ...Object.fromEntries(quotes.map((q) => [q.id, { at: nowLabel(), attempts: q.attempts }])) }));

    setCategories((prev) => prev.map((c) => ({
      ...c,
      accounts: c.accounts.map((a) => {
        if (!a.isStock) return a;
        if (a.priceSource === "manual") {
          // leave the typed-in price alone — just keep its USD value current with FX
          return { ...a, value: stockUsdValue(a.nativePrice, a.units, a.currency, nextRates) };
        }
        const live = quoteById[a.id];
        let nativePrice, priceSource, priceSourceName;
        if (live?.price != null) { nativePrice = live.price; priceSource = "live"; priceSourceName = live.source; }
        else {
          const walk = 1 + (Math.random() * 0.03 - 0.015);
          nativePrice = Math.max(0.01, a.nativePrice * walk);
          priceSource = "simulated";
        }
        return { ...a, nativePrice, priceSource, priceSourceName, value: stockUsdValue(nativePrice, a.units, a.currency, nextRates), updatedAt: todayISO() };
      }),
    })));

    setLastSynced(nowLabel());
    setSyncing(false);
    const manualCount = stockAccounts.length - autoAccounts.length;
    if (autoAccounts.length > 0) {
      addActivity(`Synced prices — ${liveCount} live, ${autoAccounts.length - liveCount} simulated${manualCount > 0 ? `, ${manualCount} manual` : ""}`);
    } else if (manualCount > 0) {
      addActivity(`Synced FX rate — ${manualCount} holding${manualCount !== 1 ? "s" : ""} kept at manual price`);
    } else {
      addActivity("Synced FX rate");
    }
  };

  const handleSaveApiKey = (key) => { setApiKey(key); saveApiKey(key); setSettingsOpen(false); };
  const handleSaveAllTickToken = (token) => { setAllTickToken(token); saveAllTickToken(token); setSettingsOpen(false); };

  const TABS = [
    { id: "assets", label: t("tabAssets"), icon: Wallet },
    { id: "distribution", label: t("tabMix"), icon: PieIcon },
    { id: "pnl", label: t("tabPnl"), icon: DollarSign },
    { id: "trend", label: t("tabTrend"), icon: LineIcon },
  ];

  return (
    <LangContext.Provider value={{ lang, t, setLang }}>
    <div className="min-h-screen w-full flex justify-center" style={{ background: COLORS.bg }}>
      <style>{`
        ${FONT_IMPORT}
        @keyframes draw { to { stroke-dashoffset: 0; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
      `}</style>

      <div className="w-full relative" style={{ maxWidth: 430 }}>
        <div className="px-5 pt-8 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center rounded-lg" style={{
              width: 22, height: 22,
              background: iconThemed ? `linear-gradient(135deg, ${themeById(themeId).colors[1]}, ${themeById(themeId).colors[0]})` : COLORS.rule,
            }}>
              <span style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 11, color: iconThemed ? "#fff" : COLORS.inkSoft }}>%</span>
            </span>
            <span style={{ fontFamily: "Fraunces, serif", fontSize: 15, letterSpacing: 1.5, color: COLORS.inkSoft, textTransform: "uppercase" }}>FinTrack</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={syncNow} disabled={syncing} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ border: `1px solid ${COLORS.rule}`, fontFamily: "Inter", fontSize: 11, color: COLORS.inkSoft }}>
              <RefreshCw size={12} style={syncing ? { animation: "spin 800ms linear infinite" } : {}} />
              {syncing ? t("syncing") : lastSynced ? t("synced", lastSynced) : t("syncPrices")}
            </button>
            <button onClick={() => setMenuOpen(true)} aria-label="More"><MoreHorizontal size={19} color={COLORS.inkSoft} /></button>
          </div>
        </div>

        {autoBanner && (
          <div className="mx-5 mb-3 px-3.5 py-2.5 rounded-xl flex items-center justify-between" style={{ background: COLORS.ink }}>
            <div className="flex items-center gap-2">
              <Repeat size={13} color="#fff" />
              <span style={{ fontFamily: "Inter", fontSize: 12.5, color: "#fff" }}>{autoBanner}</span>
            </div>
            <button onClick={() => setAutoBanner(null)} aria-label="Dismiss"><X size={14} color="#fff" /></button>
          </div>
        )}

        <div className="px-5 pb-5">
          <div className="flex items-center justify-between mb-1">
            <div style={{ fontFamily: "Inter", fontSize: 12.5, color: COLORS.inkSoft }}>{t("netWorth")}</div>
            <div className="flex rounded-full overflow-hidden" style={{ border: `1px solid ${COLORS.rule}` }}>
              {["USD", "HKD"].map((cur) => (
                <button key={cur} onClick={() => setDisplayCurrency(cur)} className="px-2.5 py-1"
                  style={{ fontFamily: "Inter", fontSize: 11, fontWeight: 600, background: displayCurrency === cur ? COLORS.ink : "transparent", color: displayCurrency === cur ? "#fff" : COLORS.inkSoft }}>
                  {cur}
                </button>
              ))}
            </div>
          </div>
          <div style={{ fontFamily: "IBM Plex Mono", fontWeight: 500, fontSize: 38, color: COLORS.ink, lineHeight: 1 }}>{formatDisplay(netWorth)}</div>
          <div style={{ marginTop: 6 }}><SketchUnderline color={COLORS.sage} width={190} /></div>
        </div>

        <div className="px-5 flex gap-1.5 mb-4">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ fontFamily: "Inter", fontSize: 12.5, fontWeight: 500, background: active ? COLORS.ink : "transparent", color: active ? "#fff" : COLORS.inkSoft, border: `1px solid ${active ? COLORS.ink : COLORS.rule}` }}>
                <Icon size={13} /> {t.label}
              </button>
            );
          })}
        </div>

        <div className="px-5 pb-28">
          {tab === "assets" && (
            <div>
              {visibleCategories.map((c) => (
                <CategoryCard key={c.id} category={c} theme={themeById(themeId)} formatDisplay={formatDisplay} onRowClick={openEdit} onAdd={openAdd} onAddStock={openAddStock} onHide={hideCategory} />
              ))}
              {hiddenCategoryIds.length > 0 && (
                <button onClick={() => setSettingsOpen(true)} className="w-full text-center py-2" style={{ fontFamily: "Inter", fontSize: 11.5, color: COLORS.inkSoft }}>
                  {hiddenCategoryIds.length} categor{hiddenCategoryIds.length !== 1 ? "ies" : "y"} hidden · manage in Settings
                </button>
              )}
            </div>
          )}
          {tab === "distribution" && <DistributionView categories={visibleCategories} theme={themeById(themeId)} />}
          {tab === "pnl" && <ProfitLossView categories={categories} snapshots={snapshots} rates={rates} convert={convert} currencySymbol={CURRENCY_SYMBOL[displayCurrency]} theme={themeById(themeId)} />}
          {tab === "trend" && <TrendView snapshots={snapshots} categories={visibleCategories} theme={themeById(themeId)} onRecord={recordSnapshot} convert={convert} currencySymbol={CURRENCY_SYMBOL[displayCurrency]} />}
        </div>

        {tab === "assets" && (
          <button onClick={() => setTypeSheetOpen(true)} className="absolute flex items-center justify-center rounded-full shadow-lg"
            style={{ width: 52, height: 52, background: COLORS.ink, bottom: 28, right: 20 }} aria-label="Add account">
            <Plus size={22} color="#fff" />
          </button>
        )}

        <AccountTypeSheet open={typeSheetOpen} onClose={() => setTypeSheetOpen(false)} categories={categories} theme={themeById(themeId)} onPick={pickAccountType} />
        <AccountModal open={modal.open} initial={modal.initial} presetSubtype={modal.presetSubtype} categories={categories} rates={rates} onClose={closeModal} onSave={handleSaveAccount} onDelete={handleDeleteAccount}
          onAddStockInstead={(categoryId) => { closeModal(); openAddStock(categoryId); }} existingBrokers={investBrokers} />
        <StockModal open={stockModal.open} categoryId={stockModal.categoryId} initial={stockModal.initial} rates={rates} onClose={closeStockModal} onSave={handleSaveStock} onDelete={handleDeleteAccount} existingTags={stockTags} existingBrokers={investBrokers}
          diagnostics={stockModal.initial ? syncDiagnostics[stockModal.initial.id] : null} />
        <SettingsModal open={settingsOpen} apiKey={apiKey} onClose={() => setSettingsOpen(false)} onSave={handleSaveApiKey} allTickToken={allTickToken} onSaveAllTick={handleSaveAllTickToken} themeId={themeId} onOpenTheme={() => { setSettingsOpen(false); setThemeOpen(true); }}
          categories={categories} hiddenCategoryIds={hiddenCategoryIds} onUnhide={unhideCategory} lang={lang} onSetLang={setLang} />
        <ThemeModal open={themeOpen} onClose={() => setThemeOpen(false)} themeId={themeId} onSelect={(id) => { setThemeId(id); addActivity(`Switched theme to ${themeById(id).name}`); }}
          iconThemed={iconThemed} onToggleIcon={() => setIconThemed((v) => !v)} />
        <MenuSheet
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          onRefreshAll={syncNow}
          onHistory={() => setHistoryOpen(true)}
          onSearch={() => setSearchOpen(true)}
          onShare={() => setShareOpen(true)}
          onSettings={() => setSettingsOpen(true)}
        />
        <HistoryModal open={historyOpen} onClose={() => setHistoryOpen(false)} activities={activities} />
        <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} categories={categories} formatDisplay={formatDisplay} onSelect={(a) => openEdit(a.categoryId, a)} />
        <ShareCardModal
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          brandColor={SHARE_BRAND.networth}
          title={t("myNetWorth")}
          periodLabel={rangeLabel("6m")}
          narrativeLines={[t("netWorthCurrently", formatDisplay(netWorth))]}
          legend={[{ label: t("netWorthLabel"), color: SHARE_BRAND.networth }]}
          chartData={snapshots.slice(-6).map((s) => ({ label: fmtDateShort(s.date), v: convert(s.value) }))}
          seriesKeys={[{ key: "v", color: SHARE_BRAND.networth }]}
          currencySymbol={CURRENCY_SYMBOL[displayCurrency]}
        />
      </div>
    </div>
    </LangContext.Provider>
  );
}
