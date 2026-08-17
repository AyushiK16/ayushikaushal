// ================================
// LOADING SCREEN
// Rotates through greetings once per
// browser session, then slides the
// screen up to reveal the site.
// ================================
(function initLoadingScreen() {
  const loadingScreen = document.getElementById("loadingScreen");
  const wordEl = document.getElementById("loadingWord");
  if (!loadingScreen || !wordEl) return;

  const alreadySeen = sessionStorage.getItem("ayushiIntroSeen");
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  // repeat visits within the same session (or reduced-motion users)
  // skip the animation entirely — index.html's inline script already
  // hides it visually, this just removes it from the DOM.
  if (alreadySeen || prefersReducedMotion) {
    loadingScreen.remove();
    return;
  }

  sessionStorage.setItem("ayushiIntroSeen", "true");

  // TODO: swap the last entry ("hello") for a handwritten SVG signature later —
  // it's kept as a plain word here so the swap is a one-line change.
  const words = ["hi", "नमस्ते", "hola", "bonjour", "ciao", "你好", "hello"];
  const stepMs = 330; // how long each word stays fully visible
  const fadeMs = 150; // must match the CSS transition on .loading-word

  document.body.classList.add("loading-active");
  wordEl.textContent = words[0];

  let i = 0;
  const interval = setInterval(() => {
    wordEl.classList.add("loading-fade");

    setTimeout(() => {
      i++;
      if (i >= words.length) {
        clearInterval(interval);
        loadingScreen.classList.add("loading-hide");
        document.body.classList.remove("loading-active");
        // remove from the DOM once the slide-up transition finishes
        setTimeout(() => loadingScreen.remove(), 700);
        return;
      }
      wordEl.textContent = words[i];
      wordEl.classList.remove("loading-fade");
    }, fadeMs);
  }, stepMs);
})();

// ================================
// PHOTOBOOTH STRIP
// Prints the photo strip downward the
// first time the about section scrolls
// into view.
// ================================
(function initPhotoStrip() {
  const strip = document.getElementById("photoStrip");
  // watch the outer wrapper, not the strip itself — the strip is
  // deliberately clipped to 0% visible (translateY + overflow:hidden
  // ancestor) until it "prints," and IntersectionObserver measures
  // visibility *after* ancestor clipping, so observing the strip
  // directly would report ~0% forever and never cross the threshold.
  const trigger = document.querySelector(".photobooth");
  if (!strip || !trigger) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (prefersReducedMotion) {
    strip.classList.add("strip-visible");
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          strip.classList.add("strip-visible");
          observer.unobserve(entry.target);
          /*
            unobserve() stops watching once it's printed —
            without this the strip would try to "reprint"
            every time you scroll the section back into view.
          */
        }
      });
    },
    { threshold: 0.3 },
  );

  observer.observe(trigger);
})();

// ================================
// CUSTOM CURSOR
// A small glyph that follows the
// pointer. Desktop (fine pointer)
// only, and skipped for reduced-
// motion users. A tiny corner button
// lets you cycle its shape for fun.
// ================================
(function initCustomCursor() {
  const cursor = document.getElementById("customCursor");
  const toggle = document.getElementById("cursorToggle");
  if (!cursor) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const isFinePointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)",
  ).matches;

  if (prefersReducedMotion || !isFinePointer) {
    if (toggle) toggle.remove();
    return;
  }

  document.body.classList.add("custom-cursor-active");

  window.addEventListener("mousemove", (e) => {
    cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    cursor.classList.add("visible");
  });

  document.addEventListener("mouseleave", () => {
    cursor.classList.remove("visible");
  });

  // easter egg: click the corner button to cycle cursor shapes
  if (toggle) {
    const glyphs = ["✦", "✏️", "❤️", "★"];
    let glyphIndex = 0;

    toggle.addEventListener("click", () => {
      glyphIndex = (glyphIndex + 1) % glyphs.length;
      cursor.textContent = glyphs[glyphIndex];
    });
  }
})();

