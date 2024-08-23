const bcrypt = require('bcrypt');
const User = require('../model/auth');
// const  verifyToken = require('../Jwt');
const jwt = require('jsonwebtoken');
const ACCESS_TOKEN_SECRET_KEY = process.env.ACCESS_TOKEN_SECRET_KEY;
require('dotenv').config();

const generateToken = (user) => {
    return jwt.sign({ id: user._id }, ACCESS_TOKEN_SECRET_KEY, { expiresIn: '1h' });
};

exports.generateToken = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = generateToken(user);
        res.status(200).json({ token });
    } catch (err) {
        console.error('Error during token generation:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
// Protected route handler
exports.protectedRouteHandler = (req, res) => {
    res.status(200).json({ message: 'Access granted to protected route' });
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

        res.json({ accessToken: newAccessToken });
    } catch (error) {
        console.error('Error verifying refresh token', error);
        res.status(403).json({ message: 'Invalid refresh token' });
    }
};

// Export the middleware and handler


