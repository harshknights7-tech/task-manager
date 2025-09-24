const express = require('express');
const router = express.Router();
const database = require('../../config/database');
const Document = require('../models/Document');
const DocumentController = require('../controllers/DocumentController');
const auth = require('../middleware/auth');

// Initialize controller
const documentModel = new Document(database);
const documentController = new DocumentController(documentModel);

// Apply authentication middleware to all routes
router.use(auth.authenticateToken);

// Upload document (with file upload middleware)
router.post('/upload', documentController.upload.single('document'), documentController.uploadDocument.bind(documentController));

// Get documents by family
router.get('/family/:familyId', documentController.getByFamily.bind(documentController));

// Get documents by family member
router.get('/member/:memberId', documentController.getByFamilyMember.bind(documentController));

// Get document categories for a family
router.get('/family/:familyId/categories', documentController.getCategories.bind(documentController));

// Get document statistics for a family
router.get('/family/:familyId/stats', documentController.getStats.bind(documentController));

// Get recent documents for a family
router.get('/family/:familyId/recent', documentController.getRecent.bind(documentController));

// Download document
router.get('/:id/download', documentController.downloadDocument.bind(documentController));

// Standard CRUD operations
router.get('/:id', documentController.getById.bind(documentController));
router.put('/:id', documentController.updateDocument.bind(documentController));
router.delete('/:id', documentController.deleteDocument.bind(documentController));

module.exports = router;
