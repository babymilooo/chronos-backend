const { Schema, model } = require('mongoose');

const UserModel = new Schema({
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    bio: { type: String, default: null },
    image: { type: String, default: null },
    password: { type: String, required: true },
    activationPassword: { type: String, default: null },
    pendingPasswordUpdate: { type: Boolean, default: false },
    isActivated: { type: Boolean, default: false },
    lastActive: { type: Date, default: Date.now },
    // timezone: { type: String, default: null },
});

module.exports = model('User', UserModel);