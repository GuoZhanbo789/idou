const currency = new Intl.NumberFormat("zh-CN", {
  style: "currency",
  currency: "CNY",
  maximumFractionDigits: 0,
});

const today = new Date().toISOString().slice(0, 10);

const defaults = {
  works: [
    {
      id: crypto.randomUUID(),
      title: "花束钥匙扣",
      category: "现货",
      price: 29,
      status: "可售",
      note: "轻巧、适合包挂和日常小礼物。",
      image: "",
      palette: ["#536f86", "#f3e5d1"],
    },
    {
      id: crypto.randomUUID(),
      title: "奶油小狗杯垫",
      category: "礼盒",
      price: 49,
      status: "少量",
      note: "适合桌面陈列和礼盒搭配。",
      image: "",
      palette: ["#798b70", "#efe2c9"],
    },
    {
      id: crypto.randomUUID(),
      title: "定制头像拼豆画",
      category: "定制",
      price: 128,
      status: "预约",
      note: "按照片、角色或名字定制，高利润订单。",
      image: "",
      palette: ["#d86d61", "#f2d4cc"],
    },
  ],
  products: [
    { id: crypto.randomUUID(), name: "像素花束钥匙扣", category: "钥匙扣", price: 29, cost: 9, stock: 18, status: "热卖" },
    { id: crypto.randomUUID(), name: "奶油小狗杯垫", category: "杯垫", price: 49, cost: 16, stock: 9, status: "少量" },
    { id: crypto.randomUUID(), name: "定制头像拼豆画", category: "定制", price: 128, cost: 38, stock: 4, status: "预约" },
    { id: crypto.randomUUID(), name: "节日礼盒套装", category: "礼盒", price: 168, cost: 62, stock: 6, status: "新品" },
  ],
  colors: [
    { id: crypto.randomUUID(), name: "奶油白", code: "#f6efe2", stock: 1260, min: 400 },
    { id: crypto.randomUUID(), name: "摩卡棕", code: "#7b5a43", stock: 520, min: 350 },
    { id: crypto.randomUUID(), name: "樱桃红", code: "#c9453d", stock: 280, min: 320 },
    { id: crypto.randomUUID(), name: "海盐蓝", code: "#5f87a7", stock: 760, min: 300 },
    { id: crypto.randomUUID(), name: "抹茶绿", code: "#7e966d", stock: 210, min: 300 },
    { id: crypto.randomUUID(), name: "琥珀黄", code: "#d8a33d", stock: 430, min: 280 },
  ],
  ledger: [
    { id: crypto.randomUUID(), type: "income", name: "头像定制订单", amount: 256, date: today },
    { id: crypto.randomUUID(), type: "income", name: "钥匙扣现货销售", amount: 145, date: today },
    { id: crypto.randomUUID(), type: "expense", name: "补货：基础色拼豆", amount: 86, date: today },
    { id: crypto.randomUUID(), type: "expense", name: "礼盒包装材料", amount: 42, date: today },
  ],
  consumptions: [
    { id: crypto.randomUUID(), colorId: "", colorName: "奶油白", amount: 120, date: today, project: "奶油小狗杯垫" },
    { id: crypto.randomUUID(), colorId: "", colorName: "海盐蓝", amount: 86, date: today, project: "头像定制订单" },
    { id: crypto.randomUUID(), colorId: "", colorName: "樱桃红", amount: 64, date: today, project: "花束钥匙扣" },
  ],
};

