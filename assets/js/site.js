/* AURELLE storefront — cart, gallery and checkout.
   Language strings and the product catalogue are supplied by the page
   (window.AURELLE_I18N / window.AURELLE_CATALOG / window.AURELLE_LOCALE). */
(function () {
  "use strict";

  var CFG = window.AURELLE_CONFIG || {};
  var I18N = window.AURELLE_I18N || {};
  var CATALOG = window.AURELLE_CATALOG || {};
  var LOCALE = window.AURELLE_LOCALE || "en-US";
  var KEY = "aurelle.cart.v1";
  var ROOT = window.AURELLE_ROOT || "";

  function asset(path) { return path ? ROOT + path : path; }

  function t(key) { return I18N[key] || key; }

  function money(value) {
    try {
      return new Intl.NumberFormat(LOCALE, {
        style: "currency", currency: CFG.currency || "USD",
        minimumFractionDigits: 2, maximumFractionDigits: 2
      }).format(value);
    } catch (e) {
      return "$" + Number(value).toFixed(2);
    }
  }

  function readCart() {
    try {
      var raw = JSON.parse(localStorage.getItem(KEY) || "[]");
      if (!Array.isArray(raw)) return [];
      return raw.filter(function (i) {
        return i && CATALOG[i.code] && i.qty > 0;
      }).map(function (i) {
        return { code: i.code, qty: Math.min(99, Math.max(1, parseInt(i.qty, 10) || 1)), variant: i.variant || 0 };
      });
    } catch (e) { return []; }
  }

  function writeCart(items) {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {}
    paintCount();
    document.dispatchEvent(new CustomEvent("aurelle:cart"));
  }

  function paintCount() {
    var n = readCart().reduce(function (s, i) { return s + i.qty; }, 0);
    var nodes = document.querySelectorAll("[data-cart-count]");
    for (var k = 0; k < nodes.length; k++) {
      nodes[k].textContent = n;
      nodes[k].style.display = n ? "" : "none";
    }
  }

  function addItem(code, qty, variant) {
    var items = readCart();
    var found = null;
    for (var i = 0; i < items.length; i++) {
      if (items[i].code === code && items[i].variant === variant) { found = items[i]; break; }
    }
    if (found) found.qty = Math.min(99, found.qty + qty);
    else items.push({ code: code, qty: qty, variant: variant });
    writeCart(items);
  }

  function variantLabel(code, index) {
    var p = CATALOG[code];
    if (!p || !p.variants || !p.variants[index]) return "";
    return p.variants[index].label;
  }

  function subtotal(items) {
    return items.reduce(function (s, i) {
      return s + (CATALOG[i.code] ? CATALOG[i.code].price * i.qty : 0);
    }, 0);
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  function toast(message) {
    var old = document.querySelector(".aurelle-toast");
    if (old) old.remove();
    var box = el("div", "aurelle-toast", message);
    box.setAttribute("role", "status");
    box.style.cssText = "position:fixed;left:50%;bottom:26px;transform:translateX(-50%);" +
      "background:#2c2723;color:#fbf7f4;padding:.8rem 1.3rem;font-size:.72rem;" +
      "letter-spacing:.14em;text-transform:uppercase;z-index:99;box-shadow:0 18px 40px -24px rgba(0,0,0,.6)";
    document.body.appendChild(box);
    setTimeout(function () { box.style.opacity = "0"; box.style.transition = "opacity .4s"; }, 2200);
    setTimeout(function () { if (box.parentNode) box.remove(); }, 2800);
  }

  /* ------------------------------------------------------------- product page */
  function initProduct() {
    var page = window.AURELLE_PAGE;
    if (!page || !page.code) return;
    var code = page.code;

    var main = document.querySelector("[data-gallery-main]");
    var thumbs = document.querySelectorAll("[data-thumb]");
    for (var i = 0; i < thumbs.length; i++) {
      thumbs[i].addEventListener("click", function () {
        var src = this.getAttribute("data-src");
        if (main && src) main.setAttribute("src", src);
        var all = document.querySelectorAll("[data-thumb]");
        for (var j = 0; j < all.length; j++) all[j].classList.remove("is-active");
        this.classList.add("is-active");
      });
    }

    var chosen = 0;
    var options = document.querySelectorAll("[data-variant]");
    for (var v = 0; v < options.length; v++) {
      options[v].addEventListener("click", function () {
        chosen = parseInt(this.getAttribute("data-variant"), 10) || 0;
        for (var j = 0; j < options.length; j++) options[j].setAttribute("aria-pressed", "false");
        this.setAttribute("aria-pressed", "true");
        var sib = document.querySelector("[data-gallery-main]");
        var imgs = CATALOG[code] && CATALOG[code].variants ? CATALOG[code].variants[chosen].image : null;
        if (!imgs) {
          var allThumbs = document.querySelectorAll("[data-thumb]");
          var pick = allThumbs[Math.min(chosen + 1, allThumbs.length - 1)];
          if (pick) imgs = pick.getAttribute("data-src");
        }
        if (sib && imgs) sib.setAttribute("src", asset(imgs));
      });
    }

    var qtyInput = document.querySelector("[data-qty-input]");
    var minus = document.querySelector("[data-qty-minus]");
    var plus = document.querySelector("[data-qty-plus]");
    if (minus && qtyInput) minus.addEventListener("click", function () {
      qtyInput.value = Math.max(1, (parseInt(qtyInput.value, 10) || 1) - 1);
    });
    if (plus && qtyInput) plus.addEventListener("click", function () {
      qtyInput.value = Math.min(99, (parseInt(qtyInput.value, 10) || 1) + 1);
    });

    var addBtn = document.querySelector("[data-add]");
    if (addBtn) addBtn.addEventListener("click", function () {
      var qty = qtyInput ? Math.min(99, Math.max(1, parseInt(qtyInput.value, 10) || 1)) : 1;
      addItem(code, qty, chosen);
      toast(t("added"));
    });
  }

  /* ------------------------------------------------------------- cart page */
  function initCart() {
    var host = document.querySelector("[data-cart-list]");
    if (!host) return;
    var sumSub = document.querySelector("[data-sum-subtotal]");
    var sumTotal = document.querySelector("[data-sum-total]");
    var count = document.querySelector("[data-sum-count]");
    var empty = document.querySelector("[data-cart-empty]");
    var body = document.querySelector("[data-cart-body]");
    var summary = document.querySelector("[data-cart-summary]");

    function render() {
      var items = readCart();
      host.innerHTML = "";
      if (!items.length) {
        if (empty) empty.hidden = false;
        if (body) body.hidden = true;
        if (summary) summary.hidden = true;
        paintCount();
        return;
      }
      if (empty) empty.hidden = true;
      if (body) body.hidden = false;
      if (summary) summary.hidden = false;

      items.forEach(function (item) {
        var p = CATALOG[item.code];
        var row = el("div", "cart-row");

        var img = el("img");
        img.src = asset(p.image); img.alt = p.name; img.loading = "lazy";
        row.appendChild(img);

        var meta = el("div", "cart-meta");
        meta.appendChild(el("span", "pcard-code", item.code));
        meta.appendChild(el("h3", "", p.name));
        var vl = variantLabel(item.code, item.variant);
        if (vl) meta.appendChild(el("span", "variant", vl));

        var qty = el("div", "qty");
        qty.style.marginTop = ".4rem";
        var dec = el("button", "", "−"); dec.type = "button"; dec.setAttribute("aria-label", t("decrease"));
        var inp = el("input"); inp.type = "number"; inp.min = "1"; inp.max = "99"; inp.value = item.qty;
        inp.setAttribute("aria-label", t("quantity"));
        var inc = el("button", "", "+"); inc.type = "button"; inc.setAttribute("aria-label", t("increase"));
        dec.addEventListener("click", function () { item.qty = Math.max(1, item.qty - 1); writeCart(items); render(); });
        inc.addEventListener("click", function () { item.qty = Math.min(99, item.qty + 1); writeCart(items); render(); });
        inp.addEventListener("change", function () {
          item.qty = Math.min(99, Math.max(1, parseInt(inp.value, 10) || 1));
          writeCart(items); render();
        });
        qty.appendChild(dec); qty.appendChild(inp); qty.appendChild(inc);
        meta.appendChild(qty);
        row.appendChild(meta);

        var side = el("div", "cart-side");
        side.appendChild(el("span", "line-price", money(p.price * item.qty)));
        var rm = el("button", "remove", t("remove")); rm.type = "button";
        rm.addEventListener("click", function () {
          var next = readCart().filter(function (i) { return !(i.code === item.code && i.variant === item.variant); });
          writeCart(next); render();
        });
        side.appendChild(rm);
        row.appendChild(side);

        host.appendChild(row);
      });

      var sub = subtotal(items);
      if (sumSub) sumSub.textContent = money(sub);
      if (sumTotal) sumTotal.textContent = money(sub);
      if (count) count.textContent = String(items.reduce(function (s, i) { return s + i.qty; }, 0));
      paintCount();
    }

    render();
    document.addEventListener("aurelle:cart", render);
  }

  /* ------------------------------------------------------------- checkout */
  function orderRef() {
    var d = new Date();
    var ymd = String(d.getFullYear()).slice(2) +
      String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0");
    return "AR-" + ymd + "-" + String(Math.floor(1000 + Math.random() * 9000));
  }

  /* ------------------------------------------------------------- payment gateway */
  function loadPaypal(clientId, currency) {
    if (window.paypal && window.paypal.Buttons) return Promise.resolve(window.paypal);
    var loaded = document.querySelector("script[data-paypal-sdk]");
    if (loaded) {
      return new Promise(function (resolve, reject) {
        if (window.paypal && window.paypal.Buttons) return resolve(window.paypal);
        loaded.addEventListener("load", function () { resolve(window.paypal); });
        loaded.addEventListener("error", function () { reject(new Error("sdk")); });
      });
    }
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = "https://www.paypal.com/sdk/js?client-id=" + encodeURIComponent(clientId) +
        "&currency=" + encodeURIComponent(currency) + "&components=buttons&intent=capture";
      s.setAttribute("data-paypal-sdk", "1");
      s.onload = function () { resolve(window.paypal); };
      s.onerror = function () { reject(new Error("sdk")); };
      document.head.appendChild(s);
    });
  }

  function note(host, text) {
    var p = el("p", "sum-note");
    p.style.margin = ".7rem 0 0";
    p.textContent = text;
    host.appendChild(p);
  }

  /* Renders the "pay now" block on the confirmation page according to CFG.payments.mode. */
  function renderPayNow(panel, ref, items, method) {
    var host = panel.querySelector("[data-pay-now]");
    if (!host) return;
    host.innerHTML = "";
    host.hidden = true;
    if (method === "offline") return;

    var pay = CFG.payments || {};
    var mode = pay.mode || "payment-link";
    var total = subtotal(items);
    var currency = CFG.currency || "USD";
    var amount = Number(total).toFixed(2);

    if (mode === "paypal" && pay.paypalClientId) {
      host.hidden = false;
      loadPaypal(pay.paypalClientId, currency).then(function (pp) {
        if (!pp || !pp.Buttons) throw new Error("no buttons");
        pp.Buttons({
          style: { layout: "vertical", shape: "rect", color: "gold", label: "paypal", height: 46 },
          createOrder: function (data, actions) {
            return actions.order.create({
              purchase_units: [{
                reference_id: ref,
                description: "AURELLE order " + ref,
                amount: { value: amount, currency_code: currency }
              }],
              application_context: { shipping_preference: "NO_SHIPPING" }
            });
          },
          onApprove: function (data, actions) {
            return actions.order.capture().then(function (details) {
              host.innerHTML = "";
              note(host, t("paid") + " — " + (details && details.id ? details.id : ref));
              toast(t("paid"));
            });
          },
          onError: function () { toast(t("payFail")); }
        }).render(host);
        note(host, t("payNowNote"));
      }).catch(function () { note(host, t("payUnavailable")); });
      return;
    }

    var href = "";
    if (mode === "paypal-me" && pay.paypalMeHandle) {
      var handle = String(pay.paypalMeHandle).replace(/^@/, "");
      href = "https://www.paypal.com/paypalme/" + encodeURIComponent(handle) + "/" + amount + currency;
    } else if (mode === "stripe" && pay.stripePaymentLink) {
      href = pay.stripePaymentLink + (pay.stripePaymentLink.indexOf("?") >= 0 ? "&" : "?") +
        "client_reference_id=" + encodeURIComponent(ref);
    }
    if (!href) return;

    host.hidden = false;
    var a = el("a", "btn", pay.payNowLabel || t("payNow"));
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener";
    a.style.display = "inline-block";
    a.style.marginTop = "1rem";
    host.appendChild(a);
    note(host, t("payNowNote"));
  }

  function initCheckout() {
    var form = document.querySelector("[data-checkout-form]");
    if (!form) return;

    var methods = document.querySelectorAll("[data-paymethod]");
    for (var m = 0; m < methods.length; m++) {
      methods[m].addEventListener("change", function () {
        var wrap = this.closest ? this.closest(".paymethod") : this.parentNode;
        for (var j = 0; j < methods.length; j++) {
          var w = methods[j].closest ? methods[j].closest(".paymethod") : methods[j].parentNode;
          if (w) w.classList.toggle("is-selected", methods[j].checked);
        }
        if (wrap && this.checked) wrap.classList.add("is-selected");
      });
      if (methods[m].checked) {
        var w0 = methods[m].closest ? methods[m].closest(".paymethod") : methods[m].parentNode;
        if (w0) w0.classList.add("is-selected");
      }
    }

    function renderLines() {
      var host = document.querySelector("[data-order-lines]");
      var items = readCart();
      if (!host) return;
      host.innerHTML = "";
      items.forEach(function (item) {
        var p = CATALOG[item.code];
        var line = el("div", "order-line");
        var img = el("img"); img.src = asset(p.image); img.alt = p.name; img.loading = "lazy";
        var mid = el("div");
        mid.appendChild(el("div", "", p.name));
        var vl = variantLabel(item.code, item.variant);
        mid.appendChild(el("span", "", (vl ? vl + " · " : "") + item.qty + " × " + money(p.price)));
        var amount = el("div", "", money(p.price * item.qty));
        line.appendChild(img); line.appendChild(mid); line.appendChild(amount);
        host.appendChild(line);
      });
      var itemsCount = document.querySelector("[data-order-count]");
      var sub = document.querySelector("[data-order-subtotal]");
      if (itemsCount) itemsCount.textContent = String(items.reduce(function (s, i) { return s + i.qty; }, 0));
      if (sub) sub.textContent = money(subtotal(items));
    }

    renderLines();
    document.addEventListener("aurelle:cart", renderLines);

    var payModeNote = document.querySelector("[data-pay-note]");
    function paintNote() {
      if (!payModeNote) return;
      var picked = form.querySelector('input[name="paymethod"]:checked');
      payModeNote.textContent = picked && picked.value === "offline" ? t("noteOffline") : t("noteOnline");
    }
    for (var n = 0; n < methods.length; n++) methods[n].addEventListener("change", paintNote);
    paintNote();

    function collect() {
      var fd = new FormData(form);
      var data = {};
      fd.forEach(function (v, k) { data[k] = String(v || "").trim(); });
      return data;
    }

    function orderText(ref, data, items, method) {
      var lines = [t("orderRefLabel") + ": " + ref, ""];
      items.forEach(function (i) {
        var p = CATALOG[i.code];
        var vl = variantLabel(i.code, i.variant);
        lines.push(p.name + (vl ? " (" + vl + ")" : "") + " × " + i.qty + " — " + money(p.price * i.qty));
      });
      lines.push("", t("subtotal") + ": " + money(subtotal(items)),
        t("shipping") + ": " + t("quoted"),
        t("total") + ": " + money(subtotal(items)), "",
        t("payMethod") + ": " + (method === "offline" ? t("payOffline") : t("payOnline")), "",
        data.name, data.email, data.phone,
        data.address, data.city, data.postal, data.country,
        data.notes ? ("\n" + data.notes) : "");
      return lines.join("\n");
    }

    function showConfirm(ref, data, items, method) {
      var panel = document.querySelector("[data-confirm]");
      var wrapEl = document.querySelector("[data-checkout-main]");
      if (!panel) return;
      if (wrapEl) wrapEl.hidden = true;
      panel.hidden = false;

      var refEl = panel.querySelector("[data-confirm-ref]");
      if (refEl) refEl.textContent = ref;
      var sumEl = panel.querySelector("[data-confirm-sum]");
      if (sumEl) sumEl.textContent = money(subtotal(items));

      var linesEl = panel.querySelector("[data-confirm-lines]");
      if (linesEl) {
        linesEl.innerHTML = "";
        items.forEach(function (i) {
          var p = CATALOG[i.code];
          if (!p) return;
          var row = el("div", "confirm-line");
          var label = p.name + " × " + i.qty;
          var vl = variantLabel(i.code, i.variant);
          if (vl) label += " · " + vl;
          row.appendChild(el("span", "", label));
          row.appendChild(el("span", "", money(p.price * i.qty)));
          linesEl.appendChild(row);
        });
      }

      var bankBox = panel.querySelector("[data-bank]");
      if (bankBox) bankBox.hidden = method !== "offline";

      var onlineP = panel.querySelector("[data-confirm-online]");
      if (onlineP) onlineP.hidden = method === "offline";
      var offlineP = panel.querySelector("[data-confirm-offline]");
      if (offlineP) offlineP.hidden = method !== "offline";

      renderPayNow(panel, ref, items, method);

      var text = orderText(ref, data, items, method);
      var mail = panel.querySelector("[data-send-email]");
      if (mail) {
        mail.href = "mailto:" + CFG.email +
          "?subject=" + encodeURIComponent("AURELLE order " + ref) +
          "&body=" + encodeURIComponent(text);
      }
      var wa = panel.querySelector("[data-send-whatsapp]");
      if (wa) {
        wa.href = "https://wa.me/" + (CFG.whatsapp || "") + "?text=" + encodeURIComponent(text);
      }
      var copyBtn = panel.querySelector("[data-copy]");
      if (copyBtn) copyBtn.addEventListener("click", function () {
        var done = function () { toast(t("copied")); };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done, function () { toast(t("copyFail")); });
        } else {
          var ta = document.createElement("textarea");
          ta.value = text; document.body.appendChild(ta); ta.select();
          try { document.execCommand("copy"); done(); } catch (e) { toast(t("copyFail")); }
          ta.remove();
        }
      });

      var printBtn = panel.querySelector("[data-print]");
      if (printBtn) printBtn.addEventListener("click", function () { window.print(); });

      try {
        var log = JSON.parse(localStorage.getItem("aurelle.orders.v1") || "[]");
        log.unshift({ ref: ref, at: new Date().toISOString(), items: items, total: subtotal(items), method: method, customer: data });
        localStorage.setItem("aurelle.orders.v1", JSON.stringify(log.slice(0, 30)));
      } catch (e) {}

      /* the order is recorded; empty the bag so a refresh cannot duplicate it */
      try { localStorage.setItem(KEY, "[]"); } catch (e) {}
      paintCount();

      panel.scrollIntoView ? null : null;
      if (panel.focus) panel.focus();
    }

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var items = readCart();
      if (!items.length) { toast(t("bagEmptyShort")); return; }
      if (!form.checkValidity()) {
        form.reportValidity();
        toast(t("fillRequired"));
        return;
      }
      var data = collect();
      var picked = form.querySelector('input[name="paymethod"]:checked');
      var method = picked ? picked.value : "online";
      showConfirm(orderRef(), data, items, method);
    });
  }

  /* ------------------------------------------------------------- boot */
  function boot() {
    paintCount();
    initProduct();
    initCart();
    initCheckout();
    document.addEventListener("aurelle:cart", paintCount);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
