const express = require('express');
const BaseController = require('../controllers/BaseController');
const BaseModel = require('../models/BaseModel');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const familyModel = new BaseModel('families', require('../../config/database'));
const familyController = new BaseController(familyModel);

// Apply authentication to all routes
router.use(authenticateToken);

// Family routes with user_id filtering for data security
router.get('/', (req, res) => {
  // Filter families by user_id for data security
  req.query.user_id = req.user.id;
  familyController.getAll(req, res);
});

router.get('/:id', (req, res) => {
  // First check if family belongs to user, then get by id
  familyController.getByIdWithUserCheck(req, res);
});

router.post('/', (req, res) => {
  // Add user_id to family data for security
  req.body.user_id = req.user.id;
  familyController.create(req, res);
});

router.put('/:id', (req, res) => {
  // Update family only if it belongs to user
  familyController.updateWithUserCheck(req, res);
});

router.delete('/:id', (req, res) => {
  // Delete family only if it belongs to user
  familyController.deleteWithUserCheck(req, res);
});

module.exports = router;
