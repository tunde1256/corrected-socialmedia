const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    },
    password: {
        type: String,
        required: true,
        // minlength: 8,
        // maxlength: 100
    },
    profilePicture: {
        type: String,
        maxlength: 50
    },
    coverPicture: {
        type: String,
        default: ''
    },
    followers: {
        type: [String], // Use [String] for arrays of strings
        default: []
    },
    followings: {
        type: [String], // Use [String] for arrays of strings
        default: []
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    desc: {
        type: String,
        default: ''
    },
    city: {
        type: String,
        maxlength: 50
    },
    from: {
        type: String,
        maxlength: 50
    },
    relationship: {
        type: Number,
        enum: [1, 2, 3] // Assuming 1: Single, 2: In a relationship, 3: It's complicated
    },
    failedAttempts: {
        type: Number,
        default: 0
    },
    lockoutUntil: {
        type: Date,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