const state = loadState();
const els = {
  pages: document.querySelectorAll("[data-page]"),
  nav: document.querySelectorAll("[data-route]"),
  heroProfit: document.querySelector("#heroProfit"),
  heroTodayProfit: document.querySelector("#heroTodayProfit"),
  metricGrid: document.querySelector("#metricGrid"),
  financeMetrics: document.querySelector("#financeMetrics"),
  productMetrics: document.querySelector("#productMetrics"),
  summaryMetrics: document.querySelector("#summaryMetrics"),
  summaryMode: document.querySelector("#summaryMode"),
  summaryDay: document.querySelector("#summaryDay"),
  summaryMonth: document.querySelector("#summaryMonth"),
  summaryYear: document.querySelector("#summaryYear"),
  summaryPeriodLabel: document.querySelector("#summaryPeriodLabel"),
  summaryHeadline: document.querySelector("#summaryHeadline"),
  summaryNarrative: document.querySelector("#summaryNarrative"),
  usageSummary: document.querySelector("#usageSummary"),
  moneySummary: document.querySelector("#moneySummary"),
  stockSummary: document.querySelector("#stockSummary"),
  productTable: document.querySelector("#productTable"),
  colorList: document.querySelector("#colorList"),
  restockList: document.querySelector("#restockList"),
  consumptionList: document.querySelector("#consumptionList"),
  ledgerList: document.querySelector("#ledgerList"),
  ledgerForm: document.querySelector("#ledgerForm"),
  ledgerDate: document.querySelector("#ledgerDate"),
  workBoard: document.querySelector("#workBoard"),
  workUpload: document.querySelector("#workUpload"),
  workSearch: document.querySelector("#workSearch"),
  workFilter: document.querySelector("#workFilter"),
  dialog: document.querySelector("#editDialog"),
  editForm: document.querySelector("#editForm"),
  dialogTitle: document.querySelector("#dialogTitle"),
  dialogFields: document.querySelector("#dialogFields"),
  closeDialog: document.querySelector("#closeDialog"),
};

let editContext = null;
let dragId = null;
els.ledgerDate.value = today;
els.summaryDay.value = today;
els.summaryMonth.value = today.slice(0, 7);
els.summaryYear.value = new Date().getFullYear();

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("is-visible");
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.02, rootMargin: "0px 0px 12% 0px" });

function loadState() {
  const saved = localStorage.getItem("idou-studio-state-v2");
  if (!saved) return structuredClone(defaults);
  const parsed = JSON.parse(saved);
  return {
    ...structuredClone(defaults),
    ...parsed,
    works: parsed.works?.length ? parsed.works : structuredClone(defaults.works),
    consumptions: parsed.consumptions || structuredClone(defaults.consumptions),
  };
}

function saveState() {
  localStorage.setItem("idou-studio-state-v2", JSON.stringify(state));
}

function route() {
  const page = location.hash.replace("#/", "") || "home";
  const validPage = [...els.pages].some((node) => node.dataset.page === page) ? page : "home";
  els.pages.forEach((node) => node.classList.toggle("active", node.dataset.page === validPage));
  els.nav.forEach((node) => node.classList.toggle("active", node.dataset.route === validPage));
  window.scrollTo({ top: 0, behavior: "auto" });
  requestAnimationFrame(() => {
    prepareMotion();
  });
}

function render() {
  renderMetrics();
  renderWorks();
  renderProducts();
  renderColors();
  renderLedger();
  renderSummary();
  requestAnimationFrame(prepareMotion);
  saveState();
}

function renderMetrics() {
  const income = sumLedger("income");
  const expense = sumLedger("expense");
  const profit = income - expense;
  const todayProfit = sumLedger("income", today) - sumLedger("expense", today);
  const productValue = state.products.reduce((sum, item) => sum + item.price * item.stock, 0);
  const lowColors = state.colors.filter((item) => item.stock < item.min).length;
  const workValue = state.works.reduce((sum, item) => sum + Number(item.price || 0), 0);

  els.heroProfit.textContent = currency.format(profit);
  els.heroTodayProfit.textContent = currency.format(todayProfit);
  els.metricGrid.innerHTML = metricCards([
    ["作品数量", `${state.works.length} 件`, `作品墙估值 ${currency.format(workValue)}`],
    ["本月收入", currency.format(income), "来自订单、现货和定制"],
    ["预计利润", currency.format(profit), profit >= 0 ? "现金流健康" : "需要控制支出"],
    ["库存预警", `${lowColors} 色`, `成品库存估值 ${currency.format(productValue)}`],
  ]);

  els.financeMetrics.innerHTML = metricCards([
    ["总收入", currency.format(income), "已记录收入账目"],
    ["总支出", currency.format(expense), "材料、包装、工具成本"],
    ["净利润", currency.format(profit), "收入减支出"],
    ["利润率", income ? `${Math.round((profit / income) * 100)}%` : "0%", "基于当前账本"],
  ]);

  const avgMargin = state.products.length
    ? Math.round(state.products.reduce((sum, item) => sum + ((item.price - item.cost) / item.price) * 100, 0) / state.products.length)
    : 0;
  els.productMetrics.innerHTML = metricCards([
    ["产品数量", `${state.products.length} 款`, "现货与定制一起管理"],
    ["平均毛利率", `${avgMargin}%`, "售价与成本自动计算"],
    ["成品库存", `${state.products.reduce((sum, item) => sum + Number(item.stock), 0)} 件`, "当前可销售数量"],
    ["库存估值", currency.format(productValue), "按售价粗略估算"],
  ]);
}

