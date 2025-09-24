class BaseController {
  constructor(model) {
    this.model = model;
  }

  async create(req, res) {
    try {
      const data = { ...req.body, id: require('uuid').v4() };
      const result = await this.model.create(data);
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getAll(req, res) {
    try {
      const conditions = req.query;
      const data = await this.model.findAll(conditions);
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

  async getById(req, res) {
    try {
      const { id } = req.params;
      const data = await this.model.findById(id);
      
      if (!data) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }

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

  async update(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      
      const updated = await this.model.update(id, data);
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }

      const result = await this.model.findById(id);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await this.model.delete(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }

      res.json({
        success: true,
        message: 'Resource deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // User-specific methods for data security
  async getByIdWithUserCheck(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      // First check if the resource belongs to the user
      const data = await this.model.findById(id);
      
      if (!data) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }

      // Check if the resource belongs to the current user
      if (data.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Resource does not belong to user'
        });
      }

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

  async updateWithUserCheck(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const data = req.body;
      
      // First check if the resource belongs to the user
      const existing = await this.model.findById(id);
      
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }

      // Check if the resource belongs to the current user
      if (existing.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Resource does not belong to user'
        });
      }

      // Ensure user_id cannot be changed
      data.user_id = userId;
      
      const updated = await this.model.update(id, data);
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }

      const result = await this.model.findById(id);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteWithUserCheck(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      // First check if the resource belongs to the user
      const existing = await this.model.findById(id);
      
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }

      // Check if the resource belongs to the current user
      if (existing.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Resource does not belong to user'
        });
      }

      const deleted = await this.model.delete(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }

      res.json({
        success: true,
        message: 'Resource deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = BaseController;
