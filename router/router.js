const express = require('express');
const Router = express.Router();
const userController = require('../controller/userreg');
const tokenController = require('../controller/generattoken');
const verifyToken = require('../middleware/middleware');
const tokengenerator = require('../controller/generattoken');
const { verify } = require('crypto');
const { registerValidation, validate,loginValidation } = require('../middleware/validator');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           description: The user's username
 *         email:
 *           type: string
 *           description: The user's email
 *         password:
 *           type: string
 *           description: The user's password
 */

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request, invalid user data
 *       500:
 *         description: Server error
 */
Router.post('/register',registerValidation,validate, userController.register);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email
 *               password:
 *                 type: string
 *                 description: The user's password
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: The JWT token
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
Router.post('/login',loginValidation,validate, verifyToken,userController.login);

/**
 * @swagger
 * /api/generateToken:
 *   post:
 *     summary: Generate JWT token
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email
 *               password:
 *                 type: string
 *                 description: The user's password
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: JWT token generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: The JWT token
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
Router.post('/generateToken', tokengenerator.generateToken);

/**
 * @swagger
 * /api/users/protected:
 *   get:
 *     summary: Access a protected route
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Access granted to protected route
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
Router.post('/protected', verifyToken, (req, res) => {
    res.status(200).json({ message: 'Access granted to protected route' });
});

Router.post('/logout', userController.logout);

Router.post('/refreshToken', tokenController.refreshToken);

module.exports = Router;