function metricCards(items) {
  return items.map(([label, value, note], index) => `
    <article class="metric-card" style="--stagger:${index}">
      <span>${label}</span>
      <strong>${value}</strong>
      <small>${note}</small>
    </article>
  `).join("");
}

function renderWorks() {
  const keyword = (els.workSearch.value || "").trim().toLowerCase();
  const filter = els.workFilter.value || "all";
  const works = state.works.filter((item) => {
    const text = `${item.title} ${item.category} ${item.status} ${item.note}`.toLowerCase();
    const matchKeyword = !keyword || text.includes(keyword);
    const matchFilter = filter === "all" || item.category === filter;
    return matchKeyword && matchFilter;
  });

  els.workBoard.innerHTML = works.map((item, index) => {
    const image = item.image
      ? `<img class="work-photo" src="${item.image}" alt="${escapeAttr(item.title)}" />`
      : `<div class="work-placeholder" style="--tile-a:${item.palette?.[0] || "#536f86"};--tile-b:${item.palette?.[1] || "#f3e5d1"}"></div>`;
    return `
      <article class="work-tile" draggable="true" data-id="${item.id}" style="--stagger:${index}">
        ${image}
        <div class="tile-actions">
          <button class="row-button" data-action="edit-work" data-id="${item.id}" title="编辑">✎</button>
          <button class="row-button" data-action="delete-work" data-id="${item.id}" title="删除">×</button>
        </div>
        <div class="work-info">
          <small>${escapeHtml(item.category)} · ${escapeHtml(item.status)} · ${currency.format(Number(item.price || 0))}</small>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.note)}</p>
        </div>
      </article>
    `;
  }).join("");
}

function renderProducts() {
  els.productTable.innerHTML = state.products.map((item, index) => {
    const margin = item.price ? Math.round(((item.price - item.cost) / item.price) * 100) : 0;
    return `
      <tr style="--stagger:${index}">
        <td>${escapeHtml(item.name)}</td>
        <td>${escapeHtml(item.category)}</td>
        <td>${currency.format(Number(item.price))}</td>
        <td>${currency.format(Number(item.cost))}</td>
        <td>${currency.format(Number(item.price - item.cost))} · ${margin}%</td>
        <td>${Number(item.stock)}</td>
        <td><span class="status">${escapeHtml(item.status)}</span></td>
        <td>
          <button class="row-button" data-action="edit-product" data-id="${item.id}" title="编辑">✎</button>
          <button class="row-button" data-action="delete-product" data-id="${item.id}" title="删除">×</button>
        </td>
      </tr>
    `;
  }).join("");
}

function renderColors() {
  els.colorList.innerHTML = state.colors.map((item, index) => {
    const low = item.stock < item.min;
    return `
      <article class="color-item" style="--stagger:${index}">
        <span class="swatch" style="background:${item.code}"></span>
        <div>
          <div class="color-name">${escapeHtml(item.name)}</div>
          <div class="muted">${escapeHtml(item.code)} · 最低 ${Number(item.min)} 颗</div>
        </div>
        <div class="stock-pill ${low ? "low" : ""}">${Number(item.stock)} 颗</div>
        <div class="row-actions">
          <button class="row-button" data-action="edit-color" data-id="${item.id}" title="编辑">✎</button>
          <button class="row-button" data-action="delete-color" data-id="${item.id}" title="删除">×</button>
        </div>
      </article>
    `;
  }).join("");

  const low = state.colors.filter((item) => item.stock < item.min);
  els.restockList.innerHTML = (low.length ? low : state.colors.slice(0, 4)).map((item, index) => {
    const need = Math.max(0, item.min - item.stock);
    return `
      <article class="restock-item" style="--stagger:${index}">
        <div class="color-name">${escapeHtml(item.name)}</div>
        <div class="muted">${need ? `建议补货 ${need} 颗以上` : "库存稳定，可作为常用色"}</div>
      </article>
    `;
  }).join("");

  els.consumptionList.innerHTML = state.consumptions.length
    ? state.consumptions.slice(0, 8).map((item, index) => `
      <article class="summary-item" style="--stagger:${index}">
        <div>
          <strong>${escapeHtml(item.colorName)}</strong>
          <small>${item.date} · ${escapeHtml(item.project || "未填写用途")}</small>
        </div>
        <span>${Number(item.amount)} 颗</span>
      </article>
    `).join("")
    : emptySummary("还没有记录拼豆消耗");
}

