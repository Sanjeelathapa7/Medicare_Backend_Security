// import
const router = require('express').Router();
const userController = require("../controllers/userController");
const { authGuard } = require('../middleware/authGuard');

// register api
router.post('/register', userController.createUser)

//login api
router.post('/login', userController.loginUser)

//forget api 
router.post('/reset_password', userController.resetPassword);
router.post('/reset_code', userController.verifyResetCode);
router.post('/update_password', userController.updatePassword);
router.post('/change_password', userController.changePassword);


// exporting
module.exports = router;