// ================================
// EASTER EGG
// Typing "ayushi" anywhere on the
// page triggers a confetti burst.
// ================================
(function initEasterEgg() {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (prefersReducedMotion) return;

  const target = "ayushi";
  let buffer = "";

  function burstConfetti() {
    const colors = [
      "#e8b4c0",
      "#c47a8a",
      "#a8c49a",
      "#5a7a52",
      "#efe6d5",
      "#8a3a4a",
    ];
    const count = 40;
    const container = document.createElement("div");
    container.className = "confetti-burst";

    for (let i = 0; i < count; i++) {
      const piece = document.createElement("span");
      piece.className = "confetti-piece";
      piece.style.left = `${Math.random() * 100}vw`;
      piece.style.background = colors[i % colors.length];
      piece.style.animationDelay = `${Math.random() * 0.3}s`;
      piece.style.setProperty("--rot", `${Math.random() * 360}deg`);
      container.appendChild(piece);
    }

    document.body.appendChild(container);
    setTimeout(() => container.remove(), 2200);
  }

  document.addEventListener("keydown", (e) => {
    const tag = e.target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    if (e.key.length !== 1) return; // ignore Shift, Enter, arrow keys, etc.

    buffer = (buffer + e.key.toLowerCase()).slice(-target.length);
    if (buffer === target) {
      burstConfetti();
      buffer = "";
    }
  });
})();

// ================================
// BACK TO TOP
// ================================
(function initBackToTop() {
  const btn = document.getElementById("backToTop");
  if (!btn) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  window.addEventListener("scroll", () => {
    btn.classList.toggle("visible", window.scrollY > 600);
  });

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  });
})();

// ================================
// ARTICLE OVERLAY
// Full-screen reading view shared by
// every project card. Closed via the
// back button, ESC, or a repeat click.
// ================================
const articleOverlay = document.getElementById("articleOverlay");
const articleBack = document.getElementById("articleBack");
const articleCat = document.getElementById("articleCat");
const articleDate = document.getElementById("articleDate");
const articleRead = document.getElementById("articleRead");
const articleOverlayTitle = document.getElementById("articleOverlayTitle");
const articleBody = document.getElementById("articleBody");

function closeArticle() {
  articleOverlay.classList.remove("open");
  articleOverlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("overlay-open");
}

if (articleOverlay && articleBack) {
  articleBack.addEventListener("click", closeArticle);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && articleOverlay.classList.contains("open")) {
      closeArticle();
    }
  });
}

// ================================
// PROJECTS
// data array → card grid → clicking
// a card opens the full case study
// in the shared #articleOverlay.
// ================================
const statusStyles = {
  shipped: { bg: "#d4e8cc", color: "#3a5a32", border: "#a8c49a" },
  live: { bg: "#d4e8cc", color: "#3a5a32", border: "#a8c49a" },
  "in development": { bg: "#f5dce3", color: "#8a3a4a", border: "#e8b4c0" },
  "under submission": { bg: "#ede9fe", color: "#4c1d95", border: "#c4b5fd" },
  research: { bg: "#ede9fe", color: "#4c1d95", border: "#c4b5fd" },
  "v2.0": { bg: "#efe6d5", color: "#5a4a3a", border: "#c8b89a" },
};

