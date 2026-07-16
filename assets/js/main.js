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
     Hero neural-network canvas — glowing purple/blue nodes,
     pulsing connections, occasional "spark" bursts for a
     lively, dopamine-friendly ambient background.
  --------------------------------------------------------- */
  const canvas = document.getElementById("constellation");
  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext("2d");
    let w, h, dpr, t = 0;
    let particles = [];
    let sparks = [];
    const COLORS = ["#6D3BF5", "#2563EB", "#8B5CF6", "#3B82F6"];

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const initParticles = () => {
      const count = w < 640 ? 22 : 42;
      particles = Array.from({ length: count }, (_, i) => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.32,
        vy: (Math.random() - 0.5) * 0.32,
        r: 1.6 + Math.random() * 2.2,
        pulse: Math.random() * Math.PI * 2,
        color: COLORS[i % COLORS.length]
      }));
    };

    // Occasional bright "spark" that travels along a connection —
    // the small unexpected flash is the deliberate dopamine touch.
    const maybeSpawnSpark = () => {
      if (sparks.length > 2 || Math.random() > 0.012) return;
      const a = particles[Math.floor(Math.random() * particles.length)];
      const b = particles[Math.floor(Math.random() * particles.length)];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (dist > 0 && dist < 170) sparks.push({ a, b, p: 0 });
    };

    const step = () => {
      t += 0.02;
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
            ctx.strokeStyle = `rgba(109,59,245,${(1 - dist / maxDist) * 0.22})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // glowing pulsing nodes
      particles.forEach(p => {
        p.pulse += 0.045;
        const pulseR = p.r + Math.sin(p.pulse) * 0.8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, pulseR * 3.2, 0, Math.PI * 2);
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, pulseR * 3.2);
        glow.addColorStop(0, p.color + "33");
        glow.addColorStop(1, p.color + "00");
        ctx.fillStyle = glow;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, pulseR, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.85;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // traveling sparks along random connections
      maybeSpawnSpark();
      sparks = sparks.filter(s => s.p < 1);
      sparks.forEach(s => {
        s.p += 0.02;
        const x = s.a.x + (s.b.x - s.a.x) * s.p;
        const y = s.a.y + (s.b.y - s.a.y) * s.p;
        ctx.beginPath();
        ctx.arc(x, y, 2.4, 0, Math.PI * 2);
        const g = ctx.createRadialGradient(x, y, 0, x, y, 8);
        g.addColorStop(0, "#ffffff");
        g.addColorStop(1, "#ffffff00");
        ctx.fillStyle = g;
        ctx.fill();
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
     Dark mode toggle
     No saved preference -- always starts in light mode on
     every fresh visit/reload, as requested.
  --------------------------------------------------------- */
  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const root = document.documentElement;
      const isDark = root.getAttribute("data-theme") === "dark";
      if (isDark) {
        root.removeAttribute("data-theme");
        themeToggle.setAttribute("aria-pressed", "false");
      } else {
        root.setAttribute("data-theme", "dark");
        themeToggle.setAttribute("aria-pressed", "true");
      }
    });
  }

  /* ---------------------------------------------------------
     Full-page photo slideshow
     Auto-detects images named 1.jpg, 2.jpg, 3.jpg ... inside
     assets/images/slideshow-1920x1080-16x9/. To add or change
     photos, just add/replace numbered files in that folder --
     no code edits needed. Supports .jpg, .jpeg, .png, .webp.
  --------------------------------------------------------- */
  const slideshowSection = document.getElementById("fullpageSlideshow");
  if (slideshowSection) {
    const track = document.getElementById("slideshowTrack");
    const dotsWrap = document.getElementById("slideshowDots");
    const folder = "assets/images/slideshow-1920x1080-16x9/";
    const extensions = ["jpg", "jpeg", "png", "webp"];
    const maxSlides = 20;

    function probeImage(num) {
      return new Promise((resolve) => {
        let i = 0;
        function tryExt() {
          if (i >= extensions.length) return resolve(null);
          const ext = extensions[i++];
          const url = `${folder}${num}.${ext}`;
          const img = new Image();
          img.onload = () => resolve(url);
          img.onerror = tryExt;
          img.src = url;
        }
        tryExt();
      });
    }

    (async function init() {
      const found = [];
      for (let n = 1; n <= maxSlides; n++) {
        const url = await probeImage(n);
        if (!url) break; // stop at first gap in numbering
        found.push(url);
      }
      if (found.length === 0) return; // no photos uploaded yet

      found.forEach((url, i) => {
        const div = document.createElement("div");
        div.className = "fullpage-slideshow__slide" + (i === 0 ? " is-active" : "");
        div.style.backgroundImage = `url("${url}")`;
        track.appendChild(div);
      });

      const slideEls = Array.from(track.children);

      if (found.length > 1) {
        found.forEach((_, i) => {
          const dot = document.createElement("button");
          dot.className = "fullpage-slideshow__dot" + (i === 0 ? " is-active" : "");
          dot.setAttribute("aria-label", `Go to photo ${i + 1}`);
          dot.addEventListener("click", () => goTo(i));
          dotsWrap.appendChild(dot);
        });
        const dotEls = Array.from(dotsWrap.children);

        let current = 0;
        function goTo(index) {
          slideEls[current].classList.remove("is-active");
          dotEls[current].classList.remove("is-active");
          current = (index + slideEls.length) % slideEls.length;
          slideEls[current].classList.add("is-active");
          dotEls[current].classList.add("is-active");
        }

        if (!prefersReducedMotion) {
          setInterval(() => goTo(current + 1), 5000);
        }
      }
    })();
  }
})();
