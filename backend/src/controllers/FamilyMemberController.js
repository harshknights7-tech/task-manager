const BaseController = require('./BaseController');
const BaseModel = require('../models/BaseModel');
const database = require('../../config/database');

class FamilyMemberController extends BaseController {
  constructor() {
    super(new BaseModel('family_members', database));
  }

  async getByFamily(req, res) {
    try {
      const { familyId } = req.params;
      const sql = `SELECT * FROM ${this.model.tableName} WHERE family_id = ? ORDER BY created_at DESC`;
      const members = await this.model.db.all(sql, [familyId]);
      
      res.json({
        success: true,
        data: members
      });
    } catch (error) {
      console.error('Error fetching family members by family:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching family members'
      });
    }
  }

  async getByUserEmail(req, res) {
    try {
      const { email } = req.params;
      const sql = `
        SELECT fm.*, f.name as family_name, f.description as family_description
        FROM ${this.model.tableName} fm
        LEFT JOIN families f ON fm.family_id = f.id
        WHERE fm.email = ? AND fm.is_active = 1
        ORDER BY fm.created_at DESC
      `;
      const members = await this.model.db.all(sql, [email]);
      
      res.json({
        success: true,
        data: members
      });
    } catch (error) {
      console.error('Error fetching family members by email:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching family members'
      });
    }
  }

  async getAllWithFamilyFilter(req, res) {
    try {
      const { family_id } = req.query;
      let sql = `SELECT fm.*, f.name as family_name FROM ${this.model.tableName} fm LEFT JOIN families f ON fm.family_id = f.id`;
      let params = [];
      
      if (family_id) {
        sql += ' WHERE fm.family_id = ?';
        params.push(family_id);
      }
      
      sql += ' ORDER BY fm.created_at DESC';
      const members = await this.model.db.all(sql, params);
      
      res.json({
        success: true,
        data: members
      });
    } catch (error) {
      console.error('Error fetching family members:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching family members'
      });
    }
  }
}

module.exports = new FamilyMemberController();
