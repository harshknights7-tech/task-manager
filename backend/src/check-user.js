const database = require('../config/database');

async function checkUser() {
  try {
    await database.connect();
    
    const user = await database.get('SELECT * FROM users WHERE email = ?', ['admin@example.com']);
    console.log('User found:', user);
    
    if (user) {
      console.log('✅ User exists in database');
      console.log('Email:', user.email);
      console.log('Name:', user.name);
      console.log('Password hash length:', user.password.length);
    } else {
      console.log('❌ User not found in database');
    }
    
  } catch (error) {
    console.error('Error checking user:', error);
  } finally {
    database.close();
  }
}

checkUser();
