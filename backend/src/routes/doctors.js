const express = require('express');
const BaseController = require('../controllers/BaseController');
const BaseModel = require('../models/BaseModel');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const doctorModel = new BaseModel('doctors', require('../../config/database'));
const doctorController = new BaseController(doctorModel);

// Apply authentication to all routes
router.use(authenticateToken);

// Doctor routes
router.get('/', (req, res) => doctorController.getAll(req, res));
router.get('/:id', (req, res) => doctorController.getById(req, res));
router.post('/', (req, res) => doctorController.create(req, res));
router.put('/:id', (req, res) => doctorController.update(req, res));
router.delete('/:id', (req, res) => doctorController.delete(req, res));

module.exports = router;
