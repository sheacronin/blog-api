const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    author: { type: Schema.Types.ObjectId, required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, required: true },
    onPost: { type: Schema.Types.ObjectId, required: true },
});

module.exports = mongoose.model('Comment', CommentSchema);
