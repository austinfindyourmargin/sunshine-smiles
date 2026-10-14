(() => {
  "use strict";

  window.sunshine = {
    fitPlaygroundForm(event) {
      const frame = event.currentTarget;
      const container = frame.parentElement;
      const fit = () => {
        const available = container.clientWidth;
        if (!available) return;
        // Playground's form needs at least 368px for its fields and consent text.
        const width = Math.max(368, available);
        const scale = available / width;
        frame.style.width = `${width}px`;
        frame.style.transform = `scale(${scale})`;
        container.style.height = `${Math.ceil(frame.offsetHeight * scale)}px`;
      };
      fit();
      new ResizeObserver(fit).observe(container);
    },
    async submitInquiry(event) {
      event.preventDefault();
      const form = event.currentTarget;
      if (form.dataset.submitting === "true" || !form.reportValidity()) return false;
      const button = form.querySelector('button[type="submit"]');
      const feedback = form.querySelector(".ss-form-feedback");
      const label = button.textContent;
      form.dataset.submitting = "true";
      form.setAttribute("aria-busy", "true");
      button.disabled = true;
      button.textContent = "Sending…";
      feedback.textContent = "";
      feedback.hidden = true;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      try {
        const data = new FormData(form);
        data.set("inquiry", form.dataset.inquiry);
        const response = await fetch(new URL(form.getAttribute("action"), location.href), {
          method: "POST",
          headers: { "Accept": "application/json", "X-Sunshine-Form": "1" },
          body: data,
          signal: controller.signal
        });
        const result = await response.json();
        if (!response.ok || result.success !== true) {
          throw new Error(result.message || "We couldn’t send your request. Please try again or contact us directly.");
        }
        return true;
      } catch (error) {
        feedback.textContent = error.name === "AbortError"
          ? "The connection timed out. Please contact us directly if you’re unsure whether your request went through."
          : error instanceof SyntaxError || error instanceof TypeError
            ? "We couldn’t confirm your request. Please try again or contact us directly."
            : error.message;
        feedback.hidden = false;
        return false;
      } finally {
        clearTimeout(timeout);
        delete form.dataset.submitting;
        form.removeAttribute("aria-busy");
        button.disabled = false;
        button.textContent = label;
      }
    }
  };

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    const toggle = document.getElementById("hamburger");
    if (toggle?.getAttribute("aria-expanded") === "true") {
      toggle.click();
      toggle.focus();
    }
  });

  // The template runtime adds anchor targets after the browser's initial hash jump.
  document.addEventListener("DOMContentLoaded", () => {
    if (!location.hash) return;
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); }
    catch { return; }
    const scrollToTarget = () => {
      const target = document.getElementById(id);
      if (!target || !target.getClientRects().length) return false;
      requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "start", behavior: "instant" }));
      return true;
    };
    if (scrollToTarget()) return;
    const observer = new MutationObserver(() => {
      if (scrollToTarget()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => observer.disconnect(), 10000);
  });
})();
