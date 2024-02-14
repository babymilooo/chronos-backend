const { Schema, model } = require('mongoose');

const UserModel = new Schema({
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    bio: { type: String, default: '' },
    image: { type: String, default: '' },
    password: { type: String, required: true },
    isActivated: { type: Boolean, default: false },
    activationLink: { type: String },
})

module.exports = model('User', UserModel);