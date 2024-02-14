const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth-middleware');
const adminMiddleware = require('../middlewares/admin-middleware');
const ownerMiddleware = require('../middlewares/owner-middleware');
const adminOrOwnerMiddleware = require('../middlewares/admin-or-owner-middleware');
const userController = require('../controllers/user-controller');

// can do admin
router.get('/users/:id', authMiddleware, adminMiddleware, userController.getUserById);

// can do admin and any authorized user
router.get('/users', authMiddleware, userController.getUsers);
router.get('/users/username/:username', authMiddleware, userController.getUserByUsername);

// can do admin and user (account owner)
router.put('/users/update/:id', authMiddleware, adminOrOwnerMiddleware, userController.updateUserById);
// router.put('/users/update/:id/bio', authMiddleware, adminOrOwnerMiddleware, userController.updateProfileBio);
// router.put('/users/update/:id/email', authMiddleware, adminOrOwnerMiddleware, userController.updateProfileEmail);
// router.put('/users/update/:id/username', authMiddleware, adminOrOwnerMiddleware, userController.updateProfileUsername);
router.put('/users/update/:id/password', authMiddleware, adminOrOwnerMiddleware, userController.updateProfilePassword);
// router.delete('/users/update/:id', authMiddleware, adminOrOwnerMiddleware, userController.deleteUserById);

module.exports = router;