const projects = [
  {
    id: "contingent-anchor",
    title: "The Contingent Anchor",
    subtitle:
      "Regime dependence in gold's sensitivity to real interest rates, 2003–2026",
    status: "under submission",
    description:
      "Gold is supposed to move against real interest rates. I wanted to know whether that relationship has always held — and it hasn't.",
    stack: [
      "python",
      "statsmodels",
      "xgboost",
      "shap",
      "fred api",
      "block bootstrap",
    ],
    credit:
      "Co-authored with Dr. Kapil Tomar (CSE, TIET). Under submission to IMRC 2026 (IIM Ahmedabad) and ConfAI 2026 (Plaksha).",
    body: `
      <p>Gold is supposed to move against real interest rates. I wanted to know whether that relationship has always held — and it hasn't.</p>
      <p>Working with weekly data from 2003 to mid-2026 (~1,200 observations pulled from FRED, Yahoo Finance, and the Caldara–Iacoviello geopolitical risk index), I tested for structural breaks in gold's real-rate beta. There's a robust break at January 2009: before it, beta is positive (+2.90); after, negative (−6.03). The textbook relationship doesn't predate quantitative easing — it emerges with it.</p>
      <p>The second finding is the one I kept trying to explain away. Since February 2022, gold has drifted +80.5% beyond what the model predicts, beating all 5,000 block-bootstrap resamples. I ran the obvious alternatives and rejected them: Fed rate turbulence (p=0.14), geopolitical risk (fills 5% of the gap), Western ETF flows (21%). A copper placebo came back clean (−23%, p=0.63), which tells me the method isn't just manufacturing residuals out of noise.</p>
      <p>I also layered on XGBoost with rolling SHAP attribution, and got a result I liked precisely because it was uncomfortable: explanatory R² collapses from 0.32 to 0.10 post-2022, while the model's reliance on the real-rate feature actually rises. The signal is still there. It just stopped being enough.</p>
      <p>The paper reports its nulls honestly — regime dummies don't improve forecasts, the 2022 returns break is marginal and flips with a single week of data, and the central-bank holdings data is unusable because Russia stopped reporting to the IMF in exactly the month the anomaly begins.</p>
    `,
  },
  {
    id: "pulse",
    title: "Pulse",
    subtitle: "Financial news sentiment dashboard",
    status: "in development",
    description:
      "A dashboard that reads financial news the way a trader skims a terminal — fast, and with a sense of which way the mood is turning.",
    stack: ["next.js", "typescript", "tailwind", "finbert", "python"],
    body: `
      <p>A dashboard that reads financial news the way a trader skims a terminal — fast, and with a sense of which way the mood is turning.</p>
      <p>The first version used VADER, which is a fine general-purpose sentiment model and a bad financial one. "Shares plunge on beat-and-raise guidance" is not a negative headline, but VADER is very confident that it is. Version two replaces it with FinBERT, which is trained on financial text and understands that the vocabulary of markets is its own dialect.</p>
      <p>v2 also rebuilds the frontend properly — Next.js, TypeScript, Tailwind — because the analysis being right doesn't matter if reading it is a chore.</p>
      <p>Actively in development.</p>
    `,
  },
  {
    id: "bug-buddy",
    title: "Bug Buddy",
    subtitle: "A ladybug on your screen that refuses to give you the answer",
    status: "shipped",
    description:
      "Ask an LLM a coding question and it hands you a finished, tailored solution — the exact wrong thing when you're trying to learn.",
    stack: ["python", "sentence-transformers", "numpy", "pyside6", "macos"],
    body: `
      <p>Ask an LLM a coding question and it hands you a finished, tailored solution. That's genuinely useful and it's also the exact wrong thing when you're trying to learn — the answer arrives before the thinking does.</p>
      <p>Bug Buddy is a small ladybug you place anywhere on your screen. Click her, type a question, and she hands back the relevant documentation snippet. Not a rephrasing. Not a generated explanation. The snippet. That constraint is the whole product: pure retrieval, no generative model, which makes the anti-spoon-feeding guarantee structural rather than a matter of prompt discipline.</p>
      <p>Under the hood: a hand-curated corpus (starting with C++), each chunk embedded once with all-MiniLM-L6-v2 via sentence-transformers, cosine similarity at query time against a plain vector matrix — no vector DB, because at this scale a matrix multiply is the search. Two thresholds govern the response: above HIGH it answers confidently, between LOW and HIGH it shows the closest chunk flagged as a guess, below LOW it says it doesn't know. It never bluffs.</p>
      <p>Building it taught me something I didn't expect about retrieval systems. When "for loop" returned the range-based-for chunk, my instinct was to tune the thresholds. The actual problem was that a plain for-loop chunk didn't exist. Coverage is the corpus. No amount of parameter tuning creates information that isn't there.</p>
      <p>The desktop app is Python + PySide6 — a frameless, always-on-top, draggable sprite with a popover that opens to the side, animates properly, and calls the retrieval engine directly with no cross-language glue. Running on macOS. The ladybug is my own pixel art.</p>
    `,
  },
  {
    id: "marionette",
    title: "Marionette",
    subtitle: "Gesture-controlled Spotify player",
    status: "shipped",
    description:
      "Conducting music with your hands — a sentence that sounds better than the engineering behind it deserves.",
    stack: ["python", "mediapipe", "scikit-learn", "spotify api"],
    body: `
      <p>Conducting music with your hands, which is a sentence that sounds better than the engineering behind it deserves — but the engineering is the part I'm proud of.</p>
      <p>MediaPipe handles hand landmark detection, and a KNN classifier maps gestures to playback controls. The piece I actually designed was the feature vector: raw landmark coordinates are useless for classification because they encode where your hand is and how big it appears, not what shape it's making. A custom normalised feature vector strips out position and scale so the classifier learns gesture geometry instead of memorising your webcam setup.</p>
    `,
  },
  {
    id: "plantagotchi",
    title: "Plantagotchi",
    subtitle: "A plant that tells you how it's doing",
    status: "v2.0",
    description:
      "An ESP32 wired to a soil moisture sensor and an OLED, giving a houseplant a small face and a way to complain about being thirsty.",
    stack: ["esp32", "c++ / arduino", "sh1106 oled", "capacitive soil moisture sensor"],
    body: `
      <p>An ESP32 wired to a capacitive soil moisture sensor and an SH1106 OLED, giving a houseplant a small face and a way to complain about being thirsty.</p>
      <p>My first real hardware project, which mostly meant learning that the software habits don't transfer cleanly — analog sensors drift, calibration is a per-sensor fact rather than a datasheet constant, and there's no debugger, just an LED and a lot of patience.</p>
    `,
  },
  {
    id: "mlsc-timetable",
    title: "mlsc timetable",
    status: "live",
    description:
      "production timetable software built for the ML Student Community at Thapar. real users, real constraints.",
    stack: ["react", "node.js", "firebase"],
    // TODO: rewrite in your own words
    problem:
      "the ML Student Community at Thapar was managing timetables in spreadsheets and group chats — constant clashes, no single source of truth.",
    // TODO: rewrite in your own words
    built:
      "a full platform on react, node, and firebase that handles scheduling, conflict detection, and updates in real time for the whole community.",
    // TODO: rewrite in your own words
    learned:
      'the gap between "it works on my machine" and "it works for 500 people with 500 different edge cases." production software for real users is a different game than a class project.',
  },
  {
    id: "edutrack",
    title: "edutrack",
    status: "live",
    description:
      "a cross-platform academic planner app — the kind of thing i wanted to exist so i built it.",
    stack: ["react native", "firebase", "expo"],
    // TODO: rewrite in your own words
    problem:
      "i wanted an academic planner that didn't feel like a corporate productivity app — something built around how students actually think about a semester.",
    // TODO: rewrite in your own words
    built:
      "a cross-platform mobile app with react native, expo, and firebase — assignments, deadlines, and grades in one place, syncing across devices.",
    // TODO: rewrite in your own words
    learned:
      "mobile development has a different rhythm than web — testing on real devices, thinking about offline states, and expo's build pipeline all took getting used to.",
  },
  {
    id: "cpu-benchmarking",
    title: "cpu benchmarking",
    status: "research",
    description:
      "ml-based CPU performance optimisation comparing XGBoost, Random Forest, and Logistic Regression.",
    stack: ["python", "xgboost", "scikit-learn"],
    // TODO: rewrite in your own words
    problem:
      "predicting cpu performance under different workloads usually means slow, expensive real-world benchmarking.",
    // TODO: rewrite in your own words
    built:
      "an ml pipeline comparing xgboost, random forest, and logistic regression models trained on performance data, aiming to predict outcomes without running the full benchmark suite.",
    // TODO: rewrite in your own words
    learned:
      "how much model choice depends on the shape of your data — xgboost's edge here wasn't automatic, and i had to actually justify it with the numbers, not just pick the trendy model.",
  },
];

