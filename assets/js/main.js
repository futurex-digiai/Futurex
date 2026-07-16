(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------
     Sticky navbar background on scroll
  --------------------------------------------------------- */
  const nav = document.getElementById("nav");
  const onScroll = () => {
    nav.classList.toggle("is-scrolled", window.scrollY > 12);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------------
     Mobile nav toggle
  --------------------------------------------------------- */
  const navToggle = document.getElementById("navToggle");
  const navMobile = document.getElementById("navMobile");
  navToggle.addEventListener("click", () => {
    const isOpen = navMobile.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
  navMobile.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      navMobile.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  /* ---------------------------------------------------------
     Scroll reveal (IntersectionObserver)
  --------------------------------------------------------- */
  const revealEls = document.querySelectorAll(".reveal");
  if (prefersReducedMotion) {
    revealEls.forEach(el => el.classList.add("is-visible"));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(el => io.observe(el));
  }

  /* ---------------------------------------------------------
     Counter animation for hero stats
  --------------------------------------------------------- */
  const counters = document.querySelectorAll(".stat__num");
  const animateCounter = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    const suffix = el.dataset.suffix || "";
    if (prefersReducedMotion) { el.textContent = target + suffix; return; }
    const duration = 1200;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const counterIo = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterIo.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });
  counters.forEach(c => counterIo.observe(c));

  /* ---------------------------------------------------------
     Magnetic buttons
  --------------------------------------------------------- */
  if (!prefersReducedMotion && window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".btn--magnetic").forEach(btn => {
      let raf = null;
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          btn.style.transform = `translate(${x * 0.18}px, ${y * 0.35}px)`;
        });
      });
      btn.addEventListener("mouseleave", () => {
        if (raf) cancelAnimationFrame(raf);
        btn.style.transform = "translate(0,0)";
      });
    });
  }

  /* ---------------------------------------------------------
     Hero constellation canvas — four glowing nodes
     (Marketing / AI / Code / Design) drifting and connecting,
     echoing the "four disciplines, one studio" idea.
  --------------------------------------------------------- */
  const canvas = document.getElementById("constellation");
  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext("2d");
    let w, h, dpr;
    let particles = [];
    const COLORS = ["#F2B84B", "#9B8CFF", "#6FA0FF", "#FF93A8"];

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const initParticles = () => {
      const count = w < 640 ? 18 : 32;
      particles = Array.from({ length: count }, (_, i) => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: 1 + Math.random() * 1.6,
        color: COLORS[i % COLORS.length]
      }));
    };

    const step = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      });
      // connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 150;
          if (dist < maxDist) {
            ctx.strokeStyle = `rgba(155,140,255,${(1 - dist / maxDist) * 0.18})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      // nodes
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.7;
        ctx.fill();
        ctx.globalAlpha = 1;
      });
      requestAnimationFrame(step);
    };

    resize();
    initParticles();
    requestAnimationFrame(step);
    window.addEventListener("resize", () => { resize(); initParticles(); }, { passive: true });
  }

  /* ---------------------------------------------------------
     Contact form — client-side validation + states
     (No backend wired here; replace endpoint in production)
  --------------------------------------------------------- */
  const form = document.getElementById("contactForm");
  if (form) {
    const status = document.getElementById("formStatus");
    const submitBtn = document.getElementById("submitBtn");

    const validators = {
      name: (v) => v.trim().length > 1,
      email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
      interest: (v) => v.trim().length > 0,
      message: (v) => v.trim().length > 4
    };

    const validateField = (field) => {
      const wrapper = field.closest(".field");
      const isValid = validators[field.name] ? validators[field.name](field.value) : true;
      wrapper.classList.toggle("is-invalid", !isValid);
      return isValid;
    };

    form.querySelectorAll("input, select, textarea").forEach(field => {
      field.addEventListener("blur", () => validateField(field));
      field.addEventListener("input", () => {
        if (field.closest(".field").classList.contains("is-invalid")) validateField(field);
      });
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fields = [...form.querySelectorAll("input, select, textarea")];
      const allValid = fields.map(validateField).every(Boolean);

      if (!allValid) {
        status.textContent = "Please fix the highlighted fields.";
        status.classList.remove("is-success");
        return;
      }

      submitBtn.classList.add("is-loading");
      submitBtn.disabled = true;
      status.textContent = "";

      try {
        const payload = {
          name: form.querySelector("[name=name]").value.trim(),
          email: form.querySelector("[name=email]").value.trim(),
          interested_in: form.querySelector("[name=interest]").value.trim(),
          message: form.querySelector("[name=message]").value.trim()
        };

        const res = await fetch("/backend/contact-handler.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        const result = await res.json();
        if (!res.ok || !result.success) throw new Error(result.message || "Submit failed");

        status.textContent = result.message || "Message sent — we'll get back to you within a business day.";
        status.classList.add("is-success");
        form.reset();
        fields.forEach(f => f.closest(".field").classList.remove("is-invalid"));
      } catch (err) {
        status.textContent = "Something went wrong. Please try again or email us directly.";
        status.classList.remove("is-success");
      } finally {
        submitBtn.classList.remove("is-loading");
        submitBtn.disabled = false;
      }
    });
  }

  /* ---------------------------------------------------------
     Hero image slider
  --------------------------------------------------------- */
  const heroSlider = document.getElementById("heroSlider");
  if (heroSlider) {
    const slides = Array.from(heroSlider.querySelectorAll(".hero-slider__slide"));
    const dotsWrap = document.getElementById("heroDots");
    const prevBtn = document.getElementById("heroPrev");
    const nextBtn = document.getElementById("heroNext");
    let current = 0;
    let timer = null;

    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.className = "hero-slider__dot" + (i === 0 ? " is-active" : "");
      dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
      dot.addEventListener("click", () => { goTo(i); restart(); });
      dotsWrap.appendChild(dot);
    });
    const dots = Array.from(dotsWrap.children);

    function goTo(index) {
      slides[current].classList.remove("is-active");
      dots[current].classList.remove("is-active");
      current = (index + slides.length) % slides.length;
      slides[current].classList.add("is-active");
      dots[current].classList.add("is-active");
    }

    function start() {
      if (prefersReducedMotion) return;
      timer = setInterval(() => goTo(current + 1), 5000);
    }
    function stop() { if (timer) clearInterval(timer); }
    function restart() { stop(); start(); }

    prevBtn.addEventListener("click", () => { goTo(current - 1); restart(); });
    nextBtn.addEventListener("click", () => { goTo(current + 1); restart(); });

    start();
    heroSlider.addEventListener("mouseenter", stop);
    heroSlider.addEventListener("mouseleave", start);
  }
})();
