const loginForm = document.querySelector("#login-form")
const loginMsg = document.querySelector("#login-msg")
const loginBtn = document.querySelector("#login-btn")

const token = localStorage.getItem("token");
if (token) {
    window.location.replace("index.html");
}

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;
    loginBtn.disabled = true;
    loginBtn.textContent = "Logging in...";
    try {
        const response = await fetch("http://foodwebsite-project.onrender.com/login", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email,
                password
            })
        })
        const data = await response.json();
        console.log(data)

        console.log(token)
        if (response.ok) {
            //save token
            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.user.role);
            
            setTimeout(() => {
                window.location.replace("index.html");
            }, 1000);

        } else {
            loginMsg.textContent = "something went wrong! Check your credentials and try again.";
            loginMsg.classList.add("error");
            console.log(data.error);
        }
    } catch (err) {
        console.log(err)
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = "Login";
    }

})

