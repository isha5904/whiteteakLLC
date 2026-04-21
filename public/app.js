(function () {
  // Mobile/Tablet hamburger drawer
  function initNavDrawer() {
    var toggle = document.querySelector("[data-mp-nav-toggle]");
    var drawer = document.querySelector("[data-mp-nav-drawer]");
    if (!toggle || !drawer) return;
    function open() {
      drawer.hidden = false;
      toggle.setAttribute("aria-expanded", "true");
      document.body.classList.add("mp-nav-open");
    }
    function close() {
      drawer.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("mp-nav-open");
    }
    toggle.addEventListener("click", function () {
      if (drawer.hidden) open(); else close();
    });
    drawer.querySelectorAll("[data-mp-nav-close]").forEach(function (el) {
      el.addEventListener("click", close);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !drawer.hidden) close();
    });
    drawer.querySelectorAll(".mp-nav-body a").forEach(function (el) {
      el.addEventListener("click", close);
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initNavDrawer);
  } else {
    initNavDrawer();
  }

  const CART_KEY = "electrohub-cart";

  function readCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    } catch {
      return [];
    }
  }

  function writeCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(value);
  }

  function updateCartCount() {
    const count = readCart().reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll("[data-cart-count]").forEach((node) => {
      node.textContent = count;
    });
  }

  function attachAddToCart() {
    document.querySelectorAll("[data-add-to-cart]").forEach((button) => {
      button.addEventListener("click", () => {
        const payload = JSON.parse(button.getAttribute("data-add-to-cart"));
        const cart = readCart();
        const existing = cart.find((item) => item.id === payload.id);

        if (existing) {
          existing.quantity += 1;
        } else {
          cart.push({ ...payload, quantity: 1 });
        }

        writeCart(cart);
        button.textContent = "Added";
        setTimeout(() => {
          button.textContent = "Add to cart";
        }, 1200);
      });
    });
  }

  function renderCartPage() {
    const container = document.querySelector("[data-cart-items]");
    if (!container) return;

    const cart = readCart();
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);

    document.querySelector("[data-cart-items-count]").textContent = count;
    document.querySelector("[data-cart-total]").textContent = formatCurrency(total);

    if (!cart.length) {
      container.innerHTML = `<div class="empty-panel">Your cart is empty. Add products from the catalog to continue.</div>`;
      return;
    }

    container.innerHTML = cart.map((item) => `
      <article class="cart-line">
        <img src="${item.image}" alt="${item.name}">
        <div>
          <strong>${item.name}</strong>
          <p>${formatCurrency(item.price)} x ${item.quantity}</p>
        </div>
        <button class="ghost-button" data-remove-id="${item.id}">Remove</button>
      </article>
    `).join("");

    container.querySelectorAll("[data-remove-id]").forEach((button) => {
      button.addEventListener("click", () => {
        const next = readCart().filter((item) => String(item.id) !== button.getAttribute("data-remove-id"));
        writeCart(next);
        renderCartPage();
      });
    });
  }

  function renderCheckoutPage() {
    const itemsNode = document.querySelector("[data-checkout-items]");
    const totalNode = document.querySelector("[data-checkout-total]");
    const form = document.querySelector("[data-checkout-form]");
    const messageNode = document.querySelector("[data-checkout-message]");
    if (!itemsNode || !totalNode || !form) return;

    const cart = readCart();
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    totalNode.textContent = formatCurrency(total);

    if (!cart.length) {
      itemsNode.innerHTML = `<div class="empty-panel">Your cart is empty. Add products before checking out.</div>`;
      form.querySelector("button").disabled = true;
      return;
    }

    itemsNode.innerHTML = cart.map((item) => `
      <div class="summary-line border-row">
        <span>${item.name} x ${item.quantity}</span>
        <strong>${formatCurrency(item.price * item.quantity)}</strong>
      </div>
    `).join("");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      messageNode.textContent = "Placing your order...";

      const formData = new FormData(form);
      const payload = {
        customerName: formData.get("customerName"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        address: formData.get("address"),
        city: formData.get("city"),
        state: formData.get("state"),
        pincode: formData.get("pincode"),
        items: cart.map((item) => ({ id: item.id, quantity: item.quantity }))
      };

      try {
        const response = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || "Could not place order");
        }
        writeCart([]);
        window.location.href = `/order/${encodeURIComponent(result.orderCode)}`;
      } catch (error) {
        messageNode.textContent = error.message;
      }
    });
  }

  function attachGallery() {
    const stage = document.querySelector("[data-gallery-stage]");
    const mediaItems = Array.from(document.querySelectorAll("[data-gallery-item]"));
    const thumbColumn = document.querySelector(".thumb-column");
    const thumbPrev = document.querySelector("[data-thumb-prev]");
    const thumbNext = document.querySelector("[data-thumb-next]");
    if (!stage || !mediaItems.length) return;

    let reelTimer = null;

    function stopReel() {
      if (reelTimer) {
        window.clearInterval(reelTimer);
        reelTimer = null;
      }
    }

    function activateItem(target) {
      mediaItems.forEach((item) => item.classList.toggle("active", item === target));
    }

    function renderImage(item) {
      stopReel();
      const img = item.querySelector("img");
      if (!img) return;
      const mainClass = document.querySelector(".clean-pdp-shell") ? "clean-hero-image" : "detail-hero-image";
      stage.innerHTML = `<img class="${mainClass} ${img.className.replace("thumb detail-thumb", "").trim()}" data-gallery-main src="${img.getAttribute("src")}" alt="${img.getAttribute("alt")}">`;
    }

    function renderVideo(item) {
      stopReel();
      const frames = JSON.parse(item.getAttribute("data-video-frames") || "[]").filter(Boolean);
      const title = item.getAttribute("data-video-title") || "Product video";
      const caption = item.getAttribute("data-video-caption") || "";
      const initialFrame = frames[0] || "";

      stage.innerHTML = `
        <div class="gallery-video-state">
          <div class="gallery-video-shell">
            <img class="gallery-video-frame" src="${initialFrame}" alt="${title}">
            <div class="gallery-video-copy">
              <div class="video-thumb-play"></div>
              <strong>${title}</strong>
              <span>${caption}</span>
            </div>
          </div>
        </div>
      `;

      const frameNode = stage.querySelector(".gallery-video-frame");
      if (frameNode && frames.length > 1) {
        let index = 0;
        reelTimer = window.setInterval(() => {
          index = (index + 1) % frames.length;
          frameNode.src = frames[index];
        }, 1200);
      }
    }

    mediaItems.forEach((item) => {
      item.addEventListener("click", () => {
        activateItem(item);
        if (item.getAttribute("data-gallery-type") === "video") {
          renderVideo(item);
        } else {
          renderImage(item);
        }
      });
    });

    const scrollThumbs = (direction) => {
      if (!thumbColumn) return;
      const amount = window.innerWidth <= 760 ? thumbColumn.clientWidth * 0.85 : 180;
      thumbColumn.scrollBy({
        left: window.innerWidth <= 760 ? direction * amount : 0,
        top: window.innerWidth <= 760 ? 0 : direction * amount,
        behavior: "smooth"
      });
    };

    thumbPrev?.addEventListener("click", () => scrollThumbs(-1));
    thumbNext?.addEventListener("click", () => scrollThumbs(1));
  }

  function attachCarousel() {
    const root = document.querySelector("[data-carousel]");
    if (!root) return;

    const slides = Array.from(root.querySelectorAll("[data-carousel-slide]"));
    const dots = Array.from(root.querySelectorAll("[data-carousel-dot]"));
    const prev = root.querySelector("[data-carousel-prev]");
    const next = root.querySelector("[data-carousel-next]");
    if (!slides.length) return;

    let activeIndex = slides.findIndex((slide) => slide.classList.contains("active"));
    if (activeIndex < 0) activeIndex = 0;
    let timer = null;

    function render(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle("active", slideIndex === activeIndex);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle("active", dotIndex === activeIndex);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(() => {
        render(activeIndex + 1);
      }, 4800);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    prev?.addEventListener("click", () => {
      render(activeIndex - 1);
      startTimer();
    });

    next?.addEventListener("click", () => {
      render(activeIndex + 1);
      startTimer();
    });

    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        render(index);
        startTimer();
      });
    });

    root.addEventListener("mouseenter", stopTimer);
    root.addEventListener("mouseleave", startTimer);
    render(activeIndex);
    startTimer();
  }

  function attachRails() {
    document.querySelectorAll("[data-rail]").forEach((root) => {
      const track = root.querySelector("[data-rail-track]");
      const prev = root.querySelector("[data-rail-prev]");
      const next = root.querySelector("[data-rail-next]");
      if (!track) return;

      const scrollAmount = () => Math.max(track.clientWidth * 0.82, 240);

      prev?.addEventListener("click", () => {
        track.scrollBy({ left: -scrollAmount(), behavior: "smooth" });
      });

      next?.addEventListener("click", () => {
        track.scrollBy({ left: scrollAmount(), behavior: "smooth" });
      });

      // Auto-scroll (marquee-style) only for Bank Offers + Deals Of The Day.
      // Layout/HTML/CSS are untouched; we just animate scrollLeft and loop seamlessly.
      const isMarquee =
        track.classList.contains("bank-offer-rail") ||
        track.classList.contains("deal-rail");
      if (!isMarquee) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const speedPxPerSec = 40; // gentle ticker speed
      let lastTs = 0;
      let paused = false;
      let userInteracting = false;
      let resumeTimer = null;

      const pauseTemporarily = (ms = 2500) => {
        userInteracting = true;
        clearTimeout(resumeTimer);
        resumeTimer = setTimeout(() => { userInteracting = false; }, ms);
      };

      root.addEventListener("mouseenter", () => { paused = true; });
      root.addEventListener("mouseleave", () => { paused = false; });
      track.addEventListener("wheel", () => pauseTemporarily(), { passive: true });
      track.addEventListener("touchstart", () => pauseTemporarily(4000), { passive: true });
      prev?.addEventListener("click", () => pauseTemporarily(4000));
      next?.addEventListener("click", () => pauseTemporarily(4000));

      const step = (ts) => {
        if (!lastTs) lastTs = ts;
        const dt = (ts - lastTs) / 1000;
        lastTs = ts;

        if (!paused && !userInteracting) {
          const maxScroll = track.scrollWidth - track.clientWidth;
          if (maxScroll > 4) {
            let next = track.scrollLeft + speedPxPerSec * dt;
            if (next >= maxScroll - 1) next = 0; // seamless loop back to start
            track.scrollLeft = next;
          }
        }
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  updateCartCount();
  attachAddToCart();
  renderCartPage();
  renderCheckoutPage();
  attachGallery();
  attachCarousel();
  attachRails();

  function attachV2Carousel() {
    const roots = document.querySelectorAll("[data-v2-carousel]");
    roots.forEach((root) => {
      const slides = Array.from(root.querySelectorAll(".v2-slide"));
      const dots = Array.from(root.querySelectorAll("[data-v2-dot]"));
      const prev = root.querySelector("[data-v2-prev]");
      const next = root.querySelector("[data-v2-next]");
      if (!slides.length) return;
      let idx = 0;
      let timer = null;
      function show(i) {
        idx = (i + slides.length) % slides.length;
        slides.forEach((s, si) => s.classList.toggle("is-active", si === idx));
        dots.forEach((d, di) => d.classList.toggle("is-active", di === idx));
      }
      function start() { stop(); timer = setInterval(() => show(idx + 1), 6000); }
      function stop() { if (timer) { clearInterval(timer); timer = null; } }
      if (prev) prev.addEventListener("click", () => { show(idx - 1); start(); });
      if (next) next.addEventListener("click", () => { show(idx + 1); start(); });
      dots.forEach((d, di) => d.addEventListener("click", () => { show(di); start(); }));
      root.addEventListener("mouseenter", stop);
      root.addEventListener("mouseleave", start);
      start();
    });
  }
  attachV2Carousel();

  // ===== Wishlist toggle (PDP heart, wishlist page removal) =====
  document.querySelectorAll("[data-pdp2-wish]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var pid = Number(btn.getAttribute("data-pdp2-wish"));
      var isOn = btn.classList.contains("is-on");
      var url = isOn ? "/api/wishlist/remove" : "/api/wishlist/add";
      fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: pid }) })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          if (!res.ok) { alert(res.j.error || "Please log in to use wishlist."); return; }
          btn.classList.toggle("is-on");
          btn.textContent = btn.classList.contains("is-on") ? "♥" : "♡";
        });
    });
  });
  document.querySelectorAll("[data-mp-wish-remove]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var pid = Number(btn.getAttribute("data-mp-wish-remove"));
      fetch("/api/wishlist/remove", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: pid }) })
        .then(function () { var card = btn.closest(".mp-wish-card"); if (card) card.remove(); });
    });
  });

  // ===== PDP qty stepper =====
  document.querySelectorAll("[data-pdp2-qty]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var el = document.querySelector("[data-pdp2-qty-val]");
      if (!el) return;
      var v = Number(el.textContent || "1");
      v += (btn.getAttribute("data-pdp2-qty") === "+") ? 1 : -1;
      if (v < 1) v = 1; if (v > 10) v = 10;
      el.textContent = v;
    });
  });

  // ===== Star rating input + Review form =====
  document.querySelectorAll("[data-pdp2-stars]").forEach(function (root) {
    var buttons = root.querySelectorAll("button[data-star]");
    var input = root.querySelector('input[name=rating]');
    buttons.forEach(function (b) {
      b.addEventListener("click", function () {
        var val = Number(b.getAttribute("data-star"));
        if (input) input.value = String(val);
        buttons.forEach(function (bb) {
          var v = Number(bb.getAttribute("data-star"));
          bb.classList.toggle("is-on", v <= val);
          bb.textContent = v <= val ? "★" : "☆";
        });
      });
    });
  });
  document.querySelectorAll("[data-pdp2-rev-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = form.querySelector("[data-pdp2-rev-msg]");
      var productId = Number(form.getAttribute("data-product-id"));
      var fd = new FormData(form);
      var payload = {
        productId: productId,
        rating: Number(fd.get("rating") || 0),
        title: String(fd.get("title") || ""),
        body: String(fd.get("body") || "")
      };
      if (!payload.rating) { msg.textContent = "Please select a rating"; msg.classList.add("is-error"); return; }
      fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          if (res.ok) {
            msg.textContent = "Thanks! Your review has been posted.";
            msg.classList.remove("is-error");
            setTimeout(function () { location.reload(); }, 900);
          } else {
            msg.textContent = res.j.error || "Could not submit review";
            msg.classList.add("is-error");
          }
        });
    });
  });

  // ==== CROMA REDESIGN HANDLERS ====

  // Sidebar filter toggle on products listing
  document.querySelectorAll("[data-cr-sidebar-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var sidebar = btn.closest("[data-cr-sidebar]");
      if (sidebar) sidebar.classList.toggle("is-open");
    });
  });

  // Product detail gallery thumbnail switcher
  document.querySelectorAll("[data-cr-thumb]").forEach(function (thumb) {
    thumb.addEventListener("click", function () {
      var src = thumb.getAttribute("data-src");
      var stage = document.querySelector("[data-cr-stage]");
      if (stage && src) stage.setAttribute("src", src);
      document.querySelectorAll("[data-cr-thumb]").forEach(function (t) { t.classList.remove("is-active"); });
      thumb.classList.add("is-active");
    });
  });

  // Checkout multi-step navigation
  (function crCheckoutSteps() {
    var stepsEl = document.querySelector("[data-cr-steps]");
    if (!stepsEl) return;
    var stepItems = stepsEl.querySelectorAll("li");
    var bodies = document.querySelectorAll("[data-step-body]");
    function show(n) {
      stepItems.forEach(function (li) {
        var s = Number(li.getAttribute("data-step"));
        li.classList.toggle("is-active", s === n);
        li.classList.toggle("is-done", s < n);
      });
      bodies.forEach(function (b) {
        b.classList.toggle("is-active", Number(b.getAttribute("data-step-body")) === n);
      });
    }
    document.querySelectorAll("[data-cr-next]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var cur = document.querySelector(".cr-co-step.is-active");
        var n = cur ? Number(cur.getAttribute("data-step-body")) : 1;
        show(Math.min(n + 1, 3));
      });
    });
    document.querySelectorAll("[data-cr-back]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var cur = document.querySelector(".cr-co-step.is-active");
        var n = cur ? Number(cur.getAttribute("data-step-body")) : 1;
        show(Math.max(n - 1, 1));
      });
    });
  })();

  // Admin sidebar toggle on mobile
  document.querySelectorAll("[data-cr-admin-menu]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var sb = document.querySelector("[data-cr-admin-sidebar]");
      if (sb) sb.classList.toggle("is-open");
    });
  });

  // Color swatch toggle (decorative)
  document.querySelectorAll(".cr-swatch").forEach(function (sw) {
    sw.addEventListener("click", function () {
      var parent = sw.parentElement;
      if (parent) parent.querySelectorAll(".cr-swatch").forEach(function (s) { s.classList.remove("is-active"); });
      sw.classList.add("is-active");
    });
  });

  // Qty stepper delegation (if cart renders steppers with data-cr-qty)
  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!(t instanceof HTMLElement)) return;
    if (t.matches("[data-cr-qty-inc], [data-cr-qty-dec]")) {
      var wrap = t.closest("[data-cr-qty]");
      if (!wrap) return;
      var input = wrap.querySelector("input");
      if (!input) return;
      var cur = parseInt(input.value, 10) || 1;
      cur = t.matches("[data-cr-qty-inc]") ? cur + 1 : Math.max(1, cur - 1);
      input.value = String(cur);
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }
  });

  // === E-COMMERCE OVERHAUL handlers ===
  // Admin: bulk select-all
  document.addEventListener("change", function (e) {
    var t = e.target;
    if (!(t instanceof HTMLElement)) return;
    if (t.matches("[data-eo-check-all]")) {
      var checked = t.checked;
      document.querySelectorAll(".eo-row-check").forEach(function (cb) { cb.checked = checked; });
    }
    // Admin: order status auto-submit
    if (t.matches("[data-eo-status-select]")) {
      var form = t.closest("[data-eo-status-form]");
      if (form) form.submit();
    }
  });

  // Delete confirmations for admin single-delete forms are inline via onsubmit.

  // Filter form: auto-submit on change
  var filterForm = document.querySelector("[data-eo-filter-form]");
  if (filterForm) {
    filterForm.addEventListener("change", function (e) {
      var tgt = e.target;
      if (!(tgt instanceof HTMLElement)) return;
      // Only auto-submit for checkboxes/radios; let number inputs wait for Apply
      if (tgt.matches("input[type=checkbox], input[type=radio]")) {
        // Don't auto-submit if within data-eo-multi with range inputs, etc.
        filterForm.submit();
      }
    });
  }

  // Admin search: submit on Enter (default) - no extra JS needed. Also submit on debounce for live UX:
  var adminSearch = document.querySelector(".eo-admin-search-form input[name=q]");
  if (adminSearch) {
    var tmr;
    adminSearch.addEventListener("input", function () {
      clearTimeout(tmr);
      tmr = setTimeout(function () { adminSearch.form.submit(); }, 450);
    });
  }

  // === EH FIX: toast helper, guest cart, Razorpay integration, cart empty state ===

  function ehEnsureToastWrap() {
    var wrap = document.querySelector(".eh-toast-wrap");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.className = "eh-toast-wrap";
      document.body.appendChild(wrap);
    }
    return wrap;
  }
  window.showToast = function (msg, opts) {
    opts = opts || {};
    var wrap = ehEnsureToastWrap();
    var t = document.createElement("div");
    t.className = "eh-toast" + (opts.error ? " eh-toast-error" : "");
    t.textContent = String(msg || "");
    wrap.appendChild(t);
    requestAnimationFrame(function () { t.classList.add("is-show"); });
    setTimeout(function () {
      t.classList.remove("is-show");
      setTimeout(function () { t.remove(); }, 250);
    }, opts.duration || 3200);
  };

  // Safer fetch wrapper
  window.ehFetch = async function (url, options) {
    try {
      var r = await fetch(url, options);
      return r;
    } catch (err) {
      window.showToast("Network error: " + (err && err.message || "failed"), { error: true });
      throw err;
    }
  };

  // Show the cart empty panel when cart renders no items
  (function ehCartEmptyState() {
    var body = document.querySelector("[data-cart-items]");
    var empty = document.querySelector("[data-cart-empty]");
    if (!body || !empty) return;
    function refresh() {
      try {
        var cart = JSON.parse(localStorage.getItem("electrohub-cart") || "[]");
        if (!cart.length) {
          empty.hidden = false;
          body.style.display = "none";
        } else {
          empty.hidden = true;
          body.style.display = "";
        }
      } catch (_) {}
    }
    refresh();
    // Observe body innerHTML changes (when renderCartPage re-renders on remove)
    var mo = new MutationObserver(refresh);
    mo.observe(body, { childList: true, subtree: true });
  })();

  // Guest cart mirror — mirrors electrohub-cart localStorage to eh_guest_cart when logged-out.
  (function ehGuestCart() {
    var loggedIn = document.body && document.body.getAttribute("data-logged-in") === "true";
    var CART_KEY = "electrohub-cart";
    var GUEST_KEY = "eh_guest_cart";
    function sync() {
      if (loggedIn) return;
      try {
        var cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
        var compact = cart.map(function (it) {
          return { slug: it.slug || String(it.id || ""), qty: it.quantity || 1 };
        });
        localStorage.setItem(GUEST_KEY, JSON.stringify(compact));
      } catch (_) {}
    }
    sync();
    // Also sync on storage changes triggered from same tab via our writeCart
    var origSetItem = localStorage.setItem;
    localStorage.setItem = function (k, v) {
      origSetItem.call(localStorage, k, v);
      if (k === CART_KEY) sync();
    };
    // On login (detected by logged-in=true), attempt merge once.
    if (loggedIn) {
      try {
        var guest = JSON.parse(localStorage.getItem(GUEST_KEY) || "[]");
        if (guest && guest.length) {
          fetch("/api/cart/merge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: guest })
          }).then(function (r) { return r.ok ? r.json() : null; }).then(function (data) {
            if (!data || !data.items) return;
            // Merge into local cart
            var cur = [];
            try { cur = JSON.parse(localStorage.getItem(CART_KEY) || "[]"); } catch (_) {}
            data.items.forEach(function (it) {
              var ex = cur.find(function (c) { return c.id === it.id; });
              if (ex) ex.quantity = Math.max(ex.quantity || 1, it.quantity || 1);
              else cur.push(it);
            });
            localStorage.setItem(CART_KEY, JSON.stringify(cur));
            localStorage.removeItem(GUEST_KEY);
            if (window.showToast) window.showToast("Cart synced across devices.");
          }).catch(function () { /* silent */ });
        }
      } catch (_) {}
    }
  })();

  // Razorpay checkout handler — runs at capture phase so it can intercept the existing handler.
  (function ehRazorpay() {
    var shell = document.querySelector(".cr-co-shell");
    var form = document.querySelector("[data-checkout-form]");
    if (!shell || !form) return;
    var errorBanner = document.getElementById("eh-pay-error");
    var ready = shell.getAttribute("data-rzp-ready") === "1";
    var keyId = shell.getAttribute("data-rzp-key") || "";
    if (!ready) return; // fall back to existing COD-style submit

    function loadCheckoutScript() {
      return new Promise(function (resolve, reject) {
        if (window.Razorpay) { resolve(); return; }
        var s = document.createElement("script");
        s.src = "https://checkout.razorpay.com/v1/checkout.js";
        s.onload = function () { resolve(); };
        s.onerror = function () { reject(new Error("Failed to load Razorpay checkout.js")); };
        document.head.appendChild(s);
      });
    }

    function showError(msg) {
      if (errorBanner) {
        errorBanner.hidden = false;
        errorBanner.textContent = msg;
      }
      if (window.showToast) window.showToast(msg, { error: true });
    }
    function hideError() {
      if (errorBanner) { errorBanner.hidden = true; errorBanner.textContent = ""; }
    }

    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      event.stopImmediatePropagation();
      hideError();
      var cart = [];
      try { cart = JSON.parse(localStorage.getItem("electrohub-cart") || "[]"); } catch (_) {}
      if (!cart.length) { showError("Your cart is empty."); return; }

      var fd = new FormData(form);
      var shipping = {
        customerName: fd.get("customerName"),
        email: fd.get("email"),
        phone: fd.get("phone"),
        address: fd.get("address"),
        city: fd.get("city"),
        state: fd.get("state"),
        pincode: fd.get("pincode"),
        items: cart.map(function (i) { return { id: i.id, quantity: i.quantity }; })
      };
      var totalPaise = cart.reduce(function (s, i) { return s + Number(i.price) * Number(i.quantity); }, 0) * 100;

      var orderResp;
      try {
        var r = await fetch("/api/payment/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: totalPaise })
        });
        orderResp = await r.json();
        if (!r.ok) throw new Error(orderResp.error || "Could not initialise payment");
      } catch (err) {
        showError("Payment init failed: " + err.message);
        return;
      }

      try { await loadCheckoutScript(); }
      catch (err) { showError(err.message); return; }

      var rzp = new window.Razorpay({
        key: orderResp.keyId || keyId,
        amount: orderResp.amount,
        currency: orderResp.currency || "INR",
        order_id: orderResp.orderId,
        name: "MAPLE",
        description: "Order payment",
        prefill: {
          name: shipping.customerName || "",
          email: shipping.email || "",
          contact: shipping.phone || ""
        },
        handler: async function (response) {
          try {
            var vr = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                order: shipping
              })
            });
            var vjson = await vr.json();
            if (!vr.ok) throw new Error(vjson.error || "Verification failed");
            try { localStorage.setItem("electrohub-cart", "[]"); } catch (_) {}
            window.location.href = vjson.redirect || ("/order-success/" + encodeURIComponent(vjson.orderCode));
          } catch (err) {
            showError("Payment verification failed: " + err.message);
          }
        },
        modal: {
          ondismiss: function () {
            showError("Payment cancelled. You can retry when ready.");
          }
        },
        theme: { color: "#111111" }
      });
      rzp.on("payment.failed", function (resp) {
        showError("Payment failed: " + (resp && resp.error && resp.error.description || "unknown"));
      });
      rzp.open();
    }, true); // capture phase
  })();

  /* ==== MAPLE: address dialog ==== */
  (function () {
    var openBtn = document.querySelector("[data-mp-addr-open]");
    var dialog = document.querySelector("[data-mp-addr-dialog]");
    var form = document.querySelector("[data-mp-addr-form]");
    var cancel = document.querySelector("[data-mp-addr-cancel]");
    if (!dialog || !form) return;
    function openDialog() {
      try { dialog.showModal(); } catch (_) { dialog.setAttribute("open", "open"); }
    }
    if (openBtn) openBtn.addEventListener("click", openDialog);
    if (cancel) cancel.addEventListener("click", function () { dialog.close(); });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var payload = { city: data.get("city"), state: data.get("state"), pin: data.get("pin") };
      if (!/^\d{6}$/.test(payload.pin)) { alert("PIN must be 6 digits"); return; }
      fetch("/api/address", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (j.ok) {
            try { localStorage.setItem("mp_addr", JSON.stringify(payload)); } catch (_) {}
            location.reload();
          } else { alert(j.error || "Failed"); }
        });
    });

    function hasAddress() {
      if (document.cookie.split("; ").some(function (c) { return c.indexOf("mp_addr=") === 0; })) return true;
      try { return !!localStorage.getItem("mp_addr"); } catch (_) { return false; }
    }

    // Auto-prompt after signup/login via ?prompt_addr=1
    try {
      var params = new URLSearchParams(location.search);
      if (params.get("prompt_addr") === "1" && !hasAddress()) {
        setTimeout(openDialog, 200);
      }
    } catch (_) {}

    // Block checkout submit / payment until address is set
    var checkoutForm = document.querySelector("[data-checkout-form]");
    if (checkoutForm) {
      if (!hasAddress()) {
        setTimeout(openDialog, 250);
      }
      checkoutForm.addEventListener("submit", function (e) {
        if (!hasAddress()) {
          e.preventDefault();
          e.stopImmediatePropagation();
          openDialog();
        }
      }, true);
      // Also gate the "Continue to payment" / pay buttons (e.g. Stripe/PayPal/Wise stubs)
      document.querySelectorAll("[data-pay-btn], [data-continue-payment]").forEach(function (btn) {
        btn.addEventListener("click", function (e) {
          if (!hasAddress()) {
            e.preventDefault();
            e.stopImmediatePropagation();
            openDialog();
          }
        }, true);
      });
    }
  })();

  /* ==== MAPLE: theme swatch picker ==== */
  (function () {
    var swatches = document.querySelectorAll("[data-mp-theme-swatch]");
    if (!swatches.length) return;
    var current = window.__MAPLE_THEME__ || "snow";
    swatches.forEach(function (btn) {
      if (btn.getAttribute("data-mp-theme-swatch") === current) {
        btn.classList.add("is-active");
      }
      btn.addEventListener("click", function () {
        var theme = btn.getAttribute("data-mp-theme-swatch");
        fetch("/api/theme", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ theme: theme }) })
          .then(function (r) { return r.json(); })
          .then(function () { location.reload(); });
      });
    });
  })();

  /* ==== MAPLE: newsletter ==== */
  (function () {
    var form = document.querySelector("[data-mp-newsletter]");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = form.querySelector("[data-mp-newsletter-msg]");
      var email = form.querySelector("input[name=email]").value;
      fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email }) })
        .then(function (r) { return r.json(); })
        .then(function (j) { if (msg) msg.textContent = j.ok ? "Subscribed! Thanks." : (j.error || "Failed."); });
    });
  })();

  /* ==== MAPLE: contact form + support token ==== */
  (function () {
    var form = document.querySelector("[data-mp-contact-form]");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = Object.fromEntries(new FormData(form).entries());
      var msg = form.querySelector("[data-mp-contact-msg]");
      fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (msg) { msg.textContent = j.ok ? "Message sent. We'll be in touch." : (j.error || "Failed."); msg.className = "mp-contact-msg"; }
          if (j.ok) form.reset();
        });
    });
    var tokenBtn = document.querySelector("[data-mp-support-call]");
    if (tokenBtn) tokenBtn.addEventListener("click", function () {
      var email = form.querySelector("input[name=email]").value || "";
      fetch("/api/support-token", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email }) })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          var msg = form.querySelector("[data-mp-contact-msg]");
          if (msg) msg.textContent = j.ok ? ("Your token: " + j.token + ". We'll call within 24 hrs.") : (j.error || "Failed.");
        });
    });
  })();

  /* ==== MAPLE: admin upload dropzone + paste + word counter ==== */
  (function () {
    var form = document.querySelector("[data-mp-add-product]");
    if (!form) return;
    var dz = form.querySelector("[data-mp-drop]");
    var fileInput = form.querySelector("[data-mp-file]");
    var previews = form.querySelector("[data-mp-previews]");
    var descField = form.querySelector("[data-mp-desc]");
    var wc = form.querySelector("[data-mp-wordcount]");
    var msg = form.querySelector("[data-mp-form-msg]");
    var files = [];

    function refreshFiles() {
      var dt = new DataTransfer();
      files.forEach(function (f) { dt.items.add(f); });
      fileInput.files = dt.files;
      renderPreviews();
    }
    function renderPreviews() {
      previews.innerHTML = "";
      files.forEach(function (f, i) {
        var url = URL.createObjectURL(f);
        var d = document.createElement("div");
        d.className = "mp-preview-thumb";
        d.innerHTML = '<img src="' + url + '"><button type="button" aria-label="Remove">×</button>';
        d.querySelector("button").addEventListener("click", function () {
          files.splice(i, 1); refreshFiles();
        });
        previews.appendChild(d);
      });
    }
    function addFiles(list) {
      for (var i = 0; i < list.length; i++) {
        if (/^image\//.test(list[i].type)) files.push(list[i]);
      }
      refreshFiles();
    }
    if (dz) {
      dz.addEventListener("click", function (e) { if (e.target === dz || e.target.tagName === "P") fileInput.click(); });
      dz.addEventListener("dragover", function (e) { e.preventDefault(); dz.classList.add("is-drag"); });
      dz.addEventListener("dragleave", function () { dz.classList.remove("is-drag"); });
      dz.addEventListener("drop", function (e) {
        e.preventDefault(); dz.classList.remove("is-drag");
        if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files);
      });
    }
    if (fileInput) fileInput.addEventListener("change", function () { addFiles(fileInput.files); });
    form.addEventListener("paste", function (e) {
      if (!e.clipboardData) return;
      var items = e.clipboardData.items;
      var imgs = [];
      for (var i = 0; i < items.length; i++) {
        if (items[i].kind === "file" && /^image\//.test(items[i].type)) {
          var f = items[i].getAsFile();
          if (f) imgs.push(f);
        }
      }
      if (imgs.length) addFiles(imgs);
    });
    function updateWC() {
      var n = (descField.value || "").trim().split(/\s+/).filter(Boolean).length;
      wc.textContent = n + " words" + (n < 250 ? " (need " + (250 - n) + " more)" : "");
      wc.style.color = n >= 250 ? "#10b981" : "#a8071a";
    }
    if (descField && wc) { descField.addEventListener("input", updateWC); updateWC(); }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (msg) { msg.textContent = ""; msg.classList.remove("is-ok"); }
      var fd = new FormData(form);
      fetch("/admin/products/create", { method: "POST", body: fd })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          if (res.ok) { if (msg) { msg.textContent = "Product saved!"; msg.classList.add("is-ok"); } setTimeout(function () { location.href = "/admin?section=products"; }, 800); }
          else { if (msg) msg.textContent = res.j.error || "Failed"; }
        })
        .catch(function (err) { if (msg) msg.textContent = err.message; });
    });
  })();

  /* ==== MAPLE: checkout email verification + payment ==== */
  (function () {
    var shell = document.querySelector(".cr-co-shell");
    if (!shell) return;
    var emailEl = shell.querySelector("[data-mp-verify-email]");
    var sendBtn = shell.querySelector("[data-mp-send-otp]");
    var codeEl = shell.querySelector("[data-mp-verify-code]");
    var verifyBtn = shell.querySelector("[data-mp-verify-submit]");
    var statusEl = shell.querySelector("[data-mp-verify-status]");
    var changeLink = shell.querySelector("[data-mp-change-email]");
    var wise = shell.querySelector("[data-mp-wise]");
    var verified = false;
    function setStatus(t, err) { if (!statusEl) return; statusEl.textContent = t || ""; statusEl.classList.toggle("is-error", !!err); }
    function lock(e) {
      emailEl.readOnly = true;
      emailEl.style.background = "#f7f8fb";
      sendBtn.hidden = true; codeEl.hidden = true; verifyBtn.hidden = true;
      changeLink.hidden = false;
      verified = true;
      setStatus("🔒 Email verified: " + e, false);
    }
    if (sendBtn) sendBtn.addEventListener("click", function () {
      var email = emailEl.value.trim();
      if (!email) { setStatus("Enter an email", true); return; }
      fetch("/api/checkout/email-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email }) })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (j.ok) { codeEl.hidden = false; verifyBtn.hidden = false; setStatus("OTP sent. Check your inbox.", false); }
          else setStatus(j.error || "Failed", true);
        });
    });
    if (verifyBtn) verifyBtn.addEventListener("click", function () {
      var email = emailEl.value.trim();
      var code = (codeEl.value || "").trim();
      fetch("/api/checkout/verify-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email, code: code }) })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (j.ok) lock(email);
          else setStatus(j.error || "Invalid code", true);
        });
    });
    if (changeLink) changeLink.addEventListener("click", function (e) {
      e.preventDefault();
      emailEl.readOnly = false; emailEl.style.background = "";
      sendBtn.hidden = false; codeEl.hidden = true; codeEl.value = ""; verifyBtn.hidden = true;
      changeLink.hidden = true; verified = false; setStatus("", false);
    });
    // Wise panel toggle
    shell.addEventListener("change", function (e) {
      if (e.target && e.target.name === "pay") {
        if (wise) wise.hidden = e.target.value !== "wise";
      }
    });
    // Intercept "Place Order" to route through the right payment endpoint
    var form = shell.querySelector("[data-checkout-form]");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      var payVal = (form.querySelector('input[name=pay]:checked') || {}).value || "cod";
      if (payVal === "cod") return; // fall through to existing flow
      if (!verified) { e.preventDefault(); e.stopPropagation(); setStatus("Please verify your email before paying.", true); return; }
      e.preventDefault(); e.stopPropagation();
      var data = Object.fromEntries(new FormData(form).entries());
      var cart = [];
      try { cart = JSON.parse(localStorage.getItem("electrohub-cart") || "[]"); } catch (_) {}
      var items = cart.map(function (c) { return { id: c.id, quantity: c.quantity }; });
      var order = { customerName: data.customerName, email: data.email, phone: data.phone, address: data.address, city: data.city, state: data.state, pincode: data.pincode, items: items };
      var endpoint = payVal === "stripe" ? "/api/payment/stripe/create-session"
                   : payVal === "paypal" ? "/api/payment/paypal/create-order"
                   : "/api/payment/wise/confirm";
      fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ order: order }) })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          if (res.ok && res.j.ok) {
            try { localStorage.setItem("electrohub-cart", "[]"); } catch (_) {}
            location.href = res.j.checkoutUrl || res.j.redirect;
          } else { setStatus(res.j.error || "Payment failed", true); }
        });
    }, true);
  })();

})();
