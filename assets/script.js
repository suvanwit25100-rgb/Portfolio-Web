// ---------- PRELOADER: multiple agents building the site live ----------
(function preload() {
  const preloader = document.getElementById("preloader");
  const fill = document.getElementById("preloaderFill");
  const pct = document.getElementById("preloaderPct");
  const skip = document.getElementById("preloaderSkip");
  const logEl = document.getElementById("preloaderLog");
  const grid = document.getElementById("agentGrid");
  if (!preloader) return;

  document.body.classList.add("preloading");

  // Each agent emits a sequence of steps as the build progresses.
  const agents = {
    cabin:    { label: "cabin-agent",    steps: ["mounting layout grid", "placing hero + sections", "sealing cabin frame"] },
    avionics: { label: "avionics-agent", steps: ["reading resume.pdf", "parsing → profile.json", "loading 4 projects"] },
    livery:   { label: "livery-agent",   steps: ["mixing aviation palette", "applying gold livery", "polishing surfaces"] },
    motion:   { label: "motion-agent",   steps: ["wiring smooth-scroll", "arming reveal triggers", "calibrating parallax"] },
  };
  const order = ["cabin", "avionics", "livery", "motion"];
  const rows = {};
  if (grid) grid.querySelectorAll(".agent-row").forEach((r) => { rows[r.dataset.agent] = r; });

  let value = 0;
  let done = false;
  const progress = { cabin: 0, avionics: 0, livery: 0, motion: 0 };

  function addLine(agentKey, text, ok) {
    const p = document.createElement("p");
    p.innerHTML =
      '<span class="bl-agent">' + agentKey + "</span>" +
      (ok ? '<span class="bl-ok">✓</span>' : '<span class="bl-pending">…</span>') +
      text;
    logEl.appendChild(p);
    while (logEl.children.length > 3) logEl.removeChild(logEl.firstChild);
  }

  function finish() {
    if (done) return;
    done = true;
    order.forEach((k) => rows[k] && rows[k].classList.add("done"));
    preloader.classList.add("hidden");
    document.body.classList.remove("preloading");
    revealBuildLog();
    setTimeout(() => preloader.remove(), 800);
  }

  const interval = setInterval(() => {
    value = Math.min(100, value + Math.random() * 12 + 5);
    fill.style.width = value + "%";
    pct.textContent = Math.floor(value) + "%";

    // Agents work in parallel but slightly staggered.
    order.forEach((key, idx) => {
      const a = agents[key];
      const row = rows[key];
      const startAt = idx * 12;
      const localPct = Math.max(0, Math.min(100, (value - startAt) / (100 - startAt) * 100));
      const stepIndex = Math.floor((localPct / 100) * a.steps.length);

      if (localPct > 0 && row) row.classList.add("active");
      if (stepIndex > progress[key] && progress[key] < a.steps.length) {
        addLine(key, a.steps[progress[key]], true);
        progress[key]++;
      }
      if (localPct >= 100 && row) row.classList.add("done");
    });

    if (value >= 100) {
      clearInterval(interval);
      order.forEach((key) => {
        while (progress[key] < agents[key].steps.length) {
          addLine(key, agents[key].steps[progress[key]], true);
          progress[key]++;
        }
      });
      setTimeout(finish, 400);
    }
  }, 240);

  if (skip) skip.addEventListener("click", () => { clearInterval(interval); finish(); });
  setTimeout(() => { clearInterval(interval); finish(); }, 5200);
})();

function revealBuildLog() {
  const lines = document.querySelectorAll(".bl-line");
  lines.forEach((line) => {
    const delay = parseInt(line.getAttribute("data-delay") || "0", 10);
    setTimeout(() => line.classList.add("shown"), delay);
  });
}

