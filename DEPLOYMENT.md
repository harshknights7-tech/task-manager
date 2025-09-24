# 🚀 Full-Stack Deployment Guide

## Overview
This guide will help you deploy both your frontend and backend with a proper database.

## 🏗️ Architecture
- **Frontend**: Angular app (static hosting)
- **Backend**: Node.js API
- **Database**: PostgreSQL (production-ready)

## 📋 Deployment Steps

### Step 1: Deploy Backend to Railway

1. **Install Railway CLI** (already done)
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**
   ```bash
   railway login
   ```

3. **Navigate to backend directory**
   ```bash
   cd backend
   ```

4. **Initialize Railway project**
   ```bash
   railway init
   ```

5. **Add PostgreSQL database**
   ```bash
   railway add postgresql
   ```

6. **Set environment variables**
   ```bash
   railway variables set NODE_ENV=production
   railway variables set JWT_SECRET=your-super-secure-jwt-secret
   railway variables set GOOGLE_CLIENT_ID=your-google-client-id
   railway variables set GOOGLE_CLIENT_SECRET=your-google-client-secret
   railway variables set CORS_ORIGIN=https://your-frontend-domain.vercel.app
   railway variables set SESSION_SECRET=your-session-secret
   railway variables set FRONTEND_URL=https://your-frontend-domain.vercel.app
   ```

7. **Deploy backend**
   ```bash
   railway deploy
   ```

### Step 2: Deploy Frontend to Vercel

1. **Build frontend**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

3. **Update API URL**
   - Update your Angular API service to use the Railway backend URL
   - Example: `https://your-app.railway.app`

### Step 3: Update Google OAuth

1. **Go to Google Cloud Console**
2. **Update OAuth redirect URIs**:
   - `https://your-app.railway.app/api/auth/google/callback`

## 🔧 Database Migration

### From SQLite to PostgreSQL

1. **Install PostgreSQL client**
   ```bash
   npm install pg
   ```

2. **Update database configuration**
   - Modify `backend/config/database.js` to use PostgreSQL
   - Use `DATABASE_URL` from Railway

3. **Run migrations**
   ```bash
   railway run npm run migrate
   ```

## 🌐 Alternative: Single-Platform Deployment

### Option A: Render (Full-Stack)
1. **Connect GitHub repository**
2. **Deploy backend as Web Service**
3. **Deploy frontend as Static Site**
4. **Add PostgreSQL database**

### Option B: Heroku (Full-Stack)
1. **Create Heroku app**
2. **Add PostgreSQL addon**
3. **Deploy both frontend and backend**
4. **Configure environment variables**

## 🔒 Security Considerations

1. **Environment Variables**: Never commit secrets to Git
2. **HTTPS**: All production URLs should use HTTPS
3. **CORS**: Configure proper CORS origins
4. **Database**: Use connection pooling for PostgreSQL

## 📊 Monitoring

- **Railway**: Built-in monitoring and logs
- **Vercel**: Analytics and performance monitoring
- **Database**: Connection monitoring and backups

## 🆘 Troubleshooting

### Common Issues
1. **CORS Errors**: Check CORS_ORIGIN environment variable
2. **Database Connection**: Verify DATABASE_URL
3. **OAuth Redirects**: Update Google OAuth URIs
4. **Build Failures**: Check Node.js version compatibility

### Support
- Railway: https://railway.app/docs
- Vercel: https://vercel.com/docs
- This project: Check README.md

---

**Ready to deploy? Start with Railway for the backend!**
