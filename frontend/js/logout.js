const logoutBtn = document.querySelector("#logout-btn");

export function logout() {
    logoutBtn.addEventListener("click", () => {
        console.log("button clicked");
        localStorage.removeItem("token");
        console.log("Logged out successfully!");    
        window.location.replace("login.html");
    });
}
   