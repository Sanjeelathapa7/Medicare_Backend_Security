const Cart = require("../model/cartModel");
const User = require("../model/userModel");

const createCart = async (req, res) => {
    try {
        const { userId, quantity, productId } = req.body;

        // Validation
        if (!userId || !quantity || !productId) {
            return res.json({
                success: false,
                message: "User ID, quantity and quantity are required fields",
            });
        }

        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            cart = new Cart({ user: userId, cartItems: [] });
        }

        // Check if the product is already in the cart
        const existingItemIndex = cart.cartItems.findIndex(
            (item) => item.product.toString() === productId
        );

        if (existingItemIndex !== -1) {
            // If the product is in the cart, inform the user
            return res.json({
                success: false,
                message: "Product is already added to the cart",
            });
        }

        // If the product is not in the cart, add a new item
        cart.cartItems.push({ product: productId, quantity });

        await cart.save();
        res.status(201).json({
            success: true,
            message: "Product added to cart successfully",
            cart,
        });
    } catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ success: false, message: "Failed to add product to cart" });
    }
};

const getUserCart = async (req, res) => {
    const userId = req.params.id;

    try {
        const cart = await Cart.findOne({ user: userId }).populate({
            path: "cartItems.product",
            select: "productName productCategory productPrice productImageUrl",
        });

        if (!cart) {
            return res.json({
                success: true,
                message: "User cart is empty",
                cart: [],
            });
        }

        res.json({
            success: true,
            message: "User cart fetched successfully",
            cart: cart.cartItems,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json("Server error");
    }
};

const removeFromCart = async (req, res) => {
    try {
        const cartItemId = req.params.id; // Corrected parameter name

        // Find and remove the cart item by its ID
        const cart = await Cart.findOneAndUpdate(
            { "cartItems._id": cartItemId }, // Find cart item by its ID
            { $pull: { cartItems: { _id: cartItemId } } }, // Remove the cart item
            { new: true } // Return the updated cart
        );

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Item not found in cart",
            });
        }

        res.status(200).json({
            success: true,
            message: "Item removed from cart successfully",
            cart: cart.cartItems, // Return updated cart items
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

const updateCartItemQuantity = async (req, res) => {
    const { itemId, newQuantity } = req.body;

    try {
        const cartItem = await CartItem.findById(itemId);

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found",
            });
        }

        cartItem.quantity = newQuantity;
        await cartItem.save();

        res.status(200).json({
            success: true,
            message: "Quantity updated successfully",
            cartItem,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to update quantity",
        });
    }
};

module.exports = {
    createCart,
    getUserCart,
    removeFromCart,
    updateCartItemQuantity,
};

const mongoose = require("mongoose");

