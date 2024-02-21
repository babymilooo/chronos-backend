const authController = require('../controllers/auth-controller');
const userController = require('../controllers/auth-controller');
const authMiddleware = require('../middlewares/auth-middleware');
const accountIsActivatedMiddleware = require('../middlewares/account-is-activated-middleware');
const accountIsNotActivatedMiddleware = require('../middlewares/account-is-not-activated-middleware');

const Router = require('express').Router;

const router = new Router();

const { body } = require('express-validator');

router.post('/registration',
    body('email').isEmail(),
    body('password').isLength({ min: 3, max: 32 }),
    userController.registration
);

router.post('/login', accountIsActivatedMiddleware, userController.login);
router.post('/logout', authMiddleware, userController.logout);
router.post('/get-password-reset-link', authController.requestPasswordResetLink);
router.post('/password-reset/:link', authController.changePassword);
// router.get('/activate/:link', userController.activate);
router.post('/activate', userController.activate);
router.post('/renew-activation-code', accountIsNotActivatedMiddleware, userController.renewActivationCode);
router.get('/refresh', userController.refresh);

module.exports = router;