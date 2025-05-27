const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const reviewsController = require('../controllers/reviewsController');

const router = express.Router();

router.put('/:id', auth, [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Comment must be less than 1000 characters')
], reviewsController.updateReview);

router.delete('/:id', auth, reviewsController.deleteReview);

module.exports = router;