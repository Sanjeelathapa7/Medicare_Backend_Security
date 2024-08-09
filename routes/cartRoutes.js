// module.exports = router;
const express = require('express');
const router = express.Router();
const { createCart, getUserCart, removeFromCart, updateCartItemQuantity } = require('../controllers/cartController');

// // Create a cart
router.post('/create_cart', createCart);
router.get('/get_cart/:id', getUserCart);
router.delete("/remove_cart/:id", removeFromCart)
router.put("/update_cart/:id", updateCartItemQuantity)
module.exports = router;