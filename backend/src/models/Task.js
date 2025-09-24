const BaseModel = require('./BaseModel');

class TaskModel extends BaseModel {
  constructor(db) {
    super('tasks', db);
  }

  async findByFamily(familyId) {
    const sql = `
      SELECT t.*, fm.fullname as assigned_to_name 
      FROM tasks t 
      LEFT JOIN family_members fm ON t.assigned_to = fm.id 
      WHERE t.family_id = ? 
      ORDER BY t.created_at DESC
    `;
    return await this.db.all(sql, [familyId]);
  }

  async findByStatus(familyId, status) {
    const sql = `
      SELECT t.*, fm.fullname as assigned_to_name 
      FROM tasks t 
      LEFT JOIN family_members fm ON t.assigned_to = fm.id 
      WHERE t.family_id = ? AND t.status = ? 
      ORDER BY t.created_at DESC
    `;
    return await this.db.all(sql, [familyId, status]);
  }

  async updateStatus(id, status) {
    const sql = `UPDATE tasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    const result = await this.db.run(sql, [status, id]);
    return result.changes > 0;
  }

  async getStats(familyId) {
    const sql = `
      SELECT 
        status,
        COUNT(*) as count
      FROM tasks 
      WHERE family_id = ? 
      GROUP BY status
    `;
    return await this.db.all(sql, [familyId]);
  }
}

module.exports = TaskModel;
