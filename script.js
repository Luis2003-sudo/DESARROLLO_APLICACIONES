const heroCard = document.getElementById("heroCard");
const logoBox = document.getElementById("logoBox");
const weekCards = document.querySelectorAll(".week-card");
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.querySelector(".theme-toggle-icon");
const backToTop = document.getElementById("backToTop");
const progressBar = document.getElementById("progressBar");
const revealElements = document.querySelectorAll(".reveal");
const counters = document.querySelectorAll(".counter");

const weekSearch = document.getElementById("weekSearch");
const filterButtons = document.querySelectorAll(".filter-btn");
const noResultsMessage = document.getElementById("noResultsMessage");

let currentFilter = "all";

/* =========================
   TEMA CLARO / OSCURO
========================= */
function applyTheme(theme) {
  if (theme === "light") {
    document.body.classList.add("light-theme");
    if (themeIcon) themeIcon.textContent = "☀️";
  } else {
    document.body.classList.remove("light-theme");
    if (themeIcon) themeIcon.textContent = "🌙";
  }
}

const savedTheme = localStorage.getItem("site-theme") || "dark";
applyTheme(savedTheme);

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const isLight = document.body.classList.contains("light-theme");
    const newTheme = isLight ? "dark" : "light";
    localStorage.setItem("site-theme", newTheme);
    applyTheme(newTheme);
  });
}

/* =========================
   MENÚ ACTIVO AUTOMÁTICO
========================= */
const currentPage = window.location.pathname.split("/").pop() || "index.html";
const menuLinks = document.querySelectorAll(".menu a");

menuLinks.forEach((link) => {
  const href = link.getAttribute("href");

  if (href === currentPage) {
    menuLinks.forEach((item) => item.classList.remove("active"));
    link.classList.add("active");
  }
});

/* =========================
   BARRA DE PROGRESO + BOTÓN ARRIBA
========================= */
function updateScrollUI() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

  if (progressBar) {
    progressBar.style.width = `${progress}%`;
  }

  if (backToTop) {
    if (scrollTop > 280) {
      backToTop.classList.add("show");
    } else {
      backToTop.classList.remove("show");
    }
  }
}

window.addEventListener("scroll", updateScrollUI);
window.addEventListener("load", updateScrollUI);

if (backToTop) {
  backToTop.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
}

/* =========================
   REVEAL ON SCROLL
========================= */
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15
    }
  );

  revealElements.forEach((el) => revealObserver.observe(el));
} else {
  revealElements.forEach((el) => el.classList.add("show"));
}

/* =========================
   CONTADORES ANIMADOS
========================= */
function animateCounter(counter) {
  const target = Number(counter.dataset.target) || 0;
  const duration = 1200;
  const start = 0;
  const startTime = performance.now();

  function updateCounter(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const value = Math.floor(progress * (target - start) + start);

    counter.textContent = value;

    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    } else {
      counter.textContent = target;
    }
  }

  requestAnimationFrame(updateCounter);
}

if ("IntersectionObserver" in window && counters.length > 0) {
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );

  counters.forEach((counter) => counterObserver.observe(counter));
}

/* =========================
   EFECTO 3D HERO
========================= */
if (heroCard) {
  heroCard.addEventListener("mousemove", (e) => {
    const rect = heroCard.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -3.5;
    const rotateY = ((x - centerX) / centerX) * 3.5;

    heroCard.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  heroCard.addEventListener("mouseleave", () => {
    heroCard.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg)";
  });
}

/* =========================
   EFECTO 3D LOGO
========================= */
if (logoBox) {
  logoBox.addEventListener("mousemove", (e) => {
    const rect = logoBox.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    logoBox.style.transform =
      `rotate(-8deg) translateY(-6px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  logoBox.addEventListener("mouseleave", () => {
    logoBox.style.transform = "rotate(-8deg) translateY(0px)";
  });
}

/* =========================
   EFECTO 3D TARJETAS DE SEMANAS
========================= */
weekCards.forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -3;
    const rotateY = ((x - centerX) / centerX) * 3;

    card.style.transform =
      `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform =
      "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)";
  });
});

/* =========================
   FILTRO Y BÚSQUEDA DE SEMANAS
========================= */
function filterWeeks() {
  if (!weekCards.length) return;

  const searchTerm = weekSearch ? weekSearch.value.toLowerCase().trim() : "";
  let visibleCount = 0;

  weekCards.forEach((card) => {
    const unit = card.dataset.unit || "";
    const title = card.dataset.title || "";
    const matchesFilter = currentFilter === "all" || unit === currentFilter;
    const matchesSearch = title.includes(searchTerm);

    if (matchesFilter && matchesSearch) {
      card.classList.remove("hidden");
      visibleCount++;
    } else {
      card.classList.add("hidden");
    }
  });

  if (noResultsMessage) {
    if (visibleCount === 0) {
      noResultsMessage.classList.remove("hidden");
    } else {
      noResultsMessage.classList.add("hidden");
    }
  }
}

if (weekSearch) {
  weekSearch.addEventListener("input", filterWeeks);
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    currentFilter = button.dataset.filter;
    filterWeeks();
  });
});

filterWeeks();

/* =============================
   VISOR PDF GLOBAL
============================= */
document.addEventListener("DOMContentLoaded", () => {
  const pdfViewer = document.getElementById("pdfViewer");
  const pdfFrame = pdfViewer?.querySelector(".pdf-frame");
  const buttons = document.querySelectorAll(".btn-view-pdf");

  if (!pdfViewer || !pdfFrame || buttons.length === 0) return;

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const pdfUrl = btn.dataset.pdf;
      if (!pdfUrl) return;

      const isOpen = pdfViewer.classList.contains("show");

      if (isOpen && pdfFrame.src === pdfUrl) {
        pdfViewer.classList.remove("show");
        pdfFrame.src = "";
        btn.textContent = "📄 Ver actividad (PDF)";
        return;
      }

      buttons.forEach(b => b.textContent = "📄 Ver actividad (PDF)");

      pdfFrame.src = pdfUrl;
      pdfViewer.classList.add("show");
      btn.textContent = "❌ Cerrar actividad";

      pdfViewer.scrollIntoView({ behavior: "smooth" });
    });
  });
});