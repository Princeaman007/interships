const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middlewares/validate');
const { registerValidator, loginValidator } = require('../validators/authValidator');

router.post('/register', registerValidator,validate, authController.register);
router.get('/verify-email', authController.verifyEmail);
router.post('/login', loginValidator,validate, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);



module.exports = router;
