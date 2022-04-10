const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: { type: String, required: true, minLength: 3, maxLength: 20 },
    displayName: { type: String, required: true, minLength: 1, maxLength: 30 },
    password: { type: String, required: true, select: false },
});

module.exports = mongoose.model('User', UserSchema);
