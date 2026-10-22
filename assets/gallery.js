/* ============================================================
   拾光影集 · 页面逻辑（编辑杂志风）
   数据来源：window.GALLERY_DATA（静态版 assets/data.js）
   后端升级：设 window.GALLERY_USE_API = true 并提供
             window.GALLERY_API_URL，接口返回与 data.js 相同的 JSON
   ============================================================ */

window.GALLERY_USE_API = false;
window.GALLERY_API_URL = "/api/photos";

(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const pad = (n) => (n < 10 ? "0" : "") + n;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 状态 ---------- */
  let photos = [];
  let site = {};
  let activeCategory = "全部";
  let projectRows = [];     // 当前 DOM 中的 project 元素
  let lbList = [];          // 灯箱可见列表
  let lbIdx = 0;
  let lastFocus = null;

  /* ---------- EXIF 拼接展示 ---------- */
  function exifLine(exif) {
    if (!exif) return "";
    return [
      exif.camera && exif.lens ? `${exif.camera} · ${exif.lens}` : exif.camera,
      exif.focal, exif.aperture, exif.shutter, exif.iso && `ISO ${exif.iso}`
    ].filter(Boolean).join("  /  ");
  }

  function categories() {
    return [...new Set(photos.map(p => p.category).filter(Boolean))];
  }

  /* ---------- 导航滚动态 + 回顶部/底部按钮 ---------- */
  function bindNav() {
    const nav = $("nav");
    const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    $("to-top").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    $("to-bottom").addEventListener("click", () => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" }));
  }

  /* ---------- 入场动效 ---------- */
  function observeReveals() {
    const els = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window && !reduceMotion) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
        });
      }, { threshold: .12, rootMargin: "0px 0px -6% 0px" });
      els.forEach(el => io.observe(el));
    } else {
      els.forEach(el => el.classList.add("in"));
    }
  }
  function reReveal(el) {
    if (reduceMotion) return;
    el.classList.remove("in");
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("in")));
  }

  /* ---------- 站点信息渲染 ---------- */
  function renderSite() {
    const title = site.title || "摄影作品集";
    $("logo-en").textContent = (site.hero && site.hero.enShort) || "GALLERY";
    $("footer-logo").textContent = title;
    document.title = `${title}｜李旭琪摄影作品集`;

    /* Hero */
    const hero = site.hero || {};
    $("hero-kicker").textContent = categories().join("  ·  ");
    // 诗意主标题：\n 换行；只更新文字节点，保留 .en 英文行元素
    const lineEl = $("hero-text");
    lineEl.innerHTML = "";
    (hero.line || title).split("\n").forEach((seg, i) => {
      if (i > 0) lineEl.appendChild(document.createElement("br"));
      lineEl.appendChild(document.createTextNode(seg));
    });
    $("hero-en").textContent = hero.en || "PHOTOGRAPHY PORTFOLIO";
    $("hero-sub").textContent = hero.bio || site.description || "";

    /* Hero meta：作品数 / 分类数（自动统计） */
    $("hero-meta").innerHTML =
      `<span>收录 <b>${photos.length} 帧</b></span>` +
      `<span>创作方向 <b>${categories().length} 类</b></span>`;

    /* 封面大图 */
    const heroBg = $("hero-bg");
    heroBg.src = hero.src || (photos[0] && photos[0].src) || "";
    heroBg.alt = title;

    /* 引言 */
    const st = site.statement || {};
    $("stmt-lead").innerHTML = st.lead || "";

    /* 关于（独立文案，缺省回退到封面文案） */
    $("about-name").textContent = title;
    $("about-en").textContent = (site.about && site.about.en) || hero.en || "PHOTOGRAPHY PORTFOLIO";
    $("about-bio").textContent = (site.about && site.about.bio) || hero.bio || site.description || "";
    $("footer-copy").textContent = site.footerCopy || "";
    const places = [...new Set(photos.map(p => p.place).filter(Boolean))];
    $("facts").innerHTML =
      `<div class="f"><b>${photos.length}</b><span>收录作品</span></div>` +
      `<div class="f"><b>${categories().length}</b><span>创作方向</span></div>` +
      `<div class="f"><b>${places.length}</b><span>拍摄地点</span></div>`;
    const lines = $("cat-lines");
    lines.innerHTML = "";
    categories().forEach((cat, i) => {
      const div = document.createElement("div");
      div.className = "line";
      div.innerHTML = `<span class="k">方向${"一二三四五"[i] || i + 1}</span>` +
        `<span class="v">${cat}</span>`;
      lines.appendChild(div);
    });
  }

  /* ---------- 筛选栏 ---------- */
  function renderFilters() {
    const bar = $("filter-bar");
    bar.innerHTML = "";
    ["全部", ...categories()].forEach(cat => {
      const b = document.createElement("button");
      b.textContent = cat;
      b.dataset.cat = cat;
      b.setAttribute("aria-pressed", String(cat === activeCategory));
      b.addEventListener("click", () => { activeCategory = cat; renderFilters(); renderProjects(); syncCatUrl(); });
      bar.appendChild(b);
    });
  }

  /* 分类状态同步到 URL（可分享 ?cat=风光 这样的链接） */
  function syncCatUrl() {
    const qs = activeCategory === "全部" ? "" : "?cat=" + encodeURIComponent(activeCategory);
    history.replaceState(null, "", location.pathname + qs + location.hash);
  }

  /* ---------- 项目行 ---------- */
  function renderProjects() {
    const listEl = $("projectList");
    listEl.innerHTML = "";
    projectRows = [];

    const shown = activeCategory === "全部" ? photos : photos.filter(p => p.category === activeCategory);
    $("photo-count").textContent = `${activeCategory} · ${shown.length} 帧`;

    if (activeCategory === "全部") {
      categories().forEach(cat => {
        const label = document.createElement("p");
        label.className = "cat-label";
        label.textContent = `${cat}`;
        listEl.appendChild(label);
        photos.filter(p => p.category === cat).forEach(p => listEl.appendChild(buildProject(p, shown)));
      });
    } else {
      shown.forEach(p => listEl.appendChild(buildProject(p, shown)));
    }

    projectRows = [...listEl.querySelectorAll(".project")];
    projectRows.forEach(el => { if (!reduceMotion) el.classList.add("reveal"); observeReveals(); });
  }

  function buildProject(p, all) {
    const no = pad(all.indexOf(p) + 1);
    const art = document.createElement("article");
    art.className = "project";
    art.innerHTML =
      `<div class="proj-media" tabindex="0" role="button" aria-label="查看大图：${p.title || ""}">
         <img src="${p.src}" alt="${p.title || ""}" loading="lazy" decoding="async">
         <span class="view">查看大图 ＋</span>
       </div>
       <div class="proj-info">
         <span class="no">No.${no} / ${pad(all.length)}</span>
         <h3></h3>
         <span class="en-title"></span>
         <div class="meta"></div>
         <p></p>
       </div>`;
    art.querySelector("h3").textContent = p.title || "";
    art.querySelector(".en-title").textContent = p.en || "";
    const meta = art.querySelector(".meta");
    [
      p.place && `<span><b>地点</b> ${p.place}</span>`,
      p.exif && p.exif.date && `<span><b>时间</b> ${p.exif.date}</span>`,
      p.exif && p.exif.camera && `<span><b>器材</b> ${p.exif.camera}</span>`,
      p.category && `<span><b>类型</b> ${p.category}</span>`
    ].filter(Boolean).forEach(h => meta.insertAdjacentHTML("beforeend", h));
    art.querySelector(".proj-info p").textContent = p.desc || "";

    const img = art.querySelector("img");
    if (p.ar) img.style.aspectRatio = p.ar;   // 竖幅照片用 4/5，横幅默认 16/10
    // 渐显：加载完成后淡入，加载前显示骨架屏
    img.classList.add("loading");
    const show = () => img.classList.add("loaded");
    img.addEventListener("load", show);
    if (img.complete && img.naturalWidth > 0) show();
    img.addEventListener("error", () => { img.classList.add("loaded"); img.style.minHeight = "220px"; });

    const media = art.querySelector(".proj-media");
    media.addEventListener("click", () => openLightbox(p));
    media.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLightbox(p); }
    });
    return art;
  }

  /* ---------- 大图浏览（原图无损 + 1:1 缩放 + 下载） ---------- */
  function openLightbox(p) {
    // 与筛选状态对齐：灯箱序列 = 当前可见的作品
    const shown = activeCategory === "全部" ? photos : photos.filter(x => x.category === activeCategory);
    lbList = shown;
    lbIdx = Math.max(0, shown.indexOf(p));
    lastFocus = document.activeElement;
    $("lightbox").classList.add("open");
    document.body.style.overflow = "hidden";
    renderLightbox();
    $("lb-close").focus();
  }

  function renderLightbox() {
    const p = lbList[lbIdx];
    const stage = $("lb-stage");
    stage.classList.remove("zoomed");
    const img = $("lb-img");
    img.src = p.src;               // 始终加载原图，不经压缩
    img.alt = p.title || "";
    $("lb-index").textContent = `${pad(lbIdx + 1)} / ${pad(lbList.length)}`;
    $("lb-title").textContent = p.title || "";
    const exif = exifLine(p.exif);
    const cap = $("lb-cap");
    cap.innerHTML = "";
    const b = document.createElement("b");
    b.textContent = p.title || "";
    cap.appendChild(b);
    if (exif) {
      const s = document.createElement("span");
      s.className = "exif";
      s.textContent = exif;
      cap.appendChild(s);
    }
    const dl = document.createElement("a");
    dl.className = "dl";
    dl.textContent = "下载原图 ↓";
    dl.href = p.src;
    dl.setAttribute("download", p.src.split("/").pop() || "photo.jpg");
    cap.appendChild(dl);

    // 预加载前后各一张原图，切换时零等待
    [lbIdx - 1, lbIdx + 1].forEach(j => {
      const np = lbList[(j + lbList.length) % lbList.length];
      if (np && np.src !== p.src) { const pre = new Image(); pre.src = np.src; }
    });
  }

  function closeLightbox() {
    $("lightbox").classList.remove("open");
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  function stepLightbox(d) {
    lbIdx = (lbIdx + d + lbList.length) % lbList.length;
    renderLightbox();
  }

  function bindLightbox() {
    $("lb-close").addEventListener("click", closeLightbox);
    $("lb-prev").addEventListener("click", (e) => { e.stopPropagation(); stepLightbox(-1); });
    $("lb-next").addEventListener("click", (e) => { e.stopPropagation(); stepLightbox(1); });
    // 点击图片本体切换 1:1 原图尺寸
    $("lb-img").addEventListener("click", (e) => {
      e.stopPropagation();
      $("lb-stage").classList.toggle("zoomed");
    });
    $("lb-stage").addEventListener("click", (e) => {
      if (e.target === e.currentTarget) closeLightbox();
    });
    document.addEventListener("keydown", (e) => {
      if (!$("lightbox").classList.contains("open")) return;
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowLeft") stepLightbox(-1);
      else if (e.key === "ArrowRight") stepLightbox(1);
    });
    // 触屏：单指滑动切换；双指捏合进入/退出 1:1 原图缩放
    let tx = 0, pinchStart = 0, zoomedAtStart = false;
    const stage = $("lb-stage");
    stage.addEventListener("touchstart", (e) => {
      if (e.touches.length === 2) {
        pinchStart = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        zoomedAtStart = stage.classList.contains("zoomed");
      } else if (e.touches.length === 1) {
        tx = e.touches[0].clientX;
        if (pinchStart === 0) stage.dataset.swiping = "1";
      }
    }, { passive: true });
    stage.addEventListener("touchmove", (e) => {
      if (e.touches.length === 2 && pinchStart > 0) {
        e.preventDefault();   // 捏合时阻止浏览器整页缩放
        const d = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const ratio = d / pinchStart;
        if (!zoomedAtStart && ratio > 1.25) stage.classList.add("zoomed");
        if (zoomedAtStart && ratio < 0.8) stage.classList.remove("zoomed");
      }
    }, { passive: false });
    stage.addEventListener("touchend", (e) => {
      if (e.touches.length > 0) return;          // 捏合过程中不触发切换
      const wasSwiping = stage.dataset.swiping === "1";
      stage.dataset.swiping = "";
      pinchStart = 0;
      if (!wasSwiping) return;
      const dx = e.changedTouches[0].clientX - tx;
      if (Math.abs(dx) > 50) stepLightbox(dx < 0 ? 1 : -1);
    }, { passive: true });
  }

  /* ---------- 启动 ---------- */
  async function loadData() {
    if (window.GALLERY_USE_API) {
      const res = await fetch(window.GALLERY_API_URL);
      return res.json();
    }
    return window.GALLERY_DATA;
  }

  loadData().then(data => {
    site = data.site || {};
    // 作品数据优先读 photos-data.js（admin.html 管理页维护），兼容旧版 data.js 内嵌数据
    photos = window.GALLERY_PHOTOS || data.photos || [];
    // 支持 ?cat=分类 直达（可分享某个分类的链接）
    const urlCat = new URLSearchParams(location.search).get("cat");
    if (urlCat && (urlCat === "全部" || photos.some(p => p.category === urlCat))) activeCategory = urlCat;
    renderSite();
    renderFilters();
    renderProjects();
    bindNav();
    bindLightbox();
    observeReveals();
  }).catch(err => {
    console.error("画廊数据加载失败：", err);
  });
})();
