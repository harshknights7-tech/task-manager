# 🚀 Modern Task Manager

A sleek, modern task management application built with Angular and Node.js, featuring Google OAuth authentication and a beautiful, responsive design system.

## ✨ Features

- **🔐 Authentication**: Email/password and Google OAuth login
- **📱 Responsive Design**: Modern, mobile-first UI with smooth animations
- **👨‍👩‍👧‍👦 Family Management**: Multi-family support with role-based access
- **📋 Task Management**: Create, edit, and track tasks with priorities and due dates
- **📅 Appointments**: Schedule and manage family appointments
- **📇 Contacts**: Manage family and emergency contacts
- **🩺 Doctors**: Keep track of family healthcare providers
- **📁 Documents**: Store and organize important documents
- **🎨 Modern UI**: Beautiful design system with consistent styling

## 🛠️ Tech Stack

### Frontend
- **Angular 18** - Modern web framework
- **TypeScript** - Type-safe development
- **CSS Custom Properties** - Modern design system
- **Responsive Design** - Mobile-first approach

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **SQLite** - Lightweight database
- **Passport.js** - Authentication middleware
- **JWT** - Secure token-based authentication

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd task-manager
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   cd ..
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp backend/.env.example backend/.env
   
   # Edit the environment file with your configuration
   nano backend/.env
   ```

4. **Start the development servers**
   ```bash
   # Terminal 1: Start the backend server
   cd backend && npm start
   
   # Terminal 2: Start the frontend development server
   npm start
   ```

5. **Access the application**
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:3000

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Build the application**
   ```bash
   npm run build
   ```

3. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

### Deploy to Netlify

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy the dist folder**
   - Drag and drop the `dist/task-manager` folder to Netlify
   - Or connect your GitHub repository for automatic deployments

### Deploy Backend to Railway/Render

1. **Prepare backend for deployment**
   ```bash
   cd backend
   # Ensure your .env file has production values
   ```

2. **Deploy to Railway**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login and deploy
   railway login
   railway deploy
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Database
DATABASE_URL=./task_manager.db

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# CORS
CORS_ORIGIN=http://localhost:4200

# Session
SESSION_SECRET=your-session-secret

# Frontend URL (for OAuth redirects)
FRONTEND_URL=http://localhost:4200
```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/google/callback` (development)
   - `https://your-domain.com/api/auth/google/callback` (production)
6. Copy Client ID and Secret to your `.env` file

## 📱 Mobile App

The application is fully responsive and works great on mobile devices. You can also create a Progressive Web App (PWA) version by adding a web app manifest.

## 🎨 Design System

The application uses a modern design system with:

- **CSS Custom Properties** for consistent theming
- **Responsive breakpoints** for all screen sizes
- **Smooth animations** and micro-interactions
- **Accessible color contrasts** and typography
- **Modern gradients** and shadows

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Angular team for the amazing framework
- Google for OAuth authentication
- The open-source community for inspiration

---

**Made with ❤️ and modern web technologies**