const { Schema, model } = require('mongoose');

const UserModel = new Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    isActivated: { type: Boolean, required: true },
    activationLink: { type: String },
})

module.exports = model('User', UserModel);