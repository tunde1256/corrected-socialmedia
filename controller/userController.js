const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const User = require('../model/auth');
const { hashPassword } = require('../utils/passwordUtils');

// Utility function to handle errors
function handleError(res, error, statusCode = 409) {
    console.error(error);
    res.status(statusCode).json({ message: error.message });
}

// Utility function to validate ObjectId
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Function to handle session cleanup
async function withTransaction(session, operation) {
    try {
        await session.startTransaction();
        await operation();
        await session.commitTransaction();
    } catch (err) {
        await session.abortTransaction();
        throw err;
    } finally {
        session.endSession();
    }
}

// Update User Endpoint
exports.updateUser = [
    async (req, res) => {
        const idToUpdate = req.params.id;
        const { userId, isAdmin, password } = req.body;

        if (!isValidId(idToUpdate) || (userId && !isValidId(userId))) {
            return res.status(400).json({ message: 'Invalid ID format' });
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        if (userId !== idToUpdate && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized to update this user' });
        }

        try {
            if (password) {
                req.body.password = await hashPassword(password);
            }

            const user = await User.findByIdAndUpdate(idToUpdate, { $set: req.body }, { new: true });
            if (!user) return res.status(404).json({ message: 'User not found' });

            res.json(user);
        } catch (err) {
            handleError(res, err);
        }
    }
];

// Delete User Endpoint
exports.deleteUser = [
    async (req, res) => {
        const id = req.params.id;

        if (!isValidId(id)) {
            return res.status(400).json({ message: 'Invalid ID format' });
        }

        try {
            const user = await User.findByIdAndDelete(id);
            if (!user) return res.status(404).json({ message: 'User not found' });

            res.status(200).json({ message: 'User deleted successfully' });
        } catch (err) {
            handleError(res, err);
        }
    }
];

// Get User by ID Endpoint
exports.getUser = [
    async (req, res) => {
        const id = req.params.id;

        if (!isValidId(id)) {
            return res.status(400).json({ message: 'Invalid ID format' });
        }

        try {
            const user = await User.findById(id);
            if (!user) return res.status(404).json({ message: 'User not found' });

            res.status(200).json({ user });
        } catch (err) {
            handleError(res, err);
        }
    }
];

// Follow User Endpoint
exports.followUser = async (req, res) => {
    const {userId } = req.body;
    const followId = req.params.id;

    console.log('User ID:', userId);
    console.log('Follow ID:', followId);

    if (!isValidId(userId) || !isValidId(followId)) {
        console.log('Invalid ID format');
        return res.status(400).json({ message: 'Invalid ID format' });
    }
    

    if (userId === followId) {
        console.log("You can't follow yourself");
        return res.status(400).json({ message: "You can't follow yourself" });
    }

    try {
        const user = await User.findById(userId);
        const userToFollow = await User.findById(followId);

        if (!user || !userToFollow) {
            console.log('User not found');
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.followings.includes(followId)) {
            console.log('You already follow this user');
            return res.status(400).json({ message: 'You already follow this user' });
        }

        user.followings.push(followId);
        userToFollow.followers.push(userId);

        await user.save();
        await userToFollow.save();

        res.status(200).json({ message: 'User followed successfully' });
    } catch (err) {
        console.error('Error:', err);
        handleError(res, err);
    }
};
// Unfollow User Endpoint
exports.unfollowUser = async (req, res) => {
    const { userId } = req.body;
    const unfollowId = req.params.id;

    console.log('User ID:', userId);
    console.log('Unfollow ID:', unfollowId);

    if (!isValidId(userId) || !isValidId(unfollowId)) {
        console.log('Invalid ID format');
        return res.status(400).json({ message: 'Invalid ID format' });
    }

    try {
        const user = await User.findById(unfollowId);
        const currentUser = await User.findById(userId);

        if (!user || !currentUser) {
            console.log('User not found');
            return res.status(404).json({ message: 'User not found' });
        }

        if (!currentUser.followings.includes(unfollowId)) {
            console.log('You are not following this user');
            return res.status(400).json({ message: 'You are not following this user' });
        }

        user.followers.pull(userId);
        currentUser.followings.pull(unfollowId);

        await user.save();
        await currentUser.save();

        res.status(200).json({ message: 'User unfollowed successfully' });
    } catch (err) {
        console.error('Error:', err);
        handleError(res, err);
    }
};


// Get All Users with Pagination
exports.getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc', filterField, filterValue } = req.query;

        // Create a filter object if filtering is needed
        let filter = {};
        if (filterField && filterValue) {
            filter[filterField] = filterValue;
        }

        // Pagination and sorting
        const users = await User.find(filter)
            .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        if (!users.length) {
            return res.status(404).json({ message: 'No users found' });
        }

        res.status(200).json(users);
    } catch (err) {
        console.error('Error in getAllUsers:', err);
        res.status(500).json({ message: 'An error occurred while fetching users', error: err.message });
    }
};