function renderLedger() {
  els.ledgerList.innerHTML = state.ledger
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((item, index) => `
      <article class="ledger-item" style="--stagger:${index}">
        <div>
          <div class="ledger-name">${escapeHtml(item.name)}</div>
          <div class="muted">${item.date} · ${item.type === "income" ? "收入" : "支出"}</div>
        </div>
        <strong class="amount ${item.type}">${item.type === "income" ? "+" : "-"}${currency.format(Number(item.amount))}</strong>
        <div class="row-actions">
          <button class="row-button" data-action="delete-ledger" data-id="${item.id}" title="删除">×</button>
        </div>
      </article>
    `).join("");
}

function renderSummary() {
  const period = getSummaryPeriod();
  const ledger = state.ledger.filter((item) => inPeriod(item.date, period));
  const consumptions = state.consumptions.filter((item) => inPeriod(item.date, period));
  const income = ledger.filter((item) => item.type === "income").reduce((sum, item) => sum + Number(item.amount), 0);
  const expense = ledger.filter((item) => item.type === "expense").reduce((sum, item) => sum + Number(item.amount), 0);
  const profit = income - expense;
  const consumed = consumptions.reduce((sum, item) => sum + Number(item.amount), 0);
  const productValue = state.products.reduce((sum, item) => sum + Number(item.price) * Number(item.stock), 0);
  const lowColors = state.colors.filter((item) => item.stock < item.min);
  const profitRate = income ? Math.round((profit / income) * 100) : 0;

  els.summaryPeriodLabel.textContent = `${period.label} · ${period.mode === "day" ? "Daily Review" : period.mode === "month" ? "Monthly Review" : "Yearly Review"}`;
  els.summaryHeadline.textContent = period.mode === "day" ? "每日经营总结" : period.mode === "month" ? "月度经营总结" : "年度经营总结";
  els.summaryNarrative.textContent = buildNarrative({ income, expense, profit, profitRate, consumed, lowColors, period });

  els.summaryMetrics.innerHTML = metricCards([
    ["收入", currency.format(income), `${ledger.filter((item) => item.type === "income").length} 条收入记录`],
    ["支出", currency.format(expense), `${ledger.filter((item) => item.type === "expense").length} 条支出记录`],
    ["净利润", currency.format(profit), `利润率 ${profitRate}%`],
    ["拼豆消耗", `${consumed} 颗`, `${consumptions.length} 条消耗记录`],
  ]);

  els.usageSummary.innerHTML = renderUsageSummary(consumptions);
  els.moneySummary.innerHTML = renderMoneySummary(ledger, income, expense);
  els.stockSummary.innerHTML = renderStockSummary(productValue, lowColors);
}

function getSummaryPeriod() {
  const mode = els.summaryMode.value;
  if (mode === "year") {
    const year = String(els.summaryYear.value || new Date().getFullYear());
    return { mode, value: year, label: `${year} 年` };
  }
  if (mode === "day") {
    const day = els.summaryDay.value || today;
    return { mode, value: day, label: day };
  }
  const month = els.summaryMonth.value || today.slice(0, 7);
  return { mode, value: month, label: `${month.replace("-", " 年 ")} 月` };
}

function inPeriod(date, period) {
  if (!date) return false;
  return period.mode === "year" ? date.startsWith(period.value) : date.startsWith(period.value);
}

