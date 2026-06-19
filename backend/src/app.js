const express = require('express');
const cors = require('cors');
const multer = require('multer');
const productModel = require('./modals/product.modal');
const uploadFile = require('./storage/storage.service');
const cartModel = require('./modals/cart.modal');

const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken")
const userModel = require('./modals/user.modal');
const orderModel = require('./modals/order.modal');
const authMiddleware = require("./middleware/auth.middleware");
const adminMiddleware = require("./middleware/admin.middleware")

const app = express();

app.use(cors());
app.use(express.json());

const dataStorage = multer.memoryStorage();
const upload = multer({ storage: dataStorage });

//Login-signup apis

app.post('/register', async (req, res) => {

    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Please fill all fields"
            });
        }
        // check if user already exists
        const existingUser = await userModel.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // create user
        const newUser = await userModel.create({
            name,
            email,
            password: hashedPassword
        });

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email
            }
        });
    } catch (err) {
        console.log(err)
        res.status(201).json({
            message: "User registered failed",
        });
    }
});

app.post('/login', async (req, res) => {
    console.log("LOGIN API HIT");
    try {
        const { email, password } = req.body;

        //  check user exists
        const user = await userModel.findOne({ email });

        console.log("EMAIL RECEIVED:", email);
        console.log("USER FOUND:", user);

        if (user && (await bcrypt.compare(password, user.password))) {

            // create token
            const token = jwt.sign(
                {
                    //here payload is user info which we want to store in token
                    id: user._id,
                    role: user.role,
                    email: user.email,
                },
                process.env.JWT_SECRET,
                { expiresIn: "1d" }   //expiration time of token 
            )
            res.status(200).json({
                message: "Login successful",
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },


            });

        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get("/profile", authMiddleware, async (req, res) => {
    const userId = req.user.id;
    const user = await userModel.findById(userId).select("-password");

    res.json({
        message: "Protected route accessed",
        user
    });
});



//CART PRODUCTS APIs
app.get('/all-cartItem', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    try {
        const cartItems = await cartModel.find({ userId });

        res.status(200).json({
            message: "cart items fetched succesfully",
            cartItems: cartItems
        })
    } catch (err) {
        res.status(500).json({
            message: "Error in fetching cart items",
            Error: err.message
        })
    }
})

app.post('/add-cartItem', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    try {

        const {
            productId,
            title,
            price,
            image,
        } = req.body


        const existingItem = await cartModel.findOne({
            userId,
            productId
        });

        if (existingItem) {
            existingItem.quantity += 1;
            await existingItem.save()

            return res.status(200).json({
                message: "Quantity updated",
                cartItem: existingItem
            });
        }

        const cartNewItem = await cartModel.create({
            userId,
            productId,
            title,
            price,
            image,
            quantity: 1
        })

        res.status(201).json({
            message: "Item added to cart",
            cartItem: cartNewItem
        })
    } catch (err) {
        res.status(400).json({
            message: "Error adding cart item",
            err: err.message
        })
    }
})

app.patch('/add-quantity/:id', authMiddleware, async (req, res) => {
    const id = req.params.id;

    try {
        let cartItem = await cartModel.findById(id);

        if (!cartItem) {
            return res.status(404).json({
                message: "not Item not found"
            })
        }

        cartItem.quantity += 1;

        await cartItem.save();

        res.status(200).json({
            message: "Quantity increased",
            cartItem
        });
    } catch (err) {
        message: "error in adding item";
        error: err.message
        console.log(error)
    }
})

app.patch('/decrease-quantity/:id', authMiddleware, async (req, res) => {
    const id = req.params.id;

    try {
        let cartItem = await cartModel.findById(id)
        if (!cartItem) {
            return res.status(404).json({
                message: "not Item not found"
            })
        }

        if (cartItem.quantity > 1) {
            cartItem.quantity -= 1;

            await cartItem.save();
        }

        res.status(200).json({
            message: "Quantity increased",
            cartItem
        })
    } catch (err) {
        message: "error in decreasing item"
        error: err.message
    }
})

app.delete('/deletecart-item/:id', authMiddleware, async (req, res) => {
    const id = req.params.id

    try {
        await cartModel.findByIdAndDelete(id)

        res.status(201).json({
            message: "product deleted succesfully"
        })
    } catch (err) {
        message: "error in deleting"
        error: err.message
    }
})



//MENU PRODUCTS APIs
// get all MENU food items
app.get('/all-food', async (req, res) => {

    console.log("ALL FOOD API HIT");
    try {
        const { category, name, isAvailable } = req.query;
        let filter = {};
        // category filter
        if (category) {
            filter.category = category;
        }
        // name search
        if (name) {
            filter.productName = {
                $regex: name,
                $options: "i"
            };
        }
        if (isAvailable !== undefined) {
            filter.isAvailable = isAvailable === "true";
        }


        const products = await productModel.find(filter).lean(); // Use .lean() for faster queries and plain JS objects
        console.log(products);

        const formattedProducts = products.map(product => ({
            id: product._id,
            image: product.image,
            title: product.productName,
            price: product.price,
            description: product.description,
            category: product.category,
            rating: product.rating,
            isAvailable: product.isAvailable
        }));

        console.log(formattedProducts);
        res.status(200).json({
            message: "Products fetched successfully",
            Products: formattedProducts
        });
    } catch (err) {
        console.log("BACKEND ERROR:");
        console.log(err);

        res.status(500).json({
            message: "Error fetching products",
            error: err.message
        });
    }
})

// add a MENU food item
app.post('/add-food', upload.single('image'), authMiddleware,
    adminMiddleware, async (req, res) => {

        try {

            const {
                productName,
                price,
                category,
                description,
                rating,
                isAvailable
            } = req.body;

            console.log(req.body);
            console.log(req.body.isAvailable);
            console.log(typeof req.body.isAvailable);

            const uploadResponse = await uploadFile(req.file.buffer);

            const newProduct = await productModel.create({
                image: uploadResponse.url,
                productName,
                price,
                category,
                description,
                rating,
                isAvailable: isAvailable === "true"
            });

            console.log(newProduct);

            res.status(201).json({
                message: "Product added successfully",
                Product: newProduct
            });

        } catch (err) {

            console.log(err);

            res.status(500).json({
                message: "Error adding product",
                error: err.message
            });
        }
    });

// delete a MENU food item
app.delete('/delete-food/:id', authMiddleware,
    adminMiddleware, async (req, res) => {
        const { id } = req.params;
        try {
            await productModel.findByIdAndDelete(id);
            res.status(200).json({ message: "Product deleted successfully" });
        } catch (err) {
            res.status(500).json({ message: "Error deleting product", error: err.message });
        };
    });

// update a MENU food item
app.put('/update-food/:id', upload.single('image'), authMiddleware,
    adminMiddleware, async (req, res) => {

        const { id } = req.params;

        const {
            productName,
            price,
            category,
            description,
            rating,
            isAvailable
        } = req.body;

        console.log("REQ.BODY:", req.body);

        try {

            const updateData = {
                productName,
                price,
                category,
                description,
                rating,
                isAvailable: isAvailable === "true"
            };

            // upload new image if exists
            if (req.file) {

                const uploadResponse = await uploadFile(req.file.buffer);

                updateData.image = uploadResponse.url;
            }

            const updatedProduct = await productModel.findByIdAndUpdate(
                id,
                updateData,
                { new: true }
            );

            res.status(200).json({
                message: "Product updated successfully",
                Product: updatedProduct
            });

        } catch (err) {

            console.log(err);

            res.status(500).json({
                message: "Error updating product",
                error: err.message
            });
        }
    });

// get a food item by id
app.get('/get-food/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const product = await productModel.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json({
            message: "Product fetched successfully",
            Product: product
        });
    } catch (err) {
        res.status(500).json({ message: "Error fetching product", error: err.message });
    };
});


