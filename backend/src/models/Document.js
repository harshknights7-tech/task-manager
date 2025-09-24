const BaseModel = require('./BaseModel');

class Document extends BaseModel {
  constructor(db) {
    super('documents', db);
  }

  async create(data) {
    const documentData = {
      id: data.id || this.generateId(),
      family_id: data.family_id,
      family_member_id: data.family_member_id,
      title: data.title,
      description: data.description || null,
      category: data.category,
      file_name: data.file_name,
      file_path: data.file_path,
      file_size: data.file_size,
      file_type: data.file_type,
      uploaded_by: data.uploaded_by,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return await super.create(documentData);
  }

  async findByFamilyMember(familyMemberId) {
    const sql = `
      SELECT d.*, fm.fullname as member_name, fm.role as relation
      FROM ${this.tableName} d
      LEFT JOIN family_members fm ON d.family_member_id = fm.id
      WHERE d.family_member_id = ?
      ORDER BY d.created_at DESC
    `;
    return await this.db.all(sql, [familyMemberId]);
  }

  async findByFamily(familyId) {
    const sql = `
      SELECT d.*, fm.fullname as member_name, fm.role as relation
      FROM ${this.tableName} d
      LEFT JOIN family_members fm ON d.family_member_id = fm.id
      WHERE d.family_id = ?
      ORDER BY d.created_at DESC
    `;
    return await this.db.all(sql, [familyId]);
  }

  async findByCategory(familyId, category) {
    const sql = `
      SELECT d.*, fm.fullname as member_name, fm.role as relation
      FROM ${this.tableName} d
      LEFT JOIN family_members fm ON d.family_member_id = fm.id
      WHERE d.family_id = ? AND d.category = ?
      ORDER BY d.created_at DESC
    `;
    return await this.db.all(sql, [familyId, category]);
  }

  async getCategories(familyId) {
    const sql = `
      SELECT category, COUNT(*) as count
      FROM ${this.tableName}
      WHERE family_id = ?
      GROUP BY category
      ORDER BY category
    `;
    return await this.db.all(sql, [familyId]);
  }

  async search(familyId, searchTerm) {
    const sql = `
      SELECT d.*, fm.fullname as member_name, fm.role as relation
      FROM ${this.tableName} d
      LEFT JOIN family_members fm ON d.family_member_id = fm.id
      WHERE d.family_id = ? AND (
        d.title LIKE ? OR 
        d.description LIKE ? OR 
        d.file_name LIKE ? OR
        fm.fullname LIKE ?
      )
      ORDER BY d.created_at DESC
    `;
    const searchPattern = `%${searchTerm}%`;
    return await this.db.all(sql, [familyId, searchPattern, searchPattern, searchPattern, searchPattern]);
  }

  async getStats(familyId) {
    const sql = `
      SELECT 
        COUNT(*) as total_documents,
        SUM(file_size) as total_size,
        COUNT(DISTINCT category) as categories_count,
        COUNT(DISTINCT family_member_id) as members_with_documents
      FROM ${this.tableName}
      WHERE family_id = ?
    `;
    return await this.db.get(sql, [familyId]);
  }

  async getRecentDocuments(familyId, limit = 10) {
    const sql = `
      SELECT d.*, fm.fullname as member_name, fm.role as relation
      FROM ${this.tableName} d
      LEFT JOIN family_members fm ON d.family_member_id = fm.id
      WHERE d.family_id = ?
      ORDER BY d.created_at DESC
      LIMIT ?
    `;
    return await this.db.all(sql, [familyId, limit]);
  }
}

module.exports = Document;