function buildNarrative({ income, expense, profit, profitRate, consumed, lowColors, period }) {
  const cash = profit >= 0
    ? `本期利润为 ${currency.format(profit)}，整体现金流是正向的。`
    : `本期利润为 ${currency.format(profit)}，支出暂时高于收入，需要复盘材料或包装投入。`;
  const usage = consumed
    ? `拼豆共消耗 ${consumed} 颗，可以结合热卖作品判断下期补货重点。`
    : "本期还没有记录拼豆消耗，建议制作时顺手记录颜色和颗数。";
  const stock = lowColors.length
    ? `目前有 ${lowColors.length} 个颜色低于安全库存，优先补 ${lowColors.slice(0, 3).map((item) => item.name).join("、")}。`
    : "颜色库存整体稳定，没有明显低库存风险。";
  return `${period.label}：收入 ${currency.format(income)}，支出 ${currency.format(expense)}，利润率 ${profitRate}%。${cash}${usage}${stock}`;
}

function renderUsageSummary(consumptions) {
  const grouped = groupByName(consumptions, "colorName", "amount");
  if (!grouped.length) return emptySummary("本期暂无拼豆消耗记录");
  const max = Math.max(...grouped.map((item) => item.total), 1);
  return grouped.map((item, index) => `
    <article class="summary-item" style="--stagger:${index}">
      <div>
        <strong>${escapeHtml(item.name)}</strong>
        <small>${item.count} 次记录</small>
      </div>
      <span>${item.total} 颗</span>
      <div class="summary-bar"><span style="--bar:${Math.round((item.total / max) * 100)}%"></span></div>
    </article>
  `).join("");
}

function renderMoneySummary(ledger, income, expense) {
  const rows = [
    { name: "收入合计", total: income, count: ledger.filter((item) => item.type === "income").length },
    { name: "支出合计", total: expense, count: ledger.filter((item) => item.type === "expense").length },
    ...groupByName(ledger, "name", "amount").slice(0, 4),
  ];
  if (!ledger.length) return emptySummary("本期暂无收支记录");
  const max = Math.max(...rows.map((item) => item.total), 1);
  return rows.map((item, index) => `
    <article class="summary-item" style="--stagger:${index}">
      <div>
        <strong>${escapeHtml(item.name)}</strong>
        <small>${item.count} 条记录</small>
      </div>
      <span>${currency.format(item.total)}</span>
      <div class="summary-bar"><span style="--bar:${Math.round((item.total / max) * 100)}%"></span></div>
    </article>
  `).join("");
}

function renderStockSummary(productValue, lowColors) {
  const stockCount = state.products.reduce((sum, item) => sum + Number(item.stock), 0);
  const beadCount = state.colors.reduce((sum, item) => sum + Number(item.stock), 0);
  const rows = [
    { name: "成品库存", value: `${stockCount} 件`, note: `估值 ${currency.format(productValue)}` },
    { name: "拼豆库存", value: `${beadCount} 颗`, note: `${state.colors.length} 个颜色` },
    { name: "低库存颜色", value: `${lowColors.length} 个`, note: lowColors.length ? lowColors.map((item) => item.name).slice(0, 4).join("、") : "暂无预警" },
    { name: "作品库", value: `${state.works.length} 件`, note: "用于展示和内容发布" },
  ];
  return rows.map((item, index) => `
    <article class="summary-item" style="--stagger:${index}">
      <div>
        <strong>${escapeHtml(item.name)}</strong>
        <small>${escapeHtml(item.note)}</small>
      </div>
      <span>${escapeHtml(item.value)}</span>
    </article>
  `).join("");
}

function groupByName(items, nameKey, valueKey) {
  const map = new Map();
  items.forEach((item) => {
    const name = item[nameKey] || "未命名";
    const current = map.get(name) || { name, total: 0, count: 0 };
    current.total += Number(item[valueKey] || 0);
    current.count += 1;
    map.set(name, current);
  });
  return [...map.values()].sort((a, b) => b.total - a.total);
}

function emptySummary(text) {
  return `<article class="summary-item" style="--stagger:0"><div><strong>${text}</strong><small>记录后会自动出现在这里</small></div><span>0</span></article>`;
}

function sumLedger(type, date = "") {
  return state.ledger
    .filter((item) => item.type === type && (!date || item.date === date))
    .reduce((sum, item) => sum + Number(item.amount), 0);
}

function openEditor(kind, item) {
  editContext = { kind, id: item.id };
  const titles = { product: "编辑产品", color: "编辑颜色", work: "编辑作品", consume: "记录拼豆消耗" };
  els.dialogTitle.textContent = titles[kind];
  if (kind === "product") els.dialogFields.innerHTML = productFields(item);
  if (kind === "color") els.dialogFields.innerHTML = colorFields(item);
  if (kind === "work") els.dialogFields.innerHTML = workFields(item);
  if (kind === "consume") els.dialogFields.innerHTML = consumeFields();
  els.dialog.showModal();
}

