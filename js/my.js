const zhaoMyDataUrls = {
  navigation: "./data/navigation.json",
  banners: "./data/banners.json",
  songs: "./data/songs.json",
  shortcuts: "./data/shortcuts.json"
};

const zhaoMyState = { songs: [], banners: [], slide: 0, playing: false, currentSongId: "", toastTimer: 0 };
const zhaoMyElements = {
  topNav: document.querySelector("#zhao-top-nav"), bottomNav: document.querySelector("#zhao-bottom-nav"),
  carouselTrack: document.querySelector("#zhao-carousel-track"), carouselDots: document.querySelector("#zhao-carousel-dots"),
  songs: document.querySelector("#zhao-song-list"), searchForm: document.querySelector("#zhao-search-form"),
  searchInput: document.querySelector("#zhao-search-input"), resultsStatus: document.querySelector("#zhao-results-status"),
  toast: document.querySelector("#zhao-toast"), playerCover: document.querySelector("#zhao-player-cover"),
  playerTitle: document.querySelector("#zhao-player-title"), playerArtist: document.querySelector("#zhao-player-artist"),
  playToggle: document.querySelector("#zhao-play-toggle"), playerLike: document.querySelector("#zhao-player-like"),
  discover: document.querySelector("#zhao-discover-strip")
};

async function zhaoMyFetchJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`Request failed: ${url}`);
  return response.json();
}

function zhaoMyToast(message) {
  clearTimeout(zhaoMyState.toastTimer);
  zhaoMyElements.toast.textContent = message;
  zhaoMyElements.toast.classList.add("zhao-is-visible");
  zhaoMyState.toastTimer = setTimeout(() => zhaoMyElements.toast.classList.remove("zhao-is-visible"), 1800);
}

function zhaoMyRenderBanners() {
  zhaoMyElements.carouselTrack.replaceChildren(...zhaoMyState.banners.map((banner, index) => {
    const card = document.createElement("article");
    card.className = "zhao-feature-card";
    card.dataset.theme = banner.theme;
    card.dataset.slide = String(index);
    card.setAttribute("aria-label", banner.title.replace("\n", " "));
    const copy = document.createElement("div");
    copy.className = "zhao-feature-copy";
    const title = document.createElement("h2");
    title.className = "zhao-feature-title";
    title.textContent = banner.title.replace("\n", " ");
    const description = document.createElement("p");
    description.className = "zhao-feature-description";
    description.textContent = banner.description;
    const art = document.createElement("img");
    art.className = "zhao-feature-art";
    art.src = banner.cover;
    art.alt = `${title.textContent} 推荐封面`;
    const action = document.createElement("button");
    action.className = "zhao-feature-action";
    action.type = "button";
    action.dataset.bannerIndex = String(index);
    action.setAttribute("aria-label", banner.action);
    action.textContent = "▶";
    copy.append(title, description);
    card.append(copy, art, action);
    return card;
  }));
  zhaoMyElements.carouselDots.replaceChildren(...zhaoMyState.banners.map((_, index) => {
    const dot = document.createElement("button");
    dot.className = `zhao-carousel-dot${index === 0 ? " zhao-is-active" : ""}`;
    dot.type = "button";
    dot.dataset.slide = String(index);
    dot.setAttribute("aria-label", `查看推荐 ${index + 1}`);
    return dot;
  }));
}

function zhaoMyGoToSlide(index) {
  if (!zhaoMyState.banners.length) return;
  zhaoMyState.slide = (index + zhaoMyState.banners.length) % zhaoMyState.banners.length;
  const card = zhaoMyElements.carouselTrack.querySelector(`[data-slide="${zhaoMyState.slide}"]`);
  card?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  zhaoMyElements.carouselDots.querySelectorAll(".zhao-carousel-dot").forEach((dot, dotIndex) => {
    dot.classList.toggle("zhao-is-active", dotIndex === zhaoMyState.slide);
    dot.setAttribute("aria-current", dotIndex === zhaoMyState.slide ? "true" : "false");
  });
}

function zhaoMyRenderSongs(songs, status = `${songs.length} 首专属好歌`) {
  zhaoMyElements.resultsStatus.textContent = status;
  if (!songs.length) {
    const empty = document.createElement("li");
    empty.className = "zhao-empty-state";
    empty.textContent = "没有找到相关歌曲，换个关键词试试。";
    zhaoMyElements.songs.replaceChildren(empty);
    return;
  }
  zhaoMyElements.songs.replaceChildren(...songs.map((song, index) => {
    const row = document.createElement("li");
    row.className = "zhao-song-row";
    row.dataset.songId = song.id;
    row.style.animationDelay = `${Math.min(index * 35, 140)}ms`;
    const cover = document.createElement("img");
    cover.className = "zhao-song-cover";
    cover.src = song.cover;
    cover.alt = `${song.title} 封面`;
    const info = document.createElement("div");
    info.className = "zhao-song-info";
    const title = document.createElement("span");
    title.className = "zhao-song-title";
    title.textContent = song.title;
    const detail = document.createElement("span");
    detail.className = "zhao-song-detail";
    detail.textContent = song.artist;
    info.append(title, detail);
    const like = document.createElement("button");
    like.className = `zhao-like-button${song.liked ? " zhao-is-liked" : ""}`;
    like.type = "button";
    like.dataset.likeId = song.id;
    like.setAttribute("aria-label", song.liked ? `取消收藏 ${song.title}` : `收藏 ${song.title}`);
    like.setAttribute("aria-pressed", String(song.liked));
    like.textContent = song.liked ? "♥" : "♡";
    row.append(cover, info, like);
    return row;
  }));
}

