//import
const router = require('express').Router();

const orderController = require('../controllers/orderController.js');
// const { authGuardAdmin } = require('../middleware/authGuard.js');



router.post('/create', orderController.createOrderInfo)
// router.get('/getOrders', authGuardAdmin, orderController.getALlOrder)
router.get('/getOrders', orderController.getAllOrder)

router.get('/getOrdersByUser/:userId', orderController.getAllOrderByUserId)
// router.put("/update_order/:orderId/status",authGuardAdmin, orderController.updateOrder)
router.put("/update_order/:orderId/status", orderController.updateOrder)


module.exports = router;