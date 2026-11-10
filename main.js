(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Typed roles in the hero
  const PHRASES = {
    en: [
      "turn one-off requests into reusable product capabilities.",
      "design ranking, credits, leaderboards and referral loops.",
      "took a job platform from zero to ~30,000 users.",
      "ship business requests myself with AI agents, in one sprint."
    ],
    vi: [
      "biến yêu cầu lẻ thành tính năng dùng lại được.",
      "thiết kế xếp hạng, credit, bảng xếp hạng và vòng giới thiệu.",
      "đưa một sàn việc làm từ 0 lên ~30.000 người dùng.",
      "tự triển khai yêu cầu kinh doanh bằng AI agent, trong một sprint."
    ]
  };
  let phrases = PHRASES.en;
  const typed = document.getElementById("typed");
  let p = 0, i = 0, del = false;
  window.__setTypedLang = (lang) => {
    phrases = PHRASES[lang] || PHRASES.en;
    p = 0; i = 0; del = false;
    if (reduce) typed.textContent = phrases[0];
  };
  if (reduce) {
    typed.textContent = phrases[0];
  } else {
    const tick = () => {
      const s = phrases[p];
      typed.textContent = s.slice(0, i);
      if (!del && i < s.length) { i++; setTimeout(tick, 38); }
      else if (!del) { del = true; setTimeout(tick, 1800); }
      else if (i > 0) { i--; setTimeout(tick, 16); }
      else { del = false; p = (p + 1) % phrases.length; setTimeout(tick, 300); }
    };
    tick();
  }

  // Count-up numbers
  const fmt = new Intl.NumberFormat("en-US");
  const countUp = (el) => {
    const end = +el.dataset.count;
    const pre = el.dataset.prefix ? new DOMParser().parseFromString(el.dataset.prefix, "text/html").body.textContent : "";
    const suf = el.dataset.suffix || "";
    if (reduce) { el.textContent = pre + fmt.format(end) + suf; return; }
    const t0 = performance.now(), dur = 1600;
    const step = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      el.textContent = pre + fmt.format(Math.round(end * e)) + suf;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  // Reveal on scroll
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      el.classList.add("in");
      el.querySelectorAll("[data-count]").forEach(countUp);
      if (el.matches("[data-count]")) countUp(el);
      io.unobserve(el);
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".reveal, .mech, .guard").forEach((el) => io.observe(el));

  // Pipeline: highlight steps in turn while visible
  const steps = [...document.querySelectorAll(".pipeline .step")];
  let si = 0, timer = null;
  const run = () => {
    steps.forEach((s, k) => s.classList.toggle("active", k === si));
    si = (si + 1) % steps.length;
  };
  new IntersectionObserver(([en]) => {
    if (en.isIntersecting && !timer) { run(); if (!reduce) timer = setInterval(run, 1600); }
    else if (!en.isIntersecting && timer) { clearInterval(timer); timer = null; }
  }, { threshold: 0.2 }).observe(document.getElementById("pipeline"));

  // Tilt on role cards (pointer devices only)
  if (!reduce && window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".tilt").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(700px) rotateX(${-y * 8}deg) rotateY(${x * 10}deg) translateY(-4px)`;
      });
      card.addEventListener("pointerleave", () => { card.style.transform = ""; });
    });
  }

  // Scroll progress bar
  const bar = document.getElementById("progress-bar");
  const onScroll = () => {
    const h = document.documentElement;
    bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight || 1)) * 100 + "%";
  };
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Lightbox
  const lb = document.getElementById("lightbox");
  const lbImg = lb.querySelector("img");
  let lastFocus = null;
  const close = () => { lb.hidden = true; lastFocus && lastFocus.focus(); };
  document.querySelectorAll(".frame").forEach((btn) => {
    btn.addEventListener("click", () => {
      lastFocus = btn;
      lbImg.src = btn.dataset.full;
      lbImg.alt = btn.querySelector("img").alt;
      lb.hidden = false;
      lb.querySelector(".close").focus();
    });
  });
  lb.addEventListener("click", (e) => { if (e.target !== lbImg) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !lb.hidden) close(); });

  // Background: drifting node network (blockchain feel)
  const cv = document.getElementById("net");
  const ctx = cv.getContext("2d");
  let W, H, nodes = [];
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(70, (W * H) / 22000));
    nodes = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25
    }));
  };
  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    for (const a of nodes) {
      a.x += a.vx; a.y += a.vy;
      if (a.x < 0 || a.x > W) a.vx *= -1;
      if (a.y < 0 || a.y > H) a.vy *= -1;
    }
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 140) {
          ctx.strokeStyle = `rgba(61,139,255,${(1 - d / 140) * 0.35})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    for (const a of nodes) {
      ctx.fillStyle = "rgba(34,211,238,.7)";
      ctx.beginPath(); ctx.arc(a.x, a.y, 1.6, 0, Math.PI * 2); ctx.fill();
    }
    if (!reduce) requestAnimationFrame(draw);
  };
  window.addEventListener("resize", resize);
  resize();
  draw();
})();

