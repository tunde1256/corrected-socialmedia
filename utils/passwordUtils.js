const bcrypt = require('bcrypt');
const saltRounds = 10; // Number of salt rounds for hashing

// Utility function to hash passwords
async function hashPassword(password) {
    try {
        const salt = await bcrypt.genSalt(saltRounds); // Generate salt
        const hashedPassword = await bcrypt.hash(password, salt); // Hash the password
        return hashedPassword;
    } catch (error) {
        console.error('Error hashing password:', error);
        throw error; // Propagate error for handling elsewhere
    }
}


module.exports = { hashPassword };