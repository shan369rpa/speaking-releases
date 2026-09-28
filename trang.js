/* Public install page. No server of its own: the newest APK and the release notes come from
   GitHub's API for the repo in cau-hinh.js, so a release shows up here the moment the
   workflow publishes it, without rebuilding the page. Unauthenticated, that API allows 60
   requests an hour per address; past that the Android button falls back to the Releases
   page, which always works. */
(function () {
  "use strict";
  const CH = window.CAU_HINH;
  const $ = (id) => document.getElementById(id);
  const RELEASES = `https://github.com/${CH.kho}/releases`;
  const API = `https://api.github.com/repos/${CH.kho}/releases?per_page=20`;

  /* Release notes are CHANGELOG.md text: escape first, then allow bold and code only. */
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const dong = (s) => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  function ghiChu(md) {
    const ra = [];
    let ds = null;
    const dongDs = () => { if (ds) { ra.push(`<ul>${ds.map((m) => `<li>${dong(m)}</li>`).join("")}</ul>`); ds = null; } };
    for (const dongMd of String(md || "").replace(/\r/g, "").split("\n")) {
      let m;
      if ((m = dongMd.match(/^#{1,6}\s+(.+?)\s*$/))) { dongDs(); ra.push(`<div class="nhom">${esc(m[1])}</div>`); }
      else if ((m = dongMd.match(/^[-*]\s+(.+?)\s*$/))) { (ds = ds || []).push(m[1]); }
      else if ((m = dongMd.match(/^\s+(\S.*?)\s*$/)) && ds) { ds[ds.length - 1] += " " + m[1]; }
      else if (!dongMd.trim()) { /* a blank line ends nothing: groups are closed by headings */ }
      else { dongDs(); ra.push(`<p>${dong(dongMd.trim())}</p>`); }
    }
    dongDs();
    return ra.join("");
  }

  const phienBan = (tag) => String(tag || "").replace(/^v/i, "");
  const mb = (b) => `${(b / 1e6).toFixed(1).replace(".", ",")} MB`;
  const ngay = (iso) => { const d = new Date(iso); return isNaN(d) ? "" : d.toLocaleDateString("vi-VN"); };
  const apkCua = (r) => (r.assets || []).find((a) => /-android\.apk$/i.test(a.name || ""));

  // ---------- addresses: one constant in cau-hinh.js, empty until there is a domain ----------
  const web = String(CH.diaChiWeb || "").trim().replace(/\/+$/, "");
  document.querySelectorAll("[data-khi-co-web]").forEach((el) => { el.hidden = !web; });
  document.querySelectorAll("[data-khi-chua-co-web]").forEach((el) => { el.hidden = !!web; });
  const nutWeb = $("nut-web");
  if (web) {
    nutWeb.href = web + "/";
    document.querySelectorAll(".dia-chi-web").forEach((a) => { a.textContent = web; a.href = web + "/"; });
    $("link-cai-dat-may-chu").href = web + "/cai-dat";
  } else {
    nutWeb.removeAttribute("href");
    nutWeb.setAttribute("aria-disabled", "true");
    $("web-phu").textContent = "Sắp có địa chỉ công khai";
  }
  $("link-releases").href = RELEASES;
  $("link-releases-luu-y").href = RELEASES;

  // ---------- the Android button ----------
  const nut = $("nut-android");
  const phu = $("android-phu");
  let banDaDang = null; // null = not asked yet, [] = none, Error = GitHub refused

  function veNut(ds) {
    nut.removeAttribute("aria-busy");
    const moi = ds.find((r) => apkCua(r));
    if (moi) {
      const apk = apkCua(moi);
      nut.href = apk.browser_download_url;
      nut.removeAttribute("aria-disabled");
      phu.textContent = `bản ${phienBan(moi.tag_name)} · ${mb(apk.size)}`;
      $("phien-ban-cuoi").textContent = phienBan(moi.tag_name);
      document.body.dataset.trangThai = "co-ban";
    } else {
      nut.removeAttribute("href");
      nut.setAttribute("aria-disabled", "true");
      phu.textContent = "Sắp có · bản đầu tiên đang chuẩn bị";
      $("phien-ban-cuoi").textContent = "chưa phát hành";
      document.body.dataset.trangThai = "chua-co";
    }
  }

  function veNutLoi() {
    nut.removeAttribute("aria-busy");
    nut.removeAttribute("aria-disabled");
    nut.href = RELEASES + "/latest";
    phu.textContent = "Xem các bản trên GitHub";
    $("phien-ban-cuoi").textContent = "xem trên GitHub";
    document.body.dataset.trangThai = "loi";
  }

  (async () => {
    const ctrl = new AbortController();
    const hen = setTimeout(() => ctrl.abort(), 8000);
    try {
      const r = await fetch(API, { headers: { Accept: "application/vnd.github+json" }, signal: ctrl.signal });
      if (!r.ok) throw new Error(`GitHub trả lỗi ${r.status}`);
      const ds = await r.json();
      if (!Array.isArray(ds)) throw new Error("GitHub trả dữ liệu lạ");
      // A learner only ever sees published releases: drafts and pre-releases stay out.
      banDaDang = ds.filter((b) => !b.draft && !b.prerelease)
        .sort((a, b) => String(b.published_at).localeCompare(String(a.published_at)));
      veNut(banDaDang);
    } catch (e) {
      banDaDang = e instanceof Error ? e : new Error(String(e));
      veNutLoi();
    } finally { clearTimeout(hen); }
  })();

  // ---------- release notes panel ----------
  const man = $("ngan-phien-ban");
  const ds = $("ds-phien-ban");
  let truocKhiMo = null;

  function veGhiChu() {
    if (banDaDang === null) { ds.innerHTML = '<p class="ghi-nho">Đang hỏi GitHub…</p>'; return; }
    if (banDaDang instanceof Error) {
      ds.innerHTML = `<p class="ghi-nho">Chưa đọc được danh sách bản (${esc(banDaDang.message)}). Xem trực tiếp: <a href="${esc(RELEASES)}" rel="noopener">${esc(RELEASES)}</a></p>`;
      return;
    }
    if (!banDaDang.length) { ds.innerHTML = '<p class="ghi-nho">Chưa có bản nào được phát hành.</p>'; return; }
    ds.innerHTML = banDaDang.map((b) => `<article class="ban">
        <h3>${esc(phienBan(b.tag_name))} <span class="ngay">${esc(ngay(b.published_at))}</span></h3>
        ${ghiChu(b.body)}
      </article>`).join("");
  }

  function mo() {
    truocKhiMo = document.activeElement;
    veGhiChu();
    man.hidden = false;
    man.querySelector("[data-dong]").focus();
  }
  function dongNgan() {
    man.hidden = true;
    if (truocKhiMo && truocKhiMo.focus) truocKhiMo.focus();
  }
  $("btn-phien-ban").addEventListener("click", mo);
  man.addEventListener("click", (e) => { if (e.target === man || e.target.closest("[data-dong]")) dongNgan(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !man.hidden) dongNgan(); });

  // ---------- theme ----------
  $("btn-giao-dien").addEventListener("click", () => {
    const moi = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = moi;
    try { localStorage.setItem("speaking-giao-dien", moi); } catch (e) { /* storage blocked: this visit only */ }
  });

  // ---------- intro video ----------
  // Plays while at least half of it is on screen and pauses when it scrolls away, unless the
  // visitor asked for less motion. Once the visitor touches the video, it is theirs: scrolling
  // no longer starts or stops it. Not the autoplay attribute, and not a one-shot start: on a
  // phone the video sits half below the fold, and Chrome paused a video started there right
  // after it began (seen live at 390 px: stuck at 0:00). A visitor who never scrolls down
  // does not download 9 MB.
  const video = $("video-gioi-thieu");
  let tuDong = true;
  let dangGoi = false;
  ["pointerdown", "keydown"].forEach((ten) => video.addEventListener(ten, () => { tuDong = false; }));
  function chay() {
    if (dangGoi || !video.paused) return;
    dangGoi = true;
    const p = video.play();
    const xong = () => { dangGoi = false; };
    if (p && p.then) p.then(xong, xong); else xong();
  }
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((muc) => {
        if (!tuDong) return;
        const ty = muc[muc.length - 1].intersectionRatio;
        if (ty >= 0.5) chay();
        else if (ty < 0.25 && !video.paused) video.pause();
      }, { threshold: [0, 0.25, 0.5, 0.75, 1] }).observe(video);
    } else {
      chay();
    }
  }
})();
