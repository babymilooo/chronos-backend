const userController = require('../controllers/auth-controller');
const authMiddleware = require('../middlewares/auth-middleware');

const Router = require('express').Router;

const router = new Router();

const { body } = require('express-validator');

router.post('/registration',
    body('email').isEmail(),
    body('password').isLength({ min: 3, max: 32 }),
    userController.registration
);

router.post('/login', userController.login);
router.post('/logout', authMiddleware, userController.logout);
router.get('/activate/:link');
router.get('/refresh', userController.refresh);

module.exports = router;