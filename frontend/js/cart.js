const cartContainer = document.querySelector(".cart-items");
const cart = document.querySelector(".cart")
const cartCount = document.querySelector("#cart-count");
const totalAmount = document.querySelector("#total-price");
const cartBtn = document.querySelector("#cart-btn")
const added = document.querySelector("#successfully-added");
const body = document.body
const myOrderBtn = document.getElementById("my-orders-btn");
const placeOrderBtn = document.querySelector("#place-order-btn");
const manageOrdersBtn = document.getElementById("manage-orders-btn");
import { showOrders , showAllOrders} from "./order.js";

export {
    fetchCartItems,
    showAddedMsg,
};

let isopen = false;
let currentView = "cart";

let cartItems = [];
let initialized = false;


//manage orders btn show only for admin
const isAdmin = localStorage.getItem("role") === "admin";

if (isAdmin) {
    cartBtn.style.display = "none";
    myOrderBtn.style.display = "none";
    manageOrdersBtn.style.display = "block";

    manageOrdersBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        console.log("manage orders clicked");
       
        currentView = "manage-orders";
        isopen = true;

        document.querySelector("#cart-title").innerText = "Manage Orders";

        //hide cart stuff
        totalAmount.style.display = "none";
        placeOrderBtn.style.display = "none";
        myOrderBtn.style.display = "none";

        //show loading text while fetching orders
        cartContainer.innerHTML = `
            <p>Loading orders...</p>
        `;
        //fetch and show all orders
        const orders = await showAllOrders();
        console.log(orders);

         //show cart sidebar
        cart.classList.remove("hide");
        body.classList.add("no-scroll");
    });
}


export function setupCart() {
    fetchCartItems()

    if (initialized) return;
    initialized = true;

    // stops from bubble 
    cart.addEventListener("click", (e) => {
        e.stopPropagation();
    });


    // check if click outside the cart close it
    document.addEventListener("click", (e) => {
        if (isopen && !cart.contains(e.target) && !cartBtn.contains(e.target) && !manageOrdersBtn.contains(e.target)) {
            cart.classList.add("hide");
            isopen = false;
            body.classList.remove("no-scroll");
        }
    });

    //show cart logic
    cartBtn.addEventListener("click", (e) => {
        e.stopPropagation();

        currentView = "cart";
        isopen = true;
        document.querySelector("#cart-title").innerText = "Your cart";
        totalAmount.style.display = "block";
        placeOrderBtn.style.display = "block";
        myOrderBtn.style.display = "block";
        cart.classList.remove("hide");
        body.classList.add("no-scroll");
        updateCartUI();
    });


    //show my orders logic
    myOrderBtn.addEventListener("click", async (e) => {
        e.stopPropagation();


        currentView = "orders";
        isopen = true;
        document.querySelector("#cart-title").innerText = "My Orders";
        cart.classList.remove("hide");
        body.classList.add("no-scroll");
        await showOrders();
    });


    //button functions
    cartContainer.addEventListener("click", async (e) => {
        const cartItemEl = e.target.closest(".cart-item");
        if (!cartItemEl) return;

        // const index = Array.from(cartContainer.children).indexOf(cartItemEl);
        const id = cartItemEl.dataset.id;

        const item = cartItems.find(
            item => item._id === id
        );
        // const item = cartItems[index];
        if (!item) return;

        const token = localStorage.getItem("token");

        //INCREASE
        if (e.target.classList.contains("plusBtn")) {
            e.target.disabled = true;
            try {
                const response = await fetch(`http://localhost:3000/add-quantity/${item._id}`, {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                if (!response.ok) throw new Error("Failed to update");
                const data = await response.json()

                cartItems = cartItems.map(i =>
                    i._id === item._id
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                );
                updateCartUI();

            } catch (err) {
                console.log(err)
            } finally {
                e.target.disabled = false;
            }
        }

        // DECREASE
        if (e.target.classList.contains("minusBtn")) {
            e.target.disabled = true;
            try {
                const response = await fetch(`http://localhost:3000/decrease-quantity/${item._id}`, {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })

                if (!response.ok) throw new Error("Failed to update");
                const data = await response.json()

                cartItems = cartItems.map(i =>
                    i._id === item._id
                        ? { ...i, quantity: i.quantity - 1 }
                        : i
                );
                updateCartUI();

            } catch (err) {
                console.log(err)
            } finally {

                e.target.disabled = false;
            }

        }


        // DELETE
        if (e.target.classList.contains("dltBtn")) {
            e.target.disabled = true;

            try {
                const response = await fetch(
                    `http://localhost:3000/deletecart-item/${item._id}`,
                    {
                        method: "DELETE",
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (!response.ok) throw new Error("Failed to delete");

                const data = await response.json();

                cartItems = cartItems.filter(i => i._id !== item._id);
                updateCartUI();

            } catch (err) {
                console.log(err);
            } finally {
                e.target.disabled = false;
                e.target.innerText = "🗑";
            }
        }

    })
};

//show sucess msg
function showAddedMsg() {
    added.classList.add("show");
    setTimeout(() => added.classList.remove("show"), 3000);
}

//cart data
async function fetchCartItems() {
    try {

        const token = localStorage.getItem("token");
        const response = await fetch(
            "http://localhost:3000/all-cartItem",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();
        console.log(data);

        cartItems = data.cartItems;
        updateCartUI();

    } catch (err) {
        console.log(err);
    }
}


function updateSummary() {
    let count = 0;
    let total = 0;

    cartItems.forEach(item => {
        count += item.quantity;
        total += item.price * item.quantity;
    });

    cartCount.innerText = `(${count})`;
    totalAmount.innerText = `Total: ₹${total}`;
};

// rerender cart ui
function updateCartUI() {
    totalAmount.style.display = "block";
    if (!Array.isArray(cartItems)) {
        console.error("cartItems is not an array", cartItems);
        return;
    }

    cartContainer.innerHTML = ""
    if (cartItems.length === 0) {

        cartContainer.innerHTML = `
            <p class="empty-msg">
                Your cart is empty <br>
                Add some delicious food 🍕
            </p>
        `;

        updateSummary();
        return
    }

    cartItems.forEach(item => {
        const cartItem = document.createElement("div");
        cartItem.classList.add("cart-item");
        cartItem.dataset.id = item._id;

        cartItem.innerHTML = `
            <div class="cart-img">
                <img src="${item.image || ''}">
            </div>
            <div class="card-details">
                <h4>${item.title}</h4>
                <h6 class="price">₹${item.price}</h6>
            </div>
            <div class="cart-controls">
                <button class="minusBtn" ${item.quantity === 1 ? "disabled" : ""}>-</button>
                <span class="item-count">${item.quantity}</span>
                <button class="plusBtn">+</button>
                <button class="dltBtn">🗑</button>
            </div>
        `;

        cartContainer.append(cartItem);
    });

    updateSummary();
}