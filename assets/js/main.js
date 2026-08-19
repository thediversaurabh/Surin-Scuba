/* ============================================================
   SURIN SCUBA — main.js
   Vanilla JS. Progressive enhancement, reduced-motion aware.
   ============================================================ */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Header: solid-on-scroll ---------- */
  var header = document.querySelector(".site-header");
  function onScrollHeader() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 40);
  }
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- Mobile nav drawer ---------- */
  var toggle = document.querySelector(".nav__toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.querySelectorAll(".nav__links a").forEach(function (a) {
      a.addEventListener("click", function () {
        document.body.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Depth gauge (signature) ---------- */
  var gauge = document.querySelector(".depth-gauge");
  if (gauge) {
    var readout = gauge.querySelector(".depth-gauge__readout");
    var thumb = gauge.querySelector(".depth-gauge__thumb");
    var maxDepth = parseInt(gauge.getAttribute("data-max-depth"), 10) || 40;
    var raf = null;

    function updateGauge() {
      raf = null;
      var doc = document.documentElement;
      var scrollable = doc.scrollHeight - window.innerHeight;
      var progress = scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0;
      var depth = Math.round(progress * maxDepth);
      if (readout) readout.textContent = depth + "m";
      if (thumb) thumb.style.top = (progress * 100) + "%";
    }
    function requestGauge() {
      if (raf === null) raf = window.requestAnimationFrame(updateGauge);
    }
    window.addEventListener("scroll", requestGauge, { passive: true });
    window.addEventListener("resize", requestGauge, { passive: true });
    updateGauge();
    // fade in once ready
    window.requestAnimationFrame(function () { gauge.classList.add("is-ready"); });
  }

  /* ---------- Scroll reveals ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if (reveals.length) {
    if (prefersReduced || !("IntersectionObserver" in window)) {
      reveals.forEach(function (el) { el.classList.add("is-in"); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
      reveals.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---------- Light rays fade-in ---------- */
  var rays = document.querySelector(".light-rays");
  if (rays) {
    window.requestAnimationFrame(function () {
      window.setTimeout(function () { rays.classList.add("is-in"); }, 150);
    });
  }

  /* ---------- Hero parallax ---------- */
  var heroMedia = document.querySelector(".hero__media img");
  if (heroMedia && !prefersReduced) {
    var pRaf = null;
    function parallax() {
      pRaf = null;
      var y = window.scrollY;
      if (y < window.innerHeight) {
        heroMedia.style.transform = "translate3d(0," + (y * 0.28) + "px,0) scale(1.08)";
      }
    }
    heroMedia.style.transform = "scale(1.08)";
    window.addEventListener("scroll", function () {
      if (pRaf === null) pRaf = window.requestAnimationFrame(parallax);
    }, { passive: true });
  }

  /* ---------- Gallery lightbox ---------- */
  var galleryItems = Array.prototype.slice.call(document.querySelectorAll(".gallery__item"));
  var lightbox = document.querySelector(".lightbox");
  if (galleryItems.length && lightbox) {
    var lbImg = lightbox.querySelector("img");
    var lbCap = lightbox.querySelector(".lightbox__cap");
    var current = 0;
    var lastFocused = null;

    function showImage(i) {
      current = (i + galleryItems.length) % galleryItems.length;
      var item = galleryItems[current];
      var img = item.querySelector("img");
      var full = item.getAttribute("data-full") || img.src;
      var cap = item.getAttribute("data-caption") || img.alt || "";
      lbImg.src = full;
      lbImg.alt = cap;
      if (lbCap) lbCap.textContent = cap;
    }
    function openLightbox(i) {
      lastFocused = document.activeElement;
      showImage(i);
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      var closeBtn = lightbox.querySelector(".lightbox__close");
      if (closeBtn) closeBtn.focus();
    }
    function closeLightbox() {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (lastFocused) lastFocused.focus();
    }

    galleryItems.forEach(function (item, i) {
      item.setAttribute("tabindex", "0");
      item.setAttribute("role", "button");
      item.addEventListener("click", function () { openLightbox(i); });
      item.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLightbox(i); }
      });
    });

    lightbox.querySelectorAll("[data-lb-close]").forEach(function (el) {
      el.addEventListener("click", closeLightbox);
    });
    var prevBtn = lightbox.querySelector(".lightbox__nav--prev");
    var nextBtn = lightbox.querySelector(".lightbox__nav--next");
    if (prevBtn) prevBtn.addEventListener("click", function () { showImage(current - 1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { showImage(current + 1); });

    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("is-open")) return;
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowLeft") showImage(current - 1);
      else if (e.key === "ArrowRight") showImage(current + 1);
      else if (e.key === "Tab") {
        // simple focus trap
        var focusables = lightbox.querySelectorAll("button");
        var first = focusables[0], last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---------- Booking form ---------- */
  var form = document.querySelector("[data-booking-form]");
  if (form) {
    var steps = Array.prototype.slice.call(form.querySelectorAll(".step"));
    var indicators = Array.prototype.slice.call(document.querySelectorAll(".steps__item"));
    var successPane = document.querySelector(".booking__success");
    var stepIndex = 0;

    function showStep(i) {
      stepIndex = Math.max(0, Math.min(steps.length - 1, i));
      steps.forEach(function (s, idx) { s.classList.toggle("is-active", idx === stepIndex); });
      indicators.forEach(function (ind, idx) {
        ind.classList.toggle("is-active", idx === stepIndex);
        ind.classList.toggle("is-done", idx < stepIndex);
      });
      var firstField = steps[stepIndex].querySelector("input, select, textarea");
      if (firstField && stepIndex > 0) firstField.focus({ preventScroll: true });
    }

    function validateStep(i) {
      var required = steps[i].querySelectorAll("[required]");
      var ok = true;
      var radios = {};
      required.forEach(function (field) {
        var fieldWrap = field.closest(".field");
        if (field.type === "radio") {
          radios[field.name] = radios[field.name] || form.querySelector("input[name='" + field.name + "']:checked");
          if (!radios[field.name]) ok = false;
          return;
        }
        var valid = field.value && field.value.trim() !== "" && field.checkValidity();
        if (fieldWrap) fieldWrap.classList.toggle("has-error", !valid);
        if (!valid) ok = false;
      });
      return ok;
    }

    // Delegated nav — each step carries its own next/back buttons
    form.addEventListener("click", function (e) {
      var next = e.target.closest(".btn--next");
      var back = e.target.closest(".btn--back");
      if (next) { e.preventDefault(); if (validateStep(stepIndex)) showStep(stepIndex + 1); }
      else if (back) { e.preventDefault(); showStep(stepIndex - 1); }
    });

    // clear error on input
    form.addEventListener("input", function (e) {
      var wrap = e.target.closest(".field");
      if (wrap) wrap.classList.remove("has-error");
    });

    // Pre-select offering from URL (?offer=Open+Water+Course&type=course)
    var params = new URLSearchParams(window.location.search);
    var offer = params.get("offer");
    var type = params.get("type");
    if (type) {
      var typeInput = form.querySelector("input[name='experience'][value='" + type + "']");
      if (typeInput) typeInput.checked = true;
    }
    if (offer) {
      var offerSelect = form.querySelector("select[name='offering']");
      if (offerSelect) {
        var matched = false;
        Array.prototype.forEach.call(offerSelect.options, function (opt) {
          if (opt.value.toLowerCase() === offer.toLowerCase()) { opt.selected = true; matched = true; }
        });
        if (!matched) {
          var o = document.createElement("option");
          o.value = offer; o.textContent = offer; o.selected = true;
          offerSelect.appendChild(o);
        }
      }
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validateStep(stepIndex)) return;

      var data = Object.fromEntries(new FormData(form).entries());

      /* ---- Submission hook ----
         Replace this block to POST to a real endpoint or form service.
         e.g. fetch("/api/booking", { method:"POST", body: JSON.stringify(data) })
      */
      console.log("[Surin Scuba] Booking request:", data);

      // Populate success summary
      if (successPane) {
        var sumOffer = successPane.querySelector("[data-sum-offer]");
        var sumDate = successPane.querySelector("[data-sum-date]");
        var sumPeople = successPane.querySelector("[data-sum-people]");
        if (sumOffer) sumOffer.textContent = data.offering || data.experience || "your dive";
        if (sumDate) sumDate.textContent = data.date || "your selected date";
        if (sumPeople) sumPeople.textContent = (data.participants || "1") + " diver(s)";
        form.style.display = "none";
        var stepsEl = document.querySelector(".steps");
        if (stepsEl) stepsEl.style.display = "none";
        successPane.classList.add("is-open");
        successPane.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "center" });
      }
    });

    showStep(0);
  }

  /* ---------- Image fallback: failed remote photos fade to gradient ---------- */
  document.querySelectorAll("img").forEach(function (img) {
    img.addEventListener("error", function () { img.classList.add("img-failed"); });
    if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) {
      img.classList.add("img-failed");
    }
  });

  /* ---------- Footer year ---------- */
  var yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
