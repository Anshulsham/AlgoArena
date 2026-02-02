const express = require('express');
const discussionRouter = express.Router();
const userMiddleware = require("../middleware/userMiddleware");
const { 
    createDiscussion, getAllDiscussions, getDiscussionById, 
    addComment, voteDiscussion,deleteDiscussion,deleteComment
} = require("../controllers/discussionController");

// Public Routes
discussionRouter.get("/all", getAllDiscussions);
discussionRouter.get("/get/:id", getDiscussionById);

// Protected Routes (User must be logged in)
discussionRouter.post("/create", userMiddleware, createDiscussion);
discussionRouter.post("/comment/:id", userMiddleware, addComment);
discussionRouter.put("/vote/:id", userMiddleware, voteDiscussion);

// --- Delete Routes ---
// Note: We use the same 'userMiddleware' because the controller handles the Admin check internally.

discussionRouter.delete("/delete/:id", userMiddleware, deleteDiscussion);
discussionRouter.delete("/comment/:id", userMiddleware, deleteComment);

module.exports = discussionRouter;