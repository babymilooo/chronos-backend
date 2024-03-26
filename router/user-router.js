const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth-middleware');
const adminOrOwnerMiddleware = require('../middlewares/admin-or-owner-middleware');
const userController = require('../controllers/user-controller');
const validator = require('../middlewares/validator');

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/users/friends', validator, authMiddleware, userController.getFriends);
router.get('/users/potential-friends', authMiddleware, userController.getPotentialFriends);
router.get('/users/:id', validator, authMiddleware, userController.getUserById);
router.get('/users', validator, authMiddleware, userController.getUsers);
router.post('/users/add-friend/:id', validator, authMiddleware, userController.addFriend);
router.delete('/users/remove-friend/:id', validator, authMiddleware, userController.removeFriend);
router.get('/users/:id/isfriend', validator, authMiddleware, userController.isFriend);

router.get('/user/avatar/:filename', userController.getAvatar);
router.put('/users/:id/update', authMiddleware, upload.single('image'), userController.updateUserById);
router.get('/users/:id/friends', authMiddleware, userController.getAllFriends);
// router.delete('/users/delete/:id', validator, authMiddleware, adminOrOwnerMiddleware, userController.deleteUserById);
// router.patch('/users/update/:id/password', validator, authMiddleware, adminOrOwnerMiddleware, userController.updateProfilePassword);

module.exports = router;