function productFields(item) {
  return `
    <input name="name" value="${escapeAttr(item.name)}" placeholder="产品名称" required />
    <input name="category" value="${escapeAttr(item.category)}" placeholder="分类" required />
    <input name="price" type="number" min="0" step="0.01" value="${item.price}" placeholder="售价" required />
    <input name="cost" type="number" min="0" step="0.01" value="${item.cost}" placeholder="成本" required />
    <input name="stock" type="number" min="0" step="1" value="${item.stock}" placeholder="库存" required />
    <input name="status" value="${escapeAttr(item.status)}" placeholder="状态" required />
  `;
}

function colorFields(item) {
  return `
    <input name="name" value="${escapeAttr(item.name)}" placeholder="颜色名称" required />
    <input name="code" type="color" value="${item.code}" aria-label="颜色" required />
    <input name="stock" type="number" min="0" step="1" value="${item.stock}" placeholder="当前颗数" required />
    <input name="min" type="number" min="0" step="1" value="${item.min}" placeholder="最低库存" required />
  `;
}

function workFields(item) {
  return `
    <input name="title" value="${escapeAttr(item.title)}" placeholder="作品名称" required />
    <select name="category" required>
      ${["现货", "定制", "礼盒", "钥匙扣", "杯垫"].map((value) => `<option ${item.category === value ? "selected" : ""}>${value}</option>`).join("")}
    </select>
    <input name="price" type="number" min="0" step="0.01" value="${item.price}" placeholder="展示价格" required />
    <input name="status" value="${escapeAttr(item.status)}" placeholder="状态，例如：可售 / 已售 / 预约" required />
    <textarea name="note" placeholder="作品介绍">${escapeHtml(item.note)}</textarea>
  `;
}

function consumeFields() {
  return `
    <select name="colorId" required>
      ${state.colors.map((item) => `<option value="${item.id}">${escapeHtml(item.name)} · ${item.stock} 颗</option>`).join("")}
    </select>
    <input name="amount" type="number" min="1" step="1" placeholder="消耗颗数" required />
    <input name="project" type="text" placeholder="用途，例如：花束钥匙扣 / 客单定制" />
    <input name="date" type="date" value="${today}" required />
  `;
}

function createWork(fileName = "新作品", image = "") {
  return {
    id: crypto.randomUUID(),
    title: fileName.replace(/\.[^.]+$/, "") || "新作品",
    category: "现货",
    price: 39,
    status: "整理中",
    note: "上传照片后可编辑标题、分类、价格和说明。",
    image,
    palette: ["#b98d43", "#f2ddbd"],
  };
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function prepareMotion() {
  const activePage = document.querySelector(".page.active");
  if (!activePage) return;
  const targets = activePage.querySelectorAll([
    ".page-head",
    ".section-heading",
    ".metric-card",
    ".home-links a",
    ".panel",
    ".work-tile",
    ".color-item",
    ".restock-item",
    ".ledger-item",
    ".summary-item",
    "tbody tr",
    ".toolbar",
  ].join(","));

  targets.forEach((target, index) => {
    if (target.classList.contains("is-visible")) return;
    target.dataset.reveal = "";
    if (!target.style.getPropertyValue("--stagger")) target.style.setProperty("--stagger", Math.min(index, 10));
    target.classList.remove("is-visible");
    revealObserver.observe(target);
  });
}

document.querySelector("#addProduct").addEventListener("click", () => {
  const item = { id: crypto.randomUUID(), name: "新产品", category: "现货", price: 39, cost: 12, stock: 1, status: "编辑中" };
  state.products.unshift(item);
  openEditor("product", item);
  render();
});

document.querySelector("#addColor").addEventListener("click", () => {
  const item = { id: crypto.randomUUID(), name: "新颜色", code: "#b98d43", stock: 100, min: 200 };
  state.colors.unshift(item);
  openEditor("color", item);
  render();
});

document.querySelector("#addWork").addEventListener("click", () => {
  const item = createWork();
  state.works.unshift(item);
  openEditor("work", item);
  render();
});

document.querySelector("#consumeColor").addEventListener("click", () => {
  editContext = { kind: "consume" };
  openEditor("consume", {});
});

els.workSearch.addEventListener("input", renderWorks);
els.workFilter.addEventListener("change", renderWorks);
els.summaryMode.addEventListener("change", () => {
  els.summaryDay.style.display = els.summaryMode.value === "day" ? "block" : "none";
  els.summaryMonth.style.display = els.summaryMode.value === "month" ? "block" : "none";
  els.summaryYear.style.display = els.summaryMode.value === "year" ? "block" : "none";
  renderSummary();
});
els.summaryDay.addEventListener("change", renderSummary);
els.summaryMonth.addEventListener("change", renderSummary);
els.summaryYear.addEventListener("input", renderSummary);
els.summaryMode.value = "day";
els.summaryMonth.style.display = "none";
els.summaryYear.style.display = "none";

els.workUpload.addEventListener("change", async (event) => {
  const files = [...event.target.files].filter((file) => file.type.startsWith("image/"));
  const loaded = await Promise.all(files.map(readImageFile));
  loaded.forEach(({ name, image }) => state.works.unshift(createWork(name, image)));
  event.target.value = "";
  render();
});

function readImageFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ name: file.name, image: reader.result });
    reader.readAsDataURL(file);
  });
}

