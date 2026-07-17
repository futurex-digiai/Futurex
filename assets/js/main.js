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
    let dust = [];
    let sparks = [];
    let mx = null, my = null; // mouse position for gentle parallax
    let parallaxX = 0, parallaxY = 0;
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
      // Scaled to the now full-viewport-height hero so the network
      // reads as an ambient scene rather than a cramped cluster.
      const area = w * h;
      const count = Math.max(28, Math.min(90, Math.round(area / 22000)));
      particles = Array.from({ length: count }, (_, i) => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: 1.6 + Math.random() * 2.2,
        depth: 0.5 + Math.random() * 0.6, // parallax + size depth cue
        pulse: Math.random() * Math.PI * 2,
        color: COLORS[i % COLORS.length]
      }));

      // Faint distant "dust" layer -- small, slow, twinkling points that
      // fill out the full-page canvas without competing with the nodes.
      const dustCount = Math.max(40, Math.min(140, Math.round(area / 14000)));
      dust = Array.from({ length: dustCount }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.6 + Math.random() * 1.1,
        twinkle: Math.random() * Math.PI * 2,
        speed: 0.15 + Math.random() * 0.3,
        vy: 0.05 + Math.random() * 0.08
      }));
    };

    // Occasional bright "spark" that travels along a connection —
    // the small unexpected flash is the deliberate dopamine touch.
    const maybeSpawnSpark = () => {
      if (sparks.length > 3 || Math.random() > 0.014) return;
      const a = particles[Math.floor(Math.random() * particles.length)];
      const b = particles[Math.floor(Math.random() * particles.length)];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (dist > 0 && dist < 180) sparks.push({ a, b, p: 0 });
    };

    let isRunning = false;
    const step = () => {
      if (!isRunning) return;
      t += 0.02;

      // Parallax gently eases toward the mouse position (or a slow
      // autonomous drift on touch devices with no mouse).
      const targetX = mx !== null ? (mx / w - 0.5) * 18 : Math.sin(t * 0.15) * 6;
      const targetY = my !== null ? (my / h - 0.5) * 12 : Math.cos(t * 0.12) * 4;
      parallaxX += (targetX - parallaxX) * 0.03;
      parallaxY += (targetY - parallaxY) * 0.03;

      ctx.clearRect(0, 0, w, h);

      // distant twinkling dust, drifting slowly upward
      dust.forEach(d => {
        d.twinkle += 0.02 * d.speed;
        d.y -= d.vy;
        if (d.y < -4) { d.y = h + 4; d.x = Math.random() * w; }
        const a = 0.15 + Math.sin(d.twinkle) * 0.15;
        ctx.beginPath();
        ctx.arc(d.x + parallaxX * 0.3, d.y + parallaxY * 0.3, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,170,255,${Math.max(0, a)})`;
        ctx.fill();
      });

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
            ctx.moveTo(a.x + parallaxX * a.depth, a.y + parallaxY * a.depth);
            ctx.lineTo(b.x + parallaxX * b.depth, b.y + parallaxY * b.depth);
            ctx.stroke();
          }
        }
      }

      // glowing pulsing nodes
      particles.forEach(p => {
        p.pulse += 0.045;
        const pulseR = p.r + Math.sin(p.pulse) * 0.8;
        const px = p.x + parallaxX * p.depth, py = p.y + parallaxY * p.depth;
        ctx.beginPath();
        ctx.arc(px, py, pulseR * 3.2, 0, Math.PI * 2);
        const glow = ctx.createRadialGradient(px, py, 0, px, py, pulseR * 3.2);
        glow.addColorStop(0, p.color + "33");
        glow.addColorStop(1, p.color + "00");
        ctx.fillStyle = glow;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px, py, pulseR, 0, Math.PI * 2);
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
        const x = s.a.x + (s.b.x - s.a.x) * s.p + parallaxX * s.a.depth;
        const y = s.a.y + (s.b.y - s.a.y) * s.p + parallaxY * s.a.depth;
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

    let isVisible = true; // in-viewport
    let isPageVisible = !document.hidden;

    const startLoop = () => {
      if (isRunning) return;
      isRunning = true;
      requestAnimationFrame(step);
    };
    const stopLoop = () => { isRunning = false; };

    resize();
    initParticles();

    // Subtle parallax: nodes drift toward the cursor within the hero.
    canvas.addEventListener("pointermove", (e) => {
      const rect = canvas.getBoundingClientRect();
      mx = e.clientX - rect.left;
      my = e.clientY - rect.top;
    }, { passive: true });
    canvas.addEventListener("pointerleave", () => { mx = null; my = null; }, { passive: true });

    // Only animate while the hero canvas is actually on screen
    const canvasIo = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;
      if (isVisible && isPageVisible) startLoop(); else stopLoop();
    }, { threshold: 0 });
    canvasIo.observe(canvas);

    // Also pause when the browser tab itself isn't visible
    document.addEventListener("visibilitychange", () => {
      isPageVisible = !document.hidden;
      if (isVisible && isPageVisible) startLoop(); else stopLoop();
    });

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
      mode: (v) => v.trim().length > 0,
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

      // Honeypot: real visitors never see/fill this field, only bots do.
      // Pretend to succeed so bots don't learn to skip it.
      const honeypot = form.querySelector("[name=website]");
      if (honeypot && honeypot.value.trim() !== "") {
        status.textContent = "Thanks! We'll be in touch soon.";
        status.classList.add("is-success");
        form.reset();
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
          course_mode: form.querySelector("[name=mode]").value.trim(),
          message: form.querySelector("[name=message]").value.trim(),
          website: honeypot ? honeypot.value : ""
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
     Full-page intro video + photo slideshow
     Plays assets/video/intro.mp4 once first (if present), then
     switches to auto-detected photos named 1.jpg, 2.jpg, 3.jpg ...
     inside assets/images/slideshow-1920x1080-16x9/, changing
     every 5 seconds. To change the video, replace
     assets/video/intro.mp4 (same filename). To add/change photos,
     just add/replace numbered files in that folder -- no code
     edits needed. Supports .jpg, .jpeg, .png, .webp.
  --------------------------------------------------------- */
  const slideshowSection = document.getElementById("fullpageSlideshow");
  if (slideshowSection) {
    const track = document.getElementById("slideshowTrack");
    const dotsWrap = document.getElementById("slideshowDots");
    const introVideo = document.getElementById("slideshowIntroVideo");
    const introVideoBg = document.getElementById("slideshowIntroVideoBg");
    const videoWrap = document.getElementById("slideshowVideoWrap");
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

    // Find which numbered photos exist. Runs immediately, in parallel with
    // the intro video, so the URLs are already known by the time the video
    // hands off -- no lookup delay at the switch point.
    async function findSlideUrls() {
      const found = [];
      for (let n = 1; n <= maxSlides; n++) {
        const url = await probeImage(n);
        if (!url) break; // stop at first gap in numbering
        found.push(url);
      }
      return found;
    }
    const urlsReady = findSlideUrls();

    // Loads a slide's actual image data only when it's about to be shown
    // (plus a one-ahead prefetch), instead of requesting every photo at
    // once on page load.
    function loadSlide(slide, url, priority) {
      if (slide.dataset.loaded) return;
      slide.dataset.loaded = "1";
      [slide.bgImg, slide.fgImg].forEach(img => {
        if (priority) img.fetchPriority = "high";
        img.src = url;
        img.onerror = () => console.error("FutureX slideshow: image failed to load:", url);
      });
    }

    async function startPhotoSlideshow() {
      if (startPhotoSlideshow.started) return;
      startPhotoSlideshow.started = true;

      const found = await urlsReady;
      if (found.length === 0) return; // no photos uploaded yet

      const slideEls = found.map((url, i) => {
        const div = document.createElement("div");
        div.className = "fullpage-slideshow__slide" + (i === 0 ? " is-active" : "");

        const bg = document.createElement("img");
        bg.className = "fullpage-slideshow__bg";
        bg.alt = ""; bg.setAttribute("aria-hidden", "true");
        const fg = document.createElement("img");
        fg.className = "fullpage-slideshow__fg";
        fg.alt = "FutureX Academy showcase photo " + (i + 1);

        div.appendChild(bg);
        div.appendChild(fg);
        div.bgImg = bg; div.fgImg = fg;
        track.appendChild(div);
        return div;
      });
      loadSlide(slideEls[0], found[0], true);
      if (found.length > 1) loadSlide(slideEls[1], found[1]); // prefetch next

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
          loadSlide(slideEls[current], found[current]);
          const next = (current + 1) % slideEls.length;
          loadSlide(slideEls[next], found[next]); // stay one slide ahead
        }

        if (!prefersReducedMotion) {
          setInterval(() => goTo(current + 1), 5000);
        }
      }
    }

    function handOffToPhotos() {
      if (handOffToPhotos.done) return; // guard: never run this twice
      handOffToPhotos.done = true;

      if (videoWrap) {
        videoWrap.classList.add("is-hidden");
        [introVideo, introVideoBg].forEach(v => v && v.pause());
        setTimeout(() => {
          [introVideo, introVideoBg].forEach(v => {
            if (!v) return;
            v.removeAttribute("src"); // fully unload -- can never play again
            v.load();
          });
          videoWrap.remove();
        }, 1000); // after fade-out transition
      }
      startPhotoSlideshow();
    }

    if (introVideo) {
      // Play once, then hand off to the photo slideshow.
      introVideo.addEventListener("ended", handOffToPhotos, { once: true });
      // If the video file is missing/fails to load, skip straight to photos.
      introVideo.addEventListener("error", handOffToPhotos, { once: true });
      // Safety net: if the video ever hangs/stalls and never fires ended
      // or error (e.g. a codec or local-file quirk), force the handoff
      // after 15s so the page is never stuck showing just the video.
      setTimeout(handOffToPhotos, 15000);
      // Respect reduced-motion preference -- skip the video and go straight to photos.
      if (prefersReducedMotion) {
        handOffToPhotos();
      } else {
        introVideo.play().catch(handOffToPhotos);
      }
    } else {
      startPhotoSlideshow();
    }
  }
})();
