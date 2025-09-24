const bcrypt = require('bcryptjs');
const database = require('../config/database');

async function seedDatabase() {
  try {
    await database.connect();
    
    // Create a default user
    const hashedPassword = await bcrypt.hash('password', 10);
    const defaultUser = {
      id: '1',
      name: 'John Doe',
      email: 'admin@example.com',
      password: hashedPassword
    };
    
    // Check if user already exists
    const existingUser = await database.get('SELECT * FROM users WHERE email = ?', [defaultUser.email]);
    
    if (!existingUser) {
      await database.run(
        'INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)',
        [defaultUser.id, defaultUser.name, defaultUser.email, defaultUser.password]
      );
      console.log('✅ Default user created successfully');
    } else {
      console.log('ℹ️ Default user already exists');
    }
    
    // Create a default family
    const defaultFamily = {
      id: 'default-family-id',
      name: 'Default Family',
      description: 'Default family for development',
      timezone: 'UTC',
      currency: 'USD'
    };
    
    const existingFamily = await database.get('SELECT * FROM families WHERE id = ?', [defaultFamily.id]);
    
    if (!existingFamily) {
      await database.run(
        'INSERT INTO families (id, name, description, timezone, currency) VALUES (?, ?, ?, ?, ?)',
        [defaultFamily.id, defaultFamily.name, defaultFamily.description, defaultFamily.timezone, defaultFamily.currency]
      );
      console.log('✅ Default family created successfully');
    } else {
      console.log('ℹ️ Default family already exists');
    }
    
    console.log('🎉 Database seeding completed!');
    console.log('📧 Email: admin@example.com');
    console.log('🔑 Password: password');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    database.close();
  }
}

seedDatabase();
