const express = require('express');
const TaskController = require('../controllers/TaskController');
const TaskModel = require('../models/Task');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const taskController = new TaskController(new TaskModel(require('../../config/database')));

// Apply authentication to all routes
router.use(authenticateToken);

// Task routes
router.get('/family/:familyId', (req, res) => taskController.getByFamily(req, res));
router.get('/family/:familyId/status/:status', (req, res) => taskController.getByStatus(req, res));
router.get('/family/:familyId/stats', (req, res) => taskController.getStats(req, res));
router.patch('/:id/status', (req, res) => taskController.updateStatus(req, res));
router.get('/', (req, res) => taskController.getAll(req, res));
router.get('/:id', (req, res) => taskController.getById(req, res));
router.post('/', (req, res) => taskController.create(req, res));
router.put('/:id', (req, res) => taskController.update(req, res));
router.delete('/:id', (req, res) => taskController.delete(req, res));

module.exports = router;
