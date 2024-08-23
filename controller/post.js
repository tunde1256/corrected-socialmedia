const Post = require('../model/postmodel');
const User = require('../model/auth');
const { v4: uuidv4 } = require('uuid');
const logger = require('../logger');

const logWrapper = (fn, fnName) => {
    return async (req, res, next) => {
        try {
            logger.info(`${fnName} called with`, { params: req.params, body: req.body });
            await fn(req, res, next);  // Call the original function
            logger.info(`${fnName} completed successfully`);
        } catch (err) {
            logger.error(`Error in ${fnName}: ${err.message}`, { stack: err.stack });
            next(err);  // Pass the error to the error handler
        }
    };
};

exports.createPost = logWrapper(async (req, res, next) => {
    const { userId, desc, img } = req.body;

    // Check if required fields are provided
    if (!userId || !desc) {
        return res.status(400).json({ message: 'userId and desc are required' });
    }

    // Extract mentions from the description
    const mentions = typeof desc === 'string' ? desc.match(/@\w+/g) || [] : [];
    const mentionUserIds = [];

    // Find user IDs for mentioned usernames
    for (const mention of mentions) {
        const username = mention.slice(1); // Remove the '@' prefix
        const user = await User.findOne({ username });
        if (user) {
            mentionUserIds.push(user._id);
        }
    }

    // Create a new post
    const post = new Post({
        userId,
        desc,
        img,
        mentions: mentionUserIds,
    });

    const newPost = await post.save();
    res.status(201).json(newPost);
    next();
}, 'createPost');

exports.getPost = logWrapper(async (req, res) => {
    const post = await Post.findOne(req.params.userId);
    res.status(200).json(post);
}, 'getPost');

exports.updatePost = logWrapper(async (req, res) => {
    const { desc } = req.body;

    // Check if desc is provided
    if (!desc) {
        return res.status(400).json({ message: 'Description (desc) is required' });
    }

    // Extract mentions from desc
    const mentions = desc.match(/@\w+/g) || [];
    const mentionUserIds = [];

    // Find user IDs for mentioned usernames
    for (const mention of mentions) {
        const username = mention.slice(1); // Remove the '@' prefix
        const user = await User.findOne({ username });
        if (user) {
            mentionUserIds.push(user._id);
        }
    }

    // Update the post
    const updatedPost = await Post.findByIdAndUpdate(
        req.params.id,
        { ...req.body, mentions: mentionUserIds },
        { new: true }
    );

    if (!updatedPost) {
        return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json(updatedPost);
}, 'updatePost');


// Like/Dislike a post
exports.likePost = logWrapper(async (req, res, next) => {
    const post = await Post.findById(req.params.id);
    const userId = req.body.userId;

    if (!post) {
        return res.status(404).json({ message: 'Post not found' });
    }

    if (!post.likes.includes(userId)) {
        await post.updateOne({ $push: { likes: userId } });
        res.status(200).json({ message: 'Post has been liked' });
    } else {
        await post.updateOne({ $pull: { likes: userId } });
        res.status(200).json({ message: 'Post has been disliked' });
    }
}, 'likePost');

exports.deletePost = logWrapper(async (req, res) => {
    try {
        // Fetch the post by ID
        const post = await Post.findById(req.params.id);

        // Check if the post exists
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if the user is an admin or the owner of the post
        if (req.body.isAdmin || post.userId === req.body.userId) {
            // Perform the deletion
            await post.deleteOne();
            return res.status(200).json({ message: 'Post deleted successfully' });
        } else {
            // User is not authorized to delete this post
            return res.status(403).json({ message: 'You are not authorized to delete this post' });
        }
    } catch (err) {
        // Handle any errors that occur
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
}, 'deletePost');

exports.getAllPosts = logWrapper(async (req, res) => {
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
        .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(parseInt(limit));

    const totalPosts = await Post.countDocuments();

    res.status(200).json({
        posts,
        totalPages: Math.ceil(totalPosts / limit),
        currentPage: parseInt(page)
    });
}, 'getAllPosts');

exports.getPostsByUser = logWrapper(async (req, res) => {
    const posts = await Post.find({ userId: req.params.id }).sort({ createdAt: -1 });
    res.status(200).json(posts);
}, 'getPostsByUser');


// Add a comment to a post
exports.addComment = logWrapper(async (req, res) => {
    try {
        const { userId, text } = req.body;

        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find the post by ID
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Create and add the comment
        const comment = {
            userId,
            username: user.username,
            text,
            createdAt: new Date(),
        };
        post.comments.push(comment);

        const updatedPost = await post.save();
        res.status(200).json(updatedPost);
    } catch (err) {
        console.error('Error adding comment:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Delete a comment from a post
exports.deleteComment = logWrapper(async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(
            req.params.postId,
            { $pull: { comments: { _id: req.params.commentId } } },
            { new: true }
        );

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.status(200).json({ message: 'Comment deleted successfully', post });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

// Reply to a comment
exports.replyToComment = logWrapper(async (req, res) => {
    try {
        const { userId, text, commentId } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const post = await Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const comment = post.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const reply = {
            userId,
            username: user.username,
            text,
            createdAt: new Date(),
        };
        comment.replies.push(reply);

        const updatedPost = await post.save();
        res.status(200).json(updatedPost);
    } catch (err) {
        console.error('Error adding reply:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Delete a reply from a comment
exports.deleteReply = logWrapper(async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(
            req.params.postId,
            { $pull: { comments: { _id: req.params.commentId, replies: { _id: req.params.replyId } } } },
            { new: true }
        );

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.status(200).json({ message: 'Reply deleted successfully', post });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

// Update a comment
exports.updateComment = logWrapper(async (req, res) => {
    try {
        const { text } = req.body;
        const post = await Post.findByIdAndUpdate(
            req.params.postId,
            { $set: { 'comments.$[comment].text': text } },
            { new: true, arrayFilters: [{ 'comment._id': req.params.commentId }] }
        );

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.status(200).json(post);
    } catch (err) {
        console.error('Error updating comment:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

exports.likeComments = logWrapper(async function (req, res, next) {
    try {
        const comments = await Post.findByIdAndUpdate(
            req.params.commentId,
            { $push: { likesComments: req.body.userId } },
            { new: true }
        );

        // Check if the comment was found
        if (!comments) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Return the updated comment with the new like
        res.status(200).json(comments);
    } catch (err) {
        console.error('Error liking comments:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
    next();
});

exports.comments = logWrapper(async (req, res) => {
    try {
        // Extract userId and comment from the request body
        const { userId, comment } = req.body;

        // Ensure both userId and comment are provided
        if (!userId || !comment) {
            return res.status(400).json({ message: 'UserId and comment are required' });
        }

        // Generate a unique ID for the comment
        const commentId = uuidv4();

        // Create the new comment object
        const newComment = { commentId, userId, comment };

        // Find the post by its ID and push the new comment to the comments array
        const post = await Post.findByIdAndUpdate(
            req.params.id, 
            { $push: { comments: newComment } }, 
            { new: true }
        );

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.status(200).json({ message: 'Comment added successfully', post });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
})