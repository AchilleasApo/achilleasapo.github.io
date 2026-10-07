/* Portfolio one-pager.
   Content lives in data/site.json and data/projects.json — edit those,
   not this file. This script renders them and adds the cursor-driven
   interactions (dot field, spotlight, parallax, card tilt, pop-up). */
(() => {
  "use strict";

  const root = document.documentElement;
  root.classList.add("js");

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------ icons */
  const ICONS = {
    linkedin: '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8 10.5V16M8 7.8v.01M12 16v-5.5M12 12.8c0-1.3 1-2.3 2.3-2.3s2.2 1 2.2 2.3V16"/>',
    instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.2 6.8v.01"/>',
    bluesky: '<path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z" transform="translate(2.4 2.4) scale(.8)"/>',
    signal: '<path d="M12 3.2a8.8 8.8 0 1 0 4.6 16.3L21 21l-1.3-4.3A8.8 8.8 0 0 0 12 3.2Z"/>',
    lastfm: '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
    arrow: '<path d="M7 17L17 7M8.5 7H17v8.5"/>',
    download: '<path d="M12 4v11m0 0l-4-4m4 4l4-4M5 20h14"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M4 8l8 5 8-5"/>'
  };
  const svg = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ""}</svg>`;

  /* ------------------------------------------------------------ utils */
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const linkify = (s) =>
    esc(s).replace(/(https?:\/\/[^\s<]+[^\s<.,;:!?)])/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const toast = (msg) => {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast.t);
    toast.t = setTimeout(() => t.classList.remove("show"), 1800);
  };

  let site = null;
  let projects = [];
  const byId = {};

  /* Flag emoji render as plain letters on Windows, so swap the ones we have an
     SVG for (assets/flags/<code>.svg) for images. Add a file + code here for more. */
  const FLAGS = new Set(["gr", "dk", "ch"]);
  const FLAG_RE = /[🇦-🇿]{2}/gu;
  const HAS_FLAG = /[🇦-🇿]{2}/u;
  function flagify(rootEl) {
    const w = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT);
    const hits = [];
    for (let n; (n = w.nextNode()); ) if (HAS_FLAG.test(n.nodeValue)) hits.push(n);
    for (const node of hits) {
      const frag = document.createDocumentFragment();
      let last = 0;
      node.nodeValue.replace(FLAG_RE, (m, i) => {
        const code = [...m].map((ch) => String.fromCharCode(ch.codePointAt(0) - 0x1f1e6 + 97)).join("");
        frag.append(node.nodeValue.slice(last, i));
        if (FLAGS.has(code)) {
          const img = document.createElement("img");
          img.className = "flag"; img.src = "assets/flags/" + code + ".svg"; img.alt = code.toUpperCase(); img.height = 14;
          frag.append(img);
        } else frag.append(m);
        last = i + m.length;
        return m;
      });
      frag.append(node.nodeValue.slice(last));
      node.replaceWith(frag);
    }
  }

  /* ----------------------------------------------------------- render */
  function renderSite() {
    $("#profile").innerHTML = `
      <a class="avatar" href="#top" aria-label="Back to top">
        <img src="${esc(site.avatar)}" alt="${esc(site.name)}" width="48" height="48">
        <span class="dot ${esc(site.status || "online")}" title="${esc(site.statusLabel || "Online")}"></span>
      </a>
      <div class="who">
        <strong>${esc(site.name)}</strong>
        <a href="mailto:${esc(site.email)}">${esc(site.email)}</a>
      </div>`;

    const socials = (big) =>
      site.socials.map((s) =>
        `<a class="icon-btn" href="${esc(s.url)}" target="_blank" rel="noopener" aria-label="${esc(s.label)}" title="${esc(s.label)}">${svg(s.icon)}${big ? `<span>${esc(s.label)}</span>` : ""}</a>`
      ).join("");
    $("#socials-top").innerHTML = socials(false);
    $("#socials-contact").innerHTML = socials(true);

    const links = $$(".nav a").map((a, i) => `<a href="${a.getAttribute("href")}"><small>0${i + 1}</small>${esc(a.textContent)}</a>`).join("");
    $("#menu").innerHTML = `<div class="menu-links">${links}</div>
      <div class="menu-side"><span class="mono">${esc(site.email)}</span><div class="socials">${socials(false)}</div></div>`;

    $("#headline").textContent = site.headline;
    $("#intro").textContent = site.intro;

    const a = site.about;
    $("#portrait").src = a.portrait;
    $("#about-title").textContent = a.title;
    $("#about-text").textContent = a.text;
    $("#facts").innerHTML = a.facts.map((f) => `<li>${esc(f)}</li>`).join("");
    const cv = $("#cv-btn");
    cv.href = a.cv.url;
    if (!/^https?:/i.test(a.cv.url)) { cv.setAttribute("download", ""); cv.removeAttribute("target"); }
    cv.innerHTML = `${svg("download")}${esc(a.cv.label)}`;

    const timeline = (items) =>
      items.map((e) => {
        const current = /present/i.test(e.when);
        const roles = e.roles.map((r) => {
          const meta = [r.note, r.when && e.roles.length > 1 ? r.when : ""].filter(Boolean).join(" · ");
          return `<li><span class="rtitle">${esc(r.title)}</span>${meta ? `<span class="rmeta">${esc(meta)}</span>` : ""}</li>`;
        }).join("");
        return `<li class="entry${current ? " current" : ""}">
          <span class="when">${esc(e.when)}</span>
          <h4>${esc(e.org)}</h4>
          <ul class="roles">${roles}</ul>
        </li>`;
      }).join("");
    $("#experience").innerHTML = timeline(site.experience);
    $("#education").innerHTML = timeline(site.education);
    $("#activities").innerHTML = site.activities.map((i) =>
      `<li><span class="when">${esc(i.when)}</span><span class="title">${esc(i.title)}</span><span class="where">${esc(i.where)}</span></li>`).join("");

    $("#quote-text").textContent = site.quote.text;
    $("#quote-by").textContent = site.quote.by;

    $("#contact-title").textContent = site.contact.title;
    $("#contact-text").textContent = site.contact.text;
    const mail = $("#contact-mail");
    mail.href = `mailto:${site.email}`;
    mail.textContent = site.email;

    $("#foot-name").textContent = `© ${new Date().getFullYear()} ${site.name}`;
    const d = site.updated && new Date(site.updated);
    $("#foot-updated").textContent = d && !isNaN(d) ? `Last updated ${d.toLocaleDateString("en-GB")}` : "";

    document.title = site.name;
  }

  function renderWork() {
    const depths = [0.9, 0.45, 0.65, 0.5, 0.8];
    $("#work-grid").innerHTML = projects.map((p, i) => {
      const plain = !p.cover;
      const meta = [p.year, p.label || p.category].filter(Boolean).join(" · ");
      return `
      <div class="float fadein${p.wide ? " wide" : ""}" style="--d:${depths[i % depths.length]};--i:${i}">
        <div class="bob">
          <a class="card${plain ? " plain" : ""}" href="#/${esc(p.id)}" data-tilt aria-label="Open project: ${esc(p.title)}">
            ${plain ? "" : `<img class="cover" src="${esc(p.cover)}" alt="" decoding="async">`}
            <span class="shine"></span>
            <span class="arrow">${svg("arrow")}</span>
            <div class="card-meta">
              <span class="mono">${esc(meta)}</span>
              <h2>${esc(p.title)}</h2>
              ${plain && p.subtitle ? `<p>${esc(p.subtitle)}</p>` : ""}
            </div>
          </a>
        </div>
      </div>`;
    }).join("");
  }

  /* ------------------------------------------------------------ modal */
  const modal = $("#modal");
  const modalBody = $("#modal-body");
  const modalScroll = $("#modal-scroll");
  let pushed = false;
  let opener = null;

  function blocks(list) {
    return list.map((b) => {
      switch (b.t) {
        case "lead": return `<p class="lead">${linkify(b.text)}</p>`;
        case "h": return `<h3>${esc(b.text)}</h3>`;
        case "list": return `<ul>${b.items.map((i) => `<li>${linkify(i)}</li>`).join("")}</ul>`;
        case "pubs":
          return `<ul class="pubs">${b.items.map((i) => `<li>
            <strong>${esc(i.title)}</strong>
            ${i.authors ? `<span class="authors">${esc(i.authors)}</span>` : ""}
            ${i.venue ? `<span class="venue">${esc(i.venue)}</span>` : ""}
            ${i.link ? `<a href="${esc(i.link)}" target="_blank" rel="noopener">${esc(i.link)}</a>` : ""}
          </li>`).join("")}</ul>`;
        default: return `<p>${linkify(b.text)}</p>`;
      }
    }).join("");
  }

  function gallery(p) {
    const cols = [[], []];
    p.gallery.forEach((src, i) => cols[i % 2].push(
      `<figure style="order:${i}"><img src="${esc(src)}" alt="${esc(p.title)} — project image" decoding="async"></figure>`));
    return `<div class="m-gallery">${cols.map((c) => `<div class="m-col">${c.join("")}</div>`).join("")}</div>`;
  }

  function renderProject(id) {
    const i = projects.findIndex((p) => p.id === id);
    const p = projects[i];
    const prev = projects[(i - 1 + projects.length) % projects.length];
    const next = projects[(i + 1) % projects.length];
    const meta = [["Year", p.year], ["Timeframe", p.timeframe], ["Tools", p.tools], ["Category", p.category]].filter(([, v]) => v);

    modalBody.innerHTML = `
      ${p.cover ? `<div class="m-hero"><img src="${esc(p.cover)}" alt="${esc(p.title)}"></div>` : ""}
      <header class="m-head${p.cover ? "" : " no-hero"}">
        <p class="eyebrow">${esc(p.label || p.category || "")}</p>
        <h2 id="modal-title">${esc(p.title)}</h2>
        ${p.subtitle ? `<p class="m-sub">${esc(p.subtitle)}</p>` : ""}
        ${meta.length ? `<dl class="m-meta">${meta.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>` : ""}
      </header>
      <div class="m-body">${blocks(p.body || [])}</div>
      ${p.gallery && p.gallery.length ? gallery(p) : ""}
      ${projects.length > 1 ? `<nav class="m-nav" aria-label="More projects">
        <a href="#/${esc(prev.id)}"><span class="mono">← Previous</span><strong>${esc(prev.title)}</strong></a>
        <a href="#/${esc(next.id)}"><span class="mono">Next →</span><strong>${esc(next.title)}</strong></a>
      </nav>` : ""}`;
    flagify(modalBody);
    document.title = `${p.title} — ${site.name}`;
  }

  function showProject(id) {
    if (!byId[id]) return;
    renderProject(id);
    modal.classList.remove("closing");
    if (!modal.open) {
      modal.showModal();
      root.classList.add("lock");
    }
    modalScroll.scrollTop = 0;
  }

  function hideProject() {
    if (!modal.open || modal.classList.contains("closing")) return;
    document.title = site.name;
    const finish = () => {
      modal.close();
      modal.classList.remove("closing");
      root.classList.remove("lock");
      wake();
      if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
      opener = null;
    };
    if (reduceMotion) return finish();
    modal.classList.add("closing");
    setTimeout(finish, 230);
  }

  function closeProject() {
    if (pushed) { pushed = false; history.back(); }
    else { history.replaceState(null, "", location.pathname + location.search); hideProject(); }
  }

  const routeId = () => (location.hash.match(/^#\/([\w-]+)/) || [])[1];

  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#/"]');
    if (a) {
      const id = a.getAttribute("href").slice(2);
      if (!byId[id]) return;
      e.preventDefault();
      if (modal.open) history.replaceState(null, "", "#/" + id);
      else { opener = a; history.pushState(null, "", "#/" + id); pushed = true; }
      showProject(id);
      return;
    }
    if (e.target.closest("#modal-close")) { e.preventDefault(); closeProject(); return; }
    if (e.target === modal) { closeProject(); return; }
    const img = e.target.closest(".m-gallery img");
    if (img) {
      const lb = $("#lightbox");
      $("img", lb).src = img.currentSrc || img.src;
      lb.showModal();
      return;
    }
    if (e.target.closest("#lightbox")) $("#lightbox").close();
  });
  modal.addEventListener("cancel", (e) => { e.preventDefault(); closeProject(); });
  window.addEventListener("popstate", () => {
    const id = routeId();
    if (id && byId[id]) showProject(id); else hideProject();
  });

  /* ------------------------------------------------- scroll reveal / nav */
  function observe() {
    const els = $$(".reveal, .fadein");
    if (!("IntersectionObserver" in window)) return els.forEach((el) => el.classList.add("in"));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    els.forEach((el) => io.observe(el));

    const links = new Map($$(".nav a").map((a) => [a.getAttribute("href").slice(1), a]));
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        const link = links.get(en.target.id);
        if (link && en.isIntersecting) { links.forEach((l) => l.classList.remove("active")); link.classList.add("active"); }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    links.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });
  }

  /* ------------------------------------------- cursor-driven interaction
     Everything here runs in ONE requestAnimationFrame loop that only keeps
     going while something is still moving (pointer easing, parallax, scroll).
     When the page is idle no frames are scheduled at all. */
  const pointer = { x: -9999, y: -9999, sx: -9999, sy: -9999, nx: 0, ny: 0, mx: 0, my: 0, seen: false };
  const glow = $("#glow");
  const canvas = $("#field");
  const ctx = canvas.getContext("2d", { alpha: true });
  let W = 0, H = 0, dpr = 1;
  let dotRGB = "141, 141, 154";
  let accentRGB = "0, 255, 157";
  const SPACING = 36;
  const RADIUS = 96;

  let rafId = 0;
  let needsDraw = true;
  let floats = [];          // parallax targets: { el, d }
  let magnets = [];         // top-bar buttons that lean toward the pointer
  let magnetsDirty = true;
  let tiltReq = null;       // latest tilt/spotlight request, applied once per frame
  const drawn = { sx: NaN, sy: NaN, scroll: -1 };

  const wake = () => { if (!rafId && !document.hidden && !reduceMotion && !root.classList.contains("lock")) rafId = requestAnimationFrame(frame); };

  function readColors() {
    const cs = getComputedStyle(root);
    dotRGB = cs.getPropertyValue("--dot").trim() || dotRGB;
    accentRGB = cs.getPropertyValue("--accent-rgb").trim() || accentRGB;
  }
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    W = innerWidth; H = innerHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    needsDraw = true; magnetsDirty = true;
    if (reduceMotion) drawField(); else wake();
  }

  function drawField() {
    ctx.clearRect(0, 0, W, H);
    const off = reduceMotion ? 0 : -((scrollY * 0.18) % SPACING);
    const cols = Math.ceil(W / SPACING) + 2;
    const rows = Math.ceil(H / SPACING) + 3;
    const px = pointer.sx, py = pointer.sy;
    const R2 = RADIUS * RADIUS;
    const near = [];

    ctx.fillStyle = `rgba(${dotRGB}, 0.13)`;
    ctx.beginPath();
    for (let r = -1; r < rows; r++) {
      const y = r * SPACING + off + SPACING / 2;
      const dy = y - py;
      const rowNear = dy * dy < R2;
      for (let c = -1; c < cols; c++) {
        const x = c * SPACING + SPACING / 2;
        if (rowNear) {
          const dx = x - px, d2 = dx * dx + dy * dy;
          if (d2 < R2) { near.push(x, y, dx, dy, Math.sqrt(d2)); continue; }
        }
        ctx.moveTo(x + 1, y);
        ctx.arc(x, y, 1, 0, 6.2832);
      }
    }
    ctx.fill();

    for (let i = 0; i < near.length; i += 5) {
      const x = near[i], y = near[i + 1], dx = near[i + 2], dy = near[i + 3], d = near[i + 4] || 0.001;
      const t = 1 - d / RADIUS;
      const push = t * t * 13;
      ctx.fillStyle = `rgba(${t > 0.55 ? accentRGB : dotRGB}, ${0.13 + t * 0.34})`;
      ctx.beginPath();
      ctx.arc(x + (dx / d) * push, y + (dy / d) * push, 1 + t * 0.9, 0, 6.2832);
      ctx.fill();
    }
  }

  function refreshMagnets() {
    magnets = $$("#socials-top .icon-btn").map((el) => {
      const r = el.getBoundingClientRect();
      const tx = parseFloat(el.style.getPropertyValue("--tx")) || 0;
      const ty = parseFloat(el.style.getPropertyValue("--ty")) || 0;
      return { el, cx: r.left + r.width / 2 - tx, cy: r.top + r.height / 2 - ty, pulled: tx !== 0 || ty !== 0 };
    });
    magnetsDirty = false;
  }

  function frame() {
    rafId = 0;
    let busy = false;

    // ---- reads first (avoid layout thrash) ----
    if (magnetsDirty) refreshMagnets();
    let tilt = null;
    if (tiltReq) {
      const { t, cx, cy } = tiltReq;
      const r = t.getBoundingClientRect();
      tilt = { t, x: (cx - r.left) / r.width, y: (cy - r.top) / r.height };
      tiltReq = null;
    }

    // ---- pointer easing (dot field + spotlight) ----
    if (pointer.seen) {
      const dx = pointer.x - pointer.sx, dy = pointer.y - pointer.sy;
      if (Math.abs(dx) + Math.abs(dy) > 0.4) { pointer.sx += dx * 0.2; pointer.sy += dy * 0.2; busy = true; }
      else { pointer.sx = pointer.x; pointer.sy = pointer.y; }
      if (pointer.sx !== drawn.sx || pointer.sy !== drawn.sy) {
        glow.style.transform = `translate3d(${pointer.sx.toFixed(1)}px, ${pointer.sy.toFixed(1)}px, 0)`;
        needsDraw = true;
      }
    }
    if (scrollY !== drawn.scroll) needsDraw = true;

    // ---- card parallax: only the few floating cards, never the root ----
    const ex = pointer.nx - pointer.mx, ey = pointer.ny - pointer.my;
    if (Math.abs(ex) + Math.abs(ey) > 0.0008) {
      pointer.mx += ex * 0.08; pointer.my += ey * 0.08; busy = true;
      for (const f of floats) f.el.style.transform = `translate3d(${(pointer.mx * f.d * -18).toFixed(2)}px, ${(pointer.my * f.d * -12).toFixed(2)}px, 0)`;
    }

    // ---- canvas ----
    if (needsDraw) { drawField(); drawn.sx = pointer.sx; drawn.sy = pointer.sy; drawn.scroll = scrollY; needsDraw = false; }

    // ---- card tilt + spotlight ----
    if (tilt) {
      const { t, x, y } = tilt;
      const s = t.style;
      s.setProperty("--rx", ((y - 0.5) * -9).toFixed(2) + "deg");
      s.setProperty("--ry", ((x - 0.5) * 9).toFixed(2) + "deg");
      s.setProperty("--sx", (x * 100).toFixed(1) + "%");
      s.setProperty("--sy", (y * 100).toFixed(1) + "%");
      s.setProperty("--ix", ((0.5 - x) * 22).toFixed(1) + "px");
      s.setProperty("--iy", ((0.5 - y) * 16).toFixed(1) + "px");
    }

    // ---- magnetic buttons ----
    for (const m of magnets) {
      const dx = pointer.x - m.cx, dy = pointer.y - m.cy;
      const d = Math.hypot(dx, dy);
      if (d < 90) {
        const pull = (1 - d / 90) * 0.4;
        m.el.style.setProperty("--tx", (dx * pull).toFixed(1) + "px");
        m.el.style.setProperty("--ty", (dy * pull).toFixed(1) + "px");
        m.pulled = true;
      } else if (m.pulled) {
        m.el.style.removeProperty("--tx"); m.el.style.removeProperty("--ty");
        m.pulled = false;
      }
    }

    if (busy) wake();
  }

  function initPointer() {
    addEventListener("pointermove", (e) => {
      pointer.x = e.clientX; pointer.y = e.clientY;
      if (!pointer.seen) { pointer.seen = true; pointer.sx = e.clientX; pointer.sy = e.clientY; glow.classList.add("on"); }
      pointer.nx = (e.clientX / innerWidth - 0.5) * 2;
      pointer.ny = (e.clientY / innerHeight - 0.5) * 2;
      if (e.pointerType !== "touch") {
        const t = e.target.closest && e.target.closest("[data-tilt]");
        if (t) tiltReq = { t, cx: e.clientX, cy: e.clientY };
      }
      wake();
    }, { passive: true });

    document.addEventListener("pointerleave", () => {
      pointer.x = pointer.y = pointer.sx = pointer.sy = -9999;
      pointer.nx = pointer.ny = 0; pointer.seen = false;
      glow.classList.remove("on");
      needsDraw = true; wake();
    });

    document.addEventListener("pointerout", (e) => {
      const t = e.target.closest && e.target.closest("[data-tilt]");
      if (t && !t.contains(e.relatedTarget)) ["--rx", "--ry", "--ix", "--iy"].forEach((v) => t.style.removeProperty(v));
      if (!e.relatedTarget) { pointer.x = pointer.y = -9999; wake(); }
    });
  }

  function initField() {
    readColors();
    resize();
    addEventListener("resize", resize);
    addEventListener("scroll", wake, { passive: true });
    matchMedia("(prefers-color-scheme: light)").addEventListener("change", () => { readColors(); needsDraw = true; if (reduceMotion) drawField(); else wake(); });
    document.addEventListener("visibilitychange", wake);
    if (reduceMotion) drawField(); else wake();
  }

  function initFloats() {
    floats = $$(".float").map((el) => ({ el, d: parseFloat(el.style.getPropertyValue("--d")) || 0.5 }));
    magnetsDirty = true;
  }

  /* ------------------------------------------------------------- misc */
  function initMenu() {
    const btn = $("#menu-btn"), menu = $("#menu");
    const set = (open) => {
      menu.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", String(open));
      btn.setAttribute("aria-label", open ? "Close menu" : "Menu");
    };
    btn.addEventListener("click", () => set(!menu.classList.contains("open")));
    menu.addEventListener("click", (e) => { if (e.target.closest(".menu-links a")) set(false); });
    document.addEventListener("click", (e) => { if (!e.target.closest("#menu, #menu-btn")) set(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && menu.classList.contains("open")) { set(false); btn.focus(); } });
    matchMedia("(min-width: 1061px)").addEventListener("change", (m) => { if (m.matches) set(false); });
  }

  function initToTop() {
    const btn = $("#to-top");
    let ticking = false;
    const update = () => { btn.classList.toggle("show", scrollY > 500); ticking = false; };
    addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    btn.addEventListener("click", (e) => { e.preventDefault(); scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }); });
    update();
  }

  function initCopy() {
    $("#copy-mail").addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(site.email); toast("Email copied"); }
      catch { toast(site.email); }
    });
  }

  // one retry for any image that fails to load (flaky network / cache)
  document.addEventListener("error", (e) => {
    const img = e.target;
    if (img.tagName !== "IMG" || img.dataset.retried || !img.getAttribute("src")) return;
    img.dataset.retried = "1";
    img.src = img.getAttribute("src") + (img.getAttribute("src").includes("?") ? "&" : "?") + "r=" + Date.now();
  }, true);

  /* ------------------------------------------------------------- boot */
  async function boot() {
    initField();
    if (!reduceMotion) initPointer();

    try {
      const [s, p] = await Promise.all([
        fetch("data/site.json").then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); }),
        fetch("data/projects.json").then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
      ]);
      site = s; projects = p;
      projects.forEach((x) => (byId[x.id] = x));
    } catch (err) {
      $("#headline").textContent = "Content failed to load";
      $("#intro").textContent = "If you opened index.html straight from disk, serve the folder over http instead (e.g. `npx serve`).";
      console.error(err);
      return;
    }

    renderSite();
    renderWork();
    flagify(document.body);
    initFloats();
    initCopy();
    initMenu();
    initToTop();
    observe();

    const id = routeId();
    if (id && byId[id]) showProject(id);
  }

  boot();
})();