function zhaoMyRenderShortcuts(shortcuts) {
  const covers = ["./assets/cover-sunrise.svg", "./assets/cover-night.svg", "./assets/cover-coast.svg", "./assets/cover-moon.svg"];
  zhaoMyElements.discover.replaceChildren(...shortcuts.map((shortcut, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.shortcut = shortcut.title;
    const cover = document.createElement("img");
    cover.src = covers[index % covers.length];
    cover.alt = `${shortcut.title} 封面`;
    const title = document.createElement("span");
    title.textContent = shortcut.title;
    const subtitle = document.createElement("small");
    subtitle.textContent = shortcut.subtitle;
    button.append(cover, title, subtitle);
    button.addEventListener("click", () => zhaoMyToast(`打开${shortcut.title}`));
    return button;
  }));
}

function zhaoMySetSong(song) {
  zhaoMyState.currentSongId = song.id;
  zhaoMyElements.playerCover.src = song.cover;
  zhaoMyElements.playerCover.alt = `${song.title} 封面`;
  zhaoMyElements.playerTitle.textContent = song.title;
  zhaoMyElements.playerArtist.textContent = `${song.artist} · 酷狗音乐`;
  zhaoMyElements.playerLike.classList.toggle("zhao-is-liked", song.liked);
  zhaoMyElements.playerLike.textContent = song.liked ? "♥" : "♡";
  zhaoMyElements.playerLike.setAttribute("aria-pressed", String(song.liked));
  zhaoMyElements.playerLike.setAttribute("aria-label", song.liked ? `取消收藏 ${song.title}` : `收藏 ${song.title}`);
}

function zhaoMyLike(songId) {
  const song = zhaoMyState.songs.find((item) => item.id === songId);
  if (!song) return;
  song.liked = !song.liked;
  zhaoMyRenderSongs(zhaoMyState.songs.filter((item) => `${item.title} ${item.artist} ${item.album}`.toLowerCase().includes(zhaoMyElements.searchInput.value.trim().toLowerCase())), zhaoMyElements.resultsStatus.textContent);
  if (song.id === zhaoMyState.currentSongId) zhaoMySetSong(song);
  zhaoMyToast(song.liked ? "已加入我喜欢" : "已取消收藏");
}

function zhaoMyPlay(song) {
  zhaoMySetSong(song);
  zhaoMyState.playing = true;
  zhaoMyUpdatePlayback();
  zhaoMyToast(`正在播放：${song.title}`);
}

function zhaoMyUpdatePlayback() {
  zhaoMyElements.playToggle.classList.toggle("zhao-is-playing", zhaoMyState.playing);
  zhaoMyElements.playToggle.setAttribute("aria-pressed", String(zhaoMyState.playing));
  zhaoMyElements.playToggle.setAttribute("aria-label", zhaoMyState.playing ? "暂停" : "播放");
  zhaoMyElements.playToggle.textContent = zhaoMyState.playing ? "Ⅱ" : "▶";
  document.querySelector("#zhao-player-progress").style.background = zhaoMyState.playing ? "linear-gradient(90deg,#4a83d4 42%,#dbe2ed 42%)" : "linear-gradient(90deg,#4a83d4 27%,#dbe2ed 27%)";
}

