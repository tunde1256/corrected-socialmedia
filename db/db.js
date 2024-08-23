const mongoose = require('mongoose');
const logger = require('../logger');
require('dotenv').config();

const connectDB = async () => {
    const MAX_RETRIES = 5;
    let retries = 1;

    while (retries < MAX_RETRIES) {
        try {
            await mongoose.connect(process.env.DB_URI);
            logger.info('Connected to MongoDB');
            break;
        } catch (err) {
            logger.error(`Failed to connect to MongoDB (Attempt ${retries + 1}): ${err.message}`);
            retries += 1;
            if (retries < MAX_RETRIES) {
                logger.warn('Retrying connection...');
                await new Promise(res => setTimeout(res, 5000)); // Wait for 5 seconds before retrying
            } else {
                logger.error('Max retries reached. Exiting.');
                process.exit(1); // Exit the process if all retries fail
            }
        }
    }
};

module.exports = connectDB;
