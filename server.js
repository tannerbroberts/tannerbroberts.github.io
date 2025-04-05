// Import required libraries
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();

// Configure middleware
app.use(bodyParser.json()); // Parse JSON bodies
app.use(cors()); // Enable Cross-Origin Resource Sharing

// Serve static files from the React app's build directory
app.use(express.static(path.join(__dirname, 'build')));

// Handle all other routes by serving the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Configure Google OAuth strategy
passport.use(new GoogleStrategy(
  {
    clientID: 'YOUR_GOOGLE_CLIENT_ID',
    clientSecret: 'YOUR_GOOGLE_CLIENT_SECRET',
    callbackURL: '/auth/google/callback'
  },
  (accessToken, refreshToken, profile, done) => {
    // Handle user profile and tokens
    return done(null, profile);
  }
));

// Initialize Passport middleware
app.use(passport.initialize());

// Google login endpoint
app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Google login callback endpoint
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication, redirect or send token
    res.redirect('/dashboard');
  }
);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});