const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');

const UserModel = new Schema({
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    bio: { type: String, default: '' },
    image: { type: String, default: '' },
    password: { type: String, required: true },
    activationPassword: { type: String },
    pendingPasswordUpdate: { type: Boolean, default: false },
    isActivated: { type: Boolean, default: false },
    // activationLink: { type: String },
});

module.exports = model('User', UserModel);