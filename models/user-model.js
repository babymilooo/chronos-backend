const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');

const UserModel = new Schema({
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    bio: { type: String, default: '' },
    image: { type: String, default: '' },
    password: { type: String, required: true },
    isActivated: { type: Boolean, default: false },
    activationLink: { type: String },
});

UserModel.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

module.exports = model('User', UserModel);