function zhaoMyBind() {
  zhaoMyElements.topNav.addEventListener("click", (event) => {
    const tab = event.target.closest("[data-channel]");
    if (!tab) return;
    zhaoMyElements.topNav.querySelectorAll("[data-channel]").forEach((item) => {
      const active = item === tab;
      item.classList.toggle("zhao-is-active", active);
      active ? item.setAttribute("aria-current", "page") : item.removeAttribute("aria-current");
    });
    zhaoMyToast(`${tab.dataset.channel}频道，正在为你推荐内容`);
  });
  zhaoMyElements.bottomNav.addEventListener("click", (event) => {
    const tab = event.target.closest("[data-destination]");
    if (!tab) return;
    zhaoMyElements.bottomNav.querySelectorAll("[data-destination]").forEach((item) => {
      const active = item === tab;
      item.classList.toggle("zhao-is-active", active);
      active ? item.setAttribute("aria-current", "page") : item.removeAttribute("aria-current");
    });
    zhaoMyToast(`已切换到${tab.dataset.destination}`);
  });
  zhaoMyElements.searchForm.addEventListener("submit", (event) => event.preventDefault());
  zhaoMyElements.searchInput.addEventListener("input", () => {
    const query = zhaoMyElements.searchInput.value.trim().toLowerCase();
    const matches = zhaoMyState.songs.filter((song) => `${song.title} ${song.artist} ${song.album}`.toLowerCase().includes(query));
    zhaoMyRenderSongs(matches, query ? `搜索“${zhaoMyElements.searchInput.value.trim()}” · ${matches.length} 首结果` : `${matches.length} 首专属好歌`);
  });
  zhaoMyElements.songs.addEventListener("click", (event) => {
    const like = event.target.closest("[data-like-id]");
    if (like) return zhaoMyLike(like.dataset.likeId);
    const row = event.target.closest("[data-song-id]");
    const song = zhaoMyState.songs.find((item) => item.id === row?.dataset.songId);
    if (song) zhaoMyPlay(song);
  });
  document.querySelector("#zhao-carousel-prev").addEventListener("click", () => zhaoMyGoToSlide(zhaoMyState.slide - 1));
  document.querySelector("#zhao-carousel-next").addEventListener("click", () => zhaoMyGoToSlide(zhaoMyState.slide + 1));
  zhaoMyElements.carouselDots.addEventListener("click", (event) => {
    const dot = event.target.closest("[data-slide]");
    if (dot) zhaoMyGoToSlide(Number(dot.dataset.slide));
  });
  zhaoMyElements.carouselTrack.addEventListener("click", (event) => {
    const action = event.target.closest("[data-banner-index]");
    if (action) zhaoMyToast(`${zhaoMyState.banners[Number(action.dataset.bannerIndex)].action} · 已加入播放队列`);
  });
  document.querySelector("#zhao-play-toggle").addEventListener("click", () => {
    zhaoMyState.playing = !zhaoMyState.playing;
    zhaoMyUpdatePlayback();
    zhaoMyToast(zhaoMyState.playing ? "继续播放" : "已暂停");
  });
  zhaoMyElements.playerLike.addEventListener("click", () => zhaoMyLike(zhaoMyState.currentSongId));
  document.querySelector("#zhao-queue-button").addEventListener("click", () => zhaoMyToast(`播放列表 · ${zhaoMyState.songs.length} 首歌曲`));
  document.querySelector("#zhao-menu-button").addEventListener("click", () => zhaoMyToast("打开频道菜单"));
  document.querySelector("#zhao-voice-button").addEventListener("click", () => zhaoMyToast("语音搜索已就绪"));
  document.querySelector("#zhao-reward-button").addEventListener("click", () => zhaoMyToast("金币中心，今日签到领福利"));
  document.querySelector("#zhao-playlist-more").addEventListener("click", () => zhaoMyToast("猫猫的专属好歌"));
  document.querySelector("#zhao-profile-button").addEventListener("click", () => zhaoMyToast("专属音色，会员权益已开启"));
  document.querySelectorAll("[data-shortcut]").forEach((button) => button.addEventListener("click", () => zhaoMyToast(`打开${button.dataset.shortcut}`)));
}

async function zhaoMyInitialize() {
  zhaoMyBind();
  const results = await Promise.allSettled(Object.entries(zhaoMyDataUrls).map(async ([key, url]) => [key, await zhaoMyFetchJson(url)]));
  const data = Object.fromEntries(results.filter((result) => result.status === "fulfilled").map((result) => result.value));
  if (data.navigation) {
    zhaoMyElements.topNav.querySelectorAll("[data-channel]").forEach((tab) => {
      if (!data.navigation.top.includes(tab.dataset.channel) && tab.dataset.channel !== "儿童") tab.remove();
    });
    zhaoMyElements.bottomNav.querySelectorAll("[data-destination]").forEach((tab) => {
      if (!data.navigation.bottom.includes(tab.dataset.destination)) tab.remove();
    });
  }
  if (data.banners) {
    zhaoMyState.banners = data.banners;
    zhaoMyRenderBanners();
  } else zhaoMyElements.carouselTrack.innerHTML = "<p class='zhao-load-error'>推荐内容暂时无法加载。</p>";
  if (data.shortcuts) zhaoMyRenderShortcuts(data.shortcuts);
  else zhaoMyElements.discover.textContent = "精选内容暂时无法加载。";
  if (data.songs) {
    zhaoMyState.songs = data.songs;
    zhaoMyRenderSongs(data.songs);
    if (data.songs[0]) zhaoMySetSong(data.songs[0]);
  } else zhaoMyElements.resultsStatus.textContent = "歌曲暂时无法加载。";
}

zhaoMyInitialize();