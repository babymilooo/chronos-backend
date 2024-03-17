const authController = require('../controllers/auth-controller');
const accountIsActivatedMiddleware = require('../middlewares/account-is-activated-middleware');
const accountIsNotActivatedMiddleware = require('../middlewares/account-is-not-activated-middleware');

const validator = require('../middlewares/validator');
const Router = require('express').Router;

const router = new Router();

// router.get('/activate/:link', userController.activate);

router.post('/activate', validator, authController.activate);
router.post('/get-password-reset-link', validator, authController.requestPasswordResetLink);
router.post('/login', validator, accountIsActivatedMiddleware, authController.login);
router.post('/logout', validator, authController.logout);
router.post('/password-reset/:link', validator, authController.changePassword);
router.get('/refresh', validator, authController.refresh);
router.post('/registration', validator, authController.registration);
router.post('/renew-activation-code', validator, accountIsNotActivatedMiddleware, authController.renewActivationCode);

module.exports = router;