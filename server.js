import express from 'express';
const app = express();

// Import DB
import db from './db.js';

// Import Routes Files
import userRoutes from '././Routes/userRoutes.js';
import candidateRoutes from '././Routes/candidateRoute.js'


// import dotenv from 'dotenv';

// Express server can understand JSON request bodies and make them available in req.body.
app.use(express.json());


const PORT = process.env.PORT || 3000;

// Import JWT tokens
// import jwtUtils from './jwt.js';
// const { jwtAuthMiddleware } = jwtUtils;


// Used Imported Routes
app.use('/user', userRoutes);
app.use('/candidate' , candidateRoutes)




app.listen(PORT, () => {
  console.log('Server is listening on port', PORT);
});