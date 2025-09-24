const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.db = null;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database('./database.sqlite', (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          this.initializeTables().then(resolve).catch(reject);
        }
      });
    });
  }

  async initializeTables() {
    const tables = [
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT,
        google_id TEXT UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS families (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        timezone TEXT,
        currency TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS family_members (
        id TEXT PRIMARY KEY,
        family_id TEXT NOT NULL,
        fullname TEXT NOT NULL,
        email TEXT,
        mobile TEXT,
        role TEXT,
        user_lookup TEXT,
        points INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        joined_on DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (family_id) REFERENCES families (id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        family_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        created_by TEXT,
        assigned_to TEXT,
        assignment_type TEXT,
        status TEXT DEFAULT 'open',
        priority TEXT DEFAULT 'medium',
        due_on DATETIME,
        points INTEGER DEFAULT 0,
        rejection_reason TEXT,
        auto_assign_after_mins INTEGER,
        escalation_count INTEGER DEFAULT 0,
        completed_on DATETIME,
        percent_complete INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (family_id) REFERENCES families (id),
        FOREIGN KEY (assigned_to) REFERENCES family_members (id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS appointments (
        id TEXT PRIMARY KEY,
        family_id TEXT NOT NULL,
        title TEXT NOT NULL,
        doctor TEXT,
        appointment_date DATETIME,
        status TEXT DEFAULT 'scheduled',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (family_id) REFERENCES families (id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS contacts (
        id TEXT PRIMARY KEY,
        family_id TEXT NOT NULL,
        name TEXT NOT NULL,
        service_type TEXT,
        phone TEXT,
        whatsapp TEXT,
        email TEXT,
        address TEXT,
        source TEXT,
        rating INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (family_id) REFERENCES families (id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS doctors (
        id TEXT PRIMARY KEY,
        family_id TEXT NOT NULL,
        name TEXT NOT NULL,
        specialty TEXT,
        phone TEXT,
        email TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (family_id) REFERENCES families (id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        family_id TEXT NOT NULL,
        family_member_id TEXT,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        file_name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        file_type TEXT NOT NULL,
        uploaded_by TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (family_id) REFERENCES families (id),
        FOREIGN KEY (family_member_id) REFERENCES family_members (id),
        FOREIGN KEY (uploaded_by) REFERENCES users (id)
      )`
    ];

    for (const table of tables) {
      await this.run(table);
    }
    
    // Add migration to add google_id column if it doesn't exist
    try {
      await this.run(`ALTER TABLE users ADD COLUMN google_id TEXT UNIQUE`);
      console.log('Added google_id column to users table');
    } catch (error) {
      // Column already exists, ignore error
      if (!error.message.includes('duplicate column name')) {
        console.log('google_id column already exists or error:', error.message);
      }
    }

    // Add migration to add user_id column to families table if it doesn't exist
    try {
      await this.run(`ALTER TABLE families ADD COLUMN user_id TEXT`);
      console.log('Added user_id column to families table');
    } catch (error) {
      // Column already exists, ignore error
      if (!error.message.includes('duplicate column name')) {
        console.log('user_id column already exists or error:', error.message);
      }
    }
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

module.exports = new Database();
