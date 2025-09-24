const BaseController = require('./BaseController');
const path = require('path');
const fs = require('fs').promises;
const multer = require('multer');

class DocumentController extends BaseController {
  constructor(model) {
    super(model);
    this.setupMulter();
  }

  setupMulter() {
    // Configure multer for file uploads
    const storage = multer.diskStorage({
      destination: async (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads/documents');
        try {
          await fs.mkdir(uploadDir, { recursive: true });
          cb(null, uploadDir);
        } catch (error) {
          cb(error);
        }
      },
      filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
      }
    });

    this.upload = multer({
      storage: storage,
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
      fileFilter: (req, file, cb) => {
        // Allowed file types
        const allowedTypes = [
          'application/pdf',
          'image/jpeg',
          'image/png',
          'image/gif',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/plain'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Invalid file type. Only PDF, images, Word, Excel, and text files are allowed.'), false);
        }
      }
    });
  }

  // Upload document
  async uploadDocument(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const documentData = {
        family_id: req.body.family_id,
        family_member_id: req.body.family_member_id,
        title: req.body.title,
        description: req.body.description || null,
        category: req.body.category,
        file_name: req.file.originalname,
        file_path: req.file.path,
        file_size: req.file.size,
        file_type: req.file.mimetype,
        uploaded_by: req.user.id
      };

      const result = await this.model.create(documentData);
      
      res.status(201).json({
        success: true,
        data: result,
        message: 'Document uploaded successfully'
      });
    } catch (error) {
      // Clean up uploaded file if database operation fails
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error('Error cleaning up file:', unlinkError);
        }
      }
      
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get documents by family
  async getByFamily(req, res) {
    try {
      const { familyId } = req.params;
      const { category, search } = req.query;
      
      let documents;
      
      if (search) {
        documents = await this.model.search(familyId, search);
      } else if (category) {
        documents = await this.model.findByCategory(familyId, category);
      } else {
        documents = await this.model.findByFamily(familyId);
      }
      
      res.json({
        success: true,
        data: documents
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get documents by family member
  async getByFamilyMember(req, res) {
    try {
      const { memberId } = req.params;
      const documents = await this.model.findByFamilyMember(memberId);
      
      res.json({
        success: true,
        data: documents
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get document categories
  async getCategories(req, res) {
    try {
      const { familyId } = req.params;
      const categories = await this.model.getCategories(familyId);
      
      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get document statistics
  async getStats(req, res) {
    try {
      const { familyId } = req.params;
      const stats = await this.model.getStats(familyId);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get recent documents
  async getRecent(req, res) {
    try {
      const { familyId } = req.params;
      const { limit = 10 } = req.query;
      const documents = await this.model.getRecentDocuments(familyId, parseInt(limit));
      
      res.json({
        success: true,
        data: documents
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Download document
  async downloadDocument(req, res) {
    try {
      const { id } = req.params;
      const document = await this.model.findById(id);
      
      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Document not found'
        });
      }

      // Check if file exists
      try {
        await fs.access(document.file_path);
      } catch (error) {
        return res.status(404).json({
          success: false,
          message: 'File not found on server'
        });
      }

      // Set appropriate headers
      res.setHeader('Content-Disposition', `attachment; filename="${document.file_name}"`);
      res.setHeader('Content-Type', document.file_type);
      
      // Stream the file
      const fileStream = require('fs').createReadStream(document.file_path);
      fileStream.pipe(res);
      
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete document (with file cleanup)
  async deleteDocument(req, res) {
    try {
      const { id } = req.params;
      const document = await this.model.findById(id);
      
      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Document not found'
        });
      }

      // Delete from database
      const deleted = await this.model.delete(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Document not found'
        });
      }

      // Delete file from filesystem
      try {
        await fs.unlink(document.file_path);
      } catch (fileError) {
        console.error('Error deleting file:', fileError);
        // Continue even if file deletion fails
      }

      res.json({
        success: true,
        message: 'Document deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update document metadata
  async updateDocument(req, res) {
    try {
      const { id } = req.params;
      const updateData = {
        title: req.body.title,
        description: req.body.description,
        category: req.body.category
      };

      const updated = await this.model.update(id, updateData);
      
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Document not found'
        });
      }

      const result = await this.model.findById(id);
      res.json({
        success: true,
        data: result,
        message: 'Document updated successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = DocumentController;
