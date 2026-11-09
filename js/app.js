const zhaoDataUrls = {
  navigation: "./data/navigation.json",
  banners: "./data/banners.json",
  songs: "./data/songs.json",
  shortcuts: "./data/shortcuts.json"
};

const zhaoState = {
  songs: [],
  banners: [],
  slide: 0,
  playing: false,
  currentSongId: "",
  toastTimer: 0
};

const zhaoElements = {
  topNav: document.querySelector("#zhao-top-nav"),
  bottomNav: document.querySelector("#zhao-bottom-nav"),
  carouselTrack: document.querySelector("#zhao-carousel-track"),
  carouselDots: document.querySelector("#zhao-carousel-dots"),
  shortcuts: document.querySelector("#zhao-shortcuts-grid"),
  songs: document.querySelector("#zhao-song-list"),
  searchForm: document.querySelector("#zhao-search-form"),
  searchInput: document.querySelector("#zhao-search-input"),
  resultsStatus: document.querySelector("#zhao-results-status"),
  toast: document.querySelector("#zhao-toast"),
  playerCover: document.querySelector("#zhao-player-cover"),
  playerTitle: document.querySelector("#zhao-player-title"),
  playerArtist: document.querySelector("#zhao-player-artist"),
  playToggle: document.querySelector("#zhao-play-toggle"),
  playerLike: document.querySelector("#zhao-player-like")
};

async function zhaoFetchJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`Request failed: ${url} (${response.status})`);
  return response.json();
}

function zhaoShowToast(message) {
  window.clearTimeout(zhaoState.toastTimer);
  zhaoElements.toast.textContent = message;
  zhaoElements.toast.classList.add("zhao-is-visible");
  zhaoState.toastTimer = window.setTimeout(() => {
    zhaoElements.toast.classList.remove("zhao-is-visible");
  }, 1900);
}

function zhaoRenderNavigation(data) {
  zhaoElements.topNav.replaceChildren(...data.top.map((label) => {
    const button = document.createElement("button");
    button.className = `zhao-top-tab${label === "推荐" ? " zhao-is-active" : ""}`;
    button.type = "button";
    button.dataset.channel = label;
    button.textContent = label;
    if (label === "推荐") button.setAttribute("aria-current", "page");
    return button;
  }));

  zhaoElements.bottomNav.replaceChildren(...data.bottom.map((label, index) => {
    const button = document.createElement("button");
    const icons = ["⌂", "◉", "♢", "✳", "○"];
    button.className = `zhao-bottom-tab${index === 0 ? " zhao-is-active" : ""}`;
    button.type = "button";
    button.dataset.destination = label;
    if (index === 0) button.setAttribute("aria-current", "page");
    const icon = document.createElement("span");
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = icons[index] || "•";
    const caption = document.createElement("small");
    caption.textContent = label;
    button.append(icon, caption);
    return button;
  }));
}

function zhaoRenderBanners() {
  zhaoElements.carouselTrack.replaceChildren(...zhaoState.banners.map((banner, index) => {
    const card = document.createElement("article");
    card.className = "zhao-hero-card";
    card.dataset.theme = banner.theme;
    card.style.backgroundImage = `url("${banner.cover}")`;
    card.setAttribute("aria-label", banner.title.replace("\n", " "));

    const copy = document.createElement("div");
    copy.className = "zhao-hero-copy";
    const eyebrow = document.createElement("p");
    eyebrow.className = "zhao-hero-eyebrow";
    eyebrow.textContent = banner.eyebrow;
    const title = document.createElement("h2");
    title.className = "zhao-hero-title";
    title.textContent = banner.title;
    const description = document.createElement("p");
    description.className = "zhao-hero-description";
    description.textContent = banner.description;
    const action = document.createElement("button");
    action.className = "zhao-hero-action";
    action.type = "button";
    action.dataset.bannerIndex = String(index);
    action.innerHTML = `${banner.action} <span aria-hidden="true">→</span>`;
    copy.append(eyebrow, title, description, action);
    card.append(copy);
    return card;
  }));

  zhaoElements.carouselDots.replaceChildren(...zhaoState.banners.map((_, index) => {
    const dot = document.createElement("button");
    dot.className = `zhao-carousel-dot${index === zhaoState.slide ? " zhao-is-active" : ""}`;
    dot.type = "button";
    dot.dataset.slide = String(index);
    dot.setAttribute("aria-label", `查看推荐 ${index + 1}`);
    return dot;
  }));
  zhaoShowSlide(zhaoState.slide);
}

