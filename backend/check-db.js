const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

async function checkDatabase() {
  try {
    const db = await open({
      filename: './backend/task_manager.db',
      driver: sqlite3.Database
    });
    
    console.log('Checking users table...');
    const users = await db.all('SELECT * FROM users');
    console.log('Users found:', users);
    
    if (users.length === 0) {
      console.log('No users found. Creating demo user...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('password', 10);
      
      await db.run(
        'INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)',
        ['demo-user-1', 'Demo User', 'admin@example.com', hashedPassword]
      );
      
      console.log('Demo user created successfully');
    }
    
    await db.close();
  } catch (error) {
    console.error('Database error:', error);
  }
}

checkDatabase();
