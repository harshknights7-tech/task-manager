const express = require('express');
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const AuthService = require('../services/AuthService');
const UserModel = require('../models/User');
const database = require('../../config/database');

const router = express.Router();
const authService = new AuthService(new UserModel(database));

// Validation middleware
const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
];

const validateRegister = [
  body('name').trim().isLength({ min: 2 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
];

// Login
router.post('/login', validateLogin, async (req, res) => {
  try {
    console.log('Login request received:', {
      body: req.body,
      headers: req.headers,
      contentType: req.get('Content-Type')
    });
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;
    console.log('Login attempt for email:', email);
    
    const result = await authService.login(email, password);
    console.log('Login successful for:', email);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.log('Login failed for email:', req.body?.email, 'Error:', error.message);
    console.error('Full error:', error);
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
});

// Register
router.post('/register', validateRegister, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, password } = req.body;
    const result = await authService.register({ name, email, password });
    
    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Google OAuth routes
router.get('/google', (req, res, next) => {
  console.log('Google OAuth route hit - Method:', req.method);
  console.log('Google Client ID:', process.env.GOOGLE_CLIENT_ID);
  console.log('Google Client Secret:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set');
  
  // Check if Google OAuth is properly configured
  if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'your-google-client-id') {
    return res.status(400).json({
      success: false,
      message: 'Google OAuth is not configured. Please set up Google OAuth credentials in the backend/.env file. See GOOGLE_OAUTH_SETUP.md for instructions.'
    });
  }
  
  // For HEAD requests, just return success status
  if (req.method === 'HEAD') {
    return res.status(200).end();
  }
  
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

// HEAD route for OAuth availability check
router.head('/google', (req, res) => {
  console.log('Google OAuth HEAD request - checking availability');
  
  // Check if Google OAuth is properly configured
  if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'your-google-client-id') {
    return res.status(400).end();
  }
  
  res.status(200).end();
});

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/signin' }),
  async (req, res) => {
    try {
      console.log('Google OAuth callback hit');
      console.log('User object:', req.user);
      
      if (!req.user) {
        console.error('No user object in OAuth callback');
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:4200'}/signin?error=no_user`);
      }
      
      // Generate JWT token for the authenticated user
      const token = authService.generateToken(req.user);
      console.log('Generated token for user:', req.user.email);
      
      // Redirect to frontend with token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
      res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      console.error('Error stack:', error.stack);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:4200'}/signin?error=oauth_failed`);
    }
  }
);

module.exports = router;