function zhaoShowSlide(index) {
  if (!zhaoState.banners.length) return;
  zhaoState.slide = (index + zhaoState.banners.length) % zhaoState.banners.length;
  zhaoElements.carouselTrack.style.transform = `translateX(-${zhaoState.slide * 100}%)`;
  zhaoElements.carouselTrack.style.transition = "transform 360ms cubic-bezier(.2,.75,.3,1)";
  zhaoElements.carouselDots.querySelectorAll(".zhao-carousel-dot").forEach((dot, dotIndex) => {
    dot.classList.toggle("zhao-is-active", dotIndex === zhaoState.slide);
    dot.setAttribute("aria-current", dotIndex === zhaoState.slide ? "true" : "false");
  });
}

function zhaoRenderShortcuts(shortcuts) {
  zhaoElements.shortcuts.replaceChildren(...shortcuts.map((shortcut) => {
    const button = document.createElement("button");
    button.className = "zhao-shortcut";
    button.type = "button";
    button.dataset.shortcut = shortcut.title;
    const icon = document.createElement("span");
    icon.className = "zhao-shortcut-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = shortcut.icon;
    const title = document.createElement("span");
    title.className = "zhao-shortcut-title";
    title.textContent = shortcut.title;
    const subtitle = document.createElement("span");
    subtitle.className = "zhao-shortcut-subtitle";
    subtitle.textContent = shortcut.subtitle;
    button.append(icon, title, subtitle);
    return button;
  }));
}

function zhaoRenderSongs(songs, statusText = `${songs.length} 首为你挑选的好歌`) {
  zhaoElements.resultsStatus.textContent = statusText;
  if (!songs.length) {
    const empty = document.createElement("li");
    empty.className = "zhao-empty-state";
    empty.textContent = "没有找到相关歌曲，试试别的关键词吧。";
    zhaoElements.songs.replaceChildren(empty);
    return;
  }

  zhaoElements.songs.replaceChildren(...songs.map((song, index) => {
    const row = document.createElement("li");
    row.className = "zhao-song-row";
    row.style.animationDelay = `${Math.min(index * 40, 180)}ms`;
    row.dataset.songId = song.id;
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
    detail.textContent = `${song.artist} · ${song.album}`;
    info.append(title, detail);
    const duration = document.createElement("span");
    duration.className = "zhao-song-duration";
    duration.textContent = song.duration;
    const like = document.createElement("button");
    like.className = `zhao-like-button${song.liked ? " zhao-is-liked" : ""}`;
    like.type = "button";
    like.dataset.likeId = song.id;
    like.setAttribute("aria-label", song.liked ? `取消收藏 ${song.title}` : `收藏 ${song.title}`);
    like.setAttribute("aria-pressed", String(song.liked));
    like.textContent = song.liked ? "♥" : "♡";
    row.append(cover, info, duration, like);
    return row;
  }));
}

function zhaoSetCurrentSong(song) {
  zhaoState.currentSongId = song.id;
  zhaoElements.playerCover.src = song.cover;
  zhaoElements.playerCover.alt = `${song.title} 封面`;
  zhaoElements.playerTitle.textContent = song.title;
  zhaoElements.playerArtist.textContent = `${song.artist} · 酷狗音乐`;
  zhaoElements.playerLike.classList.toggle("zhao-is-liked", song.liked);
  zhaoElements.playerLike.textContent = song.liked ? "♥" : "♡";
  zhaoElements.playerLike.setAttribute("aria-pressed", String(song.liked));
  zhaoElements.playerLike.setAttribute("aria-label", song.liked ? `取消收藏 ${song.title}` : `收藏 ${song.title}`);
}

