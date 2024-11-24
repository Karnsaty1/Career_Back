const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const helmet = require('helmet');

// Customized Helmet CSP configuration
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://vercel.live'], 
        connectSrc: ["'self'", 'https://vercel.live'], 
        styleSrc: ["'self'", "'unsafe-inline'"], 
        imgSrc: ["'self'", 'data:'], 
      },
    },
  })
);
// CORS configuration
const corsOptions = {
  origin: ['http://localhost:3000', process.env.FRONTEND_URL],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

const { connectDB } = require('./db');

(async () => {
  try {
    await connectDB();
    app.use('/user/auth', require('./Routes/Auth'));
    app.use('/user/data', require('./Routes/Data'));

    // Add a root route to avoid "Cannot GET /"
    app.get('/', (req, res) => {
      res.send('Welcome to the backend API!');
    });
  } catch (error) {
    console.error('Error connecting to database:', error);
  }
})();

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error('Internal Server Error:', err);
  res.status(500).send('Something went wrong!');
});

// Export the app as a handler for Vercel's serverless function
module.exports = app;
