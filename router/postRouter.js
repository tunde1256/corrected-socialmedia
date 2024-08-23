const express = require('express')
const Router = express.Router()
const postController = require('../controller/post')
const verifyToken = require('../middleware/middleware');
const {isValidId} = require('../middleware/validator')

// Routes for post-related actions
// Router.post('/createPost', postController.createPost); // Create a new post
// // Router.get('/getAllPosts', postController.getAllPosts); // Get all posts
// Router.get('/getPost/:id', postController.getPost); // Get post by ID
// Router.get('/getPostsByUser/:userId', postController.getPostsByUser); // Get posts by user ID
// Router.put('/updatePost/:id', postController.updatePost); // Update a post by ID
// Router.delete('/deletePost/:id', postController.deletePost); // Delete a post by ID

// // // Routes for like-related actions
// Router.put('/likePost/:id', postController.likePost); // Like a post by ID
// Router.put('/likeComment/:id/:commentId', postController.likeComments); // Like a comment by ID (if implemented)

// //  Routes for comment-related actions
// Router.put('/addComment/:id/comments', postController.comments); // Add a comment to a post
// Router.put('/updateComment/:id/comments/:commentId', postController.updateComment); // Update a comment by ID
// Router.delete('/deleteComment/:id/comments/:commentId', postController.deleteComment); // Delete a comment by ID
// Router.put('/replyComment/:id/comments/:commentId', postController.replyToComment); // Reply to a comment by ID

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: API to manage posts and comments
 */

/**
 * @swagger
 * /api/createPost:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Post created successfully
 *       400:
 *         description: Bad request
 */
Router.post('/createPost',verifyToken, postController.createPost);

/**
 * @swagger
 * /api/getAllPosts:
 *   get:
 *     summary: Get all posts
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: List of posts
 *       500:
 *         description: Server error
 */
Router.get('/getAllPosts', verifyToken, postController.getAllPosts);

/**
 * @swagger
 * /api/getPost/{id}:
 *   get:
 *     summary: Get post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *     responses:
 *       200:
 *         description: Post data
 *       404:
 *         description: Post not found
 */
Router.get('/getPost/:id', verifyToken,postController.getPost);

/**
 * @swagger
 * /api/getPostsByUser/{userId}:
 *   get:
 *     summary: Get posts by user ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: List of posts by the user
 *       404:
 *         description: User not found
 */
Router.get('/getPostsByUser/:userId',verifyToken, postController.getPostsByUser);

/**
 * @swagger
 * /api/updatePost/{id}:
 *   put:
 *     summary: Update a post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               desc:
 *                 type: string
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       404:
 *         description: Post not found
 */
Router.put('/updatePost/:id',verifyToken, postController.updatePost);

/**
 * @swagger
 * /api/deletePost/{id}:
 *   delete:
 *     summary: Delete a post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       404:
 *         description: Post not found
 */
Router.delete('/deletePost/:id',verifyToken, postController.deletePost);

/**
 * @swagger
 * /api/likePost/{id}:
 *   put:
 *     summary: Like or dislike a post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID who is liking or disliking the post
 *     responses:
 *       200:
 *         description: Post liked or disliked successfully
 *       404:
 *         description: Post not found
 *       400:
 *         description: Bad request, user ID is required
 */

Router.put('/likePost/:id',verifyToken, postController.likePost);

/**
 * @swagger
 * /api/likeComment/{id}/{commentId}:
 *   put:
 *     summary: Like a comment by ID
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The comment ID
 *     responses:
 *       200:
 *         description: Comment liked successfully
 *       404:
 *         description: Comment not found
 */
Router.put('/likeComment/:id/:commentId', verifyToken,postController.likeComments);

/**
 * @swagger
 * /api/addComment/{id}/comments:
 *   put:
 *     summary: Add a comment to a post
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment added successfully
 *       404:
 *         description: Post not found
 */
Router.put('/addComment/:id/comments',verifyToken, postController.comments);

/**
 * @swagger
 * /api/updateComment/{id}/comments/{commentId}:
 *   put:
 *     summary: Update a comment by ID
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The comment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       404:
 *         description: Comment not found
 */
Router.put('/updateComment/:id/comments/:commentId',verifyToken, postController.updateComment);

/**
 * @swagger
 * /api/deleteComment/{id}/comments/{commentId}:
 *   delete:
 *     summary: Delete a comment by ID
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The comment ID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       404:
 *         description: Comment not found
 */
Router.delete('/deleteComment/:id/comments/:commentId', verifyToken,postController.deleteComment);

/**
 * @swagger
 * /api/replyComment/{id}/comments/{commentId}:
 *   put:
 *     summary: Reply to a comment by ID
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The comment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reply:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reply added successfully
 *       404:
 *         description: Comment not found
 */
Router.put('/replyComment/:id/comments/:commentId',verifyToken, postController.replyToComment);



module.exports = Router;



