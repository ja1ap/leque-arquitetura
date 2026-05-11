(function () {
  const navToggle = document.querySelector(".nav-toggle");
  const navEl = document.getElementById("site-nav");
  const navBackdrop = document.querySelector(".nav-backdrop");
  if (!navToggle || !navEl) return;

  function openMenu() {
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Fechar menu");
    navEl.classList.add("is-open");
    if (navBackdrop) {
      navBackdrop.hidden = false;
      requestAnimationFrame(() => navBackdrop.classList.add("is-open"));
    }
    document.body.classList.add("has-menu");
  }

  function closeMenu() {
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Abrir menu");
    navEl.classList.remove("is-open");
    if (navBackdrop) {
      navBackdrop.classList.remove("is-open");
      window.setTimeout(() => { navBackdrop.hidden = true; }, 280);
    }
    document.body.classList.remove("has-menu");
  }

  navToggle.addEventListener("click", () => {
    if (navEl.classList.contains("is-open")) closeMenu(); else openMenu();
  });

  if (navBackdrop) navBackdrop.addEventListener("click", closeMenu);

  navEl.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      if (navEl.classList.contains("is-open")) closeMenu();
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navEl.classList.contains("is-open")) closeMenu();
  });
})();

(function () {
  const PROJECT_IMAGE_COUNTS = {
    "apartamento-jml": 36,
    "apartamento-castro-alves": 34,
    "apartamento-sarutaia": 12,
    "apartamento-ac": 31,
    "project-title-5": 22,
    "project-title-6": 6,
    "project-title-3": 15,
    "project-title-2": 20,
    "project-title-1": 19,
    "casa-rl": 16,
    "project-title-4": 16,
    "apartamento-dm": 18,
    "reforma-de-interiores-comercial": 6,
    "apartamento-sc": 32,
  };

  function buildGallery(slug) {
    const count = PROJECT_IMAGE_COUNTS[slug] || 0;
    const list = [];
    for (let i = 1; i <= count; i++) {
      const n = String(i).padStart(2, "0");
      list.push(`assets/projects/${slug}/${n}.jpg`);
    }
    return list;
  }

  function findProject(slug) {
    const projects = window.LEQUE_PROJECTS || [];
    return projects.find((p) => p.slug === slug);
  }

  function formatTitle(title) {
    if (!title) return "";
    return title
      .toLowerCase()
      .split(" ")
      .map((w, i, arr) => {
        if (i === arr.length - 1 && w.length <= 3) return w.toUpperCase();
        return w.charAt(0).toUpperCase() + w.slice(1);
      })
      .join(" ");
  }

  const modal = document.getElementById("project-modal");
  if (!modal) return;
  const imgEl = modal.querySelector(".modal-image");
  const prevBtn = modal.querySelector(".modal-prev");
  const nextBtn = modal.querySelector(".modal-next");
  const counterCur = modal.querySelector(".modal-counter-current");
  const counterTotal = modal.querySelector(".modal-counter-total");
  const thumbsEl = modal.querySelector(".modal-thumbs");
  const eyebrowEl = modal.querySelector("[data-modal-type]");
  const titleEl = modal.querySelector("[data-modal-title]");
  const metaEl = modal.querySelector("[data-modal-meta]");

  let currentGallery = [];
  let currentIdx = 0;
  let lastFocused = null;
  let lockedScrollY = 0;

  function showImage(idx) {
    if (!currentGallery.length) return;
    currentIdx = (idx + currentGallery.length) % currentGallery.length;
    imgEl.src = currentGallery[currentIdx];
    counterCur.textContent = String(currentIdx + 1);
    const thumbs = Array.from(thumbsEl.children);
    thumbs.forEach((t, i) => t.classList.toggle("is-active", i === currentIdx));
    const active = thumbs[currentIdx];
    if (active && active.scrollIntoView) {
      active.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    }
  }

  function openModal(slug) {
    const project = findProject(slug);
    if (!project) return;
    currentGallery = buildGallery(slug);
    if (!currentGallery.length) return;

    titleEl.textContent = formatTitle(project.title);
    const typeDetail = (project.details || []).find((d) => /tipo/i.test(d.label));
    eyebrowEl.textContent = typeDetail ? typeDetail.text : "";

    metaEl.innerHTML = "";
    (project.details || [])
      .filter((d) => !/tipo/i.test(d.label))
      .forEach((d) => {
        const wrap = document.createElement("div");
        wrap.className = "meta-item";
        const dt = document.createElement("dt");
        dt.textContent = d.label;
        const dd = document.createElement("dd");
        dd.textContent = d.text;
        wrap.appendChild(dt);
        wrap.appendChild(dd);
        metaEl.appendChild(wrap);
      });

    thumbsEl.innerHTML = "";
    currentGallery.forEach((src, i) => {
      const t = document.createElement("button");
      t.type = "button";
      t.className = "modal-thumb";
      t.setAttribute("aria-label", `Imagem ${i + 1}`);
      const im = document.createElement("img");
      im.src = src;
      im.alt = "";
      im.loading = "lazy";
      t.appendChild(im);
      t.addEventListener("click", () => showImage(i));
      thumbsEl.appendChild(t);
    });

    counterTotal.textContent = String(currentGallery.length);
    modal.classList.toggle("is-single", currentGallery.length <= 1);
    showImage(0);

    lastFocused = document.activeElement;
    lockedScrollY = window.scrollY || window.pageYOffset || 0;
    document.body.style.top = `-${lockedScrollY}px`;
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("has-modal");
    document.documentElement.classList.add("has-modal");
    requestAnimationFrame(() => modal.classList.add("is-open"));
    modal.querySelector(".modal-close").focus({ preventScroll: true });
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("has-modal");
    document.documentElement.classList.remove("has-modal");
    document.body.style.top = "";

    const html = document.documentElement;
    const prevBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    window.scrollTo(0, lockedScrollY);
    html.style.scrollBehavior = prevBehavior;

    window.setTimeout(() => {
      modal.hidden = true;
      imgEl.src = "";
      thumbsEl.innerHTML = "";
    }, 260);
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus({ preventScroll: true });
    }
  }

  document.querySelectorAll(".project-card[data-slug]").forEach((card) => {
    card.addEventListener("click", () => openModal(card.dataset.slug));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openModal(card.dataset.slug);
      }
    });
  });

  modal.addEventListener("click", (e) => {
    if (e.target.closest("[data-modal-close]")) closeModal();
  });
  prevBtn.addEventListener("click", () => showImage(currentIdx - 1));
  nextBtn.addEventListener("click", () => showImage(currentIdx + 1));
  document.addEventListener("keydown", (e) => {
    if (modal.hidden) return;
    if (e.key === "Escape") closeModal();
    if (e.key === "ArrowLeft") showImage(currentIdx - 1);
    if (e.key === "ArrowRight") showImage(currentIdx + 1);
  });
})();
