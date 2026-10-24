(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;

  /* ===== 1. THÈME CLAIR / SOMBRE ===== */
  const themeBtn = document.getElementById("themeToggle");

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (themeBtn) themeBtn.textContent = theme === "dark" ? "☀️" : "🌙";
  }

  let savedTheme = null;
  try { savedTheme = localStorage.getItem("theme"); } catch (e) { /* stockage indisponible */ }
  applyTheme(savedTheme === "dark" ? "dark" : "light");

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem("theme", next); } catch (e) { /* ignoré */ }
    });
  }

  /* ===== 2. MENU MOBILE ===== */
  const menuBtn = document.getElementById("menuToggle");
  const nav = document.getElementById("nav");

  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      const open = nav.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open);
      menuBtn.textContent = open ? "✕" : "☰";
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("open");
        menuBtn.textContent = "☰";
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ===== 3. DÉFILEMENT : EN-TÊTE, BARRE DE PROGRESSION, RETOUR EN HAUT ===== */
  const header = document.querySelector(".header");
  const progress = document.getElementById("progress");
  const toTop = document.getElementById("toTop");

  function onScroll() {
    const y = window.scrollY;

    if (header) header.classList.toggle("scrolled", y > 20);

    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
    }

    if (toTop) toTop.classList.toggle("show", y > 600);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ===== 4. GRANDE ANIMATION : NOM EN 3D ===== */
  const nameEl = document.querySelector(".hero-text h1");

  if (nameEl && !reduceMotion) {
    const fullName = nameEl.textContent.trim();
    nameEl.setAttribute("aria-label", fullName);
    nameEl.textContent = "";

    let index = 0;
    fullName.split(" ").forEach(function (word, w, words) {
      const wordSpan = document.createElement("span");
      wordSpan.className = "word";
      wordSpan.setAttribute("aria-hidden", "true");

      Array.from(word).forEach(function (char) {
        const letter = document.createElement("span");
        letter.className = "letter";
        letter.textContent = char;
        letter.style.setProperty("--i", index++);
        wordSpan.appendChild(letter);
      });

      nameEl.appendChild(wordSpan);
      if (w < words.length - 1) nameEl.appendChild(document.createTextNode(" "));
      index++;
    });
  }

  /* ===== 5. ACCROCHE EN MACHINE À ÉCRIRE ===== */
  const subtitle = document.querySelector(".hero-text h2");

  if (subtitle && !reduceMotion) {
    subtitle.setAttribute("aria-label", "Futur ingénieur · IA · Cybersécurité · Développement web");
    subtitle.innerHTML =
      'Futur ingénieur · <span class="typed"></span><span class="cursor" aria-hidden="true">|</span>';

    const typedEl = subtitle.querySelector(".typed");
    const words = ["IA", "Cybersécurité", "Développement web"];
    let wordIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function type() {
      const current = words[wordIndex];
      charIndex += deleting ? -1 : 1;
      typedEl.textContent = current.substring(0, charIndex);

      let delay = deleting ? 50 : 100;

      if (!deleting && charIndex === current.length) {
        deleting = true;
        delay = 1600;
      } else if (deleting && charIndex === 0) {
        deleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        delay = 400;
      }
      setTimeout(type, delay);
    }
    type();
  }

  /* ===== 6. FOND DE PARTICULES (ACCUEIL) ===== */
  function initParticles() {
    const canvas = document.getElementById("particles");
    if (!canvas || reduceMotion) return;

    const ctx = canvas.getContext("2d");
    const hero = canvas.parentElement;
    const mouse = { x: null, y: null };
    const LINK_DISTANCE = 120;
    const MOUSE_DISTANCE = 150;

    let w = 0, h = 0, points = [];
    let colorA = "#1d4ed8", colorB = "#15803d";
    let rafId = 0, visible = true;

    function readColors() {
      const styles = getComputedStyle(root);
      colorA = styles.getPropertyValue("--blue").trim() || colorA;
      colorB = styles.getPropertyValue("--green").trim() || colorB;
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = hero.clientWidth;
      h = hero.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(110, Math.floor((w * h) / 14000));
      points = Array.from({ length: count }, function () {
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          r: 1.5 + Math.random() * 1.5,
          useA: Math.random() < 0.5
        };
      });
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);

      points.forEach(function (p) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        if (mouse.x !== null) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < MOUSE_DISTANCE && dist > 0) {
            const force = (MOUSE_DISTANCE - dist) / MOUSE_DISTANCE;
            p.x += (dx / dist) * force * 2.2;
            p.y += (dy / dist) * force * 2.2;
          }
        }

        ctx.globalAlpha = 0.9;
        ctx.fillStyle = p.useA ? colorA : colorB;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.lineWidth = 1;

      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const d = Math.hypot(points[i].x - points[j].x, points[i].y - points[j].y);
          if (d < LINK_DISTANCE) {
            ctx.globalAlpha = (1 - d / LINK_DISTANCE) * 0.45;
            ctx.strokeStyle = colorA;
            ctx.beginPath();
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[j].x, points[j].y);
            ctx.stroke();
          }
        }

        if (mouse.x !== null) {
          const dm = Math.hypot(points[i].x - mouse.x, points[i].y - mouse.y);
          if (dm < MOUSE_DISTANCE) {
            ctx.globalAlpha = (1 - dm / MOUSE_DISTANCE) * 0.7;
            ctx.strokeStyle = colorB;
            ctx.beginPath();
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
    }

    function loop() {
      if (!visible || document.hidden) { rafId = 0; return; }
      draw();
      rafId = requestAnimationFrame(loop);
    }

    function start() {
      if (!rafId) rafId = requestAnimationFrame(loop);
    }

    function setMouse(clientX, clientY) {
      const rect = hero.getBoundingClientRect();
      mouse.x = clientX - rect.left;
      mouse.y = clientY - rect.top;
    }

    hero.addEventListener("mousemove", function (e) { setMouse(e.clientX, e.clientY); });
    hero.addEventListener("mouseleave", function () { mouse.x = null; mouse.y = null; });
    hero.addEventListener("touchmove", function (e) {
      if (e.touches[0]) setMouse(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    hero.addEventListener("touchend", function () { mouse.x = null; mouse.y = null; });

    let resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 200);
    });

    new MutationObserver(readColors).observe(root, { attributes: true, attributeFilter: ["data-theme"] });

    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) start();
    }).observe(hero);

    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) start();
    });

    readColors();
    resize();
    start();
  }

  initParticles();

  /* ===== 7. TITRES DE SECTION ANIMÉS, PUIS CONTENU ===== */
  const titleConfig = {
    apropos:     { anim: "flip",   color: "blue" },
    competences: { anim: "decode", color: "green" },
    projets:     { anim: "drop",   color: "blue" },
    parcours:    { anim: "zoom",   color: "green" },
    contact:     { anim: "slide",  color: "blue" }
  };

  const revealSelectors = [
    ".about-content p", ".community-card", ".skill-card",
    ".project-card", ".timeline-item", ".contact-intro", ".contact-card", ".contact-form"
  ];

  const DECODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&@<>/";
  const LETTER_STEP = 90; /* délai entre deux lettres (ms) */

  document.querySelectorAll(revealSelectors.join(",")).forEach(function (el) {
    el.classList.add("reveal");
  });

  function revealSection(section) {
    section.querySelectorAll(".reveal").forEach(function (el, i) {
      el.style.setProperty("--d", (i % 5) * 0.1 + "s");
      el.classList.add("visible");
    });
  }

  function prepareTitle(title, cfg) {
    const text = title.textContent.trim();
    const letters = [];
    let i = 0;

    title.setAttribute("aria-label", text);
    title.textContent = "";
    title.classList.add("st", "anim-" + cfg.anim, "tc-" + cfg.color);

    text.split(" ").forEach(function (word, w, all) {
      const wordSpan = document.createElement("span");
      wordSpan.className = "st-word";
      wordSpan.setAttribute("aria-hidden", "true");

      Array.from(word).forEach(function (char) {
        const letter = document.createElement("span");
        letter.className = "st-letter";
        letter.textContent = char;
        letter.dataset.char = char;
        letter.style.setProperty("--i", i++);
        wordSpan.appendChild(letter);
        letters.push(letter);
      });

      title.appendChild(wordSpan);
      if (w < all.length - 1) {
        title.appendChild(document.createTextNode(" "));
        i++;
      }
    });

    return letters;
  }

  function runDecode(letters) {
    letters.forEach(function (letter, i) {
      const finalChar = letter.dataset.char;
      const endTime = 400 + i * LETTER_STEP;
      const start = performance.now();

      const timer = setInterval(function () {
        if (performance.now() - start >= endTime) {
          letter.textContent = finalChar;
          letter.classList.add("solved");
          clearInterval(timer);
        } else {
          letter.textContent = DECODE_CHARS.charAt(Math.floor(Math.random() * DECODE_CHARS.length));
        }
      }, 45);
    });
  }

  function playTitle(section, title, letters, cfg) {
    title.classList.add("play");

    let total;
    if (cfg.anim === "decode") {
      runDecode(letters);
      total = 400 + letters.length * LETTER_STEP + 400;
    } else {
      total = letters.length * LETTER_STEP + 900;
    }

    setTimeout(function () {
      title.classList.add("done");
      revealSection(section);
    }, total);
  }

  if (reduceMotion) {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("visible"); });
    document.querySelectorAll(".section-title").forEach(function (t) { t.classList.add("done"); });
  } else {
    const titleObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const data = entry.target._titleData;
        titleObserver.unobserve(entry.target);
        playTitle(data.section, entry.target, data.letters, data.cfg);
      });
    }, { threshold: 0.6, rootMargin: "0px 0px -10% 0px" });

    document.querySelectorAll("main section[id]").forEach(function (section) {
      const title = section.querySelector(".section-title");
      const cfg = titleConfig[section.id];
      if (!title || !cfg) {
        revealSection(section);
        return;
      }
      const letters = prepareTitle(title, cfg);
      title._titleData = { section: section, letters: letters, cfg: cfg };
      titleObserver.observe(title);
    });
  }

  /* ===== 8. LIEN ACTIF DANS LE MENU ===== */
  const navLinks = document.querySelectorAll(".nav a");

  const sectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        navLinks.forEach(function (link) {
          link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id);
        });
      }
    });
  }, { rootMargin: "-50% 0px -50% 0px" });

  document.querySelectorAll("main section[id]").forEach(function (section) {
    sectionObserver.observe(section);
  });

   /* ===== 9. FORMULAIRE DE CONTACT (FORMSPREE) ===== */
  const form = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");
  const formButton = document.getElementById("formButton");

  function showStatus(message, type) {
    formStatus.textContent = message;
    formStatus.className = "form-status " + type;
  }

  if (form && formStatus && formButton) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (form.action.indexOf("VOTRE_ID") !== -1) {
        showStatus("Le formulaire n’est pas encore configuré.", "error");
        return;
      }

      formButton.disabled = true;
      formButton.textContent = "Envoi en cours…";
      showStatus("Envoi en cours…", "");

      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      })
        .then(function (response) {
          return response.json().catch(function () { return {}; }).then(function (data) {
            if (response.ok) {
              form.reset();
              showStatus("Merci ! Ton message a bien été envoyé, je te réponds bientôt.", "success");
            } else {
              const detail = data.errors
                ? data.errors.map(function (e) { return e.message; }).join(", ")
                : "code " + response.status;
              console.error("Formspree :", response.status, data);
              showStatus("Envoi refusé (" + detail + ").", "error");
            }
          });
        })
        .catch(function (error) {
          console.error("Erreur réseau :", error);
          showStatus("Connexion impossible avec Formspree (" + error.message + ").", "error");
        })
        .finally(function () {
          formButton.disabled = false;
          formButton.textContent = "Envoyer le message";
        });
    });
  }
})();