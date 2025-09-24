# Google OAuth Setup Guide

## 🔧 **Google Cloud Console Setup**

### **Step 1: Create Google Cloud Project**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API (or Google Identity API)

### **Step 2: Configure OAuth Consent Screen**
1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** user type
3. Fill in required fields:
   - **App name**: Task Manager
   - **User support email**: your-email@example.com
   - **Developer contact**: your-email@example.com
4. Add scopes: `profile`, `email`
5. Add test users (your email addresses)

### **Step 3: Create OAuth Credentials**
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client IDs**
3. Choose **Web application**
4. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/google/callback`
   - `http://localhost:4200/auth/callback` (for development)
5. Copy the **Client ID** and **Client Secret**

### **Step 4: Configure Environment Variables**
Create or update `backend/.env` file:

```env
GOOGLE_CLIENT_ID=your-actual-client-id-here
GOOGLE_CLIENT_SECRET=your-actual-client-secret-here
SESSION_SECRET=your-random-session-secret-key
CORS_ORIGIN=http://localhost:4200
FRONTEND_URL=http://localhost:4200
```

## 🚀 **Testing the Setup**

### **Start the Backend Server**
```bash
cd backend
npm install
node src/server.js
```

### **Start the Frontend**
```bash
npm install
npm start
```

### **Test OAuth Flow**
1. Go to `http://localhost:4200/signup`
2. Click "Sign up with Google"
3. You should be redirected to Google OAuth
4. After authentication, you'll be redirected back to the app

## 🔍 **Troubleshooting**

### **Common Issues**

1. **"Route not found" error**
   - Check if backend server is running on port 3000
   - Verify the route is registered in `backend/src/routes/auth.js`

2. **"Invalid client" error**
   - Verify Google Client ID and Secret are correct
   - Check if redirect URI matches exactly

3. **"Access blocked" error**
   - Add your email to test users in OAuth consent screen
   - Verify the app is in testing mode

4. **CORS errors**
   - Check CORS_ORIGIN in backend/.env
   - Ensure frontend URL matches

### **Debug Steps**

1. **Check server logs** for OAuth route hits
2. **Verify environment variables** are loaded
3. **Test OAuth route directly**: `http://localhost:3000/api/auth/google`
4. **Check browser network tab** for redirect responses

## 📝 **Production Setup**

For production deployment:

1. **Update redirect URIs** to your production domain
2. **Set secure cookies** in session configuration
3. **Use HTTPS** for OAuth callbacks
4. **Configure proper CORS origins**
5. **Set up proper environment variables**

## 🔐 **Security Notes**

- Never commit `.env` files to version control
- Use strong, random session secrets
- Regularly rotate OAuth credentials
- Monitor OAuth usage and errors
- Implement rate limiting for OAuth endpoints
