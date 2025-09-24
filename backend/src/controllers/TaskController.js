const BaseController = require('./BaseController');

class TaskController extends BaseController {
  constructor(taskModel) {
    super(taskModel);
  }

  async getByFamily(req, res) {
    try {
      const { familyId } = req.params;
      const data = await this.model.findByFamily(familyId);
      
      res.json({
        success: true,
        data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getByStatus(req, res) {
    try {
      const { familyId, status } = req.params;
      const data = await this.model.findByStatus(familyId, status);
      
      res.json({
        success: true,
        data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const updated = await this.model.updateStatus(id, status);
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }

      res.json({
        success: true,
        message: 'Status updated successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getStats(req, res) {
    try {
      const { familyId } = req.params;
      const data = await this.model.getStats(familyId);
      
      res.json({
        success: true,
        data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = TaskController;
