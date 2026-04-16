const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    siteNav.classList.toggle("is-open", !isOpen);
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle.setAttribute("aria-expanded", "false");
      siteNav.classList.remove("is-open");
    });
  });
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.18,
  }
);

document.querySelectorAll(".reveal").forEach((item) => observer.observe(item));

const loanForm = document.querySelector("#loan-form");
const successMessage = document.querySelector("#form-success");
const errorMessage = document.querySelector("#form-error");

if (loanForm && successMessage && errorMessage) {
  const submitButton = loanForm.querySelector('button[type="submit"]');
  const defaultButtonLabel = submitButton ? submitButton.textContent : "";

  loanForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!loanForm.checkValidity()) {
      loanForm.reportValidity();
      return;
    }

    successMessage.hidden = true;
    errorMessage.hidden = true;

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Envoi...";
    }

    const formData = new FormData(loanForm);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/create-loan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      successMessage.hidden = false;
      loanForm.reset();
      successMessage.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } catch (error) {
      errorMessage.hidden = false;
      errorMessage.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = defaultButtonLabel;
      }
    }
  });
}
