const zhaoAccountUrls = {
  profile: "./data/account-profile.json",
  actions: "./data/account-actions.json",
  menu: "./data/account-menu.json",
  messages: "./data/account-messages.json"
};
const zhaoAccountState = { data: {}, toastTimer: 0, scanActive: false, selectedTimer: "关闭" };
const zhaoAccountNodes = {
  greeting: document.querySelector("#zhao-greeting"), subtitle: document.querySelector("#zhao-member-subtitle"),
  news: document.querySelector("#zhao-member-news-text"), actions: document.querySelector("#zhao-actions-grid"),
  menu: document.querySelector("#zhao-menu-list"), overlay: document.querySelector("#zhao-overlay"),
  title: document.querySelector("#zhao-sheet-title"), content: document.querySelector("#zhao-sheet-content"), toast: document.querySelector("#zhao-toast")
};

async function zhaoAccountFetch(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`Unable to load ${url}`);
  return response.json();
}

function zhaoAccountToast(message) {
  clearTimeout(zhaoAccountState.toastTimer);
  zhaoAccountNodes.toast.textContent = message;
  zhaoAccountNodes.toast.classList.add("zhao-is-visible");
  zhaoAccountState.toastTimer = setTimeout(() => zhaoAccountNodes.toast.classList.remove("zhao-is-visible"), 1800);
}

function zhaoAccountOpenSheet(title, content) {
  zhaoAccountNodes.title.textContent = title;
  zhaoAccountNodes.content.replaceChildren(content);
  zhaoAccountNodes.overlay.hidden = false;
}

function zhaoAccountCloseSheet() { zhaoAccountNodes.overlay.hidden = true; }

function zhaoAccountButton(text, action) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = text;
  button.addEventListener("click", action);
  return button;
}

function zhaoAccountOpenTimer() {
  const content = document.createElement("div");
  content.textContent = "设置本次播放的自动停止时间";
  const options = document.createElement("div");
  options.className = "zhao-sheet-options";
  ["10分钟", "30分钟", "60分钟", "关闭"].forEach((label) => options.append(zhaoAccountButton(label, () => {
    zhaoAccountState.selectedTimer = label;
    zhaoAccountCloseSheet();
    zhaoAccountToast(label === "关闭" ? "定时关闭已取消" : `已设置 ${label} 后停止播放`);
  })));
  content.append(options);
  zhaoAccountOpenSheet("定时关闭", content);
}

function zhaoAccountOpenSettings() {
  const content = document.createElement("div");
  ["消息通知", "Wi-Fi 自动播放", "个性化推荐", "高品质音质"].forEach((label, index) => {
    const row = document.createElement("div");
    row.className = "zhao-setting-row";
    const text = document.createElement("span");
    text.textContent = label;
    const toggle = document.createElement("button");
    toggle.className = `zhao-switch${index !== 1 ? " zhao-is-on" : ""}`;
    toggle.type = "button";
    toggle.setAttribute("role", "switch");
    toggle.setAttribute("aria-checked", String(index !== 1));
    toggle.setAttribute("aria-label", label);
    toggle.addEventListener("click", () => {
      const enabled = toggle.classList.toggle("zhao-is-on");
      toggle.setAttribute("aria-checked", String(enabled));
    });
    row.append(text, toggle);
    content.append(row);
  });
  zhaoAccountOpenSheet("设置", content);
}

function zhaoAccountOpenMessages() {
  const content = document.createElement("div");
  zhaoAccountState.data.messages.forEach((message) => {
    const row = document.createElement("div");
    row.className = "zhao-setting-row";
    const copy = document.createElement("span");
    copy.textContent = `${message.from}：${message.text}`;
    const time = document.createElement("small");
    time.textContent = message.time;
    row.append(copy, time);
    content.append(row);
  });
  zhaoAccountOpenSheet("我的消息", content);
}

