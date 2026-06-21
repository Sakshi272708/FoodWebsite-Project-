import { state } from "./state.js"
import { fetchProducts, added } from "./product.js";
import { showAddedMsg } from "./cart.js";
import { applyFilters } from "./filters.js";

const body = document.body;
let addtitle = document.querySelector("#p-title");
let addprice = document.querySelector("#p-price");
let addimage = document.querySelector("#p-image");
let category = document.querySelector("#p-category");
let addProductBtn = document.querySelector("#add-product-btn")

let available = document.querySelector("#p-available");
let description = document.querySelector("#p-description");
let rating = document.querySelector("#p-rating");

const openBtn = document.querySelector("#open-form-btn");
const overlay = document.querySelector(".form-overlay");
const closeBtn = document.querySelector(".close-btn");




document.querySelector(".add-product-form").addEventListener("click", (e) => {
    e.stopPropagation();
});


openBtn.addEventListener("click", () => {
    overlay.classList.add("show")
    body.classList.add("offscroll")
});

closeBtn.addEventListener("click", (e) => {
    overlay.classList.remove("show")
    body.classList.remove("offscroll")
    body.classList.remove("no-scroll")
    


    state.editingId = null;
    addProductBtn.innerText = "Add Product";

    resetForm()
})

overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
        overlay.classList.remove("show")
        body.classList.remove("offscroll");
        body.classList.remove("no-scroll");

        resetForm()
    }

});

function resetForm() {
    addtitle.value = "";
    addprice.value = "";
    addimage.value = "";
    category.value = "veg";

    state.editingId = null;
    addProductBtn.innerText = "Add Product";
};

addProductBtn.addEventListener("click", async (e) => {
    console.log("BUTTON CLICKED");
    e.preventDefault();
    console.log("step 1")
    addProductBtn.disabled = true;

    const originalBtnText = state.editingId
        ? "Update Product"
        : "Add Product";

    addProductBtn.innerText = state.editingId
        ? "Updating..."
        : "Adding...";

    try {
        let titleValue = addtitle.value.trim();
        let imageFile = addimage.files[0];
        let priceValue = addprice.value;
        let categoryValue = category.value;

        let availableValue = available.value;
        let descriptionValue = description.value;
        let ratingValue = rating.value;

        console.log("DESCRIPTION:", descriptionValue);

        if (!titleValue || !priceValue) {
            alert("Please fill all fields");
            return;
        }

        if (priceValue <= 0) {
            alert("Price must be greater than 0");
            return;
        }

        const formData = new FormData();
        formData.append("productName", titleValue);
        formData.append("price", priceValue);
        formData.append("category", categoryValue);
        formData.append("isAvailable", availableValue);
        formData.append("description", descriptionValue);
        formData.append("rating", ratingValue);


        if (imageFile) {
            formData.append("image", imageFile);
        }

        if (!imageFile && !state.editingId) {
            alert("Please select image");
            return;
        }
        console.log("TOKEN:", localStorage.getItem("token"));
        // update product
        if (state.editingId) {
            console.log("EDITING ID:", state.editingId);
            const token = localStorage.getItem("token");
            const response = await fetch(`https://foodwebsite-project.onrender.com/update-food/${state.editingId}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            added.innerText = "Product updated successfully!!✅";

            state.editingId = null;
        }
        else {
            const token = localStorage.getItem("token");
            const response = await fetch("https://localhost:3000/add-food", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            added.innerText = "Product added successfully!!✅";
        }
        await fetchProducts();

        applyFilters();

        overlay.classList.remove("show");
        body.classList.remove("no-scroll");
        body.classList.remove("offscroll");

        resetForm();

        showAddedMsg();

    } catch (err) {

        console.log(err);
        alert("Something went wrong");

    } finally {
        addProductBtn.disabled = false;
        addProductBtn.innerText = originalBtnText;

    }
})


