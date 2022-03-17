const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    title: { type: String, required: true, minLength: 1, maxLength: 40 },
    author: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    content: { type: String, required: true },
    timestamp: { type: Date, required: true },
    isPublished: { type: Boolean, required: true },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
});

module.exports = mongoose.model('Post', PostSchema);
