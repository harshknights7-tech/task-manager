const express = require('express');
const FamilyMemberController = require('../controllers/FamilyMemberController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Family member routes
router.get('/', FamilyMemberController.getAllWithFamilyFilter.bind(FamilyMemberController));
router.get('/family/:familyId', FamilyMemberController.getByFamily.bind(FamilyMemberController));
router.get('/user/:email', FamilyMemberController.getByUserEmail.bind(FamilyMemberController));
router.get('/:id', FamilyMemberController.getById.bind(FamilyMemberController));
router.post('/', FamilyMemberController.create.bind(FamilyMemberController));
router.put('/:id', FamilyMemberController.update.bind(FamilyMemberController));
router.delete('/:id', FamilyMemberController.delete.bind(FamilyMemberController));

module.exports = router;