function zhaoAccountAction(action) {
  if (action === "timer") return zhaoAccountOpenTimer();
  if (action === "settings") return zhaoAccountOpenSettings();
  if (action === "scan") {
    const content = document.createElement("div");
    const message = document.createElement("p");
    message.textContent = zhaoAccountState.scanActive ? "正在识别附近的歌曲…" : "将二维码放入取景框内，即可快速打开歌曲和歌单。";
    const button = document.createElement("button");
    button.className = "zhao-sheet-primary";
    button.type = "button";
    button.textContent = zhaoAccountState.scanActive ? "停止扫描" : "开始扫一扫";
    button.addEventListener("click", () => {
      zhaoAccountState.scanActive = !zhaoAccountState.scanActive;
      zhaoAccountCloseSheet();
      zhaoAccountToast(zhaoAccountState.scanActive ? "扫一扫已开启" : "扫描已结束");
    });
    content.append(message, button);
    return zhaoAccountOpenSheet("扫一扫", content);
  }
  if (action === "recognize") {
    const content = document.createElement("div");
    content.textContent = "正在聆听周围的音乐，轻触下方按钮开始识别。";
    const button = document.createElement("button");
    button.className = "zhao-sheet-primary";
    button.type = "button";
    button.textContent = "开始识别";
    button.addEventListener("click", () => { zhaoAccountCloseSheet(); zhaoAccountToast("正在识别歌曲…"); });
    content.append(button);
    return zhaoAccountOpenSheet("听歌识曲", content);
  }
  zhaoAccountToast(`打开${action}`);
}

function zhaoAccountRenderActions(actions) {
  zhaoAccountNodes.actions.replaceChildren(...actions.map((item) => {
    const button = document.createElement("button");
    button.className = "zhao-action-button";
    button.type = "button";
    const icon = document.createElement("span");
    icon.className = "zhao-action-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = item.icon;
    const title = document.createElement("span");
    title.textContent = item.title;
    button.append(icon, title);
    button.addEventListener("click", () => zhaoAccountAction(item.action));
    return button;
  }));
}

function zhaoAccountRenderMenu(items) {
  zhaoAccountNodes.menu.replaceChildren(...items.map((item) => {
    const button = document.createElement("button");
    button.className = `zhao-menu-row${item.divider ? " zhao-menu-divider" : ""}`;
    button.type = "button";
    button.dataset.menuAction = item.action;
    const icon = document.createElement("span");
    icon.className = "zhao-menu-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = item.icon;
    const title = document.createElement("span");
    title.className = "zhao-menu-title";
    title.textContent = item.title;
    const detail = document.createElement("span");
    detail.className = "zhao-menu-detail";
    if (item.detail) detail.append(document.createTextNode(item.detail));
    if (item.avatar) {
      const avatar = document.createElement("img");
      avatar.src = item.avatar.replace("../assets", "./assets");
      avatar.alt = "";
      detail.append(avatar);
    }
    if (item.dot) {
      const dot = document.createElement("span");
      dot.className = "zhao-menu-dot";
      dot.setAttribute("aria-label", "有新内容");
      detail.append(dot);
    }
    button.append(icon, title, detail);
    button.addEventListener("click", () => item.action === "messages" ? zhaoAccountOpenMessages() : item.action === "preferences" ? zhaoAccountOpenSettings() : zhaoAccountAction(item.title));
    return button;
  }));
}

function zhaoAccountBind() {
  document.querySelector("#zhao-sheet-close").addEventListener("click", zhaoAccountCloseSheet);
  zhaoAccountNodes.overlay.addEventListener("click", (event) => { if (event.target === zhaoAccountNodes.overlay) zhaoAccountCloseSheet(); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !zhaoAccountNodes.overlay.hidden) zhaoAccountCloseSheet(); });
  document.querySelector("#zhao-entitlement-button").addEventListener("click", () => zhaoAccountAction("VIP特权"));
  document.querySelector("#zhao-member-news").addEventListener("click", () => zhaoAccountAction("演出资讯"));
  document.querySelector("#zhao-back-button").addEventListener("click", () => zhaoAccountToast("已返回音乐首页"));
  document.querySelector("#zhao-header-menu").addEventListener("click", () => zhaoAccountAction("更多选项"));
}

async function zhaoAccountInitialize() {
  zhaoAccountBind();
  const results = await Promise.allSettled(Object.entries(zhaoAccountUrls).map(async ([key, url]) => [key, await zhaoAccountFetch(url)]));
  const data = Object.fromEntries(results.filter((result) => result.status === "fulfilled").map((result) => result.value));
  zhaoAccountState.data = data;
  if (data.profile) {
    zhaoAccountNodes.greeting.textContent = `Hi, ${data.profile.name}`;
    zhaoAccountNodes.subtitle.textContent = data.profile.subtitle;
    zhaoAccountNodes.news.textContent = data.profile.news;
    document.querySelector("#zhao-version-label").textContent = data.profile.version;
  }
  if (data.actions) zhaoAccountRenderActions(data.actions);
  else zhaoAccountNodes.actions.textContent = "工具暂时无法加载。";
  if (data.menu) zhaoAccountRenderMenu(data.menu);
  else zhaoAccountNodes.menu.textContent = "菜单暂时无法加载。";
  if (!data.messages) zhaoAccountState.data.messages = [];
}

zhaoAccountInitialize();