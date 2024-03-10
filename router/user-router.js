const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth-middleware');
const adminMiddleware = require('../middlewares/admin-middleware');
const ownerMiddleware = require('../middlewares/owner-middleware');
const adminOrOwnerMiddleware = require('../middlewares/admin-or-owner-middleware');
const userController = require('../controllers/user-controller');
const { fileHandler, upload } = require('../services/file-service');


// can do admin and any authorized user
router.get('/users/:id', authMiddleware, userController.getUserById);
router.get('/users', authMiddleware, userController.getUsers);

// can do admin and user (account owner)
router.patch('/users/update/:id', authMiddleware, adminOrOwnerMiddleware, userController.updateUserById);
router.patch('/users/avatars', authMiddleware, upload.single('avatar'), fileHandler, userController.changeAvatar);
router.patch('/users/update/:id/password', authMiddleware, adminOrOwnerMiddleware, userController.updateProfilePassword);

module.exports = router;