function zhaoToggleLike(songId) {
  const song = zhaoState.songs.find((item) => item.id === songId);
  if (!song) return;
  song.liked = !song.liked;
  const visibleSongs = [...zhaoElements.songs.querySelectorAll(".zhao-song-row")]
    .map((row) => zhaoState.songs.find((item) => item.id === row.dataset.songId))
    .filter(Boolean);
  zhaoRenderSongs(visibleSongs, zhaoElements.resultsStatus.textContent);
  if (zhaoState.currentSongId === song.id) zhaoSetCurrentSong(song);
  zhaoShowToast(song.liked ? "已加入我喜欢" : "已取消收藏");
}

function zhaoPlaySong(song) {
  zhaoSetCurrentSong(song);
  zhaoState.playing = true;
  zhaoUpdatePlayback();
  zhaoShowToast(`正在播放：${song.title}`);
}

function zhaoUpdatePlayback() {
  zhaoElements.playToggle.classList.toggle("zhao-is-playing", zhaoState.playing);
  zhaoElements.playToggle.setAttribute("aria-pressed", String(zhaoState.playing));
  zhaoElements.playToggle.setAttribute("aria-label", zhaoState.playing ? "暂停" : "播放");
  zhaoElements.playToggle.innerHTML = zhaoState.playing ? "<span aria-hidden=\"true\">Ⅱ</span>" : "<span aria-hidden=\"true\">▶</span>";
  document.querySelector("#zhao-player-progress").style.background = zhaoState.playing
    ? "linear-gradient(90deg, var(--zhao-coral) 42%, #eee3da 42%)"
    : "linear-gradient(90deg, var(--zhao-coral) 27%, #eee3da 27%)";
}

function zhaoFilterSongs(query) {
  const normalized = query.trim().toLocaleLowerCase();
  const matches = zhaoState.songs.filter((song) =>
    `${song.title} ${song.artist} ${song.album}`.toLocaleLowerCase().includes(normalized)
  );
  zhaoRenderSongs(matches, normalized ? `搜索“${query.trim()}” · ${matches.length} 首结果` : `${matches.length} 首为你挑选的好歌`);
}

