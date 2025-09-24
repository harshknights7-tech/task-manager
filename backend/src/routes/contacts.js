const express = require('express');
const BaseController = require('../controllers/BaseController');
const BaseModel = require('../models/BaseModel');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const contactModel = new BaseModel('contacts', require('../../config/database'));
const contactController = new BaseController(contactModel);

// Apply authentication to all routes
router.use(authenticateToken);

// Contact routes
router.get('/', (req, res) => contactController.getAll(req, res));
router.get('/:id', (req, res) => contactController.getById(req, res));
router.post('/', (req, res) => contactController.create(req, res));
router.put('/:id', (req, res) => contactController.update(req, res));
router.delete('/:id', (req, res) => contactController.delete(req, res));

module.exports = router;