// order api
//place order
app.post('/place-order', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const cartItems = await cartModel.find({ userId });

        const totalAmount = cartItems.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        );

        const order = await orderModel.create({
            userId,
            items: cartItems,
            totalAmount,
            paymentStatus: "pending",
            orderStatus: "placed"
        });
        await cartModel.deleteMany({ userId });

        res.status(201).json({
            message: "Order placed successfully",
            order
        });

    } catch (err) {
        res.status(500).json({
            message: "Error placing order",
            error: err.message
        });
    }
});

//get all orders of a user
app.get('/my-orders', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        const orders = await orderModel.find({ userId }).populate("items.productId");
        res.status(200).json({
            message: "Orders fetched successfully",
            orders
        });
    } catch (err) {
        res.status(500).json({
            message: "Error fetching orders",
            error: err.message
        });
    }
});

//delete order by id (only if payment status is pending)
app.delete("/cancel-order/:id", authMiddleware, async (req, res) => {
    console.log("CANCEL ORDER API HIT");
    const order = await orderModel.findById(req.params.id);

    if (!order) {
        return res.status(404).json({
            message: "Order not found"
        });
    }

    if (order.paymentStatus === "paid") {
        return res.status(400).json({
            message: "Paid orders cannot be cancelled"
        });
    }

    if (order.userId.toString() !== req.user.id) {
        return res.status(403).json({
            message: "Unauthorized"
        });
    }
    await orderModel.findByIdAndDelete(req.params.id);

    res.json({
        message: "Order cancelled"
    });
});


//admin routes
app.get('/all-orders', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const orders = await orderModel.find()
            .sort({ createdAt: -1 });

        res.json({
            message: "All orders fetched successfully",
            orders
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });
    }
}
);

app.patch('/update-order-status/:id', authMiddleware, adminMiddleware, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const allowedStatuses = [
            "placed",
            "preparing",
            "out-for-delivery",
            "delivered"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid status"
            });
        }

        const updatedOrder = await orderModel.findByIdAndUpdate(
            id,
            {
                orderStatus: status
            },
            {
                new: true
            }
        );



        if (!updatedOrder) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        res.json({
            message: "Order status updated successfully",
            order: updatedOrder
        });
    } catch (err) {
        res.status(500).json({
            message: "Error updating order status",
            error: err.message
        });
    }

});


//payment gateway integration with razorpay
const razorpay = require("./config/payment");

app.post("/create-payment-order", authMiddleware, async (req, res) => {

    console.log("CREATE PAYMENT ORDER API HIT");
    console.log("REQUEST BODY:", req.body);
    try {

        const { amount } = req.body;

        if (!amount) {
            return res.status(400).json({
                message: "Amount is required"
            });
        }

        const options = {
            amount: amount * 100, // paise
            currency: "INR",
            receipt: "order_rcptid_" + Date.now()
        };

        const order = await razorpay.orders.create(options);

        res.json({
            order
        });

    } catch (err) {
        res.status(500).json({
            message: "Payment order failed",
            error: err.message
        });
    }
});

const crypto = require("crypto");
const Order = require("./modals/order.modal");

app.post("/verify-payment", authMiddleware, async (req, res) => {
    try {

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderId
        } = req.body;

        const body =
            razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_KEY_SECRET
            )
            .update(body.toString())
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                message: "Invalid payment signature"
            });
        }

        await Order.findByIdAndUpdate(orderId, {
            paymentStatus: "paid",
            paymentId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id
        });

        res.json({
            message: "Payment verified successfully"
        });

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
});
module.exports = app;