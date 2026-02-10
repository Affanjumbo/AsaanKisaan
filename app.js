const links = document.querySelectorAll(".nav-link");
const path = window.location.pathname;

links.forEach((link) => {
  if (link.getAttribute("href") && path.endsWith(link.getAttribute("href"))) {
    link.classList.add("active");
  }
});

const toast = document.createElement("div");
toast.className = "toast";
document.body.appendChild(toast);

function showToast(message) {
  if (!message) return;
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast._timer);
  showToast._timer = window.setTimeout(() => toast.classList.remove("show"), 2200);
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const action = button.dataset.action;
  if (action === "scroll") {
    const target = document.querySelector(button.dataset.target);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    showToast(button.dataset.message || "Opening section...");
  }

  if (action === "toast") {
    showToast(button.dataset.message || "Action completed.");
  }
});

const drawerOpeners = document.querySelectorAll("[data-drawer-open]");
const drawerClosers = document.querySelectorAll("[data-drawer-close]");
const drawer = document.querySelector(".drawer");

function openDrawer() {
  document.body.classList.add("drawer-open");
  if (drawer) drawer.setAttribute("aria-hidden", "false");
}

function closeDrawer() {
  document.body.classList.remove("drawer-open");
  if (drawer) drawer.setAttribute("aria-hidden", "true");
}

drawerOpeners.forEach((button) => {
  button.addEventListener("click", openDrawer);
});

drawerClosers.forEach((button) => {
  button.addEventListener("click", closeDrawer);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeDrawer();
});

document.addEventListener("submit", (event) => {
  const form = event.target.closest(".demo-form");
  if (!form) return;
  event.preventDefault();
  showToast(form.dataset.message || "Saved successfully.");
});
