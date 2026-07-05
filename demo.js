const frame = document.querySelector("#siteFrame");
const stage = document.querySelector(".stage");
const cursor = document.querySelector("#cursor");
const clickRing = document.querySelector("#clickRing");
const focusFrame = document.querySelector("#focusFrame");
const stepCount = document.querySelector("#stepCount");
const captionTitle = document.querySelector("#captionTitle");
const captionText = document.querySelector("#captionText");
const progressBar = document.querySelector("#progressBar");
const chapterStrip = document.querySelector("#chapterStrip");
const replayButton = document.querySelector("#replayDemo");

const scenes = [
  {
    route: "home",
    title: "品牌首页",
    text: "镜头从品牌首屏进入，看到动态背景、拼豆轨道和实时利润卡片，先建立完整工作室气质。",
    cursor: [28, 72],
    click: [30, 72],
    camera: { zoom: 1.08, x: "-2%", y: "0%", ox: "34%", oy: "54%" },
    focus: [6, 14, 52, 74],
    scroll: 0,
  },
  {
    route: "home",
    title: "经营看板",
    text: "镜头下移到经营看板，收入、利润、作品数量和库存预警像产品仪表盘一样被快速扫过。",
    cursor: [54, 55],
    camera: { zoom: 1.2, x: "0%", y: "-28%", ox: "52%", oy: "78%" },
    focus: [8, 50, 62, 20],
    scroll: 760,
  },
  {
    route: "works",
    title: "作品库",
    text: "点击进入作品页面，上传作品照片后会自动生成杂志式作品墙，适合展示钥匙扣、杯垫和定制头像。",
    cursor: [74, 10],
    click: [74, 10],
    camera: { zoom: 1.02, x: "0%", y: "0%", ox: "50%", oy: "20%" },
    focus: [4, 12, 72, 22],
    scroll: 0,
  },
  {
    route: "works",
    title: "拖拽与编辑",
    text: "鼠标移动到作品卡片，强调可编辑、可删除、可拖拽排序，作品拍进去后会自然排得漂亮。",
    cursor: [42, 62],
    click: [42, 62],
    camera: { zoom: 1.25, x: "-6%", y: "-18%", ox: "42%", oy: "62%" },
    focus: [8, 36, 66, 45],
    scroll: 180,
  },
  {
    route: "products",
    title: "产品价格",
    text: "切换到价格页，售价、成本、毛利和库存集中管理，适合现货与定制订单一起整理。",
    cursor: [79, 10],
    click: [79, 10],
    camera: { zoom: 1.12, x: "0%", y: "-8%", ox: "50%", oy: "44%" },
    focus: [5, 34, 82, 48],
    scroll: 120,
  },
  {
    route: "inventory",
    title: "颜色库存",
    text: "进入拼豆颜色库存页面，镜头突出色卡、安全线、低库存提醒和制作消耗记录。",
    cursor: [84, 10],
    click: [84, 10],
    camera: { zoom: 1.14, x: "-2%", y: "-9%", ox: "40%", oy: "50%" },
    focus: [4, 29, 58, 56],
    scroll: 100,
  },
  {
    route: "finance",
    title: "财务利润",
    text: "最后进入财务账本，收入、支出、净利润和利润率自动汇总，适合每天快速复盘。",
    cursor: [89, 10],
    click: [89, 10],
    camera: { zoom: 1.14, x: "0%", y: "-8%", ox: "54%", oy: "42%" },
    focus: [5, 28, 82, 55],
    scroll: 60,
  },
  {
    route: "summary",
    title: "月报年报",
    text: "进入经营总结页面，可以切换月总结和年总结，查看金钱、库存消耗、低库存颜色与经营建议。",
    cursor: [91, 10],
    click: [91, 10],
    camera: { zoom: 1.12, x: "0%", y: "-7%", ox: "54%", oy: "42%" },
    focus: [5, 20, 84, 62],
    scroll: 80,
  },
  {
    route: "home",
    title: "完整闭环",
    text: "作品、价格、库存、财务和月报年报形成一个完整闭环：从拍作品到算利润，再到复盘增长。",
    cursor: [50, 48],
    camera: { zoom: 1, x: "0%", y: "0%", ox: "50%", oy: "50%" },
    focus: [0, 0, 0, 0],
    scroll: 0,
  },
];

let timer = null;
let sceneIndex = 0;

chapterStrip.innerHTML = scenes
  .map((scene, index) => `<button class="chapter" data-index="${index}">${String(index + 1).padStart(2, "0")} ${scene.title}</button>`)
  .join("");

function sleep(ms) {
  return new Promise((resolve) => {
    timer = setTimeout(resolve, ms);
  });
}

function applyScene(scene, index) {
  frame.src = `./index.html#/${scene.route}`;
  stage.style.setProperty("--zoom", scene.camera.zoom);
  stage.style.setProperty("--pan-x", scene.camera.x);
  stage.style.setProperty("--pan-y", scene.camera.y);
  stage.style.setProperty("--origin-x", scene.camera.ox);
  stage.style.setProperty("--origin-y", scene.camera.oy);

  moveCursor(scene.cursor);
  if (scene.click) popClick(scene.click);
  setFocus(scene.focus);

  stepCount.textContent = `${String(index + 1).padStart(2, "0")} / ${String(scenes.length).padStart(2, "0")}`;
  captionTitle.textContent = scene.title;
  captionText.textContent = scene.text;
  progressBar.style.width = `${((index + 1) / scenes.length) * 100}%`;
  document.querySelectorAll(".chapter").forEach((node, nodeIndex) => node.classList.toggle("active", nodeIndex === index));

  setTimeout(() => scrollFrame(scene.scroll || 0), 750);
}

function moveCursor(point) {
  cursor.style.setProperty("--x", `${point[0]}%`);
  cursor.style.setProperty("--y", `${point[1]}%`);
}

function popClick(point) {
  clickRing.classList.remove("pop");
  clickRing.style.setProperty("--x", `${point[0]}%`);
  clickRing.style.setProperty("--y", `${point[1]}%`);
  void clickRing.offsetWidth;
  clickRing.classList.add("pop");
}

function setFocus(box) {
  const [left, top, width, height] = box;
  focusFrame.style.setProperty("--left", `${left}%`);
  focusFrame.style.setProperty("--top", `${top}%`);
  focusFrame.style.setProperty("--width", `${width}%`);
  focusFrame.style.setProperty("--height", `${height}%`);
  focusFrame.style.setProperty("--frame-opacity", width && height ? 1 : 0);
}

function scrollFrame(top) {
  try {
    frame.contentWindow.scrollTo({ top, behavior: "smooth" });
  } catch {
    frame.contentWindow.location.hash = frame.contentWindow.location.hash;
  }
}

async function play(from = 0) {
  clearTimeout(timer);
  sceneIndex = from;
  while (sceneIndex < scenes.length) {
    applyScene(scenes[sceneIndex], sceneIndex);
    await sleep(sceneIndex === 0 ? 5200 : 4600);
    sceneIndex += 1;
  }
}

replayButton.addEventListener("click", () => play(0));

chapterStrip.addEventListener("click", (event) => {
  const button = event.target.closest("[data-index]");
  if (!button) return;
  play(Number(button.dataset.index));
});

frame.addEventListener("load", () => {
  scrollFrame(scenes[sceneIndex]?.scroll || 0);
});

play(0);
