const mongoose = require('mongoose');
const { Schema } = mongoose;

const discussionSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { 
        type: String, 
        enum: ['career', 'contest', 'compensation', 'feedback', 'interview', 'general'], 
        default: 'general' 
    },
    author: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    upvotes: [{ type: Schema.Types.ObjectId, ref: 'user' }],
    downvotes: [{ type: Schema.Types.ObjectId, ref: 'user' }],
    views: { type: Number, default: 0 },
    comments: [{ type: Schema.Types.ObjectId, ref: 'comment' }]
}, { timestamps: true });

module.exports = mongoose.model('discussion', discussionSchema);