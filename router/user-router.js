const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth-middleware');
const adminOrOwnerMiddleware = require('../middlewares/admin-or-owner-middleware');
const userController = require('../controllers/user-controller');
const { fileHandler, upload } = require('../services/file-service');
const validator = require('../middlewares/validator');

// can do admin and any authorized user
router.get('/users/friends', validator, authMiddleware, userController.getFriends);
router.get('/users/:id', validator, authMiddleware, userController.getUserById);
router.get('/users', validator, authMiddleware, userController.getUsers);
router.post('/users/addtofriend/:id', validator, authMiddleware, userController.addToFriends);
router.get('/users/:id/isfriend', validator, authMiddleware, userController.isFriend);
// can do admin and user (account owner)
router.patch('/users/update/:id', validator, authMiddleware, adminOrOwnerMiddleware, userController.updateUserById);
router.delete('/users/delete/:id', validator, authMiddleware, adminOrOwnerMiddleware, userController.deleteUserById);
router.patch('/users/avatars', validator, authMiddleware, upload.single('avatar'), fileHandler, userController.changeAvatar);
router.patch('/users/update/:id/password', validator, authMiddleware, adminOrOwnerMiddleware, userController.updateProfilePassword);

module.exports = router;