const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const verifyToken = require('../middleware/middleware');
const { isValidId } = require('../middleware/validator');

// Update User
router.put('/users/:id', userController.updateUser);

// Delete User
router.delete('/users/:id', userController.deleteUser);

// Get User by ID
router.get('/users/:id', userController.getUser);

// Follow User
router.put('/users/:id/follow', userController.followUser);

// Unfollow User
router.put('/users/:id/unfollow', userController.unfollowUser);

// Get All Users
router.get('/users', userController.getAllUsers);


/**
 * @openapi
 * /api/users/{id}:
 *   put:
 *     summary: Update User
 *     description: Update user details by user ID. Ensure that the `userId` in the request body is either the same as the `id` parameter or the requester is an admin. Optionally, you can provide a new password, which will be hashed before saving.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the user to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user making the update request. Required if not an admin.
 *               isAdmin:
 *                 type: boolean
 *                 description: Whether the user making the request is an admin.
 *               password:
 *                 type: string
 *                 description: New password for the user. If provided, it will be hashed before saving.
 *     responses:
 *       200:
 *         description: Successfully updated the user. Returns the updated user object.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: User ID
 *                 username:
 *                   type: string
 *                   description: Username of the user
 *                 email:
 *                   type: string
 *                   description: Email of the user
 *                 bio:
 *                   type: string
 *                   description: Bio of the user
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: The date and time when the user was created
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: The date and time when the user was last updated
 *       400:
 *         description: Bad request. Invalid input or ID format. Validation errors will be returned.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                       param:
 *                         type: string
 *                       location:
 *                         type: string
 *       403:
 *         description: Forbidden. The requester is not authorized to update this user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: User not found. The ID provided does not match any user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error. An error occurred while processing the request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 * 
 *   delete:
 *     summary: Delete User
 *     description: Delete a user by ID.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the user to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully deleted the user.
 *       400:
 *         description: Bad request. Invalid ID format.
 *       404:
 *         description: User not found. The ID provided does not match any user.
 *       500:
 *         description: Internal server error. An error occurred while processing the request.
 *
 *   get:
 *     summary: Get User by ID
 *     description: Retrieve user details by user ID.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the user to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the user. Returns the user object.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: User ID
 *                 username:
 *                   type: string
 *                   description: Username of the user
 *                 email:
 *                   type: string
 *                   description: Email of the user
 *                 bio:
 *                   type: string
 *                   description: Bio of the user
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: The date and time when the user was created
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: The date and time when the user was last updated
 *       404:
 *         description: User not found. The ID provided does not match any user.
 *       500:
 *         description: Internal server error. An error occurred while processing the request.
 * 
 * 
 * /api/users/{id}/unfollow:
 *   put:
 *     summary: Unfollow User
 *     description: Unfollow a user by ID. The request should include the ID of the user making the request in the request body, and the ID of the user to unfollow in the path parameter.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the user to unfollow (24-character hexadecimal string).
 *         schema:
 *           type: string
 *           pattern: '^[a-fA-F0-9]{24}$'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 pattern: '^[a-fA-F0-9]{24}$'
 *                 description: ID of the current user making the unfollow request (24-character hexadecimal string).
 *     responses:
 *       200:
 *         description: Successfully unfollowed the user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User unfollowed successfully
 *       400:
 *         description: Bad request. Invalid ID format, you are not following this user, or missing required parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   examples:
 *                     invalidIdFormat:
 *                       value: Invalid ID format
 *                     notFollowing:
 *                       value: You are not following this user
 *       404:
 *         description: User not found. The ID provided does not match any user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Internal server error. An error occurred while processing the request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 *
 * /api/users/{id}/follow:
 *   put:
 *     summary: Follow User
 *     description: Follow a user by ID. The request should include the ID of the user making the request in the request body, and the ID of the user to follow in the path parameter.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the user to follow (24-character hexadecimal string).
 *         schema:
 *           type: string
 *           pattern: '^[a-fA-F0-9]{24}$'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 pattern: '^[a-fA-F0-9]{24}$'
 *                 description: ID of the current user making the follow request (24-character hexadecimal string).
 *     responses:
 *       200:
 *         description: Successfully followed the user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User followed successfully
 *       400:
 *         description: Bad request. Invalid ID format, you can't follow yourself, or missing required parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   examples:
 *                     invalidIdFormat:
 *                       value: Invalid ID format
 *                     selfFollow:
 *                       value: You can't follow yourself
 *                     alreadyFollowed:
 *                       value: You already follow this user
 *       404:
 *         description: User not found. The ID provided does not match any user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Internal server error. An error occurred while processing the request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 *

 * /api/users:
 *   get:
 *     summary: Get All Users
 *     description: Retrieve a list of all users. Requires authentication.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of users.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: User ID
 *                       username:
 *                         type: string
 *                         description: Username of the user
 *                       email:
 *                         type: string
 *                         description: Email of the user
 *                       bio:
 *                         type: string
 *                         description: Bio of the user
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: The date and time when the user was created
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         description: The date and time when the user was last updated
 *                 totalPages:
 *                   type: integer
 *                   description: Total number of pages available
 *                 currentPage:
 *                   type: integer
 *                   description: The current page number
 *       401:
 *         description: Unauthorized. The request is missing or has an invalid token.
 *       500:
 *         description: Internal server error. An error occurred while processing the request.
 */

module.exports = router;

