const userName = document.querySelector("#username");
const openaddProductBtn = document.querySelector("#open-form-btn");


export async function loadProfile() {
    const token = localStorage.getItem("token");

    if (!token) return;

    try {
        const response = await fetch("http://localhost:3000/profile", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        if (!response.ok) {
            localStorage.removeItem("token");
            window.location.replace("login.html");
            return;
        }

        const data = await response.json();
        console.log("Role:", data.user.role);

        localStorage.setItem("role", data.user.role);
        const role = localStorage.getItem("role");

       if (role !== "admin" && openaddProductBtn) {
            console.log("Hiding add product button for non-admin user.");
            openaddProductBtn.style.display = "none";
        }

        const name =
            data.user.name.charAt(0).toUpperCase() +
            data.user.name.slice(1);
        userName.textContent = `Hi, ${name}`;
    } catch (err) {
        console.log(err);
    }
}

