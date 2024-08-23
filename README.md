## Table of Contents

Features
Tech Stack
Prerequisites
Installation
Configuration
Running the Application
API Endpoints
Testing
Deployment
Contributing
License
Features
User authentication (Sign up, Log in)
Create, edit, and delete posts
Like and comment on posts
User profile management

## Tech Stack
Backend: Node.js, Express.js
Database: MongoDB
Authentication: JWT (JSON Web Tokens)
Environment Management: dotenv
Prerequisites
Node.js (v14.x or higher)
MongoDB (local or cloud instance)
Installation
## 1. Clone the Repository
bash
Copy code
git clone https://github.com/tunde1256/socialmedia2-project.git
cd socialmedia2-project
## 2. Install Dependencies
bash
Copy code
npm install
Configuration
## 1. Environment Variables
Create a .env file in the root directory with the following:

### bash
Copy code
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=3000
ACCESS_TOKEN_SECRET_KEY
DB_URI

## Running the Application
To start the development server:

bash
Copy code
npm run dev
The app will be available at http://localhost:3000.

## API Endpoints
User Routes
POST /api/users/register: Register a new user
POST /api/users/login: Log in a user
Post Routes
POST /api/posts: Create a new post
GET /api/posts: Get all posts
DELETE /api/posts/:id: Delete a post by ID
Testing
To run tests:

bash
Copy code
npm run test

## Deployment
For deployment, consider using platforms like Heroku or Vercel. Ensure that the environment variables are set up appropriately on the deployment platform.

### Contributing
Contributions are welcome! Please fork the repository and create a pull request for any improvements or bug fixes.

## License
This project is licensed under the MIT License.

# socialmedia2
# socialmedia2
