(() => {
  "use strict";

  window.sunshine = {
    openEmailDraft(event) {
      event.preventDefault();
      const form = event.currentTarget;
      if (!form.reportValidity()) return false;
      const fields = Array.from(form.querySelectorAll("input, textarea")).map((field) => {
        const label = field.closest("label").childNodes[0].textContent.trim();
        return `${label}: ${field.value.trim() || "(not provided)"}`;
      }).join("\n");
      const subject = form.dataset.inquiry === "enrollment" ? "Enrollment inquiry" : "Tour request";
      window.location.href = `mailto:erika.byrd3@gmail.com?subject=${encodeURIComponent(`Sunshine Smiles - ${subject}`)}&body=${encodeURIComponent(fields)}`;
      return true;
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
})();
