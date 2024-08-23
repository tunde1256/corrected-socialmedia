require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const { configDotenv } = require('dotenv');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const userregRoutes = require('./router/router'); // Corrected path
const userRoutes = require('./router/userrouter'); // Corrected path
const postRouter = require('./router/postRouter'); // Corrected path
const connectDB = require('./db/db');
const logger = require('./logger')
const cookieParser = require('cookie-parser');



connectDB();
const app = express();

// Load environment variables from .env file
configDotenv();

// Use the port from environment variables or default to 3000
const Port = process.env.PORT || 3000;

// Swagger setup
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.1.0',
        info: {
            title: 'Social Media API',
            version: '1.0.0',
            description: 'API for Social Media Application',
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{
            bearerAuth: []
        }],
    },
    apis: ['./router/*.js', './router/userRouter.js','./jwt.js'], // Path to the API docs
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('dev'));
app.use(cookieParser());

// Swagger route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use('/api', userregRoutes);
app.use('/api', userRoutes); 
app.use('/api', postRouter);

// Start the server
app.listen(3000, () => logger.info('Server is running on port 3000'));
