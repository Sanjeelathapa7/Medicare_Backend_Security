const router = require('express').Router();
const productController = require("../controllers/productController");
const {authGuardAdmin } = require('../middleware/authGuard');

router.get("/get_products", productController.getProducts)
router.get("/get_product/:id", productController.getSingleProduct)

router.post('/create_product', productController.createProduct)
router.put("/update_product/:id", productController.updateProduct)
router.delete("/delete_product/:id", productController.deleteProduct)

// router.post('/create_product', authGuardAdmin, productController.createProduct)
// router.put("/update_product/:id", authGuardAdmin, productController.updateProduct)
// router.delete("/delete_product/:id", authGuardAdmin, productController.deleteProduct)


module.exports = router;