function renderProjects() {
  const grid = document.getElementById("projectGrid");
  if (!grid) return;

  grid.innerHTML = projects
    .map(
      (project) => `
      <div class="card" data-id="${project.id}" tabindex="0" role="button" aria-haspopup="dialog">
        <div class="card-header">
          <h3>${project.title}</h3>
          <span>${project.status}</span>
        </div>
        ${project.subtitle ? `<p class="card-subtitle">${project.subtitle}</p>` : ""}
        <p>${project.description}</p>
        <div class="card-footer">
          ${project.stack.map((s) => `<span>${s}</span>`).join("")}
        </div>
        <span class="card-expand-hint">read the case study →</span>
      </div>
    `,
    )
    .join("");
}

function openProjectOverlay(project) {
  const s = statusStyles[project.status] || statusStyles.live;
  articleCat.textContent = project.status;
  articleCat.style.background = s.bg;
  articleCat.style.color = s.color;
  articleCat.style.border = `1px solid ${s.border}`;
  articleDate.textContent = project.stack.join(" · ");
  articleRead.textContent = "";
  articleOverlayTitle.textContent = project.title;

  // richer write-ups carry their own `body` HTML; older placeholder
  // entries still use the problem/built/learned case-block layout
  articleBody.innerHTML = project.body
    ? `
      ${project.subtitle ? `<p class="case-subtitle">${project.subtitle}</p>` : ""}
      ${project.body}
      ${project.credit ? `<p class="case-credit">${project.credit}</p>` : ""}
    `
    : `
      <div class="case-blocks">
        <div class="case-block">
          <h4>the problem</h4>
          <p>${project.problem}</p>
        </div>
        <div class="case-block">
          <h4>what i built</h4>
          <p>${project.built}</p>
        </div>
        <div class="case-block">
          <h4>what i learned</h4>
          <p>${project.learned}</p>
        </div>
      </div>
    `;

  articleOverlay.classList.add("open");
  articleOverlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("overlay-open");
  articleBack.focus();

  // GA4: fires once the gtag snippet is added to <head>; safe no-op until then.
  if (typeof gtag === "function") {
    gtag("event", "project_open", { project: project.id });
  }
}

renderProjects();

if (articleOverlay && articleBack) {
  const projectGrid = document.getElementById("projectGrid");
  projectGrid.addEventListener("click", (e) => {
    const card = e.target.closest(".card");
    if (!card) return;
    const project = projects.find((p) => p.id === card.dataset.id);
    if (project) openProjectOverlay(project);
  });

  projectGrid.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const card = e.target.closest(".card");
    if (!card) return;
    e.preventDefault();
    const project = projects.find((p) => p.id === card.dataset.id);
    if (project) openProjectOverlay(project);
  });
}

// ================================
// GA4 OUTBOUND LINK CLICKS
// Each fires a click event once the
// real gtag snippet is added to
// <head> — safe no-ops until then.
// ================================
[
  { id: "substackLink", event: "substack_click", location: "footer" },
  { id: "footerSubstackLink", event: "substack_click", location: "footer_icon" },
  { id: "githubLink", event: "github_click", location: "footer" },
  { id: "linkedinLink", event: "linkedin_click", location: "footer" },
].forEach(({ id, event, location }) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener("click", () => {
    if (typeof gtag === "function") {
      gtag("event", event, { link_location: location });
    }
  });
});
