const signupForm = document.getElementById('signup-form');
const signupmsg = document.getElementById('signup-msg');
const signupBtn = document.querySelector("#signup-btn");

const token = localStorage.getItem("token");

if (token) {
    window.location.replace("index.html");
}

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    signupBtn.disabled = true;
    signupBtn.textContent = "Registering...";
    signupmsg.textContent = "";
    try {
        const response = await fetch("http://foodwebsite-project.onrender.com/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                name,
                email,
                password
            })
        });

        const data = await response.json();
        console.log(data);

        if (response.ok) {
            signupmsg.textContent = "Registration successful! Redirecting to login...";
            signupmmsg.classList.add("success");
            setTimeout(() => {
                window.location.replace("login.html");
            }, 1500);

        } else {
            signupmsg.textContent = data.message;

            signupBtn.disabled = false;
            signupBtn.textContent = "Sign Up";
        }

    } catch (err) {
        console.error(err);

        signupmsg.textContent = "Something went wrong";
        signupmsg.classList.add("error");

        signupBtn.disabled = false;
        signupBtn.textContent = "Sign Up";
    }
});
