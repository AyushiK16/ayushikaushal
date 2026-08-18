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
// POLAROID (single) — phone variant
// Same fade/scale-in idea as the photo
// strip above, just for the alternate
// single-polaroid element shown only at
// phone widths (see style.css).
// ================================
(function initPolaroidSingle() {
  const polaroid = document.querySelector(".polaroid-single");
  if (!polaroid) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (prefersReducedMotion) {
    polaroid.classList.add("polaroid-visible");
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          polaroid.classList.add("polaroid-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 },
  );

  observer.observe(polaroid);
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
// NAV HEIGHT
// Keeps --nav-height in sync with the
// nav's real (responsive) height, so the
// article overlay below can sit right
// under it instead of covering it.
// ================================
(function syncNavHeight() {
  const nav = document.querySelector(".nav");
  if (!nav) return;

  function setNavHeight() {
    document.documentElement.style.setProperty(
      "--nav-height",
      `${nav.offsetHeight}px`,
    );
  }

  setNavHeight();
  window.addEventListener("resize", setNavHeight);
})();

// ================================
// ARTICLE OVERLAY
// Full-screen reading view shared by
// every project card. Each project gets
// a real, shareable URL (#/projects/<id>)
// via the hash — opening/closing always
// goes through a hash change, so the
// browser's own back/forward buttons work
// without any extra routing library.
// ================================
const articleOverlay = document.getElementById("articleOverlay");
const articleBack = document.getElementById("articleBack");
const articleFooterNext = document.getElementById("articleFooterNext");
const articleCat = document.getElementById("articleCat");
const articleDate = document.getElementById("articleDate");
const articleRead = document.getElementById("articleRead");
const articleOverlayTitle = document.getElementById("articleOverlayTitle");
const articleSubtitle = document.getElementById("articleSubtitle");
const articleBody = document.getElementById("articleBody");

function closeArticle() {
  articleOverlay.classList.remove("open");
  articleOverlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("overlay-open");

  // clearing the hash makes the browser try to jump to the very top of
  // the page — landing back on the project grid instead reads as "go
  // back," not "start over"
  const projectsSection = document.getElementById("projects");
  if (projectsSection) {
    projectsSection.scrollIntoView({ behavior: "auto", block: "start" });
  }
}

if (articleOverlay && articleBack) {
  // back button / ESC just clear the hash — the hashchange listener
  // below (see PROJECTS) is what actually closes the overlay, so
  // every close path stays in sync with the URL
  articleBack.addEventListener("click", () => {
    location.hash = "";
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && articleOverlay.classList.contains("open")) {
      location.hash = "";
    }
  });
}

// ================================
// PROJECTS
// Each project lives in its own file
// under /projects — see projects/README.md
// for how to add one. This loads
// projects/manifest.json (the list of
// which files exist), fetches each file,
// then builds the card grid and wires up
// the shared #articleOverlay.
// ================================
const statusStyles = {
  shipped: { bg: "#d4e8cc", color: "#3a5a32", border: "#a8c49a" },
  "in development": { bg: "#f5dce3", color: "#8a3a4a", border: "#e8b4c0" },
  "under submission": { bg: "#ede9fe", color: "#4c1d95", border: "#c4b5fd" },
  research: { bg: "#ede9fe", color: "#4c1d95", border: "#c4b5fd" },
  "v2.0": { bg: "#efe6d5", color: "#5a4a3a", border: "#c8b89a" },
};

async function loadProjects() {
  const manifestRes = await fetch("projects/manifest.json");
  const ids = await manifestRes.json();

  return Promise.all(
    ids.map((id) =>
      fetch(`projects/${id}.json`).then((res) => {
        if (!res.ok) throw new Error(`couldn't load projects/${id}.json`);
        return res.json();
      }),
    ),
  );
}

function renderProjects(projects) {
  const grid = document.getElementById("projectGrid");
  if (!grid) return;

  grid.innerHTML = projects
    .map((project) => {
      const s = statusStyles[project.status] || statusStyles.shipped;
      return `
      <div class="card" data-id="${project.id}" tabindex="0" role="button" aria-haspopup="dialog">
        <div class="card-header">
          <h3>${project.title}</h3>
          <span style="background:${s.bg}; color:${s.color}; border-color:${s.border}">${project.status}</span>
        </div>
        ${project.subtitle ? `<p class="card-subtitle">${project.subtitle}</p>` : ""}
        <p>${project.overview}</p>
        <div class="card-footer">
          ${project.stack.map((tech) => `<span>${tech}</span>`).join("")}
        </div>
        <span class="card-expand-hint">read more</span>
      </div>
    `;
    })
    .join("");
}

// the hash is the single source of truth for whether the overlay is
// open and which project it's showing — this is what makes the
// browser's back/forward buttons (and direct/shared links) work
let loadedProjects = [];

function openProjectOverlay(project) {
  const s = statusStyles[project.status] || statusStyles.shipped;
  articleCat.textContent = project.status;
  articleCat.style.background = s.bg;
  articleCat.style.color = s.color;
  articleCat.style.border = `1px solid ${s.border}`;
  articleDate.textContent = project.stack.join(" · ");
  articleRead.textContent = "";
  articleOverlayTitle.textContent = project.title;
  articleSubtitle.textContent = project.subtitle || "";

  // richer write-ups carry a `body` array of paragraphs; older placeholder
  // entries still use the problem/built/learned case-block layout
  articleBody.innerHTML = project.body
    ? `
      ${project.body.map((p) => `<p>${p}</p>`).join("")}
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

  // "next project" footer link — loops back to the first project
  // after the last one, so it always has something to point to
  if (articleFooterNext && loadedProjects.length > 1) {
    const currentIndex = loadedProjects.findIndex((p) => p.id === project.id);
    const nextProject =
      loadedProjects[(currentIndex + 1) % loadedProjects.length];
    articleFooterNext.textContent = `next: ${nextProject.title} →`;
    articleFooterNext.onclick = () => {
      location.hash = `/projects/${nextProject.id}`;
    };
  }

  articleOverlay.classList.add("open");
  articleOverlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("overlay-open");
  articleBack.focus();

  // GA4: fires once the gtag snippet is added to <head>; safe no-op until then.
  if (typeof gtag === "function") {
    gtag("event", "project_open", { project: project.id });
  }
}

function applyHashRoute() {
  const match = location.hash.match(/^#\/projects\/(.+)$/);
  if (match) {
    const project = loadedProjects.find(
      (p) => p.id === decodeURIComponent(match[1]),
    );
    if (project) {
      openProjectOverlay(project);
      return;
    }
  }
  closeArticle();
}

async function initProjects() {
  const grid = document.getElementById("projectGrid");
  if (!grid) return;

  try {
    loadedProjects = await loadProjects();
  } catch (err) {
    grid.innerHTML = `<p class="card-load-error">couldn't load projects right now — try refreshing.</p>`;
    console.error(err);
    return;
  }

  renderProjects(loadedProjects);

  grid.addEventListener("click", (e) => {
    const card = e.target.closest(".card");
    if (!card) return;
    location.hash = `/projects/${card.dataset.id}`;
  });

  grid.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const card = e.target.closest(".card");
    if (!card) return;
    e.preventDefault();
    location.hash = `/projects/${card.dataset.id}`;
  });

  window.addEventListener("hashchange", applyHashRoute);
  applyHashRoute(); // handles landing directly on a shared project link
}

initProjects();

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
