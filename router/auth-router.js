const authController = require('../controllers/auth-controller');
const userController = require('../controllers/auth-controller');
const authMiddleware = require('../middlewares/auth-middleware');
const accountIsActivatedMiddleware = require('../middlewares/account-is-activated-middleware');
const accountIsNotActivatedMiddleware = require('../middlewares/account-is-not-activated-middleware');

const validator = require('../middlewares/validator');
const Router = require('express').Router;

const router = new Router();

// router.get('/activate/:link', userController.activate);

router.post('/activate', validator, async (req, res, next) => {
    try {
        userController.activate(req, res, next);
    } catch (e) {
        next(e);
    }
});

router.post('/get-password-reset-link', validator, async (req, res, next) => {
    try {
        authController.requestPasswordResetLink(req, res, next);
    } catch (e) {
        next(e);
    }
});

router.post('/login', validator, accountIsActivatedMiddleware, async (req, res, next) => {
    try {
        userController.login(req, res, next);
    } catch (e) {
        next(e);
    }
});

router.post('/logout', validator, authMiddleware, async (req, res, next) => {
    try {
        userController.logout(req, res, next);
    } catch (e) {
        next(e);
    }
});

router.post('/password-reset/:link', validator, async (req, res, next) => {
    try {
        authController.changePassword(req, res, next);
    } catch (e) {
        next(e);
    }
});

router.get('/refresh', validator, async (req, res, next) => {
    try {
        userController.refresh(req, res, next);
    } catch (e) {
        next(e);
    }
});

router.post('/registration', validator, async (req, res, next) => {
    try {
        userController.registration(req, res, next);
    } catch (e) {
        next(e);
    }
});

router.post('/renew-activation-code', validator, accountIsNotActivatedMiddleware, async (req, res, next) => {
    try {
        userController.renewActivationCode(req, res, next);
    } catch (e) {
        next(e);
    }
});

module.exports = router;