import { setupTheme } from "./theme.js";
import {
    setupCart
} from "./cart.js";
import {
    fetchProducts,
    getProducts,
    renderUI,
    initProducts
} from "./product.js";
import {
    state
} from "./state.js"
import { setupFilters } from "./filters.js";
import { setupSearch } from "./search.js";

import { applyFilters } from "./filters.js";
import { logout } from "./logout.js";
import {loadProfile} from "./profile.js";

import {  placeOrder } from "./order.js";
const body = document.body;
const heroBtn = document.querySelector("#hero-section button");
const menuSection = document.querySelector("#menu-section");

const clearInput = document.querySelector(".clear-input");
const navItems = document.querySelectorAll(".nav-links a");

const token = localStorage.getItem("token");

if (!token) {
    window.location.replace("login.html");
}

// TO SHOW MENU
const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.querySelector(".nav-links");

// MOBILE MENU TOGGLE
menuToggle.addEventListener("click", () => {

    navLinks.classList.toggle("show-menu");

    body.classList.toggle(
        "no-scroll",
        navLinks.classList.contains("show-menu")
    );

});

// CLOSE MENU AFTER CLICKING LINK
navItems.forEach(link => {
    link.addEventListener("click", () => {

        navLinks.classList.remove("show-menu");
        body.classList.remove("no-scroll");

    });
});

// for hero btn
heroBtn.addEventListener("click", () => {
    menuSection.scrollIntoView({
        behavior: "smooth"
    })
    setTimeout(() => {
        menuSection.classList.add("highlight");
        setTimeout(() => {
            menuSection.classList.remove("highlight");
        }, 1500)
    }, 500);
});

setupTheme();
setupCart();
placeOrder();
setupFilters(applyFilters);
setupSearch(applyFilters);

initProducts(applyFilters);
fetchProducts();

loadProfile();
logout();