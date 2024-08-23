require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../model/auth'); // Adjust the path to your User model
const logger = require('../logger'); // Adjust the path to your logger module

exports.register = async (req, res) => {
    logger.info('Request Body:', req.body);

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    try {
        // Check if the email already exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Check if the username already exists
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Hash the password
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;
        if (isNaN(saltRounds)) {
            throw new Error('Invalid salt rounds value');
        }
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(password, salt);

        logger.debug('User registered with hashed password:', hashedPassword);

        // Create and save the new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });
        const user = await newUser.save();

        // Log token secrets (in a real application, avoid logging sensitive information)
        logger.debug('Access Token Secret Key:', process.env.ACCESS_TOKEN_SECRET_KEY);
        logger.debug('Refresh Token Secret Key:', process.env.REFRESH_TOKEN_SECRET_KEY);

        // Generate tokens
        const accessToken = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.ACCESS_TOKEN_SECRET_KEY,
            { expiresIn: '1h' }
        );
        const refreshToken = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.REFRESH_TOKEN_SECRET_KEY,
            { expiresIn: '7d' }
        );

        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
        res.status(201).json({ message: 'Registration successful', user, accessToken });
    } catch (error) {
        logger.error('Error during registration:', error);
        res.status(403).json({ message: 'Error during registering' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const accessToken = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.ACCESS_TOKEN_SECRET_KEY,
            { expiresIn: '15m' }
        );
        const refreshToken = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.REFRESH_TOKEN_SECRET_KEY,
            { expiresIn: '7d' }
        );

        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
        res.status(200).json({ message: 'Login successful', user, accessToken });
    } catch (error) {
        logger.error('Error during login:', error);
        res.status(403).json({ message: 'Error during login' });
    }
};

exports.logout = (req, res) => {
    res.clearCookie('refreshToken');
    res.status(200).json({ message: 'Logged out successfully' });
};

exports.refreshToken = (req, res) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
        return res.status(401).json({ message: 'No refresh token provided' });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET_KEY);
        const newAccessToken = jwt.sign(
            { userId: decoded.userId, email: decoded.email },
            process.env.ACCESS_TOKEN_SECRET_KEY,
            { expiresIn: '15m' }
        );

        res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
        logger.error('Error verifying refresh token:', error);
        res.status(403).json({ message: 'Invalid refresh token' });
    }
};