function zhaoBindInteractions() {
  zhaoElements.topNav.addEventListener("click", (event) => {
    const button = event.target.closest("[data-channel]");
    if (!button) return;
    zhaoElements.topNav.querySelectorAll("[data-channel]").forEach((tab) => {
      const active = tab === button;
      tab.classList.toggle("zhao-is-active", active);
      active ? tab.setAttribute("aria-current", "page") : tab.removeAttribute("aria-current");
    });
    zhaoShowToast(`${button.dataset.channel}频道，正在为你推荐内容`);
  });

  zhaoElements.bottomNav.addEventListener("click", (event) => {
    const button = event.target.closest("[data-destination]");
    if (!button) return;
    zhaoElements.bottomNav.querySelectorAll("[data-destination]").forEach((tab) => {
      const active = tab === button;
      tab.classList.toggle("zhao-is-active", active);
      active ? tab.setAttribute("aria-current", "page") : tab.removeAttribute("aria-current");
    });
    zhaoShowToast(`已切换到${button.dataset.destination}`);
  });

  zhaoElements.searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    zhaoFilterSongs(zhaoElements.searchInput.value);
  });
  zhaoElements.searchInput.addEventListener("input", () => zhaoFilterSongs(zhaoElements.searchInput.value));
  zhaoElements.songs.addEventListener("click", (event) => {
    const likeButton = event.target.closest("[data-like-id]");
    if (likeButton) {
      zhaoToggleLike(likeButton.dataset.likeId);
      return;
    }
    const row = event.target.closest("[data-song-id]");
    if (row) {
      const song = zhaoState.songs.find((item) => item.id === row.dataset.songId);
      if (song) zhaoPlaySong(song);
    }
  });

  document.querySelector("#zhao-carousel-prev").addEventListener("click", () => zhaoShowSlide(zhaoState.slide - 1));
  document.querySelector("#zhao-carousel-next").addEventListener("click", () => zhaoShowSlide(zhaoState.slide + 1));
  zhaoElements.carouselDots.addEventListener("click", (event) => {
    const dot = event.target.closest("[data-slide]");
    if (dot) zhaoShowSlide(Number(dot.dataset.slide));
  });
  document.querySelector("#zhao-refresh-button").addEventListener("click", () => {
    zhaoShowSlide(zhaoState.slide + 1);
    zhaoShowToast("换到下一组精选推荐");
  });
  zhaoElements.carouselTrack.addEventListener("click", (event) => {
    const action = event.target.closest("[data-banner-index]");
    if (action) zhaoShowToast(`${zhaoState.banners[Number(action.dataset.bannerIndex)].action} · 已加入播放队列`);
  });

  document.querySelector("#zhao-play-toggle").addEventListener("click", () => {
    zhaoState.playing = !zhaoState.playing;
    zhaoUpdatePlayback();
    zhaoShowToast(zhaoState.playing ? "继续播放" : "已暂停");
  });
  zhaoElements.playerLike.addEventListener("click", () => zhaoToggleLike(zhaoState.currentSongId));
  document.querySelector("#zhao-play-all").addEventListener("click", () => {
    if (zhaoState.songs[0]) zhaoPlaySong(zhaoState.songs[0]);
  });
  document.querySelector("#zhao-queue-button").addEventListener("click", () => zhaoShowToast(`播放列表 · ${zhaoState.songs.length} 首歌曲`));
  document.querySelector("#zhao-profile-button").addEventListener("click", () => zhaoShowToast("个人中心，欢迎回来"));
  zhaoElements.shortcuts.addEventListener("click", (event) => {
    const shortcut = event.target.closest("[data-shortcut]");
    if (!shortcut) return;
    zhaoShowToast(`打开${shortcut.dataset.shortcut}`);
    if (shortcut.dataset.shortcut === "每日推荐" && zhaoState.songs[0]) zhaoPlaySong(zhaoState.songs[0]);
  });
}

async function zhaoInitialize() {
  document.querySelector("#zhao-date-label").textContent = new Intl.DateTimeFormat("zh-CN", {
    month: "long", day: "numeric", weekday: "long"
  }).format(new Date());
  zhaoBindInteractions();
  const results = await Promise.allSettled(Object.entries(zhaoDataUrls).map(async ([key, url]) => [key, await zhaoFetchJson(url)]));
  const data = Object.fromEntries(results.filter((result) => result.status === "fulfilled").map((result) => result.value));

  if (data.navigation) zhaoRenderNavigation(data.navigation);
  if (data.banners) {
    zhaoState.banners = data.banners;
    zhaoRenderBanners();
  } else {
    zhaoElements.carouselTrack.innerHTML = "<p class=\"zhao-load-error\">推荐内容暂时无法加载，请检查本地服务器。</p>";
  }
  if (data.shortcuts) zhaoRenderShortcuts(data.shortcuts);
  else zhaoElements.shortcuts.innerHTML = "<p class=\"zhao-load-error\">快捷入口暂时无法加载。</p>";
  if (data.songs) {
    zhaoState.songs = data.songs;
    zhaoRenderSongs(zhaoState.songs);
    if (zhaoState.songs[0]) zhaoSetCurrentSong(zhaoState.songs[0]);
  } else {
    zhaoElements.resultsStatus.textContent = "歌曲列表暂时无法加载，请检查本地服务器。";
  }
}

zhaoInitialize();