// Token chart: peak context per feature session (measured from transcripts, 10 Nov 2026)
(() => {
  const data = [["10-16",283],["10-16",366],["10-16",441],["10-16",142],["10-16",283],["10-16",531],["10-16",212],["10-16",301],["10-16",242],["10-16",531],["10-19",110],["10-19",853],["10-19",207],["10-19",177],["10-19",166],["10-19",288],["10-19",344],["10-20",217],["10-22",348],["10-26",139],["10-27",342],["10-27",392],["10-28",459],["10-28",400],["10-28",384],["10-28",246],["10-28",433],["10-28",341],["10-29",219],["10-29",388],["10-29",509],["10-29",706],["10-29",647],["10-30",647],["10-30",322],["11-02",473],["11-03",514],["11-03",339],["11-03",388],["11-03",531],["11-04",272],["11-05",412],["11-06",965],["11-06",534],["11-06",647],["11-06",965],["11-06",625],["11-06",483],["11-07",654],["11-08",286],["11-08",293],["11-08",415],["11-08",539],["11-09",348],["11-09",966]];
  const svg = document.getElementById("token-svg");
  if (!svg) return;
  const NS = "http://www.w3.org/2000/svg";
  const W = 1000, H = 260, L = 0, B = 0, T = 2, MAX = 1000;
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.setAttribute("preserveAspectRatio", "none");
  const y = (v) => T + (H - T - B) * (1 - v / MAX);
  const el = (n, a) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); svg.appendChild(e); return e; };
  [250, 500, 750].forEach((v) => el("line", { x1: L, x2: W, y1: y(v), y2: y(v), class: "grid", "vector-effect": "non-scaling-stroke" }));
  el("line", { x1: L, x2: W, y1: y(MAX), y2: y(MAX), class: "ceil", "vector-effect": "non-scaling-stroke" });
  const n = data.length, slot = (W - L) / n, bw = slot * 0.68;
  const color = (v) => v >= 900 ? "#ff3b5c" : v >= 600 ? "#f59e0b" : v >= 300 ? "#3d8bff" : "#2dd4bf";
  const bars = data.map(([d, v], i) => {
    const x = L + i * slot + (slot - bw) / 2;
    const r = el("rect", { x, width: bw, y: y(0), height: 0, rx: 2, fill: color(v) });
    const t = document.createElementNS(NS, "title"); t.textContent = `Session started ${d}: peak ${v}k tokens`; r.appendChild(t);
    return [r, v];
  });
  const grow = () => bars.forEach(([r, v], i) => setTimeout(() => { r.setAttribute("y", y(v)); r.setAttribute("height", y(0) - y(v)); }, i * 18));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) { grow(); return; }
  new IntersectionObserver(([en], o) => { if (en.isIntersecting) { grow(); o.disconnect(); } }, { threshold: 0.3 }).observe(svg);
})();

// Compare galleries (employer, admin): tabs, v1/v2 slider, auto-advance while visible
document.querySelectorAll(".admin-gallery").forEach((g) => {
  const tabs = [...g.querySelectorAll("[role=tab]")], panes = [...g.querySelectorAll(".pane")], caps = [...g.querySelectorAll(".cap")];
  const cmp = g.querySelector(".cmp"), range = g.querySelector("input[type=range]"), bar = g.querySelector(".abar span");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let i = 0, timer = null, visible = false, sweep = null, touched = false;
  const setPos = (v) => { cmp.style.setProperty("--pos", v + "%"); range.value = v; };
  const animate = () => {
    cancelAnimationFrame(sweep);
    if (reduce) { setPos(50); return; }
    const t0 = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - t0) / 1400), e = 1 - Math.pow(1 - k, 3);
      setPos(Math.round(92 - 42 * e));
      if (k < 1) sweep = requestAnimationFrame(step);
    };
    sweep = requestAnimationFrame(step);
  };
  const show = (k) => {
    i = k;
    tabs.forEach((t, j) => t.setAttribute("aria-selected", j === k));
    panes.forEach((p, j) => p.classList.toggle("on", j === k));
    caps.forEach((c, j) => c.classList.toggle("on", j === k));
    cmp.classList.toggle("solo", panes[k].classList.contains("solo"));
    animate();
    bar.classList.remove("run"); void bar.offsetWidth;
    if (!reduce && visible && !touched) bar.classList.add("run");
  };
  const loop = () => {
    clearInterval(timer);
    if (!reduce && visible && !touched) timer = setInterval(() => show((i + 1) % panes.length), 6500);
  };
  tabs.forEach((t, k) => t.addEventListener("click", () => { touched = true; show(k); loop(); }));
  range.addEventListener("input", () => {
    touched = true; clearInterval(timer); cancelAnimationFrame(sweep); bar.classList.remove("run"); setPos(range.value);
  });
  new IntersectionObserver(([en]) => {
    const was = visible; visible = en.isIntersecting;
    if (visible && !was) show(i);
    loop();
  }, { threshold: 0.3 }).observe(g);
});

// Lifecycle: light each stage in turn while visible
(() => {
  const c = document.getElementById("cycle"); if (!c) return;
  const items = [...c.querySelectorAll("li")];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let k = 0, t = null;
  const tick = () => { items.forEach((li, j) => li.classList.toggle("lit", j === k)); k = (k + 1) % items.length; };
  new IntersectionObserver(([en]) => {
    if (en.isIntersecting && !t) { tick(); if (!reduce) t = setInterval(tick, 1100); }
    else if (!en.isIntersecting && t) { clearInterval(t); t = null; }
  }, { threshold: 0.25 }).observe(c);
  document.querySelectorAll(".fb").forEach((el) => new IntersectionObserver(([en], o) => { if (en.isIntersecting) { el.classList.add("in"); o.disconnect(); } }, { threshold: 0.2 }).observe(el));
})();