// ---------- Ambient sound (procedural, no audio file) ----------
(function ambientSound() {
  const toggle = document.getElementById("soundToggle");
  const iconOn = document.getElementById("soundIconOn");
  const iconOff = document.getElementById("soundIconOff");
  const label = document.getElementById("soundLabel");
  if (!toggle) return;

  let ctx = null;
  let nodes = [];
  let playing = false;

  function startAmbient() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    master.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 1.5);

    const freqs = [110, 164.81, 220];
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = f;

      const lfo = ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = 0.07 + idx * 0.03;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 4;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      const gain = ctx.createGain();
      gain.gain.value = idx === 0 ? 0.6 : 0.3;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 900;

      osc.connect(gain);
      gain.connect(filter);
      filter.connect(master);

      osc.start();
      lfo.start();
      nodes.push(osc, lfo);
    });

    nodes.push(master);
    playing = true;
  }

  function stopAmbient() {
    if (!ctx) return;
    const master = nodes[nodes.length - 1];
    master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
    setTimeout(() => {
      nodes.forEach((n) => { if (n.stop) n.stop(); });
      ctx.close();
      ctx = null;
      nodes = [];
    }, 650);
    playing = false;
  }

  toggle.addEventListener("click", () => {
    if (!playing) {
      startAmbient();
      toggle.classList.add("active");
      toggle.setAttribute("aria-pressed", "true");
      iconOn.style.display = "";
      iconOff.style.display = "none";
      label.textContent = "ambient on";
    } else {
      stopAmbient();
      toggle.classList.remove("active");
      toggle.setAttribute("aria-pressed", "false");
      iconOn.style.display = "none";
      iconOff.style.display = "";
      label.textContent = "ambient off";
    }
  });
})();

// ---------- Hero parallax (lightweight, native-scroll-safe) ----------
(function heroParallax() {
  const ghost = document.querySelector(".hero-ghost");
  const rail = document.querySelector(".hero-rail");
  if (!ghost && !rail) return;
  function onScroll() {
    const y = window.scrollY;
    if (y > window.innerHeight) return;
    if (ghost) ghost.style.transform = `translateX(-50%) translateY(${y * 0.15}px)`;
    if (rail) rail.style.transform = `translateY(${y * 0.08}px)`;
  }
  window.addEventListener("scroll", onScroll, { passive: true });
})();

// Typing effect in hero
const phrases = [
  "machine learning researcher",
  "prognostics, computer vision & applied ML",
  "building, breaking, and re-training models",
];

const typedEl = document.getElementById("typed");

function typeLoop() {
  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function tick() {
    const current = phrases[phraseIndex];

    if (!deleting) {
      charIndex++;
      typedEl.textContent = current.slice(0, charIndex);
      if (charIndex === current.length) {
        deleting = true;
        setTimeout(tick, 1600);
        return;
      }
    } else {
      charIndex--;
      typedEl.textContent = current.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
      }
    }
    setTimeout(tick, deleting ? 30 : 55);
  }
  tick();
}

if (typedEl) typeLoop();

// Mobile nav toggle
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => navLinks.classList.remove("open"));
  });
}

// Reveal sections on scroll
const sections = document.querySelectorAll(".section");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
sections.forEach((s) => observer.observe(s));

// Footer year
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Scroll progress bar
const progressBar = document.getElementById("scrollProgress");
const statusScroll = document.getElementById("statusScroll");
function updateProgress() {
  if (!progressBar) return;
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressBar.style.width = pct + "%";
  if (statusScroll) statusScroll.textContent = Math.round(pct) + "%";
}
window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

// Active nav link on scroll (scroll-spy)
const navAnchors = Array.from(document.querySelectorAll(".nav-link"));
const spySections = navAnchors
  .map((a) => document.querySelector(a.getAttribute("href")))
  .filter(Boolean);

const statusSection = document.getElementById("statusSection");

const spyObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = "#" + entry.target.id;
        navAnchors.forEach((a) => {
          a.classList.toggle("active", a.getAttribute("href") === id);
        });
        if (statusSection) statusSection.textContent = entry.target.id;
      }
    });
  },
  { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
);
spySections.forEach((s) => spyObserver.observe(s));
