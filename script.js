/* ============================================================
   ROHAN RAO — PORTFOLIO SCRIPT
   ============================================================ */

document.getElementById("year").textContent = new Date().getFullYear();

/* ---------------------------------------------------------
   1. IMAGE SEQUENCE (the "waking up" figure) + LOADER
--------------------------------------------------------- */
const FRAME_COUNT = 300;
const canvas = document.getElementById("heroCanvas");
const ctx = canvas.getContext("2d");
const loader = document.getElementById("loader");
const loaderFill = document.getElementById("loaderFill");
const loaderPct = document.getElementById("loaderPct");

function frameSrc(i) {
  const n = String(i + 1).padStart(4, "0");
  return `./img/male${n}.png`;
}

const images = [];
let loadedCount = 0;
let readyToReveal = false;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  render();
}

function scaleImage(img) {
  if (!img || !img.complete || !img.naturalWidth) return;
  const hRatio = canvas.width / img.width;
  const vRatio = canvas.height / img.height;
  const ratio = Math.max(hRatio, vRatio);
  const shiftX = (canvas.width - img.width * ratio) / 2;
  const shiftY = (canvas.height - img.height * ratio) / 6; // nudge toward bottom
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, img.width, img.height, shiftX, shiftY, img.width * ratio, img.height * ratio);
}

const frameState = { frame: 0 };

function nearestLoaded(target) {
  if (images[target] && images[target].complete && images[target].naturalWidth) return images[target];
  for (let d = 1; d < FRAME_COUNT; d++) {
    const a = target - d, b = target + d;
    if (images[a] && images[a].complete && images[a].naturalWidth) return images[a];
    if (images[b] && images[b].complete && images[b].naturalWidth) return images[b];
  }
  return null;
}

function render() {
  const img = nearestLoaded(Math.round(frameState.frame));
  if (img) scaleImage(img);
}

function markDone() {
  if (loader && !loader.classList.contains("loader-done")) {
    loader.classList.add("loader-done");
    document.body.style.overflow = "";
    initReveals();
  }
}

function loadFrame(i) {
  const img = new Image();
  img.onload = img.onerror = () => {
    loadedCount++;
    const pct = Math.round((loadedCount / FRAME_COUNT) * 100);
    if (loaderFill) loaderFill.style.width = pct + "%";
    if (loaderPct) loaderPct.textContent = pct + "%";
    if (i === 0) render();
    // Reveal the page as soon as the first ~12 frames are ready — rest keep
    // loading quietly in the background so scrubbing stays smooth.
    if (!readyToReveal && loadedCount >= Math.min(12, FRAME_COUNT)) {
      readyToReveal = true;
      markDone();
    }
    if (loadedCount === FRAME_COUNT) markDone();
  };
  img.src = frameSrc(i);
  images[i] = img;
}

document.body.style.overflow = "hidden";
for (let i = 0; i < FRAME_COUNT; i++) loadFrame(i);

// Safety net: never block the site for more than 6s even on a slow line.
setTimeout(markDone, 6000);

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

/* ---------------------------------------------------------
   2. GSAP SCROLLTRIGGER — pin hero + scrub frames
--------------------------------------------------------- */
if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);

  gsap.to(frameState, {
    frame: FRAME_COUNT - 1,
    ease: "none",
    scrollTrigger: {
      trigger: "#hero",
      start: "top top",
      end: "+=250%",
      scrub: 0.2,
      pin: true,
      anticipatePin: 1,
    },
    onUpdate: render,
  });
}

/* ---------------------------------------------------------
   3. TYPED ROLE ROTATION
--------------------------------------------------------- */
const roles = [
  "Security & Infrastructure Engineer",
  "Fullstack Developer",
  "Travel Photographer",
  "Automation Enthusiast",
  "Cinematography Hobbyist",
];
const typedEl = document.getElementById("typedRole");
let roleIdx = 0, charIdx = 0, deleting = false;

function typeLoop() {
  if (!typedEl) return;
  const word = roles[roleIdx];
  if (!deleting) {
    charIdx++;
    typedEl.textContent = word.slice(0, charIdx);
    if (charIdx === word.length) {
      deleting = true;
      setTimeout(typeLoop, 1600);
      return;
    }
  } else {
    charIdx--;
    typedEl.textContent = word.slice(0, charIdx);
    if (charIdx === 0) {
      deleting = false;
      roleIdx = (roleIdx + 1) % roles.length;
    }
  }
  setTimeout(typeLoop, deleting ? 35 : 65);
}
typeLoop();

/* ---------------------------------------------------------
   4. SCROLL REVEALS (IntersectionObserver)
--------------------------------------------------------- */
function initReveals() {
  const els = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );
  els.forEach((el) => io.observe(el));

  initCounters();
}

/* ---------------------------------------------------------
   5. STAT COUNT-UP
--------------------------------------------------------- */
function initCounters() {
  const nums = document.querySelectorAll(".stat-num");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.target || "0");
        const prefix = el.dataset.prefix || "";
        const decimal = el.dataset.decimal || "";
        const duration = 1200;
        const start = performance.now();
        function step(now) {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          const val = Math.floor(target * eased);
          el.textContent = `${prefix}${val}${p === 1 ? decimal : ""}`;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        io.unobserve(el);
      });
    },
    { threshold: 0.4 }
  );
  nums.forEach((el) => io.observe(el));
}

/* ---------------------------------------------------------
   6. NAV TOGGLE (mobile)
--------------------------------------------------------- */
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");
if (navToggle) {
  navToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
    navToggle.classList.toggle("active");
  });
  navLinks.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => navLinks.classList.remove("open"))
  );
}

/* ---------------------------------------------------------
   7. CURSOR GLOW (desktop, decorative)
--------------------------------------------------------- */
const glow = document.getElementById("cursorGlow");
if (glow && window.matchMedia("(hover: hover)").matches) {
  window.addEventListener("mousemove", (e) => {
    glow.style.opacity = "1";
    glow.style.left = e.clientX + "px";
    glow.style.top = e.clientY + "px";
  });
  window.addEventListener("mouseleave", () => (glow.style.opacity = "0"));
}
