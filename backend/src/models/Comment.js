const mongoose = require('mongoose');
const { Schema } = mongoose;

const commentSchema = new Schema({
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    discussionId: { type: Schema.Types.ObjectId, ref: 'discussion', required: true }
}, { timestamps: true });

module.exports = mongoose.model('comment', commentSchema);