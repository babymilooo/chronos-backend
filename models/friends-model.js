const { Schema, model } = require('mongoose');

const FriendModel = new Schema({
    user1: { type: Schema.Types.ObjectId, ref: 'User' },
    user2: { type: Schema.Types.ObjectId, ref: 'User' }
});

module.exports = model('Friends', FriendModel);