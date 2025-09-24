const express = require('express');
const BaseController = require('../controllers/BaseController');
const BaseModel = require('../models/BaseModel');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const appointmentModel = new BaseModel('appointments', require('../../config/database'));
const appointmentController = new BaseController(appointmentModel);

// Apply authentication to all routes
router.use(authenticateToken);

// Appointment routes
router.get('/', (req, res) => appointmentController.getAll(req, res));
router.get('/:id', (req, res) => appointmentController.getById(req, res));
router.post('/', (req, res) => appointmentController.create(req, res));
router.put('/:id', (req, res) => appointmentController.update(req, res));
router.delete('/:id', (req, res) => appointmentController.delete(req, res));

module.exports = router;