document.body.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const { action, id } = button.dataset;
  if (action === "edit-product") openEditor("product", state.products.find((item) => item.id === id));
  if (action === "edit-color") openEditor("color", state.colors.find((item) => item.id === id));
  if (action === "edit-work") openEditor("work", state.works.find((item) => item.id === id));
  if (action === "delete-product") state.products = state.products.filter((item) => item.id !== id);
  if (action === "delete-color") state.colors = state.colors.filter((item) => item.id !== id);
  if (action === "delete-work") state.works = state.works.filter((item) => item.id !== id);
  if (action === "delete-ledger") state.ledger = state.ledger.filter((item) => item.id !== id);
  render();
});

els.workBoard.addEventListener("dragstart", (event) => {
  const tile = event.target.closest(".work-tile");
  if (!tile) return;
  dragId = tile.dataset.id;
  tile.classList.add("dragging");
});

els.workBoard.addEventListener("dragend", (event) => {
  event.target.closest(".work-tile")?.classList.remove("dragging");
  dragId = null;
});

els.workBoard.addEventListener("dragover", (event) => {
  event.preventDefault();
  const tile = event.target.closest(".work-tile");
  if (!tile || !dragId || tile.dataset.id === dragId) return;
  const from = state.works.findIndex((item) => item.id === dragId);
  const to = state.works.findIndex((item) => item.id === tile.dataset.id);
  const [moved] = state.works.splice(from, 1);
  state.works.splice(to, 0, moved);
  render();
});

els.editForm.addEventListener("submit", () => {
  if (!editContext) return;
  const data = Object.fromEntries(new FormData(els.editForm));

  if (editContext.kind === "consume") {
    const color = state.colors.find((item) => item.id === data.colorId);
    if (color) {
      const amount = Number(data.amount);
      color.stock = Math.max(0, Number(color.stock) - amount);
      state.consumptions.unshift({
        id: crypto.randomUUID(),
        colorId: color.id,
        colorName: color.name,
        amount,
        date: data.date || today,
        project: data.project || "未填写用途",
      });
    }
  } else {
    const map = { product: state.products, color: state.colors, work: state.works };
    const item = map[editContext.kind].find((entry) => entry.id === editContext.id);
    Object.assign(item, data);
    ["price", "cost", "stock", "min"].forEach((key) => {
      if (key in item) item[key] = Number(item[key]);
    });
  }

  render();
  els.dialog.close();
});

els.closeDialog.addEventListener("click", () => els.dialog.close());

els.ledgerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.querySelector("#ledgerName").value.trim();
  const amount = Number(document.querySelector("#ledgerAmount").value);
  const date = document.querySelector("#ledgerDate").value || today;
  const type = document.querySelector("#ledgerType").value;
  if (!name || !amount) return;

  state.ledger.unshift({ id: crypto.randomUUID(), type, name, amount, date });
  els.ledgerForm.reset();
  els.ledgerDate.value = today;
  render();
});

window.addEventListener("hashchange", route);
route();
render();
