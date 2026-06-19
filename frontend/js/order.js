const cartContainer = document.querySelector(".cart-items");
const totalAmount = document.querySelector("#total-price");
const placeOrderBtn = document.querySelector("#place-order-btn");
import { fetchCartItems } from "./cart.js";
//show orders
export async function showOrders() {
    const token = localStorage.getItem("token");

    const response = await fetch("http://localhost:3000/my-orders", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await response.json();

    totalAmount.style.display = "none";
    cartContainer.innerHTML = "";

    if (!data.orders || data.orders.length === 0) {
        cartContainer.innerHTML = `
            <p class="empty-msg">
                No orders found 📦
            </p>
        `;
        return;
    }

    data.orders.forEach(order => {

        const orderDiv = document.createElement("div");
        orderDiv.classList.add("order-card");

        const statusClass = `status-${order.orderStatus}`;

        let itemsHTML = "";

        order.items.forEach(item => {
            itemsHTML += `
            <div class="order-product">
                <span>${item.title}</span>
                <span>x${item.quantity}</span>
            </div>
        `;
        });

        orderDiv.innerHTML = `
        <div class="order-header">
            <h4>Order #${order._id.slice(-5)}</h4>

            <span class="${statusClass}">
                ${order.orderStatus}
            </span>
        </div>

        <div class="order-items">
            ${itemsHTML}
        </div>

        <div class="order-footer">
            <strong>Total: ₹${order.totalAmount}</strong>
            <p>
                Payment:
                    ${order.paymentStatus === "paid"
                ? "✅ Paid"
                : "⏳ Pending"}
            </p>

             ${order.paymentStatus === "pending"
                ? `
            <button
                 class="pay-now-btn"
                 data-id="${order._id}"
                data-amount="${order.totalAmount}">
                Pay Now
            </button>
            <button class="cancel-order-btn"
                data-id="${order._id}">
                Cancel Order
            </button>
        `
                : ""
            }
        </div>
    `;

        cartContainer.appendChild(orderDiv);
    });


    //pay now button
    document.querySelectorAll(".pay-now-btn").forEach(btn => {

        btn.addEventListener("click", async () => {

            const token = localStorage.getItem("token");

            const amount = Number(btn.dataset.amount);
            console.log("Amount:", amount);
            console.log("Type:", typeof amount);

            const response = await fetch(
                "http://localhost:3000/create-payment-order",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        amount
                    })
                }
            );

            const data = await response.json();

            console.log("RAZORPAY ORDER:", data);

            // Initialize Razorpay and show popup
            const options = {
                key: "rzp_test_T0Juhz4l9dKzcM", // your test key id
                amount: data.order.amount,
                currency: data.order.currency,
                order_id: data.order.id,

                name: "My Store",

                handler: async function (response) {

                    console.log("PAYMENT SUCCESS:", response);
                    const token = localStorage.getItem("token");

                    const verifyResponse = await fetch(
                        "http://localhost:3000/verify-payment",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`
                            },
                            body: JSON.stringify({
                                orderId: btn.dataset.id, // MongoDB order id
                                razorpay_order_id:
                                    response.razorpay_order_id,
                                razorpay_payment_id:
                                    response.razorpay_payment_id,
                                razorpay_signature:
                                    response.razorpay_signature
                            })

                        }
                    );
                    const verifyData = await verifyResponse.json();

                    console.log("VERIFY:", verifyData);

                    alert("Payment Successful!");
                    await showOrders();
                }
            };

            const rzp = new Razorpay(options);

            rzp.open();
        });
    });

    //cancel order buttonha
    document.querySelectorAll(".cancel-order-btn").forEach(btn => {

        btn.addEventListener("click", async () => {

            const token = localStorage.getItem("token");
            const orderId = btn.dataset.id;

            const confirmCancel = confirm(
                "Are you sure you want to cancel this order?"
            );

            if (!confirmCancel) return;

            try {

                const response = await fetch(
                    `http://localhost:3000/cancel-order/${orderId}`,
                    {
                        method: "DELETE",
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message);
                }

                alert(data.message);

                await showOrders(); // refresh orders

            } catch (err) {

                console.error("Cancel order error:", err);

                alert(err.message);
            }
        });

    });
}


//place order
export async function placeOrder() {
    placeOrderBtn.addEventListener("click", async () => {
        try {
            const token = localStorage.getItem("token");

            placeOrderBtn.textContent = "Placing Order..."; // Show loading state
            placeOrderBtn.disabled = true; // Disable button to prevent multiple clicks

            const response = await fetch("http://localhost:3000/place-order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            await fetchCartItems();

        } catch (error) {
            console.error("Error placing order:", error);
            alert("Failed to place order. Please try again.");
        } finally {
            placeOrderBtn.textContent = "Place Order"; // Reset button text
            placeOrderBtn.disabled = false; // Re-enable button
        }
    });
}

//show all to manage orders admin 
export async function showAllOrders() {
    const token = localStorage.getItem("token");

    const response = await fetch(
        "http://localhost:3000/all-orders",
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const data = await response.json();

    cartContainer.innerHTML = "";
    data.orders.forEach(order => {

        const orderDiv = document.createElement("div");
        orderDiv.classList.add("order-card");

        let itemsHTML = "";
        order.items.forEach(item => {
            itemsHTML += `
            <div class="order-product">
                <span>${item.title}</span>
                <span>x${item.quantity}</span>
            </div>
        `;
        });


        orderDiv.innerHTML = `
        <h4>Order #${order._id.slice(-5)}</h4>
        <div class="order-items">
            ${itemsHTML}</div>
        <p>Total: ₹${order.totalAmount}</p>

        <select class="status-select" data-id="${order._id}">
    <option value="placed"
        ${order.orderStatus === "placed" ? "selected" : ""}>
        Placed
    </option>

    <option value="preparing"
        ${order.orderStatus === "preparing" ? "selected" : ""}>
        Preparing
    </option>

    <option value="out-for-delivery"
        ${order.orderStatus === "out-for-delivery" ? "selected" : ""}>
        Out For Delivery
    </option>

    <option value="delivered"
        ${order.orderStatus === "delivered" ? "selected" : ""}>
        Delivered
    </option>
</select>
    `;

        cartContainer.appendChild(orderDiv);
    });


    //admin change order status
    document.querySelectorAll(".status-select").forEach(select => {
        select.addEventListener("change", async (e) => {
            const orderId = e.target.dataset.id;
            const newStatus = e.target.value;

            const token = localStorage.getItem("token");

            try {
                const response = await fetch(
                    `http://localhost:3000/update-order-status/${orderId}`,
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            status: newStatus
                        })
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message);
                }

                console.log("STATUS UPDATED:", data);
                await showAllOrders(); // Refresh the orders list to reflect changes

            } catch (err) {
                console.log("Error updating status:", err.message);
            }
        });
    });
    console.log("ALL ORDERS:", data);

    return data.orders;
}