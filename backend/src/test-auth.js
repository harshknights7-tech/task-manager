const bcrypt = require('bcryptjs');
const database = require('../config/database');

async function testAuth() {
  try {
    await database.connect();
    
    const user = await database.get('SELECT * FROM users WHERE email = ?', ['admin@example.com']);
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (user) {
      console.log('Testing password validation...');
      const isValid = await bcrypt.compare('password', user.password);
      console.log('Password validation result:', isValid);
      
      if (isValid) {
        console.log('✅ Password validation successful');
      } else {
        console.log('❌ Password validation failed');
        console.log('Stored hash:', user.password);
        console.log('Testing with different password...');
        const testHash = await bcrypt.hash('password', 10);
        console.log('New hash:', testHash);
        const testValid = await bcrypt.compare('password', testHash);
        console.log('New hash validation:', testValid);
      }
    }
    
  } catch (error) {
    console.error('Error testing auth:', error);
  } finally {
    database.close();
  }
}

testAuth();
