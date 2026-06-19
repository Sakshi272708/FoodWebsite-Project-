// for dark mode
export function setupTheme() {
    const themeToggle = document.querySelector("#theme-toggle");
    console.log(themeToggle);

    const savedTheme =
        localStorage.getItem("theme");

    if (savedTheme === "true") {
        document.body.classList.add("dark-theme");
    }

    themeToggle.addEventListener("click", () => {

        document.body.classList.toggle("dark-theme");

        const isDark =
            document.body.classList.contains("dark-theme");

        localStorage.setItem("theme", isDark);

    });
}