const Discussion = require("../models/Discussion");
const Comment = require("../models/Comment");
const User = require("../models/user"); // Assuming your user model is 'user'

// --- 1. Create a New Discussion Post ---
// Route: POST /discussion/create
// Auth Required: YES
const createDiscussion = async (req, res) => {
    try {
        const { title, content, category } = req.body;
        const userId = req.result._id; // Taken from your Auth Middleware

        if (!title || !content) {
            return res.status(400).send("Title and Content are required");
        }

        // Create the discussion
        const newDiscussion = await Discussion.create({
            title,
            content,
            category: category || 'general', // Default if not provided
            author: userId
        });

        res.status(201).send(newDiscussion);

    } catch (err) {
        res.status(500).send("Error: " + err.message);
    }
};

// --- 2. Get All Discussions (List View) ---
// Route: GET /discussion/all
// Auth Required: NO (Publicly visible)
const getAllDiscussions = async (req, res) => {
    try {
        // Optional: Filter by category if passed in query (e.g., ?category=interview)
        const { category } = req.query;
        const filter = category ? { category } : {};

        const discussions = await Discussion.find(filter)
            .populate('author', 'firstName lastName') // Show author's name
            .select('-comments') // Don't load all comments in the list view for performance
            .sort({ createdAt: -1 }); // Newest first

        if (!discussions) return res.status(404).send("No discussions found");

        res.status(200).send(discussions);

    } catch (err) {
        res.status(500).send("Error: " + err.message);
    }
};

// --- 3. Get Single Discussion with Comments ---
// Route: GET /discussion/:id
// Auth Required: NO
const getDiscussionById = async (req, res) => {
    const { id } = req.params;

    try {
        if (!id) return res.status(400).send("ID is Missing");

        // Fetch discussion and populate author AND comments (with their authors)
        const discussion = await Discussion.findById(id)
            .populate('author', 'firstName lastName')
            .populate({
                path: 'comments',
                populate: { path: 'author', select: 'firstName lastName' }, // Nested populate for comment authors
                options: { sort: { createdAt: 1 } } // Oldest comments first
            });

        if (!discussion) return res.status(404).send("Discussion not found");

        // Increment view count (optional but good feature)
        discussion.views += 1;
        await discussion.save();

        res.status(200).send(discussion);

    } catch (err) {
        res.status(500).send("Error: " + err.message);
    }
};

// --- 4. Add a Comment to a Discussion ---
// Route: POST /discussion/:id/comment
// Auth Required: YES
const addComment = async (req, res) => {
    const { id } = req.params; // Discussion ID
    const { content } = req.body;
    const userId = req.result._id;

    try {
        if (!content) return res.status(400).send("Comment content is required");

        const discussion = await Discussion.findById(id);
        if (!discussion) return res.status(404).send("Discussion not found");

        // 1. Create the comment document
        const newComment = await Comment.create({
            content,
            author: userId,
            discussionId: id
        });

        // 2. Link comment to the discussion
        discussion.comments.push(newComment._id);
        await discussion.save();

        // Return the full comment with author details so UI updates instantly
        const populatedComment = await newComment.populate('author', 'firstName lastName');

        res.status(201).send(populatedComment);

    } catch (err) {
        res.status(500).send("Error: " + err.message);
    }
};

// --- 5. Vote on a Discussion (Upvote/Downvote) ---
// Route: POST /discussion/:id/vote
// Auth Required: YES
const voteDiscussion = async (req, res) => {
    const { id } = req.params;
    const { voteType } = req.body; // Expecting 'up' or 'down'
    const userId = req.result._id;

    try {
        const discussion = await Discussion.findById(id);
        if (!discussion) return res.status(404).send("Discussion not found");

        // Helper to check if user is in an array
        const isUpvoted = discussion.upvotes.includes(userId);
        const isDownvoted = discussion.downvotes.includes(userId);

        if (voteType === 'up') {
            if (isUpvoted) {
                // User clicked upvote again -> remove vote (toggle off)
                discussion.upvotes.pull(userId);
            } else {
                // Add upvote, remove downvote if exists
                discussion.upvotes.push(userId);
                discussion.downvotes.pull(userId);
            }
        } else if (voteType === 'down') {
            if (isDownvoted) {
                // User clicked downvote again -> remove vote
                discussion.downvotes.pull(userId);
            } else {
                // Add downvote, remove upvote if exists
                discussion.downvotes.push(userId);
                discussion.upvotes.pull(userId);
            }
        } else {
            return res.status(400).send("Invalid vote type");
        }

        await discussion.save();
        res.status(200).send(discussion); // Return updated object to UI

    } catch (err) {
        res.status(500).send("Error: " + err.message);
    }
};
const deleteDiscussion = async (req, res) => {
    const { id } = req.params;
    const userId = req.result._id;

    try {
        const discussion = await Discussion.findById(id);
        if (!discussion) return res.status(404).send("Discussion not found");

        // Fetch user to check role (Admin Check)
        const user = await User.findById(userId);
        
        // PERMISSION CHECK:
        // Allow if: (User is the Author) OR (User is Admin)
        if (discussion.author.toString() !== userId && user.role !== 'admin') {
            return res.status(403).send("You are not authorized to delete this post");
        }

        // Optional: Delete associated comments to clean up DB
        await Comment.deleteMany({ discussionId: id });

        await Discussion.findByIdAndDelete(id);
        res.status(200).send("Discussion deleted successfully");

    } catch (err) {
        res.status(500).send("Error: " + err.message);
    }
};

// --- 7. Delete a Comment ---
// Route: DELETE /discuss/comment/:id
// Logic: User must be Author OR Admin
const deleteComment = async (req, res) => {
    const { id } = req.params; // This is the comment ID
    const userId = req.result._id;

    try {
        const comment = await Comment.findById(id);
        if (!comment) return res.status(404).send("Comment not found");

        const user = await User.findById(userId);

        // PERMISSION CHECK:
        if (comment.author.toString() !== userId && user.role !== 'admin') {
            return res.status(403).send("You are not authorized to delete this comment");
        }

        // 1. Remove the comment ID from the Discussion's 'comments' array
        await Discussion.findByIdAndUpdate(comment.discussionId, {
            $pull: { comments: id }
        });

        // 2. Delete the actual comment document
        await Comment.findByIdAndDelete(id);

        res.status(200).send("Comment deleted successfully");

    } catch (err) {
        res.status(500).send("Error: " + err.message);
    }
};

module.exports = {
    // ... existing exports ...
    createDiscussion,
    getAllDiscussions,
    getDiscussionById,
    addComment,
    voteDiscussion,
    deleteDiscussion, // <--- Add this
    deleteComment     // <--- Add this
};