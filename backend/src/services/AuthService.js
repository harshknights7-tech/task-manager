const jwt = require('jsonwebtoken');
const UserModel = require('../models/User');

class AuthService {
  constructor(userModel) {
    this.userModel = userModel;
    this.jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
  }

  async login(email, password) {
    const user = await this.userModel.validatePassword(email, password);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user);
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token
    };
  }

  generateToken(user) {
    return jwt.sign(
      { 
        id: user.id, 
        email: user.email 
      },
      this.jwtSecret,
      { expiresIn: '24h' }
    );
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  async register(userData) {
    const existingUser = await this.userModel.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const user = await this.userModel.create(userData);
    const token = this.generateToken(user);
    
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token
    };
  }
}

module.exports = AuthService;
