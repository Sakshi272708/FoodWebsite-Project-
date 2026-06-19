import { apiRequest } from "./api.js";
import { fetchCartItems, showAddedMsg } from "./cart.js";
import { state } from "./state.js";

const menuSection = document.querySelector("#menu-section");
const menuContainer = document.querySelector(".menu-container");
const body = document.body;
const overlay = document.querySelector(".form-overlay");
const addtitle = document.querySelector("#p-title");
const addprice = document.querySelector("#p-price");
const category = document.querySelector("#p-category");
const rating = document.querySelector("#p-rating");
const description = document.querySelector("#p-description");
const available = document.querySelector("#p-available");

const addProductBtn = document.querySelector("#add-product-btn");
export const added = document.querySelector("#successfully-added");

// to store item of product
let Products = [];
let filterFunction = null;
export function initProducts(applyFiltersFn) {
    filterFunction = applyFiltersFn;
}

export function getProducts() {
    return Products
}

export async function fetchProducts() {

    menuContainer.innerHTML = `
        <div class="food-card skeleton"></div>
        <div class="food-card skeleton"></div>
        <div class="food-card skeleton"></div>
    `;


    try {
        const data = await apiRequest("/all-food")

        Products = data.Products;
        if (filterFunction) {
            filterFunction();
        }

    } catch (error) {

        menuContainer.innerHTML = "<h4>Failed to load products</h4>";

        console.log(error);
    }

}

export function renderUI(data, value = "", words = []) {
    menuContainer.innerHTML = "";

    const fragment = document.createDocumentFragment();

    data.forEach(product => {
        const card = document.createElement("div");
        card.classList.add("food-card");

        let finaltitle = product.title;

        if (value) {
            words.forEach(word => {
                let regex = new RegExp(`(${word})`, "gi");

                finaltitle = finaltitle.replace(
                    regex,
                    `<span class="highlight">$1</span>`
                );
            });
        }

        const isAdmin = localStorage.getItem("role") === "admin";

        // for rating genrate stars
        let fullStars = Math.floor(product.rating);
        let hasHalfStar = product.rating % 1 >= 0.5;
        let emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        let stars =
            '<span class="full-star">★</span>'.repeat(fullStars) +
            (hasHalfStar ? '<span class="half-star">★</span>' : '') +
            '<span class="empty-star">★</span>'.repeat(emptyStars);

        const role = localStorage.getItem("role");
        console.log("Role:", role);

        card.innerHTML = `
        ${isAdmin ? `
            <button class="edit-product-btn" data-id="${product.id || product._id}">✏️</button>
            <button class="dlt-product-btn" data-id="${product.id || product._id}">❌</button>` : ""}
            <img src="${product.image}" class="main-img lazy-img" loading="lazy">
            <h3>${finaltitle}</h3>
            <p class="rating">${stars}</p>
            <small>${product.description || "No description available"}</small>
            <p class="price">₹${product.price}</p>
            ${!isAdmin ? `<button class="add-cart" data-id="${product.id || product._id}">
                Add to cart </button> ` : ""}
        `;

        fragment.appendChild(card);

        const img = card.querySelector(".lazy-img");
        if (img) {
            const show = () => img.classList.add("loaded");
            if (img.complete) show();
            else img.onload = show;
        }
    });

    menuContainer.appendChild(fragment);
}

menuContainer.addEventListener("click", async (e) => {

    //to edit existing menu card
    const editBtn = e.target.closest(".edit-product-btn");

    console.log(e.target);
    if (editBtn) {

        const idToEdit = editBtn.dataset.id;
        state.editingId = idToEdit;

        const product = Products.find(p => String(p.id || p._id) === String(idToEdit));

        console.log({
            addtitle,
            addprice,
            category,
            rating,
            description,
            available
        });
        // value updation
        // fill form
        addtitle.value = product.title;
        addprice.value = product.price;
        category.value = product.category;
        rating.value = product.rating || "";
        description.value = product.description || "";
        available.checked = product.isAvailable === true;

        // open form
        overlay.classList.add("show");
        body.classList.add("no-scroll");

        addProductBtn.innerText = "Update Product";
        added.innerText = "Product updated successfully";
        return;
    }

    // to dlt existing  menu card
    const dltButton = e.target.closest(".dlt-product-btn");
    if (dltButton) {
        dltButton.disabled = true;

        try {
            if (dltButton) {
                const idToDelete = dltButton.dataset.id;


                const data = await apiRequest(`/delete-food/${idToDelete}`, {
                    method: "DELETE"
                });

                await fetchProducts();
                return;
            }
        } catch (err) {
            console.log(err)
        } finally {
            dltButton.disabled = false;
            dltButton.innerText = "❌";
        }

        return;
    }


    //add to cart button 
    const btn = e.target.closest(".add-cart");
    if (!btn) return;

    console.log(e.target)

    btn.disabled = true;
    btn.innerText = "Adding...";

    try {
        let card = btn.closest(".food-card");

        let id = btn.dataset.id;
        // let title = card.querySelector("h3").innerText;
        let title = Products.find(p => String(p.id) === String(id)).title;
        let price = card.querySelector(".price").innerText;
        let image = card.querySelector(".main-img").src;
        console.log("price value:", price);
        console.log("price type:", typeof price);
        let cleanPrice = parseInt(price.replace(/[^\d]/g, ""));

        console.log("id =", id);
        console.log("title =", title);
        console.log("image =", image);
        console.log("price =", cleanPrice);
        //Add to cart Btn logic
        const token = localStorage.getItem("token");
        await apiRequest("/add-cartItem", {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                productId: id,
                title,
                image,
                price: cleanPrice
            })
        })

        await fetchCartItems()
        showAddedMsg();

    } catch (err) {
        console.log(err)
    }
    finally {
        btn.disabled = false;
        btn.innerText = "Add to Cart";
    }
});

