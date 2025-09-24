const BaseModel = require('./BaseModel');
const bcrypt = require('bcryptjs');

class UserModel extends BaseModel {
  constructor(db) {
    super('users', db);
  }

  async create(userData) {
    const { password, ...otherData } = userData;
    
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }
    
    const data = {
      ...otherData,
      password: hashedPassword
    };
    return await super.create(data);
  }

  async findByEmail(email) {
    const sql = `SELECT * FROM users WHERE email = ?`;
    return await this.db.get(sql, [email]);
  }

  async validatePassword(email, password) {
    const user = await this.findByEmail(email);
    if (!user) {
      return null;
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const sql = `UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    const result = await this.db.run(sql, [hashedPassword, id]);
    return result.changes > 0;
  }
}

module.exports = UserModel;
