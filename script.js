const root = document.body;
const themeToggle = document.getElementById("themeToggle");
const year = document.getElementById("year");
const links = document.querySelectorAll(".nav-links a");
const sections = [...document.querySelectorAll("main section[id]")];

year.textContent = new Date().getFullYear();

const savedTheme = localStorage.getItem("portfolio-theme");
if (savedTheme === "light") {
  root.classList.add("light");
  themeToggle.textContent = "☀️";
}

themeToggle.addEventListener("click", () => {
  root.classList.toggle("light");
  const lightMode = root.classList.contains("light");
  themeToggle.textContent = lightMode ? "☀️" : "🌙";
  localStorage.setItem("portfolio-theme", lightMode ? "light" : "dark");
});

const setActive = () => {
  const y = window.scrollY + 120;
  let current = "";
  for (const section of sections) {
    if (y >= section.offsetTop && y < section.offsetTop + section.offsetHeight) {
      current = section.id;
      break;
    }
  }
  links.forEach((link) => {
    link.style.color = link.getAttribute("href") === `#${current}` ? "var(--primary)" : "var(--muted)";
  });
};

window.addEventListener("scroll", setActive);
